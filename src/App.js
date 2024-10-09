import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Components/Home";
import StartPage from "./Components/StartPage";
//import SoundCal from "./Components/SoundCal";
import HeadphoneCheck from "./Components/HeadphoneCheck";
//import PerTut from "./Components/Tutorial";
//import PerTask from "./Components/Task";
//import EndPage from "./Components/EndPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Start" element={<StartPage />} />
      <Route path="/HeadphoneCheck" element={<HeadphoneCheck />} />
    </Routes>
  );
}

export default App;
