import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Components/Home";
import StartPage from "./Components/StartPage";
import SoundCal from "./Components/SoundCal";
import HeadphoneCheck from "./Components/HeadphoneCheck";
import Tutorial from "./Components/Tutorial";
import Task from "./Components/Task";
import Bonus from "./Components/Bonus";
import Questionnaires from "./Components/Questionnaires";
import EndPage from "./Components/EndPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Start" element={<StartPage />} />
      {/*<Route path="/HeadphoneCheck" element={<HeadphoneCheck />} /> --> Skip headphone check*/}
      <Route path="/SoundCal" element={<SoundCal />} />
      <Route path="/Tutorial" element={<Tutorial />} />
      <Route path="/Task" element={<Task />} />
      <Route path="/Bonus" element={<Bonus />} />
      <Route path="/Quest" element={<Questionnaires />} />
      <Route path="/EndPage" element={<EndPage />} />
    </Routes>
  );
}

export default App;
