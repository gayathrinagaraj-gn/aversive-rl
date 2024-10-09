import React from "react";
import PropTypes from "prop-types";

import { easeOutCubic } from "./helpers/easing";
import { getStopIconPoints, getPlayIconPoints } from "./helpers/icon-points";

class PlayButton extends React.Component {
  static propTypes = {
    audio: PropTypes.string,
    active: PropTypes.bool,
    // playNum: PropTypes.number,
    play: PropTypes.func,
    stop: PropTypes.func,
    volume: PropTypes.number,
    // idleBackgroundColor: PropTypes.string,
  };

  static defaultProps = {
    size: 80,
    progressCircleWidth: 10,
    progressCircleColor: "#e3d26f",
    idleBackgroundColor: "#DC143C",
    activeBackgroundColor: "#a15e49",
    stopIconColor: "#FFFFFF",
    playIconColor: "#FFFFFF",
    iconAnimationLength: 450,
    fadeInLength: 0,
    fadeOutLength: 0,
    playOnceOnly: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      active: this.props.active,
      progress: 0,
      loading: true,
      duration: 0,
      iconPoints: getPlayIconPoints(props),
      finish: false,
    };

    this.clickHandler = this.clickHandler.bind(this);
    this.animateIcon = this.animateIcon.bind(this);

    this.setupAudio = this.setupAudio.bind(this);
    this.triggerPlayAudio = this.triggerPlayAudio.bind(this);
    this.triggerStopAudio = this.triggerStopAudio.bind(this);
  }

  setupAudio() {
    this.audio = new Audio(this.props.audio);
    this.audio.load();

    this.audio.onloadedmetadata = () => {
      this.setState({
        duration: this.audio.duration,
        url: this.props.audio,
      });
    };

    var volume = this.props.volume / 100;

    setTimeout(
      this.setState({
        loading: false,
        volume: volume,
        finish: false,
      }),
      100
    );
  }

  componentDidMount() {
    this.setupAudio();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const justStartedPlaying = !this.props.active && nextProps.active;
    const justStoppedPlaying = this.props.active && !nextProps.active;
    //    const newAudioClip = this.state.url !== nextProps.audio;

    if (justStartedPlaying) {
      this.setupAudio();
      this.triggerPlayAudio();
    } else if (justStoppedPlaying) {
      this.triggerStopAudio();
    }
  }

  triggerPlayAudio() {
    this.audio.play();
    this.animateIcon("stop");
    this.setState({ progress: 0, active: true, finish: false }, () =>
      this.updateProgress()
    );
  }

  triggerStopAudio() {
    window.setTimeout(() => this.audio.pause(), this.props.fadeOutLength);
    this.audio.currentTime = 0; //this makes it restart from the beginning whenever we pause it
    this.animateIcon("play");

    this.setState({ progress: 0, active: false });
  }

  triggerResetAudio() {
    this.animateIcon("play");
    this.setState({ progress: 0, active: false, finish: true });
  }

  clickHandler(event) {
    this.setState({ active: !this.state.active });
    this.state.active ? this.props.stop() : this.props.play();
  }

  updateProgress() {
    window.requestAnimationFrame(() => {
      if (!this.state.active) {
        return;
      } else {
        var currentTime = this.audio.currentTime;
        var progress = currentTime / this.state.duration;

        // I need this part to do the volume adjustment in the sound calibration
        var volume = this.props.volume / 100;

        // Add in a fail safe I guess

        if (volume > 1) {
          volume = 1;
        } else if (volume < 0) {
          volume = 0;
        }

        this.audio.volume = volume;

        if (this.state.progress === 1) {
          if (this.props.playOnceOnly) {
            return;
          } else {
          }

          return;
        } else {
          this.setState({
            volume: volume,
            progress: progress,
          });

          this.updateProgress();
        }
      }
    });
  }

  animateIcon(shape) {
    const easingFunction = easeOutCubic;
    const startTime = new Date().getTime();
    const duration = this.props.iconAnimationLength;
    const initialPoints = this.state.iconPoints;
    const finalPoints =
      shape === "stop"
        ? getStopIconPoints(this.props)
        : getPlayIconPoints(this.props);

    const updatePosition = () => {
      requestAnimationFrame(() => {
        const time = new Date().getTime() - startTime;

        // Our end condition. The time has elapsed, the animation is completed.
        if (time > duration) return;

        const newPoints = initialPoints.map((initialPoint, index) => {
          const [initialX, initialY] = initialPoint;
          const [finalX, finalY] = finalPoints[index];

          return [
            easingFunction(time, initialX, finalX - initialX, duration),
            easingFunction(time, initialY, finalY - initialY, duration),
          ];
        });

        this.setState(
          {
            iconPoints: newPoints,
          },
          updatePosition
        );
      });
    };

    updatePosition();
  }

  renderIcon() {
    const { playIconColor, stopIconColor } = this.props;
    const points = this.state.iconPoints.map((p) => p.join(",")).join(" ");

    return (
      <polygon
        points={points}
        style={{ cursor: "pointer" }}
        fill={this.state.active ? playIconColor : stopIconColor}
      />
    );
  }

  renderMainCircle() {
    const { size, idleBackgroundColor, activeBackgroundColor } = this.props;

    const radius = size / 2;

    return (
      <circle
        cx={radius}
        cy={radius}
        r={radius}
        style={{ cursor: "pointer" }}
        fill={this.state.active ? activeBackgroundColor : idleBackgroundColor}
        pointerEvents="visiblePainted"
      />
    );
  }

  renderProgressBar() {
    const { size, progressCircleWidth, progressCircleColor } = this.props;

    const center = size / 2;
    const diameter = size - progressCircleWidth;
    const radius = diameter / 2;
    const circumference = diameter * Math.PI;
    const progressWidth = Math.floor(
      1 - (1 - this.state.progress) * circumference
    );

    const circlePath = `
      M ${center}, ${center}
      m 0, -${radius}
      a ${radius},${radius} 0 1,0 0,${diameter}
      a ${radius},${radius} 0 1,0 0,-${diameter}
    `;

    return (
      <path
        d={circlePath}
        stroke={progressCircleColor}
        strokeWidth={progressCircleWidth}
        strokeDasharray={circumference}
        style={{
          cursor: "pointer",
          strokeDashoffset: progressWidth,
        }}
        fill="transparent"
      />
    );
  }

  render() {
    const { size } = this.props;

    return (
      <svg
        id="playbutton"
        width={size}
        height={size}
        onClick={this.clickHandler}
      >
        {this.renderMainCircle()}
        {this.state.active ? this.renderProgressBar() : null}
        {this.renderIcon()}
      </svg>
    );
  }
}

export default PlayButton;
