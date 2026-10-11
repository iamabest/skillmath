import { Link, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { AppFooter } from "./AppFooter";
import { allSimulations } from "../data/simulations";
import React from "react";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const simulation = allSimulations.find((item) => item.url === pathname);
  return (
    <>
      <SiteHeader />

      <main className="simulation-page">
        <div className="breadcrumb" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Trang chủ
          </Link>
          <span>/</span>
          {simulation?.grade && (
            <>
              <span>Lớp {simulation.grade}</span>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--text-primary)' }}>{simulation?.title}</span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {simulation?.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {simulation?.description}
          </p>
        </div>

        <div className="simulation-content">{children}</div>
      </main>

      <AppFooter />
    </>
  );
}
