import React from "react";
import style from "./style/taskStyle.module.css";
import withRouter from "./withRouter.js";

var debug = false;
var skip = false;

class EndPage extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

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

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      // demo paramters
      userID: userID,
      //prolificID: prolificID,
      //sessionID: sessionID,
      src_subjectID: src_subjectID,
      subject_KEY: subject_KEY,
      timePT: timePT,
      studyName: studyName,
      date: date,
      startTime: startTime,

      //section paramters
      sectionTime: sectionTime,
      section: "end",

      // screen parameters
      instructScreen: true,
      instructNum: 1, //start from 1

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

    this.handleInstruct = this.handleInstruct.bind(this);
    this.instructText = this.instructText.bind(this);
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// KEYBOARD HANDLES ////

  // This handles instruction screen within the component USING KEYBOARD

  handleInstruct(keyPressed) {
    var curText = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 1 && curText > 1) {
      this.setState({ instructNum: curText - 1 });
    } else if (whichButton === 2 && curText < 3) {
      this.setState({ instructNum: curText + 1 });
    } else if (whichButton === 3 && curText === 3) {
      setTimeout(
        function () {
          this.redirectToEnd();
        }.bind(this),
        0
      );
    }
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
      case 32:
        //    this is spacebar
        keyPressed = 3;
        this.handleInstruct(keyPressed);
        break;
      default:
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////
  /// INSTRUCTION TEXT ////

  instructText(instructNum) {
    let instruct_text1 = (
      <div>
        <span>
          Well done, you have completed all the tasks! Thanks for your help!
          <br />
          <br />
          Your data makes an important contribution to our understanding of
          mental health.
          <br />
          <br />
          In this tasks, we were interested in how you learn from aversive
          outcomes, like an unpleasant sound.
          <br /> <br />
          Previous work have linked differences in behaviour to psychiatric
          disorders, which we are aiming to understand better.
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

    let instruct_text2 = (
      <div>
        <span>
          If you feel that completing the questionnaires caused you any
          distress, please use the following contact details for help and
          support:
          <br />
          <br />
          <i>Web page links (opens in new tab):</i>
          <br />
          <ul>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab(
                    "https://www.nhs.uk/conditions/stress-anxiety-depression/mental-health-helplines/"
                  );
                }}
              >
                <u>NHS Mental Health Helplines</u>
              </span>
            </li>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab("https://www.anxietyuk.org.uk");
                }}
              >
                <u>Anxiety UK</u>
              </span>
              (Helpline: 03444 775 774)
            </li>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab("https://ocdaction.org.uk/");
                }}
              >
                <u>OCD Action</u>
              </span>
              (Helpline: 0300 636 5478)
            </li>
            <li>
              <span
                className={style.link}
                onClick={() => {
                  this.openInNewTab("https://www.samaritans.org/");
                }}
              >
                <u>Samaritans</u>
              </span>
              (Helpline: 116 123)
            </li>
          </ul>
          <br /> <br />
          <center>
            [<strong>←</strong>] [<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text3 = (
      <div>
        <span>
          You have finished the study!
          <br />
          <br />
          Press the [<strong>SPACEBAR</strong>] to submit study completion on
          Prolific. Click 'OK' on the pop up.
          <br />
          <br />
          If the page fails to be directed to Prolific, please use the
          completion code <strong>CNIWLO6H</strong> and send a message to us on
          Prolific.
          <center>
            [<strong>←</strong>]
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

      default:
    }
  }

  openInNewTab(url) {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
  }

  redirectToEnd() {
    alert("You will now be redirected to Prolific's validation page.");
    document.removeEventListener("keyup", this._handleInstructKey);
    window.location =
      "https://app.prolific.com/submissions/complete?cc=CNIWLO6H"; //this will the prolific validation code
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.instructScreen === true) {
      document.addEventListener("keyup", this._handleInstructKey);
      text = <div> {this.instructText(this.state.instructNum)}</div>;
      //  console.log(this.state.instructNum);
    } else {
      return null;
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

export default withRouter(EndPage);
