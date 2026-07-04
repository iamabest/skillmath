import { Routes, Route } from "react-router-dom";
import { allSimulations } from "./data/simulations.js";

import HomePage from "./page/HomePage";
import InscribedAngleSimulation from "./page/math9/InscribedAngleSimulation.jsx";
import ParabolaSimulation from "./page/math9/ParabolaSimulation.jsx";
import RevolutionSolidSimulation from "./page/math9/RevolutionSolidSimulation.jsx";
import BinomialIdentitySimulation from "./page/math8/BinomialIdentitySimulation.jsx";
import LinearGraphSimulation from "./page/math8/LinearGraphSimulation.jsx";
import PrismPyramidSimulation from "./page/math8/PrismPyramidSimulation.jsx";
import SpatialNetSimulation from "./page/math7/spatial-nets/SpatialNetSimulation.jsx";
import TriangleConcurrencySimulation from "./page/math7/TriangleConcurrencySimulation.jsx";
import NumberLineSimulation from "./page/math6/NumberLineSimulation.jsx";
import SymmetrySimulation from "./page/math6/SymmetrySimulation.jsx";
import EratosthenesSimulation from "./page/math6/EratosthenesSimulation.jsx";
import FractionSliceSimulation from "./page/math6/FractionSliceSimulation.jsx";
import ClippingPlanesSimulation from "./page/math9/ClippingPlanesSimulation.jsx";
import ProbSim from "./page/xstk/ProbSim.jsx";

// Component mapping based on slug
const componentMap = {
  "lop9-goc-noi-tiep": InscribedAngleSimulation,
  "lop9-ban-bong-parabol": ParabolaSimulation,
  "lop9-khoi-tron-xoay": RevolutionSolidSimulation,
  "lop8-hang-dang-thuc": BinomialIdentitySimulation,
  "lop8-do-thi-bac-nhat": LinearGraphSimulation,
  "lop8-phong-thi-nghiem-3d": PrismPyramidSimulation,
  "lop7-trai-phang": SpatialNetSimulation,
  "lop7-duong-dong-quy": TriangleConcurrencySimulation,
  "lop6-truc-so-nguyen": NumberLineSimulation,
  "lop6-doi-xung-hinh-phang": SymmetrySimulation,
  "lop6-so-nguyen-to": EratosthenesSimulation,
  "lop6-phan-so-lat-cat": FractionSliceSimulation,
  "lop9-thiet-dien-hinh-khoi": ClippingPlanesSimulation,
  "xac-suat-thong-ke": ProbSim,
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      {allSimulations.map((sim) => {
        const Component = componentMap[sim.slug];
        if (!Component) return null;
        return (
          <Route
            key={sim.slug}
            path={`/simulations/${sim.slug}`}
            element={<Component />}
          />
        );
      })}
    </Routes>
  );
}
