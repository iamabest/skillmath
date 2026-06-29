import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function NumberLineSimulation() {
  // State cho UI
  const [x, setX] = useState(0);
  const [y, setY] = useState(3);
  const [operator, setOperator] = useState("add");

  // Refs cho các biến logic (giữ nguyên logic từ sim.js)
  const canvasRef = useRef(null);
  const animRef = useRef({
    animationId: null,
    currentPos: 0,
    startPos: 0,
    targetPos: 0,
    stepIndex: 0,
    totalSteps: 0,
    stepDir: 1,
    isAnimating: false,
    animProgress: 0,
    pathHistory: [],
  });

  // Hằng số hình học (từ sim.js)
  const PADDING_X = 40;
  const CENTER_Y = 195; // Căn chỉnh theo chiều cao canvas
  const UNIT_WIDTH = 25;

  const mathToCanvasX = (val, canvasWidth) =>
    canvasWidth / 2 + val * UNIT_WIDTH;

  // --- LOGIC VẼ (PORT TỪ SIM.JS) ---
  const drawJumpArc = (ctx, fromVal, toVal, progress = 1) => {
    const canvas = canvasRef.current;
    const x1 = mathToCanvasX(fromVal, canvas.width);
    const x2 = mathToCanvasX(toVal, canvas.width);
    const cpX = (x1 + x2) / 2;
    const cpY = CENTER_Y - 40;

    ctx.beginPath();
    ctx.moveTo(x1, CENTER_Y);

    if (progress === 1) {
      ctx.quadraticCurveTo(cpX, cpY, x2, CENTER_Y);
      ctx.stroke();
      drawArrowOnArc(ctx, cpX, cpY, x2, CENTER_Y, toVal > fromVal ? 1 : -1);
    } else {
      for (let t = 0; t <= progress; t += 0.05) {
        const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpX + t * t * x2;
        const by =
          (1 - t) * (1 - t) * CENTER_Y +
          2 * (1 - t) * t * cpY +
          t * t * CENTER_Y;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  };

  const drawArrowOnArc = (ctx, cpX, cpY, x2, y2, dir) => {
    ctx.save();
    ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
    const angle = Math.atan2(y2 - cpY, x2 - cpX);
    ctx.translate(x2, y2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -4);
    ctx.lineTo(-8, 4);
    ctx.fill();
    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING_X, CENTER_Y);
    ctx.lineTo(canvas.width - PADDING_X, CENTER_Y);
    ctx.stroke();

    for (let i = -10; i <= 10; i++) {
      const xPos = mathToCanvasX(i, canvas.width);
      ctx.strokeStyle = i === 0 ? "#60a5fa" : "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.moveTo(xPos, CENTER_Y - 8);
      ctx.lineTo(xPos, CENTER_Y + 8);
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(i, xPos, CENTER_Y + 25);
    }

    // Vẽ lịch sử cung nhảy
    ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
    ctx.lineWidth = 2.5;
    animRef.current.pathHistory.forEach((step) =>
      drawJumpArc(ctx, step.from, step.to),
    );

    if (
      animRef.current.isAnimating &&
      animRef.current.stepIndex < animRef.current.totalSteps
    ) {
      const fromVal =
        animRef.current.startPos +
        animRef.current.stepIndex * animRef.current.stepDir;
      const toVal = fromVal + animRef.current.stepDir;
      drawJumpArc(ctx, fromVal, toVal, animRef.current.animProgress);
    }

    // Vẽ nhân vật
    let activeX = animRef.current.isAnimating
      ? mathToCanvasX(
          animRef.current.startPos +
            animRef.current.stepIndex * animRef.current.stepDir +
            animRef.current.animProgress * animRef.current.stepDir,
          canvas.width,
        )
      : mathToCanvasX(animRef.current.currentPos, canvas.width);

    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    let jumpY = animRef.current.isAnimating
      ? CENTER_Y -
        4 *
          35 *
          animRef.current.animProgress *
          (1 - animRef.current.animProgress)
      : CENTER_Y;
    ctx.arc(activeX, jumpY, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  // --- ĐIỀU KHIỂN ANIMATION ---
  const animateStep = () => {
    const s = animRef.current;
    if (s.stepIndex < s.totalSteps) {
      s.animProgress += 0.05;
      if (s.animProgress >= 1) {
        const nextPos = s.startPos + (s.stepIndex + 1) * s.stepDir;
        s.pathHistory.push({
          from: s.startPos + s.stepIndex * s.stepDir,
          to: nextPos,
        });
        s.stepIndex++;
        s.currentPos = nextPos;
        s.animProgress = 0;
      }
      draw();
      s.animationId = requestAnimationFrame(animateStep);
    } else {
      s.isAnimating = false;
      s.currentPos = s.targetPos;
      draw();
    }
  };
  const resetXY = () => {
    setX(0);
    setY(3);
  };
  const startAnimation = () => {
    if (animRef.current.isAnimating) return;
    const delta = operator === "add" ? y : -y;
    animRef.current = {
      ...animRef.current,
      startPos: x,
      currentPos: x,
      targetPos: x + delta,
      totalSteps: Math.abs(delta),
      stepDir: delta >= 0 ? 1 : -1,
      stepIndex: 0,
      animProgress: 0,
      pathHistory: [],
      isAnimating: true,
    };
    animateStep();
  };

  // Reset khi thay đổi inputs
  useEffect(() => {
    animRef.current.currentPos = x;
    animRef.current.pathHistory = [];
    draw();
  }, [x, y, operator]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel">
          <canvas
            ref={canvasRef}
            width="550"
            height="350"
            className="canvas-panel"
          />
        </div>

        <div className="control-panel">
          <h3>Phép tính & Điều khiển</h3>
          <div className="control-group">
            <div className="control-label">
              <label className="radio-label">
                <input
                  type="radio"
                  checked={operator === "add"}
                  onChange={() => setOperator("add")}
                />{" "}
                Cộng (+)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  checked={operator === "sub"}
                  onChange={() => setOperator("sub")}
                />{" "}
                Trừ (-)
              </label>
            </div>
          </div>

          <div className="control-group">Số thứ nhất (X): {x}</div>
          <input
            type="range"
            min="-10"
            max="10"
            value={x}
            onChange={(e) => setX(parseInt(e.target.value))}
          />

          <div className="control-group">Số thứ hai (Y): {y}</div>
          <input
            type="range"
            min="-10"
            max="10"
            value={y}
            onChange={(e) => setY(parseInt(e.target.value))}
          />

          <div className="control-group">
            <h2 class="control-heading h2">Phép toán thực hiện</h2>
            <p
              className="math-display"
              style={{
                fontSize: "1.4rem",
                textAlign: "center",
                margin: "0.5rem 0",
                fontWeight: "bold",
              }}
            >
              {x} {operator === "add" ? "+" : "-"} {y} ={" "}
              {operator === "add" ? x + y : x - y}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <button className="btn-action" onClick={startAnimation}>
              Chạy mô phỏng
            </button>
            <button className="btn-muted btn-action" onClick={resetXY}>
              Đặt lại
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
