import React from "react";
import { Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

import attenSound from "./sounds/task/IADSE_pianomed1360_5000.wav";
import fbSound from "./sounds/task/morriss_scream_1000.wav";
import avoidSound from "./sounds/task/bacigalupo_whitenoise_1000_minus10.wav";
import neutralSound from "./sounds/task/browniannoise_08amp_1500.wav";

import otherSound1 from "./sounds/task/250hz_sinetone_08amp_1500.wav";
import otherSound2 from "./sounds/task/800hz_sinetone_08amp_1500.wav";
import otherSound3 from "./sounds/task/5000hz_sinetone_08amp_1500.wav";
import otherSound4 from "./sounds/task/YangIADSE_cicada0335_1500.wav";
import otherSound5 from "./sounds/task/YangIADSE_water0921_2000.wav";
import otherSound6 from "./sounds/task/zaldPardo_metalscreech_1500.wav";

import * as RatingSlider from "./sliders/RatingSlider.js";
import styles from "./style/taskStyle.module.css";
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

var varPlayColour = [
  "#d02f33",
  "#cd5a7e",
  "#49458d",
  "#c17860",
  "#19cdc4",
  "#430031",
  "#21d770",
  "#948082",
  "#bfafed",
  "#b6c8a9",
  "#0e0399",
  "#d16ab1",
  "#3f0d9a",
  "#c42557",
  "#8e63a0",
  "#706804",
  "#435f07",
  "#8050a9",
  "#0f46e1",
  "#197cab",
  "#9a287c",
  "#b20d44",
  "#0a286a",
  "#e5af2d",
  "#ed3e92",
  "#84473c",
  "#6864a1",
  "#e336c9",
  "#70ddc9",
  "#6864ca",
];

// this is the main sound array
var soundArray = [
  attenSound,
  fbSound,
  avoidSound,
  neutralSound,
  otherSound1,
  otherSound2,
  otherSound3,
  otherSound4,
  otherSound5,
  otherSound6,
];
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

    const userID = this.props.location.state.userID;
    const date = this.props.location.state.date;
    const startTime = this.props.location.state.startTime;
    const volume = this.props.location.state.volume;
    const volumeNotLog = this.props.location.state.volumeNotLog;

    const fix = this.props.location.state.fix;
    const stimTrain1 = this.props.location.state.stimTrain1;
    const stimTrain2 = this.props.location.state.stimTrain2;
    const counter = this.props.location.state.counter;
    const fbAver = this.props.location.state.fbAver;
    const fbSafe = this.props.location.state.fbSafe;
    const fbAvoid = this.props.location.state.fbAvoid;
    const astrodude = this.props.location.state.astrodude;
    const stim1 = this.props.location.state.stim1;
    const stim2 = this.props.location.state.stim2;
    const stim3 = this.props.location.state.stim3;
    const stim4 = this.props.location.state.stim4;
    const stim5 = this.props.location.state.stim5;
    const stim6 = this.props.location.state.stim6;

    // var userID = 1000;
    // var date = 1000;
    // var startTime = 1000;
    // var volume = 80;
    // var volumeNotLog = 39;

    var averRatingDef = randomArray(qnNumTotal, 35, 65);
    var arouRatingDef = randomArray(qnNumTotal, 35, 65);

    // keys for the slider
    var sliderKey = Array.from(Array(qnNumTotal).keys());

    var qnTime = Math.round(performance.now());

    ////////////////////////////////////////////////////////////////////////////////
    //Set state
    ////////////////////////////////////////////////////////////////////////////////
    this.state = {
      userID: userID,
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
      arouRatingDef: arouRatingDef,
      averRating: null,
      arouRating: null,
      active: false,
      soundFocus: null,
      btnDisNext: true,

      // these are the markers for the staircase
      fullAverRating: 0,
      fullArouRating: 0,
      // neutralRating: 0,
      halfAverRating: 0,
      halfArouRating: 0,

      fix: fix,
      stimTrain1: stimTrain1,
      stimTrain2: stimTrain2,
      counter: counter,
      fbAver: fbAver,
      fbSafe: fbSafe,
      fbAvoid: fbAvoid,
      astrodude: astrodude,
      stim1: stim1,
      stim2: stim2,
      stim3: stim3,
      stim4: stim4,
      stim5: stim5,
      stim6: stim6,

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
    } else if (whichButton === 5 && curText < 4) {
      this.setState({ currentInstructionText: curText + 1 });
    } else if (whichButton === 32 && curText === 4) {
      //go to saveData
      setTimeout(
        function () {
          this.start_quest();
        }.bind(this),
        5
      );
    } else if (whichButton === 32 && curText === 5) {
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
    if (
      this.state.averRating !== null &&
      this.state.arouRating !== null &&
      this.state.playNum > 0
    ) {
      this.setState({ btnDisNext: false });
    }
  }

  callbackArou(callBackValue) {
    this.setState({ arouRating: callBackValue });
    if (
      this.state.averRating !== null &&
      this.state.arouRating !== null &&
      this.state.playNum > 0
    ) {
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
    var key2;
    var averRatingDef;
    var arouRatingDef;
    var varPlayColour = this.state.varPlayColour[qnNumShow - 1];
    var volume = this.state.volume;

    if (this.state.volCalStage === "affRatings") {
      key1 = this.state.sliderKey[qnIndx];
      key2 = this.state.sliderKey[qnIndx] + this.state.qnNumTotal;
      averRatingDef = this.state.averRatingDef[qnIndx];
      arouRatingDef = this.state.arouRatingDef[qnIndx];
      // this is the staircase calibration for the half aversive noise
    } else if (this.state.volCalStage === "affCalibAver") {
      key1 = this.state.sliderKey[qnIndx] + 10;
      key2 = this.state.sliderKey[qnIndx] + 50;
      averRatingDef = this.state.averRatingDef;
      arouRatingDef = this.state.arouRatingDef;
    } else if (this.state.volCalStage === "affCalibAvoid") {
      key1 = this.state.sliderKey[qnIndx] + 100;
      key2 = this.state.sliderKey[qnIndx] + 500;
      averRatingDef = this.state.averRatingDef;
      arouRatingDef = this.state.arouRatingDef;
    }

    let question_text = (
      <div className={styles.main}>
        <span>
          <span className={styles.center}>
            <strong>Sound {qnNumShow}</strong>
          </span>
          <br />
          Please do not adjust your volume settings.
          <br />
          You can play the sound as many times as you like!
        </span>
      </div>
    );
    let question_text1;

    // if the index is not for the frequencies that wee chosen before...
    question_text1 = (
      <div>
        <span className={styles.centerTwo}>
          <PlayButton
            audio={this.state.soundFocus}
            play={this.togglePlaying}
            stop={this.togglePlaying}
            volume={volume}
            idleBackgroundColor={varPlayColour}
            active={this.state.active}
          />
          <br />
        </span>
      </div>
    );

    let question_text2 = (
      <div className={styles.main}>
        <span className={styles.centerTwo}>
          <strong>Q{qnNumShow}a:</strong> How pleasant is this sound?
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
          <strong>Q{qnNumShow}b:</strong> How arousing is this sound?
          <br />
          <br />
          <RatingSlider.ArouSlider
            key={key2}
            callBackValue={this.callbackArou.bind(this)}
            initialValue2={arouRatingDef}
          />
          <br />
          <br />
          <span className={styles.smallfont}>
            [Note: You must play the sound and <strong>drag</strong> (not click)
            all sliders at least once to click NEXT.]
          </span>
          <br />
          <br />
          <Button
            id="right"
            className={styles.clc}
            disabled={this.state.btnDisNext}
            onClick={this.saveData.bind(this)}
          >
            NEXT
          </Button>
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
    if (this.state.volCalStage === "affRatings") {
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
        arouRating: this.state.arouRating,
        averRatingDef: this.state.averRatingDef[this.state.qnNum - 1],
        arouRatingDef: this.state.arouRatingDef[this.state.qnNum - 1],
      };
    } else if (
      this.state.volCalStage === "affCalibAver" ||
      this.state.volCalStage === "affCalibAvoid"
    ) {
      //second calibration quiz rating quiz

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
        arouRating: this.state.arouRating,
        averRatingDef: Number(this.state.averRatingDef),
        arouRatingDef: Number(this.state.arouRatingDef),
      };
    }

    // console.log("averRating: " + this.state.averRating);
    // console.log("arouRating: " + this.state.arouRating);
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
    if (this.state.volCalStage === "affRatings") {
      if (this.state.soundIndex === 1) {
        this.setState({
          fullAverRating: Number(this.state.averRating),
          fullArouRating: Number(this.state.arouRating),
          volumeFullAver: Number(this.state.volume),
          volumeNotLogFullAver: Number(this.state.volumeNotLog),
        });
      } else if (this.state.soundIndex === 2) {
        this.setState({
          halfAverRating: Number(this.state.averRating),
          halfArouRating: Number(this.state.arouRating),
          volumeHalfAver: Number(this.state.volume),
          volumeNotLogHalfAver: Number(this.state.volumeNotLog),
        });
      }
      // else if (this.state.soundIndex === 3) {
      //   this.setState({ neutralRating: Number(this.state.averRating) });
      // }
    } else if (this.state.volCalStage === "affCalibAver") {
      this.setState({
        fullAverRating: Number(this.state.averRating),
        fullArouRating: Number(this.state.arouRating),
        volumeFullAver: Number(this.state.volume),
        volumeNotLogFullAver: Number(this.state.volumeNotLog),
      });
    } else if (this.state.volCalStage === "affCalibAvoid") {
      this.setState({
        halfAverRating: Number(this.state.averRating),
        halfArouRating: Number(this.state.arouRating),
        volumeHalfAver: Number(this.state.volume),
        volumeNotLogHalfAver: Number(this.state.volumeNotLog),
      });
    }

    setTimeout(
      function () {
        this.quizNext();
      }.bind(this),
      10
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  //Next quiz
  ////////////////////////////////////////////////////////////////////////////////
  quizNext() {
    this.useEffect();
    var qnTime = Math.round(performance.now());
    var qnNum = this.state.qnNum + 1;
    var qnNumShow = this.state.qnNumShow + 1;
    var averRatingDef = randomArray(1, 35, 65);
    var arouRatingDef = randomArray(1, 35, 65);

    var ratingToReach;
    var ratingToReachMin;
    var ratingToReachMax;
    var volumePer;
    var volumeNew;
    var volumeNotLog;

    // console.log("volCalStage: " + this.state.volCalStage);
    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////
    if (this.state.volCalStage === "affRatings") {
      //
      if (qnNum <= this.state.qnNumTotal) {
        // While participant is still in the first rating phase,
        // for the next sound...
        var qnNumTotalIndex = this.state.qnNumTotalIndex;
        var soundIndex = qnNumTotalIndex[qnNum - 1];
        var soundbite = this.state.sounds[soundIndex];

        // console.log("soundIndex: " + soundIndex);
        // console.log("soundbite: " + soundbite);

        this.setState({
          qnNum: qnNum,
          qnNumShow: qnNumShow,
          qnTime: qnTime,
          soundIndex: soundIndex,
          playNum: 0,
          averRating: null,
          arouRating: null,
          btnDisNext: true,
          active: false,
          soundFocus: soundbite,
        });

        // console.log("Def volumePer: " + this.state.volumePer);
        // console.log("Def volume: " + this.state.volume);
      } else {
        // When the first rating is over, set up for the calibration phase.
        // Two calibrations to be done
        // 1) Calibrate the scream if it too postive <= 30
        ///////////////////////////////////////////////////////////////////////
        // console.log("Finish initial rating.");
        // console.log("fullAverRating: " + this.state.fullAverRating);
        // console.log("halfAverRating: " + this.state.halfAverRating);

        // Play the scream again after the initial ratings

        // console.log("Finish initial rating - scream rating too pleasant");
        // increase the volume of the scream
        volumePer = 1;
        volumeNew = logslider(logposition(this.state.volumeDef) * volumePer);

        // console.log("New volumePer: " + volumePer);
        // console.log("New volumeNew: " + volumeNew);

        // the maximum it can go is 100 volume
        if (volumeNew >= 100) {
          volumeNew = 100;
          volumePer =
            logposition(volumeNew) / logposition(this.state.volumeDef);
        }

        volumeNotLog = logposition(volumeNew);
        // console.log("New volumePer: " + volumePer);
        // console.log("New volumeNew: " + volumeNew);

        this.setState({
          qnTime: qnTime,
          volCalStage: "affCalibAver", //this leads to the next section
          qnNum: 1,
          qnNumShow: qnNumShow,
          soundIndex: 1,
          volume: volumeNew,
          volumeNotLog: volumeNotLog,
          volumePer: volumePer,
          playNum: 0,
          averRating: null,
          arouRating: null,
          btnDisNext: true,
          active: false,
          soundFocus: this.state.sounds[1], // this should be the half aversive sound
          averRatingDef: averRatingDef,
          arouRatingDef: arouRatingDef,
        });
        // this will directly start the quiz without a direct send because qnNum = 1
      }
      //////////////////////////////////////////////////////////////////////
    } else if (this.state.volCalStage === "affCalibAver") {
      // this if only if aversive sound is too plesanet, so need to toggle

      if (this.state.fullAverRating > 30 && this.state.volume !== 100) {
        // console.log(
        //   "affCalibAver - scream too pleasant and hasnt reached 100 vol"
        // );
        //
        // console.log("affCalibAver -  scream too pleasant adjust more");
        volumePer = Number(this.state.volumePer) + 0.1;
        volumeNew = logslider(logposition(this.state.volumeDef) * volumePer);

        if (volumeNew >= 100) {
          volumeNew = 100;
          volumePer =
            logposition(volumeNew) / logposition(this.state.volumeDef);
        }

        volumeNotLog = logposition(volumeNew);
        // console.log("New volumePer: " + volumePer);
        // console.log("New volumeNew: " + volumeNew);

        this.setState({
          qnTime: qnTime,
          qnNum: qnNum,
          qnNumShow: qnNumShow,
          soundIndex: 1,
          volume: volumeNew,
          volumeNotLog: volumeNotLog,
          volumePer: volumePer,
          playNum: 0,
          averRating: null,
          arouRating: null,
          btnDisNext: true,
          active: false,
          soundFocus: this.state.sounds[1],
          averRatingDef: averRatingDef,
          arouRatingDef: arouRatingDef,
        });
      } else {
        // if the ratings finally have reached, then
        // then caluculate if avoid is within the rating
        // console.log("affCalibAver - scream is fine");
        //check if the avoid sound is somwhere in mid of unplesaent to 50
        ratingToReach =
          this.state.fullAverRating + (50 - this.state.fullAverRating) / 2;
        ratingToReachMin = ratingToReach - 5;
        ratingToReachMax = ratingToReach + 5;

        // console.log(
        //   "New ratingToReach: " + ratingToReachMin + " to " + ratingToReachMax
        // );
        // console.log("halfAverRating: " + this.state.halfAverRating);
        // if rating is TOO aversive

        // console.log("affCalibAver - white nosie too unpleasant");
        volumePer = 1;
        volumeNew = logslider(logposition(this.state.volumeDef) * volumePer);

        // the minimum it can go is 1 volume
        if (volumeNew <= 1) {
          volumeNew = 1;
          volumePer =
            logposition(volumeNew) / logposition(this.state.volumeDef);
        }

        volumeNotLog = logposition(volumeNew);
        // console.log("New volumePer: " + volumePer);
        // console.log("New volumeNew: " + volumeNew);
        this.setState({
          qnTime: qnTime,
          qnNum: 1,
          qnNumShow: qnNumShow,
          volCalStage: "affCalibAvoid",
          soundIndex: 2,
          volume: volumeNew,
          volumeNotLog: volumeNotLog,
          volumePer: volumePer,
          playNum: 0,
          averRating: null,
          arouRating: null,
          btnDisNext: true,
          active: false,
          soundFocus: this.state.sounds[2], // this should be the half aversive sound
          averRatingDef: averRatingDef,
          arouRatingDef: arouRatingDef,
        });
      }
      //////////////////////////////////////////////////////////////////////
    } else if (this.state.volCalStage === "affCalibAvoid") {
      ratingToReach =
        this.state.fullAverRating + (50 - this.state.fullAverRating) / 2;
      ratingToReachMin = ratingToReach - 5;
      ratingToReachMax = ratingToReach + 5;
      // console.log(
      //   "New ratingToReach: " + ratingToReachMin + " to " + ratingToReachMax
      // );
      /// too aversive
      if (this.state.averRating < ratingToReachMin) {
        // console.log("affCalibAvoid - white nosie is too unpleasant");
        volumePer = Number(this.state.volumePer) - 0.1;
        volumeNew = logslider(logposition(this.state.volumeDef) * volumePer);

        // the minimum it can go is 1 volume
        if (volumeNew <= 1) {
          volumeNew = 1;
          volumePer =
            logposition(volumeNew) / logposition(this.state.volumeDef);
        }

        volumeNotLog = logposition(volumeNew);

        // console.log("New volumePer: " + volumePer);
        // console.log("New volumeNew: " + volumeNew);

        this.setState({
          qnTime: qnTime,
          qnNum: qnNum,
          qnNumShow: qnNumShow,
          soundIndex: 2,
          volume: volumeNew,
          volumeNotLog: volumeNotLog,
          volumePer: volumePer,
          playNum: 0,
          averRating: null,
          arouRating: null,
          btnDisNext: true,
          active: false,
          soundFocus: this.state.sounds[2], // this should be the half aversive sound
          averRatingDef: averRatingDef,
          arouRatingDef: arouRatingDef,
        });
      }
      // if it is too pleasant, increase the volume
      else if (
        this.state.averRating > ratingToReachMax &&
        this.state.volume !== 100
      ) {
        // console.log(
        //   "affCalibAvoid - white nosie is too pleasant and hasnt reached 100 vol"
        // );
        volumePer = Number(this.state.volumePer) + 0.1;
        volumeNew = logslider(logposition(this.state.volumeDef) * volumePer);

        // the maximum it can go is 100 volume
        if (volumeNew >= 100) {
          volumeNew = 100;
          volumePer =
            logposition(volumeNew) / logposition(this.state.volumeDef);
        }

        volumeNotLog = logposition(volumeNew);

        // console.log("New volumePer: " + volumePer);
        // console.log("New volumeNew: " + volumeNew);

        this.setState({
          qnTime: qnTime,
          qnNum: qnNum,
          qnNumShow: qnNumShow,
          soundIndex: 2,
          volume: volumeNew,
          volumeNotLog: volumeNotLog,
          volumePer: volumePer,
          playNum: 0,
          averRating: null,
          arouRating: null,
          btnDisNext: true,
          active: false,
          soundFocus: this.state.sounds[2], // this should be the half aversive sound
          averRatingDef: averRatingDef,
          arouRatingDef: arouRatingDef,
        });
      } else {
        // if the ratings are already in view, then go straight towards the task
        // console.log("affCalibAvoid - white nosie is fine");
        setTimeout(
          function () {
            this.tutorTask();
          }.bind(this),
          5
        );
      }
    }
  }

  // averIsFine() {
  //   // if aversive Noise is as aversive as expected, save the data again anyway bc its easier
  //   var userID = this.state.userID;
  //   let quizbehaviour;
  //
  //   quizbehaviour = {
  //     userID: this.state.userID,
  //     date: this.state.date,
  //     startTime: this.state.startTime,
  //     volCalStage: "affCalibAver",
  //     checkTry: null, //this is in headphoneCheck.js
  //     qnTime: null,
  //     qnRT: null,
  //     qnNum: this.state.qnNum,
  //     soundIndex: 1,
  //     soundFocus: this.state.sounds[1],
  //     volume: this.state.volumeFullAver,
  //     volumePer: this.state.volumePer,
  //     volumeNotLog: this.state.volumeNotLogFullAver,
  //     playNum: null,
  //     quizAnsIndiv: null, // no questions in this js but yes in headphonecheck
  //     qnPressKey: null,
  //     qnCorrIndiv: null,
  //     averRating: this.state.fullAverRating,
  //     arouRating: this.state.fullArouRating,
  //     averRatingDef: null,
  //     arouRatingDef: null,
  //   };
  //
  //   fetch(`${DATABASE_URL}/vol_cal/` + userID, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(quizbehaviour),
  //   });
  //
  //   // console.log(quizbehaviour);
  // }
  //
  // avoidIsFine() {
  //   // if aversive Noise is as aversive as expected, save the data again anyway bc its easier
  //
  //   var userID = this.state.userID;
  //   let quizbehaviour;
  //
  //   quizbehaviour = {
  //     userID: this.state.userID,
  //     date: this.state.date,
  //     startTime: this.state.startTime,
  //     volCalStage: "affCalibAvoid",
  //     checkTry: null, //this is in headphoneCheck.js
  //     qnTime: null,
  //     qnRT: null,
  //     qnNum: this.state.qnNum,
  //     soundIndex: 2,
  //     soundFocus: this.state.sounds[2],
  //     volume: this.state.volumeHalfAver,
  //     volumePer: this.state.volumePer,
  //     volumeNotLog: this.state.volumeNotLogHalfAver,
  //     playNum: null,
  //     quizAnsIndiv: null, // no questions in this js but yes in headphonecheck
  //     qnPressKey: null,
  //     qnCorrIndiv: null,
  //     averRating: this.state.halfAverRating,
  //     arouRating: this.state.halfArouRating,
  //     averRatingDef: null,
  //     arouRatingDef: null,
  //   };
  //
  //   fetch(`${DATABASE_URL}/vol_cal/` + userID, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(quizbehaviour),
  //   });
  //
  //   // console.log(quizbehaviour);
  // }

  tutorTask() {
    this.setState({
      quizScreen: false,
      currentInstructionText: 5,
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
    this.props.history.push({
      pathname: `/TutorTask`,
      state: {
        userID: this.state.userID,
        date: this.state.date,
        startTime: this.state.startTime,
        volume: this.state.volume,
        volumeHalfAver: this.state.volumeHalfAver,
        volumeFullAver: this.state.volumeFullAver,

        fix: this.state.fix,
        stimTrain1: this.state.stimTrain1,
        stimTrain2: this.state.stimTrain2,
        counter: this.state.counter,
        fbAver: this.state.fbAver,
        fbSafe: this.state.fbSafe,
        fbAvoid: this.state.fbAvoid,
        astrodude: this.state.astrodude,

        stim1: this.state.stim1,
        stim2: this.state.stim2,
        stim3: this.state.stim3,
        stim4: this.state.stim4,
        stim5: this.state.stim5,
        stim6: this.state.stim6,
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
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>AUDIO TEST: PART II</strong>
                </span>
                <br />
                Good job!
                <br />
                <br />
                For the next part of the audio screening, we will present you
                with some sounds.
                <br />
                <br />
                All you have to do is to listen to them and rate the extent to
                which they made you feel on some scales.
                <br /> <br />
                There are 2 scales:
                <br />
                1) <strong>pleasantness</strong>: on scale of unpleasant to
                pleasant
                <br />
                2) <strong>arousal</strong>: on scale of sleepy to awake <br />
                <br />
                <br />
                <span className={styles.centerTwo}>
                  [<strong>NEXT</strong> →]
                </span>
              </p>
            </div>
          );
        } else if (this.state.currentInstructionText === 2) {
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>AUDIO TEST: PART II</strong>
                </span>
                <br />
                When you are asked to rate the sound on the:
                <br /> <br />
                <span className={styles.centerTwo}>
                  <strong>Pleasantness</strong> scale
                </span>
                <br />
                <RatingSlider.ExampleAver />
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
                <span className={styles.centerTwo}>
                  [← <strong>BACK</strong>] [<strong>NEXT</strong> →]
                </span>
              </p>
            </div>
          );
        } else if (this.state.currentInstructionText === 3) {
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>AUDIO TEST: PART II</strong>
                </span>
                <br />
                When you are asked to rate the sound on the:
                <br /> <br />
                <span className={styles.centerTwo}>
                  <strong>Arousal</strong> scale
                </span>
                <br />
                <RatingSlider.ExampleArou />
                <br />
                <br />
                <strong>Not arousing</strong> sounds (0 on the scale) would be
                sounds which
                <br />
                make you feel very sleepy, bored or low energy.
                <br />
                <br />
                In contrast, <strong>very arousing</strong> sounds (100 on the
                scale) would be
                <br />
                sounds that make you feel very awake, excited or high energy.
                <br />
                <br />
                <strong>Neutral</strong> sounds (50 on the scale) would be
                sounds
                <br />
                that are neither low nor high energy to you.
                <br />
                <br />
                <span className={styles.centerTwo}>
                  [← <strong>BACK</strong>] [<strong>NEXT</strong> →]
                </span>
              </p>
            </div>
          );
        } else if (this.state.currentInstructionText === 4) {
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>AUDIO TEST: PART II</strong>
                </span>
                <br />
                Remember to <u>keep your headphones on</u> and{" "}
                <u>do not adjust</u> your sound settings.
                <br />
                <br />
                Some sounds may repeat.
                <br />
                <br />
                <span className={styles.centerTwo}>
                  When you are ready, press <strong>SPACEBAR</strong> to begin.
                </span>
                <br />
                <span className={styles.centerTwo}>
                  [← <strong>BACK</strong>]
                </span>
              </p>
            </div>
          );
        } else if (this.state.currentInstructionText === 5) {
          document.addEventListener("keyup", this._handleInstructKey);
          text = (
            <div className={styles.main}>
              <p>
                <span className={styles.center}>
                  <strong>AUDIO TEST: PART II</strong>
                </span>
                <br />
                Great! You are now ready to begin the game.
                <br />
                <br />
                <span className={styles.centerTwo}>
                  When you are ready, press <strong>SPACEBAR</strong>.
                </span>
              </p>
            </div>
          );
        }
      } else {
        //this is the quiz // quizscreen is true
        //QUIZ STARTS

        text = (
          <div className="questionnaire">
            <center>
              <br />
              {this.ratingTask(this.state.qnNum)}
              <br />
            </center>
          </div>
        );
      }
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div className={styles.main}>
          <p>
            <span className={styles.center}>DEBUG MODE</span>
            <br />

            <span className={styles.centerTwo}>
              Press the [<strong>SPACEBAR</strong>] to skip to next section.
            </span>
          </p>
        </div>
      );
    }
    return <div className={styles.spaceship}>{text}</div>;
  }

  // this is the end of the component
}

export default withRouter(SoundCal);
