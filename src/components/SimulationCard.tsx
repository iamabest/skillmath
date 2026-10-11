import { Link } from "react-router-dom";
import { Play, Sparkles, Wrench } from "lucide-react";
import { SimulationItem } from "../data/simulations";

export function SimulationCard({ simulation }: { simulation: SimulationItem }) {
  const getStatusDisplay = () => {
    switch (simulation.status) {
      case "Sẵn sàng":
        return (
          <span className="sim-status status-ready" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Play size={12} /> Sẵn sàng
          </span>
        );
      case "Mới":
        return (
          <span className="sim-status" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <Sparkles size={12} /> Mới
          </span>
        );
      default:
        return (
          <span className="sim-status status-dev" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wrench size={12} /> Đang phát triển
          </span>
        );
    }
  };

  return (
    <article className="sim-card">
      <div>
        <div className="sim-tags">
          {simulation.tags.map((tag, index) => (
            <span
              key={tag}
              className={`tag tag-${index === 0 ? simulation.tagType : "active"}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="sim-title">{simulation.title}</h3>
        <p className="sim-description">{simulation.description}</p>
      </div>
      <div className="sim-footer">
        {getStatusDisplay()}

        {(simulation.status === "Sẵn sàng" || simulation.status === "Mới") && (
          <Link to={simulation.url} className="btn-open">
            Trải nghiệm →
          </Link>
        )}
      </div>
    </article>
  );
}
