import React from "react";
import withRouter from "./withRouter.js";

import audioCalib from "./sounds/headphone/noise_calib_stim.wav";
import audioCheck1 from "./sounds/headphone/antiphase_HC_ISO.wav";
import audioCheck2 from "./sounds/headphone/antiphase_HC_IOS.wav";
import audioCheck3 from "./sounds/headphone/antiphase_HC_SOI.wav";
import audioCheck4 from "./sounds/headphone/antiphase_HC_SIO.wav";
import audioCheck5 from "./sounds/headphone/antiphase_HC_OSI.wav";
import audioCheck6 from "./sounds/headphone/antiphase_HC_OIS.wav";

import * as SliderVol from "./sliders/VolumeSlider2.js";
import * as utils from "./utils.js";

import style from "./style/taskStyle.module.css";

import PlayButton from "./PlayButton";
//import { DATABASE_URL } from "./config";
///////////////////////////////////////////////////////////////////
var quizSounds = [
  audioCheck1,
  audioCheck2,
  audioCheck3,
  audioCheck4,
  audioCheck5,
  audioCheck6,
];

var varPlayColour = [
  "#bf0069",
  "#395756",
  "#4f5d75",
  "#4d8f1e",
  "#188fa7",
  "#7261a3",
];

var quizAns = [2, 3, 1, 1, 2, 3];

utils.shuffle(varPlayColour);
utils.shuffleDouble(quizSounds, quizAns);

quizSounds = quizSounds.filter(function (val) {
  return val !== undefined;
});

quizAns = quizAns.filter(function (val) {
  return val !== undefined;
});

