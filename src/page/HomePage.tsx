import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { simulationsByGrade, allSimulations } from "../data/simulations";
import { SiteHeader } from "../components/SiteHeader";
import { Hero } from "../components/Hero";
import { GradeSection } from "../components/GradeSection";
import { AppFooter } from "../components/AppFooter";
import { SimulationCard } from "../components/SimulationCard";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");

  const filteredSimulations = useMemo(() => {
    if (!searchTerm && selectedGrade === "all") return null;

    let results = allSimulations;

    if (selectedGrade !== "all") {
      results = results.filter(
        (sim) =>
          sim.grade === selectedGrade ||
          (selectedGrade === "P" && sim.grade === "P"),
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (sim) =>
          sim.title.toLowerCase().includes(term) ||
          sim.description.toLowerCase().includes(term) ||
          sim.tags.some((tag) => tag.toLowerCase().includes(term)),
      );
    }

    return results;
  }, [searchTerm, selectedGrade]);

  return (
    <>
      <SiteHeader />

      <main>
        <Hero />

        <div
          style={{
         
            margin: "0 auto",
         
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              backgroundColor: "var(--bg-card)",
              padding: "1rem",
              borderRadius: "1rem",
              border: "1px solid var(--border-color)",
            }}
          >
            <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "1rem",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }}
              >
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài mô phỏng, chủ đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem 0.75rem 2.5rem",
                  borderRadius: "0.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="select-control"
              >
                <option value="all">Tất cả các lớp</option>
                <option value="6">Toán 6</option>
                <option value="7">Toán 7</option>
                <option value="8">Toán 8</option>
                <option value="9">Toán 9</option>
                <option value="P">Xác suất - Thống kê</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grade-container">
          {filteredSimulations ? (
            <section className="grade-section">
              <div className="grade-header">
                <h2 className="grade-title">
                  Kết quả tìm kiếm ({filteredSimulations.length})
                </h2>
              </div>
              {filteredSimulations.length > 0 ? (
                <div className="sim-grid">
                  {filteredSimulations.map((simulation, index) => (
                    <SimulationCard
                      key={`${simulation.url}-${index}`}
                      simulation={simulation}
                    />
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    padding: "2rem 0",
                  }}
                >
                  Không tìm thấy mô phỏng nào phù hợp với điều kiện tìm kiếm.
                </p>
              )}
            </section>
          ) : (
            simulationsByGrade.map((gradeGroup) => (
              <GradeSection key={gradeGroup.id} gradeGroup={gradeGroup} />
            ))
          )}
        </div>
      </main>

      <AppFooter />
    </>
  );
}
