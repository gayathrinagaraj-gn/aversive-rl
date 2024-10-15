import React from "react";
//import { Button } from "react-bootstrap";
import withRouter from "./withRouter.js";

import averSound from "./sounds/task/morriss_scream_1000.wav";
import neuSound from "./sounds/task/bacigalupo_whitenoise_1000_minus20.wav";

import * as RatingSlider from "./sliders/RatingSlider2.js";
import style from "./style/taskStyle.module.css";
import PlayButton from "./PlayButton";
import { DATABASE_URL } from "./config";

////////////////////////////////////////////////////////////////////////////////
//Functions
////////////////////////////////////////////////////////////////////////////////
//for volume and frequency?, it is in log scale
function logslider(position) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The bounds of the slider
  var minv = Math.log(1);
  var maxv = Math.log(100);

  // calculate adjustment factor
  var scale = (maxv - minv) / (maxp - minp);

  return Math.exp(minv + scale * (position - minp));
}

//return slider position
function logposition(value) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The bounds of the slider
  var minv = Math.log(1);
  var maxv = Math.log(100);

  // calculate adjustment factor
  var scale = (maxv - minv) / (maxp - minp);

  return (Math.log(value) - minv) / scale + minp;
}

//shuffleSingle
function shuffleSingle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//array of certain length within a certain range
function randomArray(length, min, max) {
  let range = max - min + 1;
  return Array.apply(null, Array(length)).map(function () {
    return Math.round(Math.random() * range) + min;
  });
}

/////// REACT
// This version, I change the calibration
// They have to rate aver and avoid sounds TWO times at least, the second rating is where we base the calibration

var varPlayColour = ["#d02f33", "#cd5a7e"];

// this is the main sound array
var soundArray = [averSound, neuSound];
// Total number of audio bites for the first part of the rating (4)
var qnNumTotal = soundArray.length;
shuffleSingle(varPlayColour); // shuffling the color of the play button

varPlayColour = varPlayColour.filter(function (val) {
  return val !== undefined;
});

// write index for the sound array
var qnNumTotalIndex = Array.from(Array(qnNumTotal).keys());
//shuffle order of presentation
shuffleSingle(qnNumTotalIndex);

qnNumTotalIndex = qnNumTotalIndex.filter(function (val) {
  return val !== undefined;
});

////////////////////////////////////////////////////////////////////////////////
//React component
////////////////////////////////////////////////////////////////////////////////
class SoundCal extends React.Component {
  constructor(props) {
    super(props);

    /*   const userID = this.props.state.userID;
    const prolificID = this.props.state.prolificID;
    const sessionID = this.props.state.sessionID;
    const date = this.props.state.date;
    const startTime = this.props.state.startTime;
    const volume = this.props.state.volume;
    const volumeNotLog = this.props.state.volumeNotLog;
*/

    var userID = 1000;
    var prolificID = 1000;
    var sessionID = 1000;
    var date = 1000;
    var startTime = 1000;
    var volume = 80;
    var volumeNotLog = 39;

    var averRatingDef = randomArray(qnNumTotal, 35, 65);

    // keys for the slider
    var sliderKey = Array.from(Array(qnNumTotal).keys());

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
      sliderKey: sliderKey,
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

      // this is for storage
      volumeHalfAver: 0,
      volumeNotLogHalfAver: 0,

      volumeFullAver: 0,
      volumeNotLogFullAver: 0,

      volumePer: 1, //this is wrt to the chosen volume
      soundIndex: 0,
      qnTime: qnTime,
      qnRT: 0,
      playNum: 0,
      averRatingDef: averRatingDef,
      averRating: null,
      active: false,
      soundFocus: null,
      btnDisNext: true,

      // these are the markers for the staircase
      fullAverRating: 0,
      halfAverRating: 0,

      debug: false,
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
    var key1;
    var averRatingDef;
    var varPlayColour = this.state.varPlayColour[qnNumShow - 1];
    var volume = this.state.volume;

    key1 = this.state.sliderKey[qnIndx];
    averRatingDef = this.state.averRatingDef[qnIndx];

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
            <strong>Q{qnNumShow}a:</strong> How pleasant is this sound?
            <br />
            <br />
            <br />
            <br />
            <RatingSlider.AverSlider
              key={key1}
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
                this.saveData.bind(this);
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
      averRatingDef: this.state.averRatingDef[this.state.qnNum - 1],
    };

    // console.log("averRating: " + this.state.averRating);
    // console.log("volumePer: " + this.state.volumePer);
    // console.log("volume: " + this.state.volume);
    // console.log("volumeNotLog: " + this.state.volumeNotLog);
    // console.log("volumeHalf: " + this.state.volumeHalfAver);
    // console.log("volumeNotLogHalf: " + this.state.volumeNotLogHalfAver);

    fetch(`${DATABASE_URL}/vol_cal/` + userID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizbehaviour),
    });

    // console.log(quizbehaviour);

    //lag a bit to make sure statestate is saved
    setTimeout(
      function () {
        this.updateRate();
      }.bind(this),
      10
    );
  }

  updateRate() {
    if (this.state.soundIndex === 1) {
      this.setState({
        fullAverRating: Number(this.state.averRating),
        volumeFullAver: Number(this.state.volume),
        volumeNotLogFullAver: Number(this.state.volumeNotLog),
      });
    } else if (this.state.soundIndex === 2) {
      this.setState({
        halfAverRating: Number(this.state.averRating),
        volumeHalfAver: Number(this.state.volume),
        volumeNotLogHalfAver: Number(this.state.volumeNotLog),
      });
    }
    setTimeout(
      function () {
        this.tutorTask();
      }.bind(this),
      5
    );
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
        volumeHalfAver: this.state.volumeHalfAver,
        volumeFullAver: this.state.volumeFullAver,
      },
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Render time!
  ////////////////////////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.debug === false) {
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
                Some sounds may repeat.
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
    } else if (this.state.debug === true) {
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
