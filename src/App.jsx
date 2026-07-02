import { Routes, Route } from "react-router-dom";
// import { useParams } from 'react-router-dom';
import { simulationsByGrade } from "./data/simulations.js";

import { GradeSection } from "./components/GradeSection.jsx";
import { Hero } from "./components/Hero.jsx";
// import { SimulationPage } from './components/SimulationPage.jsx';

import PageLayout from "./components/PageLayout.jsx";
// import LegacyRedirect from './components/LegacyRedirect.jsx';
import InscribedAngleSimulation from "../src/page/math9/InscribedAngleSimulation.jsx";
import { SiteHeader } from "./components/SiteHeader.jsx";
import { AppFooter } from "./components/AppFooter.jsx";
import HomePage from "./page/HomePage";
import ParabolaSimulation from "./page/math9/ParabolaSimulation.jsx";
import BinomialIdentitySimulation from "./page/math8/BinomialIdentitySimulation.jsx";
import LinearGraphSimulation from "./page/math8/LinearGraphSimulation.jsx";
import SpatialNetSimulation from "./page/math7/spatial-nets/SpatialNetSimulation.jsx";
import TriangleConcurrencySimulation from "./page/math7/TriangleConcurrencySimulation.jsx";
import NumberLineSimulation from "./page/math6/NumberLineSimulation.jsx";
import SymmetrySimulation from "./page/math6/SymmetrySimulation.jsx";
import ProbSim from "./page/xstk/ProbSim.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/simulations/lop9-goc-noi-tiep"
        element={<InscribedAngleSimulation />}
      />
      <Route
        path="/simulations/lop9-ban-bong-parabol"
        element={<ParabolaSimulation />}
      />
      {/* Math8 */}
      <Route
        path="/simulations/lop8-hang-dang-thuc"
        element={<BinomialIdentitySimulation />}
      />
      <Route
        path="/simulations/lop8-do-thi-bac-nhat"
        element={<LinearGraphSimulation />}
      />
      {/* Math7 */}
      <Route
        path="/simulations/lop7-trai-phang"
        element={<SpatialNetSimulation />}
      />
      <Route
        path="/simulations/lop7-duong-dong-quy"
        element={<TriangleConcurrencySimulation />}
      />

      {/*Mat6*/}
      <Route
        path="/simulations/lop6-truc-so-nguyen"
        element={<NumberLineSimulation />}
      />
      <Route
        path="/simulations/lop6-doi-xung-hinh-phang"
        element={<SymmetrySimulation />}
      />
      {/*xstk*/}
      <Route
        path="/simulations/xac-suat-thong-ke"
        element={<ProbSim/>}
      />
    </Routes>
  );
}
