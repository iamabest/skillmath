import { Link, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader.jsx";
import { AppFooter } from "./AppFooter.jsx";
import { allSimulations } from "../data/simulations.js";
export default function PageLayout({ children }) {
  const { pathname } = useLocation();
  const simulation = allSimulations.find((item) => item.url === pathname);
  console.log(simulation);
  return (
    <>
      <SiteHeader />

      <main className="simulation-page">

          <Link className="btn-back" to="/">
            ← Quay lại trang chủ
          </Link>
            <h1 className="simulation-heading ">{simulation?.title}</h1>
            <p>{simulation?.description}</p>
          


        <div className="simulation-content">{children}</div>
      </main>

      <AppFooter />
    </>
  );
}
