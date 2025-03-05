import React from "react";
import style from "./style/taskStyle.module.css";
//import * as utils from "./utils.js";
import withRouter from "./withRouter.js";

import { DATABASE_URL } from "./config.js";

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TASK
// Just the bonus screen

var debug = false;
var skip = false;

class Bonus extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    var userID;
    //var prolificID;
    //var sessionID;
    var subject_KEY;
    var timePT;
    var studyName;
    var date;
    var startTime;
    var correctPer;

    if (debug === true) {
      userID = 1000;
      //prolificID = 1000;
      //sessionID = 1000;
      src_subjectID = 1000;
      subject_KEY = 1000;
      timePT = 1000;
      studyName = 1000;
      date = 1000;
      startTime = 1000;
      correctPer = 0.7;
    } else {
      userID = this.props.state.userID;
      //prolificID = this.props.state.prolificID;
      //sessionID = this.props.state.sessionID;
      src_subjectID = this.props.state.src_subjectID;
      subject_KEY = this.props.state.subject_KEY;
      timePT =this.props.state.timePT;
      studyName = this.props.state.studyName;
      date = this.props.state.date;
      startTime = this.props.state.startTime;
      correctPer = this.props.state.correctPer;
    }

    var bonus;

    if (correctPer >= 0.6 && correctPer <= 0.7) {
      bonus = 0.5;
    } else if (correctPer >= 0.7 && correctPer <= 0.8) {
      bonus = 0.75;
    } else if (correctPer >= 0.8) {
      bonus = 1;
    } else {
      bonus = 0;
    }

    var correctPer2 = Math.round((correctPer + Number.EPSILON) * 100);

    this.state = {
      userID: userID,
      //prolificID: prolificID,
      //sessionID: sessionID,
      src_subjectID: src_subjectID,
      subject_KEY: subject_KEY,
      timePT: timePT,
      studyName: studyName,
      date: date,
      startTime: startTime,
      section: "bonus",
      sectionTime: sectionTime,
      correctPer: correctPer,
      correctPer2: correctPer2,
      bonus: bonus,
      instructScreen: true,
      instructNum: 1,
      debug: debug,
      skip: skip,
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
    this.handleBegin = this.handleBegin.bind(this);
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
          this.redirectToNextTask();
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

  handleBegin(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 1) {
      //12
      setTimeout(
        function () {
          this.renderBonusSave();
        }.bind(this),
        0
      );
    }
  }

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

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          You selected the correct fractal {this.state.correctPer2}% of the
          time!
          <br />
          <br />
          Your bonus is {this.state.bonus} GBP.
          <br />
          <br />
          <center>
            Press [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
    }
  }

  renderBonusSave() {
    var userID = this.state.userID;

    let saveString = {
      userID: this.state.userID,
      //prolificID: this.state.prolificID,
      //sessionID: this.state.sessionID,
      src_subjectID: this.state.src_subjectID,
      subject_KEY: this.state.subject_KEY,
      timePT: this.state.timePT,
      studyName: this.state.studyName,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      correctPer: this.state.correctPer,
      bonus: this.state.bonus,
    };

    try {
      fetch(`${DATABASE_URL}/bonus/` + userID, {
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
        this.redirectToNextTask();
      }.bind(this),
      10
    );
  }

  redirectToNextTask() {
    //  document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
/*
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
    }); */

    var condUrl =
    "/Quest?src_subject_id=" +
      this.state.src_subjectID +
      "&subjectkey=" +
      this.state.subject_KEY +
       "&time_pt=" +
      this.state.timePT +
      "&study=" +
      this.state.studyName;

  this.props.navigate(condUrl, {
    state: {
      userID: this.state.userID,
      //prolificID: this.state.prolificID,
      //sessionID: this.state.sessionID,
      src_subjectID: this.state.src_subjectID,
      subject_KEY: this.state.subject_KEY,
      timePT: this.state.timePT,
      studyName: this.state.studyName,
      date: this.state.date,
      startTime: this.state.startTime,
    },
  });


    //  console.log("UserID: " + this.state.userID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.skip === false) {
      if (this.state.instructScreen === true) {
        //  document.addEventListener("keyup", this._handleInstructKey);
        document.addEventListener("keyup", this._handleBeginKey);
        text = <div> {this.instructText(this.state.instructNum)}</div>;
      } else {
        text = <div> ERROR!!</div>;
      }
    } else if (this.state.skip === true) {
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
export default withRouter(Bonus);
