import React, { useState, useEffect, useRef, useCallback } from "react";
import PageLayout from "../../components/PageLayout";

// Các bộ tam giác vuông Pythagoras nổi tiếng
const PRESETS = [
  { label: "3-4-5", a: 3, b: 4, c: 5 },
  { label: "5-12-13", a: 5, b: 12, c: 13 },
  { label: "8-15-17", a: 8, b: 15, c: 17 },
  { label: "Tùy chỉnh", a: null, b: null, c: null },
];

export default function PythagorasFluidSimulation() {
  const canvasRef = useRef(null);

  // State điều khiển chung
  const [preset, setPreset] = useState(0);
  const [sides, setSides] = useState({ a: 3, b: 4, c: 5 });
  const [isPouring, setIsPouring] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Tham chiếu (Refs) cho Animation vòng lặp (RAF)
  const targetSides = useRef(sides);
  const vSides = useRef({ a: 3, b: 4, c: 5 }); // Visual sides (dùng cho hiệu ứng morphing)
  const fillRef = useRef(0);
  const isPouringRef = useRef(false);
  const reqFrame = useRef(null);

  // Tham chiếu (Refs) cho Thu Phóng (Zoom & Pan)
  const transform = useRef({ zoom: 1, panX: 0, panY: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Đồng bộ State với Refs để dùng trong requestAnimationFrame
  useEffect(() => {
    targetSides.current = sides;
  }, [sides]);
  useEffect(() => {
    isPouringRef.current = isPouring;
  }, [isPouring]);

  const startPour = useCallback(() => {
    if (isPouringRef.current) return;
    setIsComplete(false);
    fillRef.current = 0;
    setIsPouring(true);
  }, []);

  const reset = useCallback(() => {
    fillRef.current = 0;
    setIsPouring(false);
    setIsComplete(false);
  }, []);

  const handlePreset = (idx) => {
    setPreset(idx);
    reset();
    if (PRESETS[idx].a !== null) {
      setSides({ a: PRESETS[idx].a, b: PRESETS[idx].b, c: PRESETS[idx].c });
    }
  };

  const { a, b, c } = sides;
  const verifyOk = Math.abs(a * a + b * b - c * c) < 0.01;

  // XỬ LÝ SỰ KIỆN CHUỘT (THU PHÓNG VÀ KÉO THẢ)
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    transform.current.zoom = Math.max(
      0.2,
      Math.min(5, transform.current.zoom * zoomDelta),
    );
  };
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - transform.current.panX,
      y: e.clientY - transform.current.panY,
    };
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    transform.current.panX = e.clientX - dragStart.current.x;
    transform.current.panY = e.clientY - dragStart.current.y;
  };
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  const resetView = () => {
    transform.current = { zoom: 1, panX: 0, panY: 0 };
  };

  // VÒNG LẶP RENDER CHÍNH (CANVAS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });

    // Enable smooth mouse wheel
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;

      // 1. LERP ANIMATION TẠO HIỆU ỨNG CHUYỂN ĐỘNG MƯỢT MÀ
      vSides.current.a += (targetSides.current.a - vSides.current.a) * 0.1;
      vSides.current.b += (targetSides.current.b - vSides.current.b) * 0.1;
      vSides.current.c += (targetSides.current.c - vSides.current.c) * 0.1;

      // 2. LERP CHO CHẤT LỎNG (NƯỚC)
      if (isPouringRef.current) {
        fillRef.current += 0.003;
        if (fillRef.current >= 1) {
          fillRef.current = 1;
          setIsPouring(false);
          setIsComplete(true);
        }
        // } else if (!isComplete && fillRef.current > 0) {
        //   fillRef.current *= 0.9; // Hút ngược lại mượt mà khi reset
      }

      const vA = vSides.current.a;
      const vB = vSides.current.b;
      const vC = vSides.current.c;
      const fill = fillRef.current;

      // Vẽ Background tĩnh
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);

      // Vẽ lưới nền (Grid) di chuyển theo camera
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 40 * transform.current.zoom;
      const offsetX = transform.current.panX % gridSize;
      const offsetY = transform.current.panY % gridSize;
      ctx.beginPath();
      for (let x = offsetX - gridSize; x < W; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = offsetY - gridSize; y < H; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
      ctx.restore();

      // 3. TÍNH TOÁN AUTO-CENTER VÀ AUTO-SCALE
      // Khung chứa hình học: Max Width = 2*a + b, Max Height = 2*b + a
      const boundingWidth = 2 * vA + vB;
      const boundingHeight = 2 * vB + vA;
      // Fit vào màn hình với lề (margin) 20%
      const autoScale = Math.min(W / boundingWidth, H / boundingHeight) * 0.65;
      const S = autoScale * transform.current.zoom;

      const vA_S = vA * S;
      const vB_S = vB * S;
      const vC_S = vC * S;

      // Tâm điểm (Trọng tâm dịch chuyển hình vào giữa)
      const centerX = W / 2 + transform.current.panX;
      const centerY = H / 2 + transform.current.panY;

      // Tọa độ gốc C (Góc vuông)
      const ox = centerX - (vB / 2) * S;
      const oy = centerY + (vA / 2) * S;

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const drawBox = (x, y, w, h, color, fillRatio, isHypotenuse = false) => {
        // Nền mờ
        ctx.fillStyle = color.replace("1)", "0.05)");
        ctx.strokeStyle = color.replace("1)", "0.5)");
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();

        // Nước (Gradient đổ bóng)
        if (fillRatio > 0) {
          const fillH = h * fillRatio;
          const fillY = isHypotenuse ? y : y + (h - fillH);

          const grad = ctx.createLinearGradient(x, fillY, x, fillY + fillH);
          grad.addColorStop(0, color.replace("1)", "0.8)"));
          grad.addColorStop(1, color.replace("1)", "0.3)"));

          ctx.fillStyle = grad;
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.rect(x, fillY, w, fillH);
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
        }
      };

      // --- BÌNH B² (Dưới - Màu xanh lá) ---
      drawBox(ox, oy, vB_S, vB_S, "rgba(52,211,153,1)", fill);

      // --- BÌNH A² (Trái - Màu xanh dương) ---
      drawBox(ox - vA_S, oy - vA_S, vA_S, vA_S, "rgba(96,165,250,1)", fill);

      // --- BÌNH C² (Cạnh huyền - Màu hồng) ---
      ctx.save();
      ctx.translate(ox, oy - vA_S); // Dời đến đỉnh A
      const angle = Math.atan2(vA_S, vB_S);
      ctx.rotate(angle);
      // Nước trong c² xả dần (từ dưới đáy dâng lên hoặc tụt xuống)
      drawBox(0, -vC_S, vC_S, vC_S, "rgba(244,114,182,1)", 1 - fill, true);

      // Chữ trong bình c²
      ctx.fillStyle = "#fdf2f8";
      ctx.font = `bold ${Math.max(12, vC_S * 0.12)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`c² = ${Math.round(vC * vC)}`, vC_S / 2, -vC_S / 2);
      ctx.restore();

      // Vẽ chữ bình a² và b²
      ctx.fillStyle = "#eff6ff";
      ctx.font = `bold ${Math.max(12, vA_S * 0.15)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`a² = ${Math.round(vA * vA)}`, ox - vA_S / 2, oy - vA_S / 2);
      ctx.restore();
      ctx.fillStyle = "#ecfdf5";
      ctx.font = `bold ${Math.max(12, vB_S * 0.15)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`b² = ${Math.round(vB * vB)}`, ox + vB_S / 2, oy + vB_S / 2);
      ctx.restore();

      // --- TAM GIÁC VUÔNG (GIỮA) ---
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + vB_S, oy);
      ctx.lineTo(ox, oy - vA_S);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ký hiệu góc vuông
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      const sq = 12 * transform.current.zoom;
      ctx.beginPath();
      ctx.moveTo(ox + sq, oy);
      ctx.lineTo(ox + sq, oy - sq);
      ctx.lineTo(ox, oy - sq);
      ctx.stroke();

      // --- HIỆU ỨNG TIA NĂNG LƯỢNG (KHI ĐANG CHẢY NƯỚC) ---
      if (fill > 0 && fill < 1) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8;
        // Animation tạo dòng chảy
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -Date.now() / 30;

        ctx.beginPath();
        // Dòng từ C qua tam giác về A
        ctx.moveTo(ox + vB_S / 2, oy - vA_S / 2);
        ctx.lineTo(ox - vA_S / 4, oy - vA_S / 2);
        // Dòng từ C qua tam giác về B
        ctx.moveTo(ox + vB_S / 2, oy - vA_S / 2);
        ctx.lineTo(ox + vB_S / 2, oy + vB_S / 4);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }

      // Thông báo Success (Phát sáng)
      if (fill >= 1 && verifyOk) {
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 18px Inter, sans-serif";
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 10;
        ctx.fillText(`✨ ${c}² = ${a}² + ${b}² ✨`, W / 2, H - 30);
        ctx.shadowBlur = 0;
      }

      reqFrame.current = requestAnimationFrame(render);
    };

    reqFrame.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(reqFrame.current);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [a, b, c, verifyOk]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ position: "relative" }}>
          {/* NÚT CÔNG CỤ THU PHÓNG OVERLAY */}
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 10,
            }}
          >
            <button
              onClick={() => {
                transform.current.zoom *= 1.2;
              }}
              style={zoomBtnStyle}
            >
              ➕
            </button>
            <button
              onClick={() => {
                transform.current.zoom *= 0.8;
              }}
              style={zoomBtnStyle}
            >
              ➖
            </button>
            <button onClick={resetView} style={zoomBtnStyle}>
              🏠
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width="560"
            height="460"
            className="math-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              background: "#0b0f19",
              border: "1px solid #1e293b",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.8)",
              maxWidth: "100%",
              height: "auto",
              cursor: "grab", // Đổi chuột thành icon bàn tay kéo thả
            }}
          />
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.8rem",
              color: "#9ca3af",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              * Nhấn <strong>Bắt đầu rót</strong> để xem mô phỏng.
            </span>
            <span>🖱 Lăn chuột để Thu/Phóng | Kéo để di chuyển</span>
          </div>
        </div>

        {/* PANEL ĐIỀU KHIỂN (Giữ nguyên gốc) */}
        <div className="control-panel">
          <h3
            style={{
              fontSize: "1.2rem",
              borderBottom: "1px solid #374151",
              paddingBottom: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            Định lý Pitago – Chất lỏng
          </h3>

          <div className="control-group" style={{ marginBottom: "1rem" }}>
            <label className="control-label">Chọn bộ số:</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                marginTop: "0.5rem",
              }}
            >
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(i)}
                  className={`btn-action ${preset === i ? "" : "btn-muted"}`}
                  style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {preset === 3 && (
            <div className="control-group" style={{ marginBottom: "1rem" }}>
              <label className="control-label">Nhập 3 cạnh (a, b, c):</label>
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
              >
                {["a", "b", "c"].map((key) => (
                  <div key={key} style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      {key}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      value={sides[key]}
                      onChange={(e) => {
                        reset();
                        const val = parseFloat(e.target.value) || 1;
                        setSides((prev) => {
                          const nextSides = { ...prev, [key]: val };
                          const matchedIdx = PRESETS.findIndex(
                            (p) =>
                              p.a === nextSides.a &&
                              p.b === nextSides.b &&
                              p.c === nextSides.c,
                          );
                          if (matchedIdx !== -1) setPreset(matchedIdx);
                          return nextSides;
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        background: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "4px",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    />
                  </div>
                ))}
              </div>
              {!verifyOk && (
                <p
                  style={{
                    marginTop: "0.4rem",
                    fontSize: "0.8rem",
                    color: "#f87171",
                  }}
                >
                  ⚠ {a}² + {b}² ≠ {c}². Không phải tam giác vuông!
                </p>
              )}
            </div>
          )}

          <div className="button-row" style={{ marginBottom: "1rem" }}>
            <button
              className="btn-action"
              onClick={startPour}
              disabled={isPouring || !verifyOk}
            >
              {isPouring ? "Đang rót..." : "Bắt đầu rót nước"}
            </button>
            <button className="btn-action btn-muted" onClick={reset}>
              Đặt lại
            </button>
          </div>

          <div
            className={`stat-box`}
            style={{ borderColor: verifyOk ? "#4ade80" : "#f87171" }}
          >
            <div
              style={{
                color: verifyOk ? "#4ade80" : "#f87171",
                fontWeight: "bold",
              }}
            >
              {verifyOk
                ? "✓ Tam giác vuông hợp lệ"
                : "✗ Không phải tam giác vuông"}
            </div>
            <div
              style={{
                marginTop: "0.5rem",
                color: "#d1d5db",
                fontSize: "0.9rem",
              }}
            >
              a² + b² = {a * a} + {b * b} = <strong>{a * a + b * b}</strong>
              <br />
              c² = <strong>{c * c}</strong>
            </div>
          </div>

          <div className="info-box" style={{ marginTop: "1rem" }}>
            Định lý Pitago: Trong tam giác vuông, bình phương cạnh huyền bằng
            tổng bình phương hai cạnh góc vuông: <em>a² + b² = c²</em>.
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// Style nhỏ dùng cho 3 nút Thu/Phóng nổi trên mặt Canvas
const zoomBtnStyle = {
  background: "rgba(30, 41, 59, 0.8)",
  border: "1px solid #334155",
  color: "#fff",
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
  backdropFilter: "blur(4px)",
};