////////////////////////////////////////////////////////////////////////////////
//React Component
////////////////////////////////////////////////////////////////////////////////
class HeadphoneCheck extends React.Component {
  constructor(props) {
    super(props);
    // Constructor and props
    /*  const userID = this.props.state.userID;
    const prolificID = this.props.state.prolificID;
    const sessionID = this.props.state.sessionID;
    const date = this.props.state.date;
    const startTime = this.props.state.startTime; */

    var userID = 1000;
    var prolificID = 1000;
    var sessionID = 1000;
    var date = 1000;
    var startTime = 1000;

    var currTime = Math.round(performance.now());
    var volNtLog = 80;
    var vol = utils.logslider(80);

    ////////////////////////////////////////////////////////////////////////////////
    //Set state
    ////////////////////////////////////////////////////////////////////////////////
    this.state = {
      userID: userID,
      prolificID: prolificID,
      sessionID: sessionID,
      date: date,
      startTime: startTime,

      volCalStage: "volCalib",
      currentInstructionText: 1,
      quizScreen: false,

      qnNumTotal: 6,
      qnNum: 1,
      playNum: 0,
      qnTime: currTime,
      qnRT: 0,
      qnPressKey: [],
      qnCorr: [],
      quizAns: quizAns,
      quizSum: 0,
      quizPer: 0,
      soundFocus: null,
      quizAnsIndiv: null,

      active: false,
      playOnceOnly: false,
      playAgain: false,

      varPlayColour: varPlayColour,
      calibSound: audioCalib,
      quizSounds: quizSounds,
      volume: vol, // this is what i feed into the audio
      volumeNotLog: volNtLog, //this is what you feed into the slider and convert back
      checkTry: 1,

      debug: false,
    };

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    this.togglePlaying = this.togglePlaying.bind(this);
    this.handleInstructLocal = this.handleInstructLocal.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
    this.redirectToTarget = this.redirectToTarget.bind(this);
    this.redirectToBack = this.redirectToBack.bind(this);
    this.display_question = this.display_question.bind(this);
    this.handleDebugKeyLocal = this.handleDebugKeyLocal.bind(this);
  }
  ////////////////////////////////////////////////////////////////////////////////
  //Constructor and props end
  ////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////
  //Component mount
  ////////////////////////////////////////////////////////////////////////////////
  componentDidMount() {
    window.scrollTo(0, 0);

    var calibSound = this.state.calibSound;

    this.setState({
      calibSound: calibSound,
      mounted: 1,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Instruction Screen
  ////////////////////////////////////////////////////////////////////////////////
  handleInstructLocal(key_pressed) {
    var curText = this.state.currentInstructionText;
    var whichButton = key_pressed;

    if (this.state.volCalStage === "volCalib") {
      if (curText === 1 && whichButton === 5) {
        //go next page
        this.setState({ currentInstructionText: curText + 1 });
      } else if (curText === 2 && whichButton === 5) {
        //go to saveData
        setTimeout(
          function () {
            this.saveData();
          }.bind(this),
          10
        );
      } else if (curText === 2 && whichButton === 4) {
        //go back one
        this.setState({ currentInstructionText: curText - 1 });
      }
    } else if (this.state.volCalStage === "headphoneCheck") {
      if (whichButton === 32) {
        setTimeout(
          function () {
            this.start_quest();
          }.bind(this),
          10
        );
      }
    }
  }

  handleRestart(key_pressed) {
    var whichButton = key_pressed;

    if (whichButton === 32) {
      setTimeout(
        function () {
          this.redirectToBack();
        }.bind(this),
        0
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
        this.handleInstructLocal(key_pressed);
        break;
      case 39:
        //    this is right arrow
        key_pressed = 5;
        this.handleInstructLocal(key_pressed);
        break;
      case 32:
        //    this is spacebar
        key_pressed = 32;
        this.handleInstructLocal(key_pressed);
        break;
      default:
    }
  };

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
  //After audio calibration, move to headphone check instruction screen
  ////////////////////////////////////////////////////////////////////////////////
  nextStage() {
    this.setState({
      volCalStage: "headphoneCheck",
      currentInstructionText: 1,
      quizScreen: false,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Start headphone check
  ////////////////////////////////////////////////////////////////////////////////
  start_quest() {
    document.removeEventListener("keyup", this._handleInstructKey);

    var currTime = Math.round(performance.now());
    //  console.log("quizAns: " + this.state.quizAns);

    this.setState({
      quizScreen: true,
      qnNum: 1,
      qnTime: currTime,
      playOnceOnly: true, //change this to true make sure sounds can only play once for the quiz
      playAgain: false,
      active: false,
      playNum: 0,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Toggle audio playing
  ////////////////////////////////////////////////////////////////////////////////
  togglePlaying() {
    var playNum = this.state.playNum;

    if (this.state.playOnceOnly === true) {
      //if this is a section where playOnceOnly happens then
      if (this.state.playAgain === false) {
        //if it's the first play,
        playNum++;
        this.setState({
          active: !this.state.active,
          playAgain: true,
          playNum: playNum,
        });
        document.addEventListener("keydown", this._handleKeyDownNumbers);
      } else {
        //if played once then cannot play again
        this.setState({ active: false });
      }
    } else {
      playNum++;
      this.setState({ active: !this.state.active, playNum: playNum });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Callback functions to set volume before headphone check
  ////////////////////////////////////////////////////////////////////////////////

  callbackVol(callBackValue) {
    var volume = callBackValue;
    if (volume > 100) {
      volume = 100;
    } else if (volume < 0) {
      volume = 1;
    }

    // console.log("Volume set: " + volume);
    this.setState({ volume: volume });
  }

  callbackVolNotLog(callBackValueNotLog) {
    var volumeNotLog = callBackValueNotLog;
    this.setState({ volumeNotLog: volumeNotLog });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Question display for headphone check
  ////////////////////////////////////////////////////////////////////////////////
  display_question(qnNum) {
    //comment this out after debuging, it will make sure that you can only cont when after you play the sound
    //document.addEventListener("keydown", this._handleKeyDownNumbers);
    var audioBite = this.state.quizSounds[qnNum - 1];

    return (
      <div>
        {" "}
        <center>
          <strong>
            Question {qnNum} of {this.state.qnNumTotal}
          </strong>
          <br />
          <br />
          When you click the play button below, you will hear three sounds
          separated by silences.
          <br />
          <br />
          Test sounds can only be played <strong>once</strong>, so do pay
          attention!
          <br />
          <br />
          <PlayButton
            audio={audioBite}
            play={this.togglePlaying}
            stop={this.togglePlaying}
            idleBackgroundColor={this.state.varPlayColour[qnNum - 1]}
            volume={this.state.volume}
            active={this.state.active}
          />
          <br />
          <br />
          Which sound was the <strong>softest</strong> (quietest) -- 1, 2, or 3?
          <br />
          <br />
          <strong>1</strong> - FIRST sound was SOFTEST <br />
          <strong>2</strong> - SECOND sound was SOFTEST <br />
          <strong>3</strong> - THIRD sound was SOFTEST <br />
          <br />
          [Press the correct number key]
          <br />
          <br />
          <span className={style.textSmall}>
            [Note: Number keys will not work unless you click the play button.]
          </span>
        </center>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  //When answer the quiz, record and calculate quiz score and key presses
  ////////////////////////////////////////////////////////////////////////////////
  next_question(pressed, time_pressed) {
    this.useEffect();
    document.removeEventListener("keydown", this._handleKeyDownNumbers);

    var qnRT = time_pressed - this.state.qnTime;
    var qnNum = this.state.qnNum;
    var quizSum = this.state.quizSum;
    var qnPressKey = this.state.qnPressKey;
    var qnCorr = this.state.qnCorr;
    var qnCorrIndiv = this.state.qnCorrIndiv;
    var quizAns = this.state.quizAns;
    var quizPer = this.state.quizPer;
    var qnNumTotal = this.state.qnNumTotal;

    var qnNumIdx = qnNum - 1;

    // Check answers if correct
    if (
      (qnNum === 1 && pressed === quizAns[0]) ||
      (qnNum === 2 && pressed === quizAns[1]) ||
      (qnNum === 3 && pressed === quizAns[2]) ||
      (qnNum === 4 && pressed === quizAns[3]) ||
      (qnNum === 5 && pressed === quizAns[4]) ||
      (qnNum === 6 && pressed === quizAns[5])
    ) {
      qnCorr[qnNumIdx] = 1;
      qnCorrIndiv = 1;
      quizSum = quizSum + 1;
    } else {
      qnCorr[qnNumIdx] = 0;
      qnCorrIndiv = 0;
    }
    //
    // console.log("Qn correct: " + qnCorr);
    // console.log("Total quiz score: " + quizSum);
    qnPressKey = pressed;

    quizPer = (qnNum / qnNumTotal) * 100;

    this.setState({
      qnNum: qnNum,
      quizPer: quizPer,
      quizSum: quizSum,
      qnPressKey: qnPressKey,
      qnRT: qnRT,
      qnCorr: qnCorr,
      qnCorrIndiv: qnCorrIndiv,
    });

    setTimeout(
      function () {
        this.saveData();
      }.bind(this),
      10
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Save data
  ////////////////////////////////////////////////////////////////////////////////
  saveData() {
    var userID = this.state.userID;
    var currTime = Math.round(performance.now());
    let quizbehaviour;
    if (this.state.volCalStage === "volCalib") {
      quizbehaviour = {
        userID: this.state.userID,
        prolificID: this.state.prolificID,
        sessionID: this.state.sessionID,
        date: this.state.date,
        startTime: this.state.startTime,
        volCalStage: this.state.volCalStage,
        checkTry: this.state.checkTry,
        qnTime: this.state.qnTime,
        qnRT: currTime - this.state.qnRT,
        qnNum: 1,
        soundFocus: this.state.calibSound,
        soundIndex: null, // this is in soundCal.js
        volume: this.state.volume,
        volumePer: null, // this is in soundCal.js, percent wrt to the chosen auido volume
        volumeNotLog: this.state.volumeNotLog,
        playNum: this.state.playNum, // this is only for the volume adjustment, for the headcheck task this should be 1
        quizAnsIndiv: null,
        qnPressKey: null,
        qnCorrIndiv: null,
        averRating: null, //no ratings in this script, but there is in sound Cal
        arouRating: null,
        averRatingDef: null,
        arouRatingDef: null,
      };

      //      fetch(`${DATABASE_URL}/vol_cal/` + userID, {
      //        method: "POST",
      //       headers: {
      //       Accept: "application/json",
      //       "Content-Type": "application/json",
      //      },
      //      body: JSON.stringify(quizbehaviour),
      //     });

      // console.log(quizbehaviour);

      setTimeout(
        function () {
          this.nextStage();
        }.bind(this),
        10
      );
    } else if (this.state.volCalStage === "headphoneCheck") {
      quizbehaviour = {
        userID: this.state.userID,
        prolificID: this.state.prolificID,
        sessionID: this.state.sessionID,
        date: this.state.date,
        startTime: this.state.startTime,
        volCalStage: this.state.volCalStage,
        checkTry: this.state.checkTry,
        qnTime: this.state.qnTime,
        qnRT: this.state.qnRT,
        qnNum: this.state.qnNum,
        soundFocus: this.state.quizSounds[this.state.qnNum - 1],
        soundIndex: null, // this is in soundCal.js
        volume: this.state.volume,
        volumePer: null, // this is in soundCal.js, percent wrt to the chosen auido volume
        volumeNotLog: this.state.volumeNotLog,
        playNum: this.state.playNum, // this is only for the volume adjustment, for the headcheck task this should be 1
        quizAnsIndiv: this.state.quizAns[this.state.qnNum - 1],
        qnPressKey: this.state.qnPressKey,
        qnCorrIndiv: this.state.qnCorrIndiv,
        averRating: null, //no ratings in this script, but there is in sound Cal
        arouRating: null,
        averRatingDef: null,
        arouRatingDef: null,
      };

      //    fetch(`${DATABASE_URL}/vol_cal/` + userID, {
      //      method: "POST",
      //      headers: {
      //        Accept: "application/json",
      //        "Content-Type": "application/json",
      //      },
      //      body: JSON.stringify(quizbehaviour),
      //    });

      // console.log(quizbehaviour);

      setTimeout(
        function () {
          this.nextQn();
        }.bind(this),
        10
      );
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Move to next question for headphone check
  ////////////////////////////////////////////////////////////////////////////////
  nextQn() {
    var qnNum = this.state.qnNum + 1;
    var currTime = Math.round(performance.now());

    this.setState({
      qnNum: qnNum,
      playNum: 0,
      qnTime: currTime,
      active: false,
      playAgain: false, //reset so next question can play once
      playOnceOnly: true, //change this to make sure sounds can only play once for the quiz
      soundFocus: null,
      quizAnsIndiv: null,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Functions for keypresses
  ////////////////////////////////////////////////////////////////////////////////
  _handleKeyDownNumbers = (event) => {
    var pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 49:
        pressed = 1;
        time_pressed = Math.round(performance.now());
        this.next_question(pressed, time_pressed);

        break;
      case 50:
        pressed = 2;
        time_pressed = Math.round(performance.now());
        this.next_question(pressed, time_pressed);

        break;
      case 51:
        pressed = 3;
        time_pressed = Math.round(performance.now());
        this.next_question(pressed, time_pressed);
        break;

      default:
    }
  };

  _handleRestartKey = (event) => {
    var pressed;
    var time_pressed;

    switch (event.keyCode) {
      case 32:
        pressed = 32;
        time_pressed = Math.round(performance.now());
        this.handleRestart(pressed, time_pressed);
        break;
      default:
    }
  };

  ////////////////////////////////////////////////////////////////////////////////
  //Reset from beginning if fail headphone check
  ////////////////////////////////////////////////////////////////////////////////
  redirectToBack() {
    document.removeEventListener("keydown", this._handleRestartKey);
    var checkTry = this.state.checkTry + 1;
    var vol = utils.logslider(80);
    this.setState({
      checkTry: checkTry,
      volCalStage: "volCalib",
      currentInstructionText: 1,
      quizScreen: false,
      qnNum: 1,
      playNum: 0,
      qnTime: 0,
      quizSum: 0,
      qnPressKey: [],
      qnCorr: [],
      active: false,
      volume: vol,
      volumeNotLog: 80,
    });
    setTimeout(
      function () {
        this.resetSounds();
      }.bind(this),
      0
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  //If fail headphone check, reset the sounds for another try
  ////////////////////////////////////////////////////////////////////////////////
  resetSounds() {
    var quizSounds = this.state.quizSounds;
    var quizAns = this.state.quizAns;
    var varPlayColour = this.state.varPlayColour;

    utils.shuffle(varPlayColour);
    utils.shuffleDouble(quizSounds, quizAns);

    this.setState({
      quizSounds: quizSounds,
      quizAns: quizAns,
      varPlayColour: varPlayColour,
      soundFocus: null,
      quizAnsIndiv: null,
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Function to ensure that the page starts from the top
  ////////////////////////////////////////////////////////////////////////////////
  useEffect() {
    window.scrollTo(0, 0);
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Move to next section of task
  ////////////////////////////////////////////////////////////////////////////////
  redirectToTarget() {
    document.removeEventListener("keyup", this._handleDebugKey);

    var condUrl =
      "/SoundCal?PROLIFIC_PID=" +
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
        volumeNotLog: this.state.volumeNotLog,
      },
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Rendering
  ////////////////////////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.debug === false) {
      if (this.state.volCalStage === "volCalib") {
        //this is to adjust sound volume
        if (this.state.currentInstructionText === 1) {
          document.addEventListener("keyup", this._handleInstructKey);
          this.useEffect();
          text = (
            <div>
              <span>
                <center>
                  <strong>WELCOME</strong>
                </center>
                <br />
                Today, we will be playing a game that will require the use of
                several sounds.
                <br />
                <br />
                Before we begin, we will first need to adjust some sound-related
                settings.
                <br />
                <br />
                To do this, you should be in a quiet environment, and you must{" "}
                <br />
                be wearing either headphones or earphones throughout the
                session.
                <br /> <br />
                Please put on your <b>headphones or earphones</b> now.
                <br /> <br />
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
                Great! First, we need to set your sound settings to an
                appropriate level.
                <br /> <br />
                Please set your computer system volume level to{" "}
                <strong>30% of the maximum</strong>. Now, click the play button
                below.
                <br />
                <br />
                <center>
                  <PlayButton
                    audio={this.state.calibSound}
                    play={this.togglePlaying}
                    stop={this.togglePlaying}
                    volume={this.state.volume}
                    idleBackgroundColor={this.state.varPlayColour[0]}
                    active={this.state.active}
                  />
                </center>
                <br />
                If it is too loud or soft, adjust the volume on the slider
                below.
                <br />
                You can click the play button as many times as you like.
                <br />
                <br />
                You should aim for a <u>loud but comfortable</u> level.
                <br />
                <br />
                <br />
                <center>
                  <SliderVol.SliderVol
                    callBackValue={this.callbackVol.bind(this)}
                    callBackValueNotLog={this.callbackVolNotLog.bind(this)}
                  />
                </center>
                <br />
                Please continue on to the next page when you are happy with the
                sound level.
                <br />
                <br />
                <center>
                  [<strong>←</strong>] [<strong>→</strong>]
                </center>
              </span>
            </div>
          );
        }
      } else if (this.state.volCalStage === "headphoneCheck") {
        this.useEffect();
        // this is the 3 sound quiz
        if (this.state.quizScreen === false) {
          text = (
            <div>
              <span>
                <center>
                  <strong>AUDIO TEST: PART I</strong>
                </center>
                <br />
                To ensure that all is working properly, you will now complete an
                audio screening task.
                <br />
                <br />
                It is important that you <u>keep your headphones on</u>, and{" "}
                <u>do not adjust</u> your sound settings.
                <br />
                <br />
                You will need to pass this quiz in order to proceed further.
                <br /> <br />
                <center>
                  Press [<strong>SPACEBAR</strong>] to begin.
                </center>
              </span>
            </div>
          );
        } else {
          //QUIZ STARTS
          if (this.state.qnNum <= this.state.qnNumTotal) {
            text = (
              <div>
                <span>{this.display_question(this.state.qnNum)}</span>
              </div>
            );
          } else {
            // If finish questionnaire, stop listener and calculate quiz score
            document.removeEventListener("keydown", this._handleKeyDownEnter);
            if (this.state.quizSum > this.state.qnNumTotal - 2) {
              // ie either 5 or 6
              this.redirectToTarget();
            } else {
              document.addEventListener("keydown", this._handleRestartKey);
              text = (
                <div>
                  <span>
                    <center>
                      <strong>END AUDIO CHECK</strong>
                    </center>
                    <br />
                    <br />
                    Sorry, you failed the screening test.
                    <br />
                    <br />
                    You scored {this.state.quizSum} out of{" "}
                    {this.state.qnNumTotal} questions correctly.
                    <br />
                    <br />
                    Please ensure that you are wearing headphones/earphones and
                    calibrate a louder audio volume.
                    <br />
                    <br />
                    <center>
                      Press [<strong>SPACEBAR</strong>] to calibrate the volume
                      again.
                    </center>
                  </span>
                </div>
              );
            }
          }
        }
      }
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div>
          <span>
            Press the [<strong>SPACEBAR</strong>] to skip to next section.
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
}

export default withRouter(HeadphoneCheck);
