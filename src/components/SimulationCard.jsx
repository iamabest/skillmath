import { Link } from 'react-router-dom';

export function SimulationCard({ simulation }) {
  
  // const to = `/simulation/${simulation.slug}`;

  // const openSimulation = () => navigate(to);

  // const openByKeyboard = (event) => {
  //   if (event.key === 'Enter' || event.key === ' ') {
  //     event.preventDefault();
  //     openSimulation();
  //   }
  // };

  return (
    <article
      className="sim-card"
    
    >
      <div>
        <div className="sim-tags">
          {simulation.tags.map((tag, index) => (
            <span
              key={tag}
              className={`tag tag-${index === 0 ? simulation.tagType : 'active'}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="sim-title">{simulation.title}</h3>
        <p className="sim-description">{simulation.description}</p>
      </div>
      <div className="sim-footer">
        <span className="sim-status status-ready">{simulation.status}</span>
        {/* <a
          href={to}
          className="btn-open"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(to); }}
        >
          Trải nghiệm →
        </a> */}
        <Link 
        to={simulation.url}
        className='btn-open'> Trải nghiệm →
        </Link>
      </div>
    </article>
  );
}
