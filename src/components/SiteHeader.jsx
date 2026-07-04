import { Link, Links } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header>
      <Link className="logo-container brand-link" to="/" aria-label="SkillMath9 – Trang chủ">
        <div className="logo-icon" aria-hidden="true">∑</div>
        <div className="logo-text">Math</div>
       
      </Link>
      <nav aria-label="Điều hướng chính">
     
      </nav>
    </header>
  );
}
