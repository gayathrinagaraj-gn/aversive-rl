import React from "react";
import * as Consent from "survey-react";
import "../../node_modules/survey-react/survey.css";
import "./style/surveyStyle.css";
import style from "./style/taskStyle.module.css"; // apply the same style as the home page
import withRouter from "./withRouter";

import { json } from "./consent/consentFull.js";

///////////////////////////////////////////////////////////////////

class StartPage extends React.Component {
  constructor(props) {
    super(props);

    // Get data and time
    var dateTime = new Date().toLocaleString();

    var currentDate = new Date(); // maybe change to local
    var date = currentDate.getDate();
    var month = currentDate.getMonth(); //Be careful! January is 0 not 1
    var year = currentDate.getFullYear();
    var dateString = date + "-" + (month + 1) + "-" + year;
    var timeString = currentDate.toTimeString();

    // Random ID number in case this is necessary
    var userID = Math.floor(100000 + Math.random() * 900000);

    //var prolificID = this.props.state.prolificID;
    //var sessionID = this.props.state.sessionID;

    // adding the additional parameters

    var src_subjectID = this.props.state.src_subjectID;
    var subject_KEY = this.props.state.subject_KEY;
    var timePT =this.props.state.timePT;
    var studyName = this.props.state.studyName;

    // Set state
    this.state = {
      userID: userID,
      //prolificID: prolificID,
      //sessionID: sessionID,
      src_subjectID: src_subjectID,
      subject_KEY: subject_KEY,
      timePT: timePT,
      studyName: studyName,
      date: dateString,
      dateTime: dateTime,
      startTime: timeString,
      consentComplete: 0,
    };

    this.redirectToTarget = this.redirectToTarget.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";

    this.setState({
      mounted: 1,
    });
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
  }

  redirectToTarget() {
    this.setState({
      consentComplete: 1,
    });

    /*var condUrl =
      "/HeadphoneCheck?PROLIFIC_PID=" +
      this.state.prolificID +
      "?SESSION_ID=" +
      this.state.sessionID; */

     var condUrl =
      "/HeadphoneCheck?src_subject_id=" +
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

  render() {
    Consent.StylesManager.applyTheme("default");

    if (this.state.consentComplete === 0) {
      return (
       /* <div className="textBox">
          <center>
            <strong>INFORMATION FOR THE PARTICIPANT</strong>
          </center>
          <br />
          Please read this information page carefully. If you are happy to
          proceed, please check the boxes on the second page of this form to
          consent to this study proceeding. Please note that you cannot proceed
          to the study unless you give your full consent.
          <br />
          <br />
          <Consent.Survey
            json={json}
            showCompletedPage={false}
            onComplete={this.redirectToTarget}
          />
        </div> 

        <div className="textBox">
        <center>
          <strong>Welcome to the Study</strong>
        </center>
        <p>You will be redirected shortly...</p>
        <button onClick={this.redirectToTarget}>Continue</button>
      </div> */
       <div className={style.bg}>
          <div className={style.textFrame}>
            <div className={style.fontStyle}>
              <center>
                <strong>Welcome to the Study</strong>
              </center>
              <br />
              <br />
              <p>You will be redirected shortly...</p>
              <br />
              <br />
              <center>
                <button className={style.button} onClick={this.redirectToTarget}>
                  Continue
                </button>
              </center>
            </div>
          </div>
        </div>

    
      );
    } else {
      return null;
    }
  }
}

export default withRouter(StartPage);
