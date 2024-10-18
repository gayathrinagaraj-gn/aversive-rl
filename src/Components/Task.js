import React from "react";
import DrawFix from "./DrawFix.js";
import style from "./style/taskStyle.module.css";
import * as utils from "./utils.js";
import withRouter from "./withRouter.js";

import { DATABASE_URL } from "./config.js";

import stim1 from "./fractals/bandit07.png";
import stim2 from "./fractals/bandit08.png";
import stim3 from "./fractals/bandit09.png";
import stim4 from "./fractals/bandit10.png";
import stim5 from "./fractals/bandit11.png";
import stim6 from "./fractals/bandit12.png";
import fbPic from "./fractals/audio-sound.png";

import averSound from "./sounds/task/morriss_scream_1000.wav";
import neuSound from "./sounds/task/bacigalupo_whitenoise_1000_minus15.wav";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TASK
// n=120 trials, break every 40 trials?

class Task extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    //when deug
    const userID = 100;
    const prolificID = 100;
    const sessionID = 100;
    const date = 100;
    const startTime = 100;
    const volume = 80;

    // const userID = this.props.state.userID;
    //const prolificID = this.props.state.prolificID;
    //const sessionID = this.props.state.sessionID;
    // const date = this.props.state.date;
    //const startTime = this.props.state.startTime;
    // const stimPic = this.props.state.stimPic;
    //const volume = this.props.state.volume;

    var trialNumTotal = 12;
    var blockNumTotal = 3;
    var trialNumPerBlock = Math.round(trialNumTotal / blockNumTotal);

    //the stim position
    var taskStimPos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(taskStimPos);

    var stimPic = [stim1, stim2, stim3, stim4, stim5, stim6];
    utils.shuffle(stimPic);

    //cond is determined by number of corrects - inside the code

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      // demo paramters
      userID: userID,
      prolificID: prolificID,
      sessionID: sessionID,
      date: date,
      startTime: startTime,

      //section paramters
      sectionTime: sectionTime,
      section: "task",

      // trial timings in ms
      fixTimeLag: 500, // the very first fixation
      // stimTimeLag: 1500, // there is no fixed time for stim
      respFbTimeLag: 500, //
      postRespTimeLag: [500, 600, 700], // post choice fixation jitter
      fbTimeLag: 1250, // how long the sound is played
      itiTimeLag: [250, 350, 450], // this adds to the first fixation, iti jitter

      averSound: averSound,
      neuSound: neuSound,
      volume: volume,

      //trial parameters
      trialNumTotal: trialNumTotal,
      blockNumTotal: blockNumTotal,
      trialNumPerBlock: trialNumPerBlock,
      stimPosList: taskStimPos,
      stimCondList: null,

      respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O
      tutorialTry: 1,

      stimPic: stimPic,
      fbPic: fbPic,

      //trial by trial paramters
      trialNum: 0,
      trialinBlockNum: 0,
      trialTime: 0,
      fixTime: 0,
      stimPos: 0,
      stimCond: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      postRespTime: 0,
      fbTime: 0,
      itiTime: 0,
      continSwap: 0,
      whenSwap: null,

      choice: null,
      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctMatReset: [], // resets with every swap
      correctPer: 0,
      contingency: 0.8,
      soundPlay: null,

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1
      taskScreen: false,
      taskSection: null,
      debug: false,
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keyup", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    this.handleDebugKey = this.handleDebugKey.bind(this);
    this.handleInstruct = this.handleInstruct.bind(this);
    this.handleBegin = this.handleBegin.bind(this);
    this.handleResp = this.handleResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.averSound = new Audio(this.state.averSound);
    this.neuSound = new Audio(this.state.neuSound);

    this.averSound.volume = this.state.volume / 100;
    this.neuSound.volume = this.state.volume / 100;
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// KEYBOARD HANDLES ////

  handleDebugKey(pressed) {
    var whichButton = pressed;

    if (whichButton === 10) {
      document.removeEventListener("keyup", this._handleDebugKey);
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
        this.handleDebugKey(pressed);
        break;
      default:
    }
  };

  // This handles instruction screen within the component USING KEYBOARD
  handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    // from page 1 to 5, I can move forward a page
    if (whichButton === 2 && curInstructNum >= 1 && curInstructNum <= 4) {
      this.setState({ instructNum: curInstructNum + 1 });
      // from page 2 to 6, I can move backward a page
    } else if (
      whichButton === 1 &&
      curInstructNum >= 2 &&
      curInstructNum <= 5
    ) {
      // from page 6 to 7, I can move forward a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if (
      whichButton === 2 &&
      curInstructNum >= 6 &&
      curInstructNum <= 7
    ) {
      // from page 7 to 8, I can move back a page
      this.setState({ instructNum: curInstructNum + 1 });
    } else if (
      whichButton === 1 &&
      curInstructNum >= 7 &&
      curInstructNum <= 8
    ) {
      this.setState({ instructNum: curInstructNum - 1 });
    }
  }

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;
    if (whichButton === 3 && curInstructNum === 1) {
      var whenSwap = utils.randomArray(6, 10);
      this.setState({
        trialNum: 1,
        trialinBlockNum: 1,
        correctMat: [], //put correct in vector, to cal perf %
        correctMatReset: [],
        whenSwap: whenSwap,
      });
      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 2) {
      this.setState({
        trialinBlockNum: 1,
      });
      setTimeout(
        function () {
          this.breakEnd();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 3) {
      //12
      setTimeout(
        function () {
          this.redirectToNextTask();
        }.bind(this),
        0
      );
    }
  }

  handleResp(keyPressed, timePressed) {
    var respTime = timePressed - (this.state.trialTime + this.state.fixTime);

    var choice;
    var correct;
    var stimPicChosen1;
    var stimPicChosen2;
    var soundPlay;

    var stimPos = this.state.stimPos; //determined at trial reset
    var stimCond = this.state.stimCond; //determined at trial reset
    var fbCss;

    if (keyPressed === 1) {
      //if i choose left
      choice = "left";
      stimPicChosen1 = style.stimLeftChosen;
      stimPicChosen2 = style.stimRightNotChosen;
      if (stimPos === 1 && stimCond === 1) {
        correct = 1;
        fbCss = style.correct;
      } else if (stimPos === 2 && stimCond === 2) {
        correct = 1;
        fbCss = style.correct;
      } else {
        correct = 0;
        fbCss = style.incorrect;
      }
    } else if (keyPressed === 2) {
      choice = "right";
      stimPicChosen1 = style.stimLeftNotChosen;
      stimPicChosen2 = style.stimRightChosen;
      if (stimPos === 2 && stimCond === 1) {
        correct = 1;
        fbCss = style.correct;
      } else if (stimPos === 1 && stimCond === 2) {
        correct = 1;
        fbCss = style.correct;
      } else {
        correct = 0;
        fbCss = style.incorrect;
      }
    } else {
      choice = null;
      correct = null;
      fbCss = style.nfb;
    }

    if (correct === 1) {
      //if it is correct, then it is the less aversive noise
      if (Math.random() < this.state.contingency) {
        soundPlay = 1; //less aversive
      } else {
        soundPlay = 2; //more aversive
      }
    } else if (correct === 0) {
      if (Math.random() > this.state.contingency) {
        soundPlay = 1;
      } else {
        soundPlay = 2;
      }
    } else {
      soundPlay = null;
    }

    //  console.log("response: " + response);
    var correctMatReset = this.state.correctMatReset.concat(correct);
    var correctMat = this.state.correctMat.concat(correct);
    var correctPer =
      Math.round((utils.getAvg(correctMat) + Number.EPSILON) * 100) / 100; //2 dec pl

    // determine if we switch stimCond here if 6-10 times have been won, and 3 consectuive correct responses, then stimCond swaps

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
      correctMatReset: correctMatReset, // this one resets to determine the swaps
      correctMat: correctMat,
      correctPer: correctPer,
      stimPicChosen1: stimPicChosen1,
      stimPicChosen2: stimPicChosen2,
      soundPlay: soundPlay,
      fbCss: fbCss,
    });

    setTimeout(
      function () {
        this.renderChoiceFb();
      }.bind(this),
      10
    );
  }

  // handle key keyPressed
  _handleInstructKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 37:
        //    this is left arrow
        keyPressed = 1;
        this.handleInstruct(keyPressed);
        break;
      case 39:
        //    this is right arrow
        keyPressed = 2;
        this.handleInstruct(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleBeginKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        this.handleBegin(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleRespKey = (event) => {
    var keyPressed;
    var timePressed;
    var leftKey = this.state.respKeyCode[0];
    var rightKey = this.state.respKeyCode[1];

    switch (event.keyCode) {
      case leftKey:
        //    this is left choice
        keyPressed = 1;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      case rightKey:
        //    this is right choice
        keyPressed = 2;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          <br />
          You are ready to begin the main task!
          <br />
          <br />
          Remember: Your goal is to choose the fractal that leads you to the
          more pleasant sound most of the time. Over time, there will be swaps
          of the fractals and sounds, so you will have to keep track of their
          relationship throughout the task.
          <br />
          <br />
          This time, you will not be told whether you selected the correct
          fractal or not.
          <br />
          <br />
          You will have {this.state.trialNumTotal} chances to chose, split over{" "}
          {this.state.blockNumTotal} blocks.
          <br />
          <br />
          <strong>Press W</strong> to choose the fractal on the{" "}
          <strong>left</strong>.
          <br />
          <strong>Press O</strong> to choose the fractal on the{" "}
          <strong>right</strong>.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to begin.
          </center>
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>
          <br />
          Great job, you have completed {this.state.trialNum} out of{" "}
          {this.state.trialNumTotal} choices.
          <br />
          <br />
          Remember:
          <br />
          <br />
          <strong>Press W</strong> to choose the fractal on the{" "}
          <strong>left</strong>.
          <br />
          <strong>Press O</strong> to choose the fractal on the{" "}
          <strong>right</strong>.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          <br />
          Well done! You have completed the task!
          <br /> <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
      case 2:
        return <div>{instruct_text2}</div>;
      case 3:
        return <div>{instruct_text3}</div>;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// TASK TOGGLES ////

  taskBegin() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    var trialNumTotal = this.state.trialNumTotal;

    this.setState({
      trialNum: 0,
      trialNumTotal: trialNumTotal,
      trialinBlockNum: 0,
    });
    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  breakEnd() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    this.setState({
      trialinBlockNum: 0,
    });
    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  breakBegin() {
    // change state to make sure the screen is changed for the task

    var trialNum = this.state.trialNum - 1;
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 2,
      taskSection: null,
      trialNum: trialNum,
    });
  }

  taskEnd() {
    // change state to make sure the screen is changed for the task
    this.setState({
      instructScreen: true,
      taskScreen: false,
      instructNum: 3,
      taskSection: null,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////
  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var trialinBlockNum = this.state.trialinBlockNum + 1;
    var trialNumTotal = this.state.trialNumTotal;
    var trialNumPerBlock = this.state.trialNumPerBlock;
    var stimPosList = this.state.stimPosList;

    if (trialNum === 1) {
      var stimCond = 1;
    } else {
      var stimCond = this.state.stimCond;
    }

    var stimPos = stimPosList[trialNum - 1]; //shuffle the order for the dotDiffLeft
    var stimPicPosition1;
    var stimPicPosition2;

    if (stimPos === 1) {
      stimPicPosition1 = 0;
      stimPicPosition2 = 1;
    } else if (stimPos === 2) {
      stimPicPosition1 = 1;
      stimPicPosition2 = 0;
    } else {
      stimPicPosition1 = null;
      stimPicPosition2 = null;
    }

    //Reset all parameters
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "trialReset",
      trialNum: trialNum,
      trialNumTotal: trialNumTotal,
      trialinBlockNum: trialinBlockNum,
      fixTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      postRespTime: 0,
      fbTime: 0,
      soundPlay: null,
      stimPicPosition1: stimPicPosition1,
      stimPicPosition2: stimPicPosition2,
      stimPicChosen1: null,
      stimPicChosen2: null,
      choice: null,
      correct: null,
      correctPer: null,
      stimPos: stimPos,
      stimCond: stimCond,
      newStimCond: null,
    });

    console.log("TrialNum: " + trialNum);
    console.log("TrialNumPerBlock: " + trialNumPerBlock);
    console.log("TrialNumTotal: " + trialNumTotal);

    if (trialNum < trialNumTotal + 1) {
      if (trialinBlockNum === trialNumPerBlock + 1) {
        setTimeout(
          function () {
            this.breakBegin();
          }.bind(this),
          0
        );
      } else {
        setTimeout(
          function () {
            this.renderFix();
          }.bind(this),
          0
        );
      }
    } else {
      // if the trials have reached the total trial number
      document.removeEventListener("keyup", this._handleRespKey);
      setTimeout(
        function () {
          this.taskEnd();
        }.bind(this),
        0
      );
    }
  }

  renderFix() {
    var trialTime = Math.round(performance.now());

    //Show fixation
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "fixation",
      trialTime: trialTime,
    });

    setTimeout(
      function () {
        this.renderStim();
      }.bind(this),
      this.state.fixTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;
    document.addEventListener("keyup", this._handleRespKey);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimulus",
      fixTime: fixTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoiceFb() {
    document.removeEventListener("keyup", this._handleRespKey);

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "choiceFeedback",
    });

    setTimeout(
      function () {
        this.renderPostChJitter();
      }.bind(this),
      this.state.respFbTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // jitter
  renderPostChJitter() {
    var postRespTimeLag = this.state.postRespTimeLag;
    var postRespTimeLag2 =
      postRespTimeLag[Math.floor(Math.random() * postRespTimeLag.length)];

    var respFbTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime + this.state.respTime];

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "postChoiceJitter",
      respFbTime: respFbTime,
    });

    setTimeout(
      function () {
        this.renderCorFb();
      }.bind(this),
      postRespTimeLag2
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderCorFb() {
    var postRespTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.respTime +
          this.state.respFbTime,
      ];

    var soundPlay = this.state.soundPlay;
    if (soundPlay === 1) {
      this.neuSound.load();
      this.neuSound.play();
    } else if (soundPlay === 2) {
      this.averSound.load();
      this.averSound.play();
    } else {
      console.log("no sound?");
    }

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "corFeedback",
      postRespTime: postRespTime,
    });

    setTimeout(
      function () {
        this.renderITI();
      }.bind(this),
      this.state.fbTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderITI() {
    var itiTimeLag = this.state.itiTimeLag;
    var itiTimeLag2 = itiTimeLag[Math.floor(Math.random() * itiTimeLag.length)];

    var fbTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.respTime +
          this.state.respFbTime +
          this.state.postRespTime,
      ];

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "iti",
      fbTime: fbTime,
    });

    setTimeout(
      function () {
        this.saveITITime();
      }.bind(this),
      itiTimeLag2
    );
  }

  saveITITime() {
    var itiTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.respTime +
          this.state.respFbTime +
          this.state.postRespTime +
          this.state.fbTime,
      ];

    this.setState({
      itiTime: itiTime,
    });

    setTimeout(
      function () {
        this.renderTutorSave();
      }.bind(this),
      0
    );
  }

  renderTutorSave() {
    var userID = this.state.userID;

    let saveString = {
      userID: this.state.userID,
      prolificID: this.state.prolificID,
      sessionID: this.state.sessionID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      tutorial: this.state.tutorial,
      tutorialTry: this.state.tutorialTry,
      trialNum: this.state.trialNum,
      trialNumPerBlock: this.state.trialNumPerBlock,
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      stimPos: this.state.stimPos,
      stimCond: this.state.stimCond,
      responseKey: this.state.responseKey,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      postRespTime: this.state.postRespTime,
      fbTime: this.state.fbTime,
      itiTime: this.state.itiTime,
      choice: this.state.choice,
      correct: this.state.correct,
      correctMatReset: this.state.correctMatReset,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,
      continSwap: this.state.continSwap,
    };

    try {
      fetch(`${DATABASE_URL}/task_data/` + userID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveString),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    setTimeout(
      function () {
        this.detStimCond();
      }.bind(this),
      10
    );
  }

  // determine the conditions before trial Reset
  //if 6 to 10 correct responses have passed
  //if the last three answers were correct
  detStimCond() {
    var correctMatReset = this.state.correctMatReset;
    var lastresp = correctMatReset[correctMatReset.length - 1];
    var secondlastresp = correctMatReset[correctMatReset.length - 2];
    var thirdlastresp = correctMatReset[correctMatReset.length - 3];

    var stimCond = this.state.stimCond;
    var correctMatResetSum = correctMatReset.reduce((a, b) => a + b, 0); //add all the corrects together

    var continSwap = this.state.continSwap;
    var newStimCond;

    var whenSwap = this.state.whenSwap;

    // this is if I determined a random number from 6 to 10 before swap
    if (
      correctMatResetSum >= whenSwap &&
      lastresp === 1 &&
      secondlastresp === 1 &&
      thirdlastresp === 1
    ) {
      continSwap = 1;
      correctMatReset = [];
      whenSwap = utils.randomInt(6, 10); // random new number for the next round
      if (stimCond === 1) {
        newStimCond = 2;
      } else if (stimCond === 2) {
        newStimCond = 1;
      }
    } else {
      continSwap = 0;
      newStimCond = stimCond;
      correctMatReset = correctMatReset;
      whenSwap = whenSwap;
    }

    // this is if i use the 50% probablity of swapping
    /*  if (
      correctMatResetSum >= 6 &&
      correctMatResetSum <= 9 &&
      lastresp === 1 &&
      secondlastresp === 1 &&
      thirdlastresp === 1
    ) {
      //there is a 50% chance that it will swap contingencys
      if (Math.random() <= 0.5) {
        continSwap = 1;
        correctMatReset = [];
        if (stimCond === 1) {
          newStimCond = 2;
        } else if (stimCond === 2) {
          newStimCond = 1;
        }
      } else {
        continSwap = 0;
        newStimCond = stimCond;
        correctMatReset = correctMatReset;
      }
    } else if (
      correctMatResetSum === 10 &&
      lastresp === 1 &&
      secondlastresp === 1 &&
      thirdlastresp === 1
    ) {
      continSwap = 1;
      correctMatReset = [];
      if (stimCond === 1) {
        newStimCond = 2;
      } else if (stimCond === 2) {
        newStimCond = 1;
      }
    } else {
      continSwap = 0;
      newStimCond = stimCond;
      correctMatReset = correctMatReset;
    }
*/
    console.log("Correct Matrx: " + correctMatReset);
    console.log("Correct MatrxSum: " + correctMatResetSum);
    console.log("Stim Cond for next trial: " + stimCond);
    console.log("When swap: " + whenSwap);

    this.setState({
      correctMatReset: correctMatReset,
      continSwap: continSwap,
      whenSwap: whenSwap,
      stimCond: newStimCond,
    });

    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    var condUrl =
      "/Quest?PROLIFIC_PID=" +
      this.state.prolificID +
      "?SESSION_ID=" +
      this.state.sessionID;

    this.props.navigate(condUrl, {
      state: {
        prolificID: this.state.prolificID,
        userID: this.state.userID,
        sessionID: this.state.sessionID,
        date: this.state.date,
        startTime: this.state.startTime,
      },
    });

    //  console.log("UserID: " + this.state.userID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    this.averSound.addEventListener("ended", () =>
      this.setState({ active: false })
    );
    this.neuSound.addEventListener("ended", () =>
      this.setState({ active: false })
    );
  }

  componentWillUnmount() {
    this.averSound.removeEventListener("ended", () =>
      this.setState({ active: false })
    );
    this.neuSound.removeEventListener("ended", () =>
      this.setState({ active: false })
    );
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.debug === false) {
      if (
        this.state.instructScreen === true &&
        this.state.taskScreen === false
      ) {
        document.addEventListener("keyup", this._handleInstructKey);
        document.addEventListener("keyup", this._handleBeginKey);
        text = <div> {this.instructText(this.state.instructNum)}</div>;
        // console.log("THIS SHOULD BE INSTRUCTION BLOCK");
        //console.log(this.state.instructNum);
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "trialReset"
      ) {
        text = (
          <div>
            <DrawFix />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "fixation"
      ) {
        text = (
          <div>
            <DrawFix />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "stimulus"
      ) {
        text = (
          <div>
            <span className={style.frame}>
              <center>
                <img
                  src={this.state.stimPic[this.state.stimPicPosition1]}
                  className={style.stimLeft}
                  alt="stim1"
                />
                <img
                  src={this.state.stimPic[this.state.stimPicPosition2]}
                  className={style.stimRight}
                  alt="stim2"
                />
              </center>
            </span>
            <span className={style.textSmall}>
              <center>
                Press W for left choice.
                <br />
                Press O for right choice.
              </center>
            </span>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "choiceFeedback"
      ) {
        var stimPicChosen1 = this.state.stimPicChosen1;
        var stimPicChosen2 = this.state.stimPicChosen2;
        text = (
          <div>
            <span className={style.frame}>
              <center>
                <img
                  src={this.state.stimPic[this.state.stimPicPosition1]}
                  className={stimPicChosen1}
                  alt="stim1"
                />
                <img
                  src={this.state.stimPic[this.state.stimPicPosition2]}
                  className={stimPicChosen2}
                  alt="stim2"
                />
              </center>
            </span>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "postChoiceJitter"
      ) {
        text = (
          <div>
            <DrawFix />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "corFeedback"
      ) {
        var fbCss = this.state.fbCss;
        text = (
          <div>
            <span className={style.frame}>
              <center>
                <img src={this.state.fbPic} className={fbCss} alt="fbsound" />
              </center>
            </span>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "iti"
      ) {
        text = (
          <div>
            <DrawFix />
          </div>
        );
      } else if (this.state.debug === true) {
        document.addEventListener("keyup", this._handleDebugKey);
        text = (
          <div>
            <p>
              <span>DEBUG MODE</span>
              <br />
              <span>
                Press [<strong>SPACEBAR</strong>] to skip to next section.
              </span>
            </p>
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
}

//      If I want to disable mouse events to force them to use the keyboard <div style={{ pointerEvents: "none" }}>
export default withRouter(Task);
