import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Components/Home";
import StartPage from "./Components/StartPage";
import SoundCal from "./Components/SoundCal";
import HeadphoneCheck from "./Components/HeadphoneCheck";
import Tutorial from "./Components/Tutorial";
import Task from "./Components/Task";
//import EndPage from "./Components/EndPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Start" element={<StartPage />} />
      <Route path="/HeadphoneCheck" element={<HeadphoneCheck />} />
      <Route path="/SoundCal" element={<SoundCal />} />
      <Route path="/Tutorial" element={<Tutorial />} />
      <Route path="/Task" element={<Task />} />
    </Routes>
  );
}

export default App;
