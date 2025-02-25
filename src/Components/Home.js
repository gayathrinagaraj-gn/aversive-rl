import screenfull from "screenfull";
import React from "react";
import withRouter from "./withRouter.js";
import style from "./style/taskStyle.module.css";
// import queryString from "query-string";

var debug = false;

class Home extends React.Component {
  constructor(props) {
    super(props);

    // ID number - either set or get from url
    //var prolific_id;
    //var session_id;
    var src_subject_id;
    var subjectkey;
    var time_pt;
    var study;
    
    if (debug === true) {
      //prolific_id = Math.floor(100000 + Math.random() * 900000);
      //session_id = Math.floor(100000 + Math.random() * 900000);
      src_subject_id = Math.floor(100000 + Math.random() * 900000);
      subjectkey = Math.floor(100000 + Math.random() * 900000);
      time_pt = Math.floor(100000 + Math.random() * 900000);
      study = Math.floor(100000 + Math.random() * 900000);
      
    } else {
      var queryParams = new URLSearchParams(window.location.search);
      //prolific_id = queryParams.get("PROLIFIC_PID");
     // session_id = queryParams.get("SESSION_ID");
      src_subject_id = queryParams.get("src_subject_id");
      subjectkey = queryParams.get("subjectkey");
      time_pt = queryParams.get("time_pt");
      study = queryParams.get("study");
      // console.log("PID: " + prolific_id); //pizza
      // console.log("SID: " + session_id); //pizza
    }

    // Set state
    this.state = {
      //prolificID: prolific_id,
      //sessionID: session_id,
      src_subjectID: src_subject_id,
      subject_KEY: subjectkey,
      timePT: time_pt,
      studyName: study,
    };

    this.redirectToTarget = this.redirectToTarget.bind(this);
  }

  redirectToTarget() {
    //On click consent, sent to tutorial page with the props
    /*
    this.props.navigate(
      "/Start?PROLIFIC_PID=" +
        this.state.prolificID +
        "?SESSION_ID=" +
        this.state.sessionID,
      {
        state: {
          prolificID: this.state.prolificID,
          sessionID: this.state.sessionID,
        },
      }
    ); */

      this.props.navigate(
      "/Start?src_subject_id=" +
        this.state.src_subjectID +
        "?subjectkey=" +
        this.state.subject_KEY +
         "?time_pt=" +
        this.state.timePT +
        "?study=" +
        this.state.studyName,
      {
        state: {
          //prolificID: this.state.prolificID,
          //sessionID: this.state.sessionID,
          src_subjectID: this.state.src_subjectID,
          subject_KEY: this.state.subject_KEY,
          timePT: this.state.timePT,
          studyName: this.state.studyName,
          
        },
      }
    );

    //console.log("prolificID: " + this.state.prolificID);
    //console.log("sessionID: " + this.state.sessionID);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";

    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        console.log("Am I fullscreen?", screenfull.isFullscreen ? "Yes" : "No");
      });
    }
  }

  // enabling fullscreen has to be done after some user input
  toggleFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
  };

  render() {
    let text;

    text = (
      <div>
        <span>
          Please use <strong>Chrome</strong> - we cannot guarantee support on
          other browsers.
          <br />
          <br />
          To take part in the experiment, your browser must be{" "}
          <strong>maximised</strong> and be in <strong>fullscreen mode</strong>.
          This ensures that all graphics will be displayed in their correct
          dimensions.
          <br />
          <br />
          First, please ensure that your browser is maximised. When you are
          ready, click the [<strong>Start</strong>] button below. Fullscreen
          mode will be automatically enabled and you will be brought to the
          consent pages.
          <br />
          <br />
          Please <strong>do not refresh the webpage</strong> at any point in the
          study. You will not be able to return to the same page.
          <br />
          <br />
          Note: If you encounter a technical issue during the study, please take
          a screenshot of the error and send a message with details of the
          current broswer you are using to the researcher on Profilic.
          <br />
          <br />
          <center>
            <button
              onClick={() => {
                this.toggleFullScreen();
                this.redirectToTarget();
              }}
            >
              Start
            </button>
          </center>
        </span>
      </div>
    );

    return (
      <div className={style.bg}>
        <div className={style.textFrame}>
          <div className={style.fontStyle}>{text}</div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
