import React from "react";

import { simulationsByGrade } from "../data/simulations.js";
import { SiteHeader } from "../components/SiteHeader.jsx";
import { Hero } from "../components/Hero.jsx";
import { GradeSection } from "../components/GradeSection.jsx";
import { AppFooter } from "../components/AppFooter.jsx";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <Hero />

        <div className="grade-container">
          {simulationsByGrade.map((gradeGroup) => (
            <GradeSection key={gradeGroup.id} gradeGroup={gradeGroup} />
          ))}
        </div>
      </main>

      <AppFooter />
    </>
  );
}
