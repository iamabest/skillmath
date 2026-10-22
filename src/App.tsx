import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { allSimulations } from "./data/simulations";

import HomePage from "./page/HomePage";

// Lazy loaded components
const InscribedAngleSimulation = lazy(() => import("./page/math9/InscribedAngleSimulation"));
const ParabolaSimulation = lazy(() => import("./page/math9/ParabolaSimulation"));
const RevolutionSolidSimulation = lazy(() => import("./page/math9/RevolutionSolidSimulation"));
const BinomialIdentitySimulation = lazy(() => import("./page/math8/BinomialIdentitySimulation"));
const LinearGraphSimulation = lazy(() => import("./page/math8/LinearGraphSimulation"));
const PrismPyramidSimulation = lazy(() => import("./page/math8/PrismPyramidSimulation"));
const SpatialNetSimulation = lazy(() => import("./page/math7/spatial-nets/SpatialNetSimulation"));
const TriangleConcurrencySimulation = lazy(() => import("./page/math7/TriangleConcurrencySimulation"));
const TriangleBuilderSimulation = lazy(() => import("./page/math7/TriangleBuilderSimulation"));
const NumberLineSimulation = lazy(() => import("./page/math6/NumberLineSimulation"));
const SymmetrySimulation = lazy(() => import("./page/math6/SymmetrySimulation"));
const EratosthenesSimulation = lazy(() => import("./page/math6/EratosthenesSimulation"));
const FractionSliceSimulation = lazy(() => import("./page/math6/FractionSliceSimulation"));
const ProtractorSimulation = lazy(() => import("./page/math6/ProtractorSimulation"));
const ProportionBalanceSimulation = lazy(() => import("./page/math7/ProportionBalanceSimulation"));
const TransversalAnglesSimulation = lazy(() => import("./page/math7/TransversalAnglesSimulation"));
const PythagorasFluidSimulation = lazy(() => import("./page/math8/PythagorasFluidSimulation"));
const QuadrilateralEvolutionSimulation = lazy(() => import("./page/math8/QuadrilateralEvolutionSimulation"));
const ClippingPlanesSimulation = lazy(() => import("./page/math9/ClippingPlanesSimulation"));
const TrigCircleSimulation = lazy(() => import("./page/math9/TrigCircleSimulation"));
const CirclePositionsSimulation = lazy(() => import("./page/math9/CirclePositionsSimulation"));
const ProbSim = lazy(() => import("./page/xstk/ProbSim"));
const ThalesHeightSimulation = lazy(() => import("./page/math8/ThalesHeightSimulation"));
const LinearEquationsSimulation = lazy(() => import("./page/math9/LinearEquationsSimulation"));

// 15 New Simulations
const FractionCalculatorSimulation = lazy(() => import("./page/math6/FractionCalculatorSimulation"));
const GCDLCMSimulation = lazy(() => import("./page/math6/GCDLCMSimulation"));
const CoordinateMapSimulation = lazy(() => import("./page/math6/CoordinateMapSimulation"));
const LinearProportionSimulation = lazy(() => import("./page/math7/LinearProportionSimulation"));
const TriangleAnglesSimulation = lazy(() => import("./page/math7/TriangleAnglesSimulation"));
const RealNumberLineSimulation = lazy(() => import("./page/math7/RealNumberLineSimulation"));
const CongruentTrianglesSimulation = lazy(() => import("./page/math7/CongruentTrianglesSimulation"));
const AlgebraIdentities2Simulation = lazy(() => import("./page/math8/AlgebraIdentities2Simulation"));
const EquationBalanceSimulation = lazy(() => import("./page/math8/EquationBalanceSimulation"));
const SimilarFiguresSimulation = lazy(() => import("./page/math8/SimilarFiguresSimulation"));
const SquareRootSimulation = lazy(() => import("./page/math9/SquareRootSimulation"));
const ParabolaAdvancedSimulation = lazy(() => import("./page/math9/ParabolaAdvancedSimulation"));
const CircumInscribedSimulation = lazy(() => import("./page/math9/CircumInscribedSimulation"));
const StatisticsChartsSimulation = lazy(() => import("./page/xstk/StatisticsChartsSimulation"));
const SampleSpaceTreeSimulation = lazy(() => import("./page/xstk/SampleSpaceTreeSimulation"));
const BinomialDistributionSimulation = lazy(() => import("./page/xstk/BinomialDistributionSimulation"));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8', backgroundColor: '#0b0f19', flexDirection: 'column', gap: '1rem' }}>
    <div className="logo-icon" style={{ animation: 'spin 2s linear infinite', borderRadius: '50%', width: '40px', height: '40px' }}>∑</div>
    <div>Đang tải mô phỏng...</div>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// Component mapping based on slug
const componentMap: Record<string, React.LazyExoticComponent<any>> = {
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
  "lop6-sang-eratosthenes": EratosthenesSimulation,
  "lop6-phan-so-lat-cat": FractionSliceSimulation,
  "lop6-thuoc-do-goc": ProtractorSimulation,
  "lop7-can-don-ti-le": ProportionBalanceSimulation,
  "lop7-cat-tuyen-goc": TransversalAnglesSimulation,
  "lop7-dung-tam-giac": TriangleBuilderSimulation,
  "lop8-pitago-chat-long": PythagorasFluidSimulation,
  "lop8-tien-hoa-tu-giac": QuadrilateralEvolutionSimulation,
  "lop8-thales-do-chieu-cao": ThalesHeightSimulation,
  "lop9-thiet-dien-hinh-khoi": ClippingPlanesSimulation,
  "lop9-duong-tron-luong-giac": TrigCircleSimulation,
  "lop9-vi-tri-duong-tron": CirclePositionsSimulation,
  "lop9-he-phuong-trinh": LinearEquationsSimulation,
  "xac-suat-thong-ke": ProbSim,

  // 15 New Simulations
  "lop6-may-tinh-phan-so": FractionCalculatorSimulation,
  "lop6-uoc-boi-chung": GCDLCMSimulation,
  "lop6-ban-do-toa-do": CoordinateMapSimulation,
  "lop7-ham-so-y-ax": LinearProportionSimulation,
  "lop7-goc-trong-tam-giac": TriangleAnglesSimulation,
  "lop7-so-thuc-truc-so": RealNumberLineSimulation,
  "lop7-hai-tam-giac-bang-nhau": CongruentTrianglesSimulation,
  "lop8-hang-dang-thuc-2": AlgebraIdentities2Simulation,
  "lop8-phuong-trinh-can-bang": EquationBalanceSimulation,
  "lop8-hinh-dong-dang": SimilarFiguresSimulation,
  "lop9-can-thuc-bac-hai": SquareRootSimulation,
  "lop9-parabol-nang-cao": ParabolaAdvancedSimulation,
  "lop9-duong-tron-ngoai-noi-tiep": CircumInscribedSimulation,
  "xac-suat-bieu-do-thong-ke": StatisticsChartsSimulation,
  "xac-suat-so-do-cay": SampleSpaceTreeSimulation,
  "xac-suat-phan-phoi-binomial": BinomialDistributionSimulation,
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      
      {allSimulations.map((sim) => {
        const Component = componentMap[sim.slug];
        if (!Component) return null;
        
        // Cắt bỏ phần hash trong url nếu có (để React Router xử lý đúng)
        const pathUrl = sim.url.split('#')[0];
        
        return (
          <Route
            key={sim.slug}
            path={pathUrl}
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Component />
              </Suspense>
            }
          />
        );
      })}
    </Routes>
  );
}
