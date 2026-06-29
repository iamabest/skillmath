import { SimulationCard } from "./SimulationCard.jsx";

const accentMap = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  accent: "var(--color-accent)",
};

export function GradeSection({ gradeGroup }) {
  const accent = accentMap[gradeGroup.accent] || accentMap.primary;

  return (
    <section className="grade-section">
      <div className="grade-header">
        <div className="logo-icon grade-mark" style={{ background: accent }}>
          {gradeGroup.grade}
        </div>
        <h2 className="grade-title">{gradeGroup.title}</h2>
      </div>
      <div className="sim-grid">
        {gradeGroup.simulations.map((simulation, index) => (
          <SimulationCard
            key={`${simulation.url}-${index}`}
            simulation={simulation}
          />
        ))}
      </div>
    </section>
  );
}
