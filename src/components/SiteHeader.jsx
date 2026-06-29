import { Link, Links } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header>
      <Link className="logo-container brand-link" to="/" aria-label="SkillMath9 – Trang chủ">
        <div className="logo-icon" aria-hidden="true">∑</div>
        <div className="logo-text">Math</div>
        <span className="badge">Kết nối tri thức</span>
      </Link>
      <nav aria-label="Điều hướng chính">
        <Link
          to="/"
          className="btn-open"
          target="_blank"
        >
          📄 Tài liệu sư phạm
        </Link>
      </nav>
    </header>
  );
}
