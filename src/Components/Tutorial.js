import React from "react";
import DrawFix from "./DrawFix.js";
import style from "./style/taskStyle.module.css";
import * as utils from "./utils.js";
import withRouter from "./withRouter.js";

import { DATABASE_URL } from "./config.js";

import stim1 from "./fractals/bandit01.png";
import stim2 from "./fractals/bandit02.png";
import stim3 from "./fractals/bandit03.png";
import stim4 from "./fractals/bandit04.png";
import stim5 from "./fractals/bandit05.png";
import stim6 from "./fractals/bandit06.png";

import fbPic from "./fractals/audio-sound.png";

import averSound from "./sounds/task/morriss_scream_1000.wav";
import neuSound from "./sounds/task/bacigalupo_whitenoise_1000_minus15.wav";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TUTORIAL SESSION + QUIZ FOR THE TASK
// Session includes:
// 1) Introduction to task
// 2) Practice on left/right box with feedback
// 3) Instructions to the change in contigencies
// 4) Longer practice
// 5) Quiz on instructions
// 6) If quiz fail once, bring to instructions ver 2 if fail twice, bring to the start of instructions

class Tutorial extends React.Component {
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
    const volumeFullAver = 10;

    // const userID = this.props.state.userID;
    //const prolificID = this.props.state.prolificID;
    //const sessionID = this.props.state.sessionID;
    // const date = this.props.state.date;
    //const startTime = this.props.state.startTime;
    //const volumme = this.props.state.volume;
    //const volumeFullAver = this.props.state.volumeFullAver;

    var trialNumTotal1 = 2; // first tutorial, learn to chose one stimuli
    var trialNumTotal2 = 12; // second tutorial, learn the switch

