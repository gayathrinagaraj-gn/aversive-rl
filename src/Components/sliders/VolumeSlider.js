import React, { useState } from "react";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import RangeSlider from "react-bootstrap-range-slider";
import styles from "../style/taskStyle.module.css";

function logslider(position) {
  // position will be between 0 and 100
  var minp = 0;
  var maxp = 100;

  // The result should be between 100 an 10000000
  var minv = Math.log(1);
  var maxv = Math.log(100);

  // calculate adjustment factor
  var scale = (maxv - minv) / (maxp - minp);

  return Math.exp(minv + scale * (position - minp));
}

export const SliderVol = ({ callBackValue, callBackValueNotLog }) => {
  const [audioVol, setValue] = useState(80);

  return (
    <div className={styles.shortSlider}>
      <RangeSlider
        value={audioVol}
        size="lg"
        onChange={(changeEvent) => {
          const newValue = changeEvent.target.value;
          var logValue = logslider(newValue);
          setValue(newValue);
          callBackValue(logValue);
          callBackValueNotLog(newValue);
        }}
        tooltipLabel={(currentValue) => `${currentValue}`}
        tooltip="off"
        variant="info"
      />
    </div>
  );
};
