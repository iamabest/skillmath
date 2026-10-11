import { Link } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link className="logo-container brand-link" to="/" aria-label="SkillMath9 – Trang chủ">
        <div className="logo-icon" aria-hidden="true">∑</div>
        <div className="logo-text">Math</div>
      </Link>
      {/* <nav aria-label="Điều hướng chính" style={{ display: 'flex', gap: '1.5rem' }}>
        <a href="https://github.com/pmton/skillmath9" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Github</span>
        </a>
      </nav> */}
    </header>
  );
}