    //the stim position
    var pracStimPos1 = Array(Math.round(trialNumTotal1 / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal1 / 2)).fill(2));
    utils.shuffle(pracStimPos1);

    var pracStimPos2 = Array(Math.round(trialNumTotal2 / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal2 / 2)).fill(2));
    utils.shuffle(pracStimPos2);

    //trial conditions
    // code 1 for 80/20 for one config, then code 2 for 20/80 config
    var pracStimCond1 = Array(Math.round(trialNumTotal1)).fill(1);
    var pracStimCond2 = Array(Math.round(trialNumTotal2 / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal2 / 2)).fill(2));

    console.log(pracStimPos1);
    console.log(pracStimPos2);
    console.log(pracStimCond1);
    console.log(pracStimCond2);

    var stimPic = [stim1, stim2, stim3, stim4, stim5, stim6];
    utils.shuffle(stimPic);
    // so if cond is == 1, and stim pos is 1, the correct answer is left
    // so if cond is == 1, and stim pos is 2, the correct answer is right
    // so if cond is == 2, and stim pos is 1, the correct answer is right
    // so if cond is == 2, and stim pos is 2, the correct answer is left

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
      section: "tutorial",

      // trial timings in ms
      fixTimeLag: 500, // the very first fixation
      // stimTimeLag: 1500, // there is no fixed time for stim
      respFbTimeLag: 500, //
      postrespTimeLag: [500, 600, 700], // post choice fixation jitter
      fbTimeLag: 1250, // how long the sound is played
      itiTimeLag: [250, 350, 450], // this adds to the first fixation, iti jitter

      averSound: averSound,
      neuSound: neuSound,

      volume: volume,
      volumeFullAver: volumeFullAver,

      //trial parameters
      tutorial: 1, // first or second tutorial
      trialNumTotal1: trialNumTotal1,
      stimPosList1: pracStimPos1,
      stimCondList1: pracStimCond1,
      trialNumTotal2: trialNumTotal2,
      stimPosList2: pracStimPos2,
      stimCondList2: pracStimCond2,
      trialNumTotal: null,
      stimPosList: null,
      stimCondList: null,

      respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O
      tutorialTry: 1,

      stimPic: stimPic,
      fbPic: fbPic,

      //trial by trial paramters
      trialNum: 0,
      trialTime: 0,
      fixTime: 0,
      //stimTime: 0,
      stimPos: 0,
      stimCond: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      postrespTime: 0,
      fbTime: 0,
      itiTime: 0,

      choice: null,
      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,
      contingency: 0.9,
      soundPlay: null,

      //quiz paramters
      quizTry: 1,
      quizNumTotal: 3,
      quizNum: 0,
      quizPressed: null,
      quizCor: null,
      quizCorTotal: null,
      quizAns: [2, 2, 3],

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
    this.handleQuizResp = this.handleQuizResp.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);

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
    if (whichButton === 3 && curInstructNum === 5) {
      this.setState({
        tutorial: 1,
        trialNum: 1,
        correctMat: [], //put correct in vector, to cal perf %
      });
      setTimeout(
        function () {
          this.tutorBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 8) {
      //11
      this.setState({
        tutorial: 2,
        trialNum: 1,
        correctMat: [], //put correct in vector, to cal perf %
      });
      setTimeout(
        function () {
          this.tutorBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 9) {
      //11
      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        0
      );
    } else if (whichButton === 3 && curInstructNum === 10) {
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

    console.log(choice + " choice!");
    console.log(stimPos + " stimPos!");
    console.log(stimCond + " stimCond!");
    console.log(correct + " correct!");

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

    console.log(soundPlay + " soundPlay!");

    //  console.log("response: " + response);
    var correctMat = this.state.correctMat.concat(correct);
    var correctPer =
      Math.round((utils.getAvg(correctMat) + Number.EPSILON) * 100) / 100; //2 dec pl

    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
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

  handleQuizResp(keyPressed, timePressed) {
    var quizNum = this.state.quizNum;
    var whichButton = keyPressed;

    var quizTime = timePressed - this.state.trialTime;

    var quizCorTotal = this.state.quizCorTotal;
    var quizCor;

    // calculate if quiz was correct or not
    if (whichButton === this.state.quizAns[quizNum - 1]) {
      quizCorTotal = quizCorTotal + 1;
      quizCor = 1;
      this.setState({
        quizPressed: whichButton,
        quizCor: quizCor,
        quizCorTotal: quizCorTotal,
        quizTime: quizTime,
      });
    } else {
      //if was incorrect
      quizCor = 0;
      this.setState({
        quizPressed: whichButton,
        quizCor: quizCor,
        quizTime: quizTime,
      });
    }

    //  console.log("Keypress: " + whichButton);
    //  console.log("QuizTime: " + quizTime);
    //  console.log("QuizNum: " + quizNum);
    //  console.log("QuizCor: " + quizCor);
    //  console.log("QuizCorTotal: " + quizCorTotal);
    //  console.log("QuizAns: " + this.state.quizAns);
    //  console.log("quizNumTotal: " + this.state.quizNumTotal);

    setTimeout(
      function () {
        this.renderQuizSave();
      }.bind(this),
      0
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

  // handle key keyPressed
  _handleQuizKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 49:
        keyPressed = 1;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 50:
        keyPressed = 2;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 51:
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      case 52:
        keyPressed = 4;
        timePressed = Math.round(performance.now());
        this.handleQuizResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let text;
    let text2;

    //If fail quiz once, this brings me to instruct before confidence
    if (this.state.quizTry === 2 && this.state.quizTry === 3) {
      text2 = (
        <span>
          You scored {this.state.quizCorTotal}/{this.state.quizNumTotal} on the
          quiz. Please read the instructions carefully.
          <br />
          <br />
          Your task is to choose the fractal that more often leads to the more
          pleasant sound.
        </span>
      );
    }
    //If fail quiz more than once, this brings me to the beginning of the instruct
    else if (this.state.quizTry >= 4) {
      text = (
        <span>
          You scored {this.state.quizCorTotal}/{this.state.quizNumTotal} on the
          quiz. We will restart the tutorial from the beginning. Please read the
          instructions carefully.
          <br />
          <br />
        </span>
      );

      text2 = (
        <span>
          Well done!
          <br />
          <br />
          You saw that choosing the fractal that more often leads to the more
          pleasant sound was the correct answer.
          <br />
          <br />
        </span>
      );
    }

    let instruct_text1 = (
      <div>
        <span>
          {text}
          <br />
          Welcome to the task! Today, we will be making choices between two
          fractals.
          <center>
            <img
              src={this.state.stimPic[0]}
              className={style.stim}
              alt="stim1"
            />
            <img
              src={this.state.stimPic[1]}
              className={style.stim}
              alt="stim2"
            />
          </center>
          Your aim is to choose the fractal that more often leads to the more
          pleasant sound.
          <br /> <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>
          Choosing one of fractals will result in an unpleasant noise most of
          the time.
        </span>
        <center>
          <img
            src={this.state.stimPic[0]}
            className={style.stim}
            alt="stim1"
            onClick={() => {
              this.averSound.load();
              this.averSound.play();
            }}
          />
        </center>
        <span>
          Click on the fractal to hear what sound it will give you most of the
          time.
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          Choosing the other fractal will result in a slightly more pleasant
          noise most of the time.
        </span>

        <center>
          <img
            src={this.state.stimPic[1]}
            className={style.stim}
            alt="stim2"
            onClick={() => {
              this.neuSound.load();
              this.neuSound.play();
            }}
          />{" "}
        </center>
        <span>
          Click on the fractal to hear what sound it will give you most of the
          time.
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text4 = (
      <div>
        <span>
          You can select the fractal of your choice with a keypress.
          <br />
          <br />
          If the fractal on the <strong>left</strong> leads to the more pleasant
          noise more often, <strong>press W</strong>.
          <br />
          If the fractal on the <strong>right</strong> leads to the more
          pleasant noise more often, <strong>press O</strong>.
          <br />
          <br />
          Your selected fractal will be outlined in{" "}
          <font color="#87C1FF">
            <strong>light blue</strong>
          </font>
          .
          <br />
          <br />
          Let&apos;s start with a practice. In this phase we will tell you
          whether your choices are right or wrong.
          <br />
          <br />
          If you are <strong>correct</strong>, the sound feedback will have its
          outline turn{" "}
          <font color="green">
            <strong>green</strong>
          </font>
          .
          <br />
          <br />
          If you are <strong>incorrect</strong>, the sound feedback will have
          its outline turn{" "}
          <font color="red">
            <strong>red</strong>
          </font>
          .
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text5 = (
      <div>
        <span>
          You will have {this.state.trialNumTotal1} chances to choose the
          fractal that most often leads to the more pleasant noise.
          <br />
          <br />
          For every choice, you will be presented with a white cross in the
          middle of the screen first before the fractals appear. After a short
          delay, the sound will play.
          <br />
          <br />
          As a reminder:
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
            Press [<strong>SPACEBAR</strong>] to begin the practice.
          </center>
          <br />
          <center>
            [<strong>←</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text6 = (
      <div>
        <span>
          {text2}
          Now, we will introduce a new rule in this task. After some time, the
          sounds that are more often associated to each fractal may swap.
          <br />
          <br />
          This means that this fractal that previously lead to the unpleasant
          noise most of time now leads to the more pleasant sound.
          <br />
          <center>
            <img
              src={this.state.stimPic[1]}
              className={style.stim}
              alt="stim1"
              onClick={() => {
                this.neuSound.load();
                this.neuSound.play();
              }}
            />
          </center>
          Click on the fractal to hear what sound it will give you most of the
          time after the swap.
          <br />
          <br />
          <center>
            [<strong>→</strong>]
            <br />
            <br />
            <br />
            <br />
          </center>
          <br />
          <br />
        </span>
      </div>
    );

    let instruct_text7 = (
      <div>
        <span>
          This means also that this fractal that previously lead to the more
          pleasant noise most of time now leads to the unpleasant sound.
          <br />
          <center>
            <img
              src={this.state.stimPic[0]}
              className={style.stim}
              alt="stim2"
              onClick={() => {
                this.averSound.load();
                this.averSound.play();
              }}
            />
          </center>
          Click on the fractal to hear what sound it will give you most of the
          time after the swap.
          <br />
          <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text8 = (
      <div>
        <span>
          This swap will occur at some point during the task, so you will have
          to keep track of the relationship between the fractals and sounds.
          <br />
          <br />
          Let's play a short practice with {this.state.trialNumTotal2} chances
          to choose the fractals to demostrate how this would play out.
          <br />
          <br />
          As a reminder:
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
            Press [<strong>SPACEBAR</strong>] to begin the practice.
          </center>
          <br />
          <center>
            [<strong>←</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text9 = (
      <div>
        <span>
          Great job! You should have noticed that the relationship between the
          fractals and sounds swapped halfway through.
          <br />
          <br />
          Before you begin the main task, you have to pass a quick quiz to make
          sure that you have understood the key points of your task for today.
          <br />
          <br />
          Note: You will have to get <strong>all</strong> quiz questions
          correct. If not, you will be sent back to the instructions, and will
          have to replay the tutorial and retake the quiz!
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to begin the quiz.
          </center>
          <br />
        </span>
      </div>
    );

    let instruct_text10 = (
      <div>
        Amazing! You scored {this.state.quizCorTotal}/{this.state.quizNumTotal}{" "}
        for the quiz.
        <br />
        <br />
        You are ready to start the main task.
        <br />
        <br />
        <center>
          Press [<strong>SPACEBAR</strong>] to begin.
        </center>
      </div>
    );

    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
      case 2:
        return <div>{instruct_text2}</div>;
      case 3:
        return <div>{instruct_text3}</div>;
      case 4:
        return <div>{instruct_text4}</div>;
      case 5:
        return <div>{instruct_text5}</div>;
      case 6:
        return <div>{instruct_text6}</div>;
      case 7:
        return <div>{instruct_text7}</div>;
      case 8:
        return <div>{instruct_text8}</div>;
      case 9:
        return <div>{instruct_text9}</div>;
      case 10:
        return <div>{instruct_text10}</div>;
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// QUIZ TEXT ////
  // Do I need to randomise this?

  quizText(quizNum) {
    let quiz_text1 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> You are shown two fractals to
        choose from. What do you do?
        <br />
        <br />
        [1] - I choose the fractal that more often leads to the unpleasant
        sound.
        <br />
        [2] - I choose the fractal that more often leads to the more pleasant
        sound.
        <br />
        [3] - I choose both fractals as fast as possible.
        <br />
        [4] - I am unsure.
      </div>
    );

    let quiz_text2 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> After some time, you notice that
        the fractal that most often led to the unpleasant sound now leads more
        often to the more pleasant sound. What do you do?
        <br />
        <br />
        [1] - I continue to choose this fractal that more often leads to the
        unpleasant sound.
        <br />
        [2] - I now choose the other fractal that more often leads to the more
        pleasant sound.
        <br />
        [3] - I pick the one that has the brightest color.
        <br />
        [4] - I am unsure.
      </div>
    );

    let quiz_text3 = (
      <div>
        <strong>Q{this.state.quizNum}:</strong> How do I know when the swap of
        the relationship between fractals and sounds will occur?
        <br />
        <br />
        [1] - The fractal leading to with more pleasant sound more often will be
        outlined in blue.
        <br />
        [2] - There will be a unqiue sound played in the background to signal
        the swap.
        <br />
        [3] - I have to pay attention to the sounds linked to the fractals.
        <br />
        [4] - I am unsure.
      </div>
    );

    switch (quizNum) {
      case 1:
        return <div>{quiz_text1}</div>;
      case 2:
        return <div>{quiz_text2}</div>;
      case 3:
        return <div>{quiz_text3}</div>;
      default:
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// TASK TOGGLES ////

  tutorBegin() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    var tutorial = this.state.tutorial;
    var trialNumTotal;
    var stimPosList;
    var stimCondList;

    //reset tutorial if need to do again
    if (tutorial === 1) {
      trialNumTotal = this.state.trialNumTotal1;
      stimPosList = this.state.stimPosList1;
      stimCondList = this.state.stimCondList1;
    } else if (tutorial === 2) {
      trialNumTotal = this.state.trialNumTotal2;
      stimPosList = this.state.stimPosList2;
      stimCondList = this.state.stimCondList2;
    }

    this.setState({
      trialNum: 0,
      trialNumTotal: trialNumTotal,
      stimPosList: stimPosList,
      stimCondList: stimCondList,
    });
    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  tutorEnd() {
    // change state to make sure the screen is changed for the task

    if (this.state.tutorial === 1) {
      this.setState({
        instructScreen: true,
        taskScreen: false,
        instructNum: 6,
        taskSection: null,
        tutorial: 2,
      });
    } else if (this.state.tutorial === 2) {
      this.setState({
        instructScreen: true,
        taskScreen: false,
        instructNum: 9,
        taskSection: null,
      });
    }
  }

  quizBegin() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    document.addEventListener("keyup", this._handleQuizKey);

    // If I want to shuffle quiz answers?

    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "quiz",
      quizPressed: null,
      quizNum: 1,
      quizCorTotal: 0,
      quizCor: null,
    });
  }

  quizReset() {
    var quizNum = this.state.quizNum;
    var quizCorTotal = this.state.quizCorTotal;
    var trialTime = Math.round(performance.now());

    if (quizNum < this.state.quizNumTotal) {
      //go to next quiz qn
      this.setState({
        quizNum: quizNum + 1,
        trialTime: trialTime,
      });
    } else if (quizNum === this.state.quizNumTotal) {
      document.removeEventListener("keyup", this._handleQuizKey);
      //end quiz, head back to instructions
      var quizTry = this.state.quizTry;
      var tutorialTry = this.state.tutorialTry;
      //if full marks
      if (quizCorTotal === this.state.quizNumTotal) {
        //  console.log("PASS QUIZ");
        this.setState({
          instructScreen: true,
          taskScreen: false,
          instructNum: 10,
          taskSection: "instruct",
        });
      } else if (quizCorTotal !== this.state.quizNumTotal && quizTry < 4) {
        //if they got one wrong
        //  console.log("FAIL QUIZ");
        tutorialTry = tutorialTry + 1;
        quizTry = quizTry + 1;

        this.setState({
          instructScreen: true,
          taskScreen: false,
          tutorial: 2,
          instructNum: 6,
          taskSection: "instruct",
          quizTry: quizTry,
          tutorialTry: tutorialTry,
        });
      } else {
        //if they got more than one wrong
        tutorialTry = tutorialTry + 1;
        //  console.log("FAIL QUIZ");
        quizTry = quizTry + 1;
        this.setState({
          tutorial: 1,
          instructScreen: true,
          taskScreen: false,
          instructNum: 1,
          taskSection: "instruct",
          quizTry: quizTry,
          tutorialTry: tutorialTry,
        });
      }
    }
  }

  //////////////////////////////////////////////////////////////////////////////////
  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var trialNumTotal = this.state.trialNumTotal;
    var stimPosList = this.state.stimPosList;
    var stimCondList = this.state.stimCondList;

    var stimPos = stimPosList[trialNum - 1]; //shuffle the order for the dotDiffLeft
    var stimCond = stimCondList[trialNum - 1]; //shuffle the order for the dotDiffLeft
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
      fixTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      postrespTime: 0,
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
    });

    console.log(trialNum);
    console.log(trialNumTotal);

    if (trialNum < trialNumTotal + 1) {
      setTimeout(
        function () {
          this.renderFix();
        }.bind(this),
        0
      );
    } else {
      // if the trials have reached the total trial number
      document.removeEventListener("keyup", this._handleRespKey);
      setTimeout(
        function () {
          this.tutorEnd();
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
    var postrespTimeLag = this.state.postrespTimeLag;
    var postrespTimeLag2 =
      postrespTimeLag[Math.floor(Math.random() * postrespTimeLag.length)];

    var respFbTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime + this.state.respTime];

    console.log(postrespTimeLag2);

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
      postrespTimeLag2
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderCorFb() {
    var postrespTime =
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
      postrespTime: postrespTime,
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
    console.log(itiTimeLag2);

    var fbTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.respTime +
          this.state.respFbTime +
          this.state.postrespTime,
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
          this.state.postrespTime +
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
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      stimPos: this.state.stimPos,
      stimCond: this.state.stimCond,
      responseKey: this.state.responseKey,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      postrespTime: this.state.postrespTime,
      fbTime: this.state.fbTime,
      itiTime: this.state.itiTime,
      choice: this.state.choice,
      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,
    };

    //   try {
    //     fetch(`${DATABASE_URL}/tutorial_data/` + userID, {
    //       method: "POST",
    //      headers: {
    //        Accept: "application/json",
    //        "Content-Type": "application/json",
    //      },
    //      body: JSON.stringify(saveString),
    //     });
    //  } catch (e) {
    //     console.log("Cant post?");
    //   }

    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      10
    );
  }

  renderQuizSave() {
    var userID = this.state.userID;

    let saveString = {
      userID: this.state.userID,
      prolificID: this.state.prolificID,
      sessionID: this.state.sessionID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      //quiz paramters
      quizTry: this.state.quizTry,
      quizNumTotal: this.state.quizNumTotal,
      quizNum: this.state.quizNum,
      quizTime: this.state.trialTime,
      quizResp: this.state.quizPressed,
      quizRT: this.state.quizTime,
      quizAns: this.state.quizAns,
      quizCor: this.state.quizCor,
      quizCorTotal: this.state.quizCorTotal,
    };

    //    try {
    //      fetch(`${DATABASE_URL}/tut_quiz/` + userID, {
    //        method: "POST",
    //       headers: {
    //         Accept: "application/json",
    //          "Content-Type": "application/json",
    //        },
    //        body: JSON.stringify(saveString),
    //      });
    //   } catch (e) {
    console.log("Cant post?");
    //   }

    setTimeout(
      function () {
        this.quizReset();
      }.bind(this),
      10
    );
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);

    var condUrl =
      "/Task?PROLIFIC_PID=" +
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
        stimPic: this.state.stimPic,
        volume: this.state.volume,
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
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "quiz"
      ) {
        text = (
          <div>
            {this.quizText(this.state.quizNum)}
            <br />
            <br />
            <center>Please use the top row number keys to respond.</center>
          </div>
        );
      }
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

//      If I want to disable mouse events to force them to use the keyboard <div style={{ pointerEvents: "none" }}>

export default withRouter(Tutorial);
