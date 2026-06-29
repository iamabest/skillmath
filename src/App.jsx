import { Routes, Route } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { simulationsByGrade } from './data/simulations.js';
import { AppFooter } from './components/AppFooter.jsx';
import { GradeSection } from './components/GradeSection.jsx';
import { Hero } from './components/Hero.jsx';
import { SimulationPage } from './components/SimulationPage.jsx';
import { SiteHeader } from './components/SiteHeader.jsx';
import PageLayout from './components/PageLayout.jsx';
import LegacyRedirect from './components/LegacyRedirect.jsx';

function HomePage() {
  return (
    <PageLayout>
      <Hero />
      <div className="grade-container">
        {simulationsByGrade.map((gradeGroup) => (
          <GradeSection key={gradeGroup.id} gradeGroup={gradeGroup} />
        ))}
      </div>
    </PageLayout>
  );
}

function SimulationRoute() {
  const { slug } = useParams();
  return (
    <PageLayout>
      <SimulationPage slug={slug} />
    </PageLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/simulation/:slug" element={<SimulationRoute />} />
      {/* Catch-all: handle legacy ?simulation=X query strings */}
      <Route path="*" element={<LegacyRedirect />} />
    </Routes>
  );
}
