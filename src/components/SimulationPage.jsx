import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { findSimulation } from '../data/simulations.js';

const SpatialNetSimulation = lazy(() =>
  import('../simulations/spatial-nets/SpatialNetSimulation.jsx').then((module) => ({
    default: module.SpatialNetSimulation,
  })),
);

export function SimulationPage({ slug }) {
  const simulation = findSimulation(slug);

  if (!simulation) {
    return (
      <main className="simulation-page">
        <Link className="btn-back" to="/">← Quay lại trang chủ</Link>
        <section className="grade-section">
          <h1 className="grade-title">Không tìm thấy mô phỏng</h1>
          <p className="sim-description">
            Đường dẫn "<code>{slug}</code>" không hợp lệ hoặc mô phỏng đã được di chuyển.
          </p>
        </section>
      </main>
    );
  }

  if (simulation.component === 'spatial-nets') {
    return (
      <Suspense fallback={<SimulationLoading />}>
        <SpatialNetSimulation />
      </Suspense>
    );
  }

  return <LegacySimulationFrame simulation={simulation} />;
}

function SimulationLoading() {
  return (
    <main className="simulation-page">
      <section className="grade-section">
        <h1 className="grade-title">Đang tải mô phỏng...</h1>
        <p className="sim-description">Chuẩn bị không gian 3D và dữ liệu hình trải phẳng.</p>
      </section>
    </main>
  );
}

function LegacySimulationFrame({ simulation }) {
  return (
    <main className="simulation-page">
      <div className="simulation-heading">
        <div>
          <Link className="btn-back" to="/">← Quay lại trang chủ</Link>
          <h1>{simulation.title}</h1>
          <p>{simulation.description}</p>
        </div>
      </div>
      <section className="legacy-frame-shell">
        <iframe
          title={simulation.title}
          src={simulation.legacyPath}
          className="legacy-frame"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </section>
    </main>
  );
}
