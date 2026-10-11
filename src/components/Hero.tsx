import { allSimulations, simulationsByGrade } from "../data/simulations";

export function Hero() {
  const totalSims = allSimulations.length;
  const totalGrades = simulationsByGrade.filter(
    (g) => g.id !== "probability-statistics",
  ).length;
  const readySims = allSimulations.filter(
    (s) => s.status === "Sẵn sàng" || s.status === "Mới",
  ).length;

  return (
    <section
      className="hero-section"
    >
      <div className="hero-content" style={{ zIndex: 1, position: "relative" }}>
        <h1 className="hero-title">Trực quan hóa Toán THCS</h1>
        <p className="hero-subtitle">
          Hệ thống mô hình hóa toán học tương tác theo chương trình SGK mới,
          giúp học sinh khám phá toán học qua trải nghiệm trực quan.
        </p>
        <div
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            marginTop: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "var(--color-primary)",
              }}
            >
              {totalSims}
            </span>
            <span style={{ color: "var(--text-secondary)" }}>Mô phỏng</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "var(--color-success)",
              }}
            >
              {totalGrades}
            </span>
            <span style={{ color: "var(--text-secondary)" }}>Lớp học</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "var(--color-warning)",
              }}
            >
              {readySims}
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              Bài học sẵn sàng
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-10%",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          opacity: 0.15,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50%",
          right: "-10%",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          opacity: 0.15,
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
    </section>
  );
}
