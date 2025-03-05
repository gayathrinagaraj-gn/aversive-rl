import React from "react";
import withRouter from "./withRouter.js";
import * as Quest from "survey-react";
import "survey-react/survey.css";
import style from "./style/taskStyle.module.css";
import sstyle from "./style/surveyStyle.css";
import * as utils from "./utils.js";

// quests
import { dass } from "./quest/dass.js";
import { rse } from "./quest/rse.js";
import { staiy2 } from "./quest/staiy2.js";
import { sds } from "./quest/sds.js";
import { demo } from "./quest/demo.js";

import { DATABASE_URL } from "./config";

var debug = false;
var skip = false;

class Questionnaires extends React.Component {
  constructor(props) {
    super(props);

    var userID;
    //var prolificID;
    //var sessionID;
    var src_subjectID;
    var subject_KEY;
    var timePT;
    var studyName;
    var date;
    var startTime;

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
    }

    var sectionTime = Math.round(performance.now());

    var quizLabel = ["DASS", "RSE", "STAIY2", "SDS"];
    var qnTotal = quizLabel.length;
    var allQuizText = [dass, rse, staiy2, sds];

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
      section: "psych",
      sectionTime: sectionTime,
      resultAsString: {},

      qnStart: sectionTime,
      qnTime: sectionTime,
      qnTotal: qnTotal,
      quizLabel: quizLabel,
      allQuizText: allQuizText,
      demo: demo,

      qnText1: [],
      qnText2: [],
      qnText3: [],
      qnText4: [],

      instructScreen: true,
      questScreen: false,
      debug: debug,
      skip: skip,
    };
  }

  //Define a callback methods on survey complete
  onComplete(survey, options) {
    // //Write survey results into database

    var quizText = this.state.quizLabel[this.state.quizLabel.length - 1];
    console.log(quizText);

    var questPgFinish = "PgFinish_" + quizText;
    var questRT = "PgRT_" + quizText;
    var qnTime = Math.round(performance.now());
    var qnRT = qnTime - this.state.qnTime;
    survey.setValue(questPgFinish, qnTime);
    survey.setValue(questRT, qnRT);

    var qnEnd = Math.round(performance.now());
    var prolificID = this.state.prolificID;
    //survey.setValue("prolificID", prolificID);
    //survey.setValue("sessionID", this.state.sessionID);
    survey.setValue("src_subjectID", this.state.src_subjectID);
    survey.setValue("subject_KEY", this.state.subject_KEY);
    survey.setValue("timePT", this.state.timePT);
    survey.setValue("studyName", this.state.studyName);
    survey.setValue("userID", this.state.userID);
    survey.setValue("date", this.state.date);
    survey.setValue("startTime", this.state.startTime);
    survey.setValue("section", this.state.section);
    survey.setValue("sectionTime", this.state.sectionTime);
    survey.setValue("qnTimeStart", this.state.qnStart);
    survey.setValue("qnTimeEnd", qnEnd);

    var resultAsString = JSON.stringify(survey.data);

    //  console.log("resultAsString", resultAsString);
// change prolific ID to src_subjectID
    fetch(`${DATABASE_URL}/psych_quiz/` + prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: resultAsString,
    });

    this.setState({
      resultAsString: resultAsString,
    });

    setTimeout(
      function () {
        this.redirectToNextTask();
      }.bind(this),
      10
    );
  }

  startQuest() {
    this.setState({ questScreen: true, instructScreen: false });

    setTimeout(
      function () {
        this.shuffleQuest();
      }.bind(this),
      10
    );
  }

  timerCallback(survey) {
    var page = survey.pages.indexOf(survey.currentPage);
    let quizText;
    //CHECK THIS!!!
    if (page === 0) {
      quizText = "intro";
    } else if (page === 1) {
      quizText = "demo";
    } else {
      quizText = this.state.quizLabel[page - 2];
    }

    console.log(quizText);

    var questPgFinish = "PgFinish_" + quizText;
    var questRT = "PgRT_" + quizText;
    var qnTime = Math.round(performance.now());
    var qnRT = qnTime - this.state.qnTime;
    survey.setValue(questPgFinish, qnTime);
    survey.setValue(questRT, qnRT);

    this.setState({ qnTime: qnTime });
  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleDebugKey);
/*
    var condUrl =
      "/EndPage?PROLIFIC_PID=" +
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
    "/EndPage?src_subject_id=" +
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


  }

  shuffleQuest() {
    var allQuizText = this.state.allQuizText;
    var quizLabel = this.state.quizLabel;

    utils.shuffleSame(allQuizText, quizLabel);

    allQuizText = allQuizText.filter(function (val) {
      return val !== undefined;
    });
    quizLabel = quizLabel.filter(function (val) {
      return val !== undefined;
    });

    this.setState({
      qnText1: allQuizText[0],
      qnText2: allQuizText[1],
      qnText3: allQuizText[2],
      qnText4: allQuizText[3],
      quizLabel: quizLabel,
    });
  }

  handleBegin(key_pressed) {
    var whichButton = key_pressed;
    if (whichButton === 3) {
      setTimeout(
        function () {
          this.startQuest();
        }.bind(this),
        0
      );
    }
  }

  // handle key key_pressed
  _handleBeginKey = (event) => {
    var key_pressed;

    switch (event.keyCode) {
      case 32:
        //    this is sapcebar
        key_pressed = 3;
        this.handleBegin(key_pressed);
        break;
      default:
    }
  };

  //  useEffect() {
  //    window.scrollTo(0, 0);
  //  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
  }

  render() {
    let text;
    if (this.state.skip === false) {
      if (
        this.state.instructScreen === true &&
        this.state.questScreen === false
      ) {
        //      this.useEffect();
        document.addEventListener("keyup", this._handleBeginKey);
        //intructions
        text = (
          <div className={style.bg}>
            <div className={style.textFrame}>
              <div className={style.fontStyle}>
                <div>
                  For the last section, we would like you to:
                  <br />
                  <br />
                  <li>Provide some demographic information (age and gender)</li>
                  <li>Complete {this.state.qnTotal} questionnaires</li>
                  <br />
                  Do read the instructions for each quiz, which will be
                  positioned at the top of each page, carefully.
                  <br />
                  <br />
                  <center>
                    Please press [<strong>SPACEBAR</strong>] to begin.
                  </center>
                </div>
              </div>
            </div>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.questScreen === true
      ) {
        //the quiz
        document.removeEventListener("keyup", this._handleBeginKey);
        Quest.StylesManager.applyTheme("default");

        var myCss = {
          matrix: {
            //  root: "table table-striped",
            root: "table sv_q_matrix",
          },
        };

        var json = {
          title: null,
          showProgressBar: "top",
          pages: [
            {
              questions: this.state.demo,
            },
            {
              questions: this.state.qnText1,
            },
            {
              questions: this.state.qnText2,
            },
            {
              questions: this.state.qnText3,
            },
            {
              questions: this.state.qnText4,
            },
          ],
        };

        text = (
          <div className={sstyle.textBox2}>
            <Quest.Survey
              json={json}
              css={myCss}
              onComplete={this.onComplete.bind(this)}
              onCurrentPageChanged={this.timerCallback.bind(this)}
            />
          </div>
        );
      }
    } else if (this.state.skip === true) {
      text = (
        <div className={style.bg}>
          <div className={style.textFrame}>
            <div className={style.fontStyle}>
              Press the [<strong>SPACEBAR</strong>] to skip to next section.
            </div>
          </div>
        </div>
      );
    }
    return <div>{text}</div>;
  }
}
export default withRouter(Questionnaires);
