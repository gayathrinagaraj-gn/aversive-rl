import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import style from "../style/taskStyle.module.css";

const theme = createTheme({
  palette: {
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    primary: {
      contrastThreshold: 4.5,
      main: "#000000",
    },

    text: { primary: "#000000", secondary: "#000000" },
  },
});

const marks = [
  {
    value: 0,
    label: "0",
  },
  {
    value: 25,
    label: "25",
  },
  {
    value: 50,
    label: "50",
  },
  {
    value: 75,
    label: "75",
  },
  {
    value: 100,
    label: "100",
  },
];

export function AverSlider({ key, callBackValue, initialValue }) {
  const [averScale, setValue] = React.useState(initialValue);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    callBackValue(newValue);
  };

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ width: 500 }}>
        <ThemeProvider theme={theme}>
          <Slider
            key={key}
            color="primary"
            aria-label="Always visible"
            step={1}
            marks={marks}
            min={0}
            max={100}
            track={false}
            valueLabelDisplay="on"
            value={averScale}
            onChange={handleChange}
          />
        </ThemeProvider>
      </Box>
      <span className={style.confTextLeft}>very unpleasant</span>
      <span className={style.confTextMiddle}>neutral</span>
      <span className={style.confTextRight}>very pleasant</span>
    </Box>
  );
}

export function ExampleAver() {
  const [scale, setValue] = React.useState(50);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: 600 }}>
      <Box sx={{ width: 500 }}>
        <ThemeProvider theme={theme}>
          <Slider
            color="primary"
            aria-label="Always visible"
            step={1}
            marks={marks}
            min={0}
            max={100}
            track={false}
            valueLabelDisplay="on"
            value={scale}
            onChange={handleChange}
          />
        </ThemeProvider>
      </Box>
      <span className={style.confTextLeft}>very unpleasant</span>
      <span className={style.confTextMiddle}>neutral</span>
      <span className={style.confTextRight}>very pleasant</span>
    </Box>
  );
}
