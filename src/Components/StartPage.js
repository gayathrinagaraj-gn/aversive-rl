import React from "react";
import * as Consent from "survey-react";
import "../../node_modules/survey-react/survey.css";
import "./style/surveyStyle.css";
import withRouter from "./withRouter";

import { json } from "./consent/consentFull.js";

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

    const prolificID = this.props.state.prolificID;
    const sessionID = this.props.state.sessionID;

    // Set state
    this.state = {
      userID: userID,
      prolificID: prolificID,
      sessionID: sessionID,
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

    var condUrl =
      "/HeadphoneCheck?PROLIFIC_PID=" +
      this.state.prolificID +
      "SESSION_ID=" +
      this.state.sessionID;

    this.props.navigate(condUrl, {
      state: {
        userID: this.state.userID,
        prolificID: this.state.prolificID,
        sessionID: this.state.sessionID,
        date: this.state.date,
        startTime: this.state.startTime,
      },
    });
  }

  render() {
    Consent.StylesManager.applyTheme("default");

    if (this.state.consentComplete === 0) {
      return (
        <div className="textBox">
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
      );
    } else {
      return null;
    }
  }
}

export default withRouter(StartPage);
