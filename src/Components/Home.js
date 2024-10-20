import screenfull from "screenfull";
import React from "react";
import withRouter from "./withRouter.js";
import style from "./style/taskStyle.module.css";
// import queryString from "query-string";

var debug = true;

class Home extends React.Component {
  constructor(props) {
    super(props);

    // ID number - either set or get from url

    if (debug === true) {
      var prolific_id = 1000;
      var session_id = 1000;
    } else {
      const queryParams = new URLSearchParams(window.location.search);
      const prolific_id = queryParams.get("PROLIFIC_PID");
      const session_id = queryParams.get("SESSION_ID");
      // console.log("PID: " + prolific_id); //pizza
      // console.log("SID: " + session_id); //pizza
    }

    // Set state
    this.state = {
      prolificID: prolific_id,
      sessionID: session_id,
    };

    this.redirectToTarget = this.redirectToTarget.bind(this);
  }

  redirectToTarget() {
    //On click consent, sent to tutorial page with the props
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
