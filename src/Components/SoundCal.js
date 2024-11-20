import React from "react";
import withRouter from "./withRouter.js";
import * as RatingSlider from "./sliders/RatingSlider2.js";
import * as utils from "./utils.js";
import style from "./style/taskStyle.module.css";
import PlayButton from "./PlayButton";
import { DATABASE_URL } from "./config";

import averSound from "./sounds/task/morriss_scream_1000minus15.wav";
import neuSound from "./sounds/task/browniannoise_08amp_1000minus5.wav";
import pleaSound from "./sounds/task/YangIADSE_cicada0335_1000minus10.wav";
/////// REACT

var debug = false;
var skip = false;

// This version, I change the calibration
// They have to rate aver and avoid sounds TWO times at least, the second rating is where we base the calibration
var varPlayColour = [
  "#d02f33",
  "#cd5a7e",
  "#49458d",
  "#c17860",
  "#19cdc4",
  "#430031",
];

// this is the main sound array
var soundArray = [
  averSound,
  neuSound,
  pleaSound,
  averSound,
  neuSound,
  pleaSound,
];
// Total number of audio bites for the first part of the rating (4)
var qnNumTotal = soundArray.length;
utils.shuffle(varPlayColour); // shuffling the color of the play button

varPlayColour = varPlayColour.filter(function (val) {
  return val !== undefined;
});

// write index for the sound array - this is the shuffling for sounds being tested
var qnNumTotalIndexTemp = Array.from(Array(qnNumTotal / 2).keys());
var qnNumTotalIndexTemp2 = Array.from(Array(qnNumTotal / 2).keys());

utils.shuffle(qnNumTotalIndexTemp);
utils.shuffle(qnNumTotalIndexTemp2);
var qnNumTotalIndexTemp2 = qnNumTotalIndexTemp2.map((v) => v + qnNumTotal / 2);

var qnNumTotalIndex = qnNumTotalIndexTemp.concat(qnNumTotalIndexTemp2);

qnNumTotalIndex = qnNumTotalIndex.filter(function (val) {
  return val !== undefined;
});

////////////////////////////////////////////////////////////////////////////////
//React component
////////////////////////////////////////////////////////////////////////////////
class SoundCal extends React.Component {
  constructor(props) {
    super(props);

    var userID;
    var prolificID;
    var sessionID;
    var date;
    var startTime;
    var volume;
    var volumeNotLog;

    if (debug === true) {
      userID = 1000;
      prolificID = 1000;
      sessionID = 1000;
      date = 1000;
      startTime = 1000;
      volume = 80;
      volumeNotLog = 39;
    } else {
      userID = this.props.state.userID;
      prolificID = this.props.state.prolificID;
      sessionID = this.props.state.sessionID;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
      volume = this.props.state.volume;
      volumeNotLog = this.props.state.volumeNotLog;
    }

    console.log("Port over volume? " + volume);

    var averRatingDefList = utils.randomArray(qnNumTotal, 35, 65);
    var qnTime = Math.round(performance.now());

    ////////////////////////////////////////////////////////////////////////////////
    //Set state
    ////////////////////////////////////////////////////////////////////////////////
    this.state = {
      userID: userID,
      prolificID: prolificID,
      sessionID: sessionID,
      date: date,
      startTime: startTime,
      volCalStage: "affRatings", //stage 1 is the normal rating and stage 2 is the staircase, if needed

      currentInstructionText: 1,
      quizScreen: false,
      qnNumTotal: qnNumTotal, //this is only for the first round of ratings

      //arrays
      sounds: soundArray,
      varPlayColour: varPlayColour,

      //by trial variables
      qnNum: 1,
      qnNumShow: 1, // this is tracking in total how many was rated
      qnNumTotalIndex: qnNumTotalIndex,

      // this is what is being played
      volume: volume,
      volumeNotLog: volumeNotLog,

      // this is for reference to the default volume before any changes
      volumeDef: volume,
      volumeNotLogDef: volumeNotLog,

      //    volumeFullAver: 0,
      //  volumeNotLogFullAver: 0,

      volumePer: 1, //this is wrt to the chosen volume
      soundIndex: 0,
      qnTime: qnTime,
      qnRT: 0,
      playNum: 0,
      averRatingDefList: averRatingDefList,
      averRatingDef: null, // this is predetermined in an array
      averRating: null,
      active: false,
      soundFocus: null,
      btnDisNext: true,

      // these are the markers for the staircase
      //    fullAverRating: 0,

      debug: debug,
      skip: skip,
    };

    this.handleInstructionsLocal = this.handleInstructionsLocal.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.handleDebugKeyLocal = this.handleDebugKeyLocal.bind(this);

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    // this is the end of constructor/props
  }

  componentDidMount() {
    window.scrollTo(0, 0);

    var sounds = this.state.sounds;

    this.setState({
      sounds: sounds,
      mounted: 1,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Function to handle instructions
  ////////////////////////////////////////////////////////////////////////////////
  // This handles instruction screen within the component
  handleInstructionsLocal(key_pressed) {
    var curText = this.state.currentInstructionText;
    var whichButton = key_pressed;

    if (whichButton === 4 && curText > 1) {
      this.setState({ currentInstructionText: curText - 1 });
    } else if (whichButton === 5 && curText < 3) {
      this.setState({ currentInstructionText: curText + 1 });
    } else if (whichButton === 32 && curText === 3) {
      //go to saveData
      setTimeout(
        function () {
          this.start_quest();
        }.bind(this),
        5
      );
    } else if (whichButton === 32 && curText === 4) {
      // start tutor task
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        5
      );
    }
  }

  // handle key key_pressed
  _handleInstructKey = (event) => {
    var key_pressed;

    switch (event.keyCode) {
      case 37:
        //    this is left arrow
        key_pressed = 4;
        this.handleInstructionsLocal(key_pressed);
        break;
      case 39:
        //    this is right arrow
        key_pressed = 5;
        this.handleInstructionsLocal(key_pressed);
        break;
      case 32:
        //    this is spacebar
        key_pressed = 32;
        this.handleInstructionsLocal(key_pressed);
        break;
      default:
    }
  };
  ////////////////////////////////////////////////////////////////////////////////
  //Functions to toggle playing
  ////////////////////////////////////////////////////////////////////////////////
  // for audio bites
  togglePlaying() {
    var playNum = this.state.playNum;
    if (this.state.active === false) {
      playNum++;
    }

    this.setState({ active: !this.state.active, playNum: playNum });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Start the rating section
  ////////////////////////////////////////////////////////////////////////////////
  start_quest() {
    document.removeEventListener("keyup", this._handleInstructKey);
    var currTime = Math.round(performance.now());

    //get index of sound1
    var qnNumTotalIndex = this.state.qnNumTotalIndex;
    var soundIndex = qnNumTotalIndex[0];
    var soundbite = this.state.sounds[soundIndex];

    // console.log("soundIndex: " + soundIndex);
    // console.log("soundbite: " + soundbite);

    this.setState({
      quizScreen: true,
      qnTime: currTime,
      soundIndex: soundIndex,
      qnNum: 1,
      volCalStage: "affRatings",
      playNum: 0,
      active: false,
      soundFocus: soundbite,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Call back functions for sliders
  ////////////////////////////////////////////////////////////////////////////////
  callbackAver(callBackValue) {
    this.setState({ averRating: callBackValue });
    if (this.state.averRating !== null && this.state.playNum > 0) {
      this.setState({ btnDisNext: false });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Rating task text
  ////////////////////////////////////////////////////////////////////////////////
  ratingTask(qnNum) {
    // normal rating section
    var qnIndx = qnNum - 1;
    var qnNumShow = this.state.qnNumShow;
    var averRatingDef = this.state.averRatingDefList[qnIndx];
    var varPlayColour = this.state.varPlayColour[qnNumShow - 1];
    var volume = this.state.volume;
    console.log("Volume: " + volume);

    let question_text = (
      <div>
        <span>
          <center>
            <strong>Sound {qnNumShow}</strong>
            <br />
            <span className={style.textSmall}>
              Please do not adjust your volume settings.
              <br />
              You can play the sound as many times as you like!
            </span>
          </center>
          <br />
        </span>
      </div>
    );
    let question_text1;

    // if the index is not for the frequencies that wee chosen before...
    question_text1 = (
      <div>
        <center>
          <PlayButton
            audio={this.state.soundFocus}
            play={this.togglePlaying}
            stop={this.togglePlaying}
            volume={volume}
            idleBackgroundColor={varPlayColour}
            active={this.state.active}
          />
          <br />
          <br />
        </center>
      </div>
    );

    let question_text2 = (
      <div>
        <span>
          <center>
            <strong>Q{qnNumShow}:</strong> How pleasant is this sound?
            <br />
            <br />
            <br />
            <br />
            <RatingSlider.AverSlider
              callBackValue={this.callbackAver.bind(this)}
              initialValue={averRatingDef}
            />
            <br />
            <br />
            <br />
            <span className={style.textSmall}>
              [Note: You must play the sound and <strong>drag</strong> (not
              click) all sliders at least once to click NEXT.]
            </span>
            <br />
            <br />
            <button
              disabled={this.state.btnDisNext}
              onClick={() => {
                this.saveData();
              }}
            >
              NEXT
            </button>
          </center>
        </span>
      </div>
    );

    return (
      <div>
        {question_text}
        {question_text1}
        {question_text2}
      </div>
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Save data
  ////////////////////////////////////////////////////////////////////////////////
  saveData() {
    //if it is the full aversive sound or the neutral sound, keep so as to compare the ratings

    var qnRT = Math.round(performance.now()) - this.state.qnTime;
    var userID = this.state.userID;
    var quizbehaviour;

    //first normal rating quiz
    quizbehaviour = {
      userID: this.state.userID,
      prolificID: this.state.prolificID,
      sessionID: this.state.sessionID,
      date: this.state.date,
      startTime: this.state.startTime,
      volCalStage: this.state.volCalStage,
      checkTry: null, //this is in headphoneCheck.js
      qnTime: this.state.qnTime,
      qnRT: qnRT,
      qnNum: this.state.qnNum,
      soundIndex: this.state.soundIndex,
      soundFocus: this.state.soundFocus,
      volume: this.state.volume,
      volumePer: this.state.volumePer,
      volumeNotLog: this.state.volumeNotLog,
      playNum: this.state.playNum,
      quizAnsIndiv: null, // no questions in this js but yes in headphonecheck
      qnPressKey: null,
      qnCorrIndiv: null,
      averRating: this.state.averRating,
      averRatingDef: this.state.averRatingDef,
    };

    // console.log("averRating: " + this.state.averRating);
    // console.log("volumePer: " + this.state.volumePer);
    // console.log("volume: " + this.state.volume);
    // console.log("volumeNotLog: " + this.state.volumeNotLog);

    fetch(`${DATABASE_URL}/vol_cal/` + userID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizbehaviour),
    });

    //lag a bit to make sure statestate is saved
    setTimeout(
      function () {
        this.updateRate();
      }.bind(this),
      10
    );
  }

  updateRate() {
    this.setState({
      //  fullAverRating: Number(this.state.averRating),
      //   volumeFullAver: Number(this.state.volume),
      //   volumeNotLogFullAver: Number(this.state.volumeNotLog),
    });
    setTimeout(
      function () {
        this.quizNext();
      }.bind(this),
      5
    );
  }

  quizNext() {
    this.useEffect();
    var qnTime = Math.round(performance.now());
    var qnNum = this.state.qnNum + 1;
    var qnNumShow = this.state.qnNumShow + 1;

    if (qnNum <= this.state.qnNumTotal) {
      var qnNumTotalIndex = this.state.qnNumTotalIndex;
      var soundIndex = qnNumTotalIndex[qnNum - 1];
      var soundbite = this.state.sounds[soundIndex];

      this.setState({
        qnNum: qnNum,
        qnNumShow: qnNumShow,
        qnTime: qnTime,
        soundIndex: soundIndex,
        playNum: 0,
        averRating: null,
        btnDisNext: true,
        active: false,
        soundFocus: soundbite,
      });
    } else {
      setTimeout(
        function () {
          this.tutorTask();
        }.bind(this),
        5
      );
    }
  }

  tutorTask() {
    this.setState({
      quizScreen: false,
      currentInstructionText: 4,
    });
  }

  useEffect() {
    window.scrollTo(0, 0);
  }

  handleDebugKeyLocal(pressed) {
    var whichButton = pressed;

    if (whichButton === 10) {
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        0
      );
    }
  }

  _handleDebugKey = (event) => {
    var pressed;

    switch (event.keyCode) {
      case 32:
        //    this is SPACEBAR
        pressed = 10;
        this.handleDebugKeyLocal(pressed);
        break;
      default:
    }
  };

  ////////////////////////////////////////////////////////////////////////////////
  //Push to next section
  ////////////////////////////////////////////////////////////////////////////////
  redirectToTarget() {
    document.removeEventListener("keyup", this._handleInstructKey);

    var condUrl =
      "/Tutorial?PROLIFIC_PID=" +
      this.state.prolificID +
      "?SESSION_ID=" +
      this.state.sessionID;

    this.props.navigate(condUrl, {
      state: {
        userID: this.state.userID,
        prolificID: this.state.prolificID,
        sessionID: this.state.sessionID,
        date: this.state.date,
        startTime: this.state.startTime,
        volume: this.state.volume,
        //     volumeFullAver: this.state.volumeFullAver,
      },
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Render time!
  ////////////////////////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.skip === false) {
      if (this.state.quizScreen === false) {
        this.useEffect();
        if (this.state.currentInstructionText === 1) {
          document.addEventListener("keyup", this._handleInstructKey);
          text = (
            <div>
              <span>
                <br />
                Good job!
                <br />
                <br />
                For the next part of the audio screening, we will present you
                with some sounds.
                <br />
                <br />
                All you have to do is to listen to them and rate the extent to
                which they made you feel on:
                <br /> <br />
                <strong>Pleasantness</strong>: on scale of unpleasant to
                pleasant
                <br />
                <br />
                <center>
                  Use the ← and → keys to navigate the pages.
                  <br />
                  <br />[<strong>→</strong>]
                </center>
              </span>
            </div>
          );
        } else if (this.state.currentInstructionText === 2) {
          text = (
            <div>
              <span>
                <center>
                  <strong>Pleasantness</strong> scale
                  <br />
                  <br />
                  <br />
                  <RatingSlider.ExampleAver />
                </center>
                <br />
                <br />
                Very <strong>unpleasant</strong> sounds (0 on the scale) would
                be sounds which
                <br />
                you greatly dislike, that you find are annoying or bothersome.
                <br />
                <br />
                In contrast, very <strong>pleasant</strong> sounds (100 on the
                scale) would be sounds
                <br />
                you greatly enjoy hearing, and give you feelings of happiness.
                <br />
                <br />
                <strong>Neutral</strong> sounds (50 on the scale) would be
                sounds
                <br />
                that are neither pleasant nor unpleasant to you.
                <br />
                <br />
                <center>
                  [<strong>←</strong>] [<strong>→</strong>]
                </center>
              </span>
            </div>
          );
        } else if (this.state.currentInstructionText === 3) {
          text = (
            <div>
              <span>
                <br />
                Remember to <u>keep your headphones on</u> and{" "}
                <u>do not adjust</u> your sound settings.
                <br />
                <br />
                <center>
                  When you are ready, press [<strong>SPACEBAR</strong>] to
                  begin.
                </center>
                <br />
                <center>
                  [<strong>←</strong>]
                </center>
              </span>
            </div>
          );
        } else if (this.state.currentInstructionText === 4) {
          document.addEventListener("keyup", this._handleInstructKey);
          text = (
            <div>
              <span>
                <br />
                Great! You are now ready to begin the game.
                <br />
                <br />
                <center>
                  When you are ready, press [<strong>SPACEBAR</strong>].
                </center>
              </span>
            </div>
          );
        }
      } else {
        //this is the quiz // quizscreen is true
        //QUIZ STARTS

        text = <div>{this.ratingTask(this.state.qnNum)}</div>;
      }
    } else if (this.state.skip === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div>
          <span>
            <center>DEBUG MODE</center>
            <br />

            <center>
              Press the [<strong>SPACEBAR</strong>] to skip to next section.
            </center>
          </span>
        </div>
      );
    }

    return (
      <div className={style.bg}>
        <div className={style.textFrame}>
          <div className={style.fontStyle}>{text}</div>
        </div>
      </div>
    );
  }

  // this is the end of the component
}

export default withRouter(SoundCal);
