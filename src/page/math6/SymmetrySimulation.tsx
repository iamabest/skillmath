import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PageLayout from "../../components/PageLayout";

interface SymmetryAxis {
  name: string;
  angle: number;
}

interface ShapeStyle {
  strokeStyle?: string;
  fillStyle?: string;
  lineWidth?: number;
  lineDash?: number[];
}

interface ShapeConfig {
  name: string;
  description: string;
  axes: SymmetryAxis[];
  hasCenter: boolean;
  hasInfiniteAxes?: boolean;
  markerPoint: { x: number; y: number };
  draw: (size?: number) => Path2D;
}

const SHAPES: Record<string, ShapeConfig> = {
  square: {
    name: "Hình vuông",
    description:
      "Hình vuông có **4 trục đối xứng** (2 đường trung trực của các cạnh và 2 đường chéo) và **có tâm đối xứng** (giao điểm hai đường chéo).",
    axes: [
      { name: "Đường trung trực ngang", angle: 0 },
      { name: "Đường trung trực dọc", angle: Math.PI / 2 },
      { name: "Đường chéo chính", angle: Math.PI / 4 },
      { name: "Đường chéo phụ", angle: -Math.PI / 4 },
    ],
    hasCenter: true,
    markerPoint: { x: -75, y: -75 },
    draw: (size = 150) => {
      const half = size / 2;
      const p = new Path2D();
      p.rect(-half, -half, size, size);
      return p;
    },
  },
  rectangle: {
    name: "Hình chữ nhật",
    description:
      "Hình chữ nhật có **2 trục đối xứng** (2 đường trung trực của các cạnh) và **có tâm đối xứng** (giao điểm hai đường chéo). Lưu ý: Đường chéo KHÔNG PHẢI là trục đối xứng của hình chữ nhật.",
    axes: [
      { name: "Đường trung trực ngang", angle: 0 },
      { name: "Đường trung trực dọc", angle: Math.PI / 2 },
    ],
    hasCenter: true,
    markerPoint: { x: -90, y: -60 },
    draw: (size = 150) => {
      const width = size * 1.2;
      const height = size * 0.8;
      const p = new Path2D();
      p.rect(-width / 2, -height / 2, width, height);
      return p;
    },
  },
  equiTriangle: {
    name: "Tam giác đều",
    description:
      "Tam giác đều có **3 trục đối xứng** (3 đường trung trực, cũng là 3 đường cao/phân giác) nhưng **KHÔNG có tâm đối xứng** (khi xoay 180° hình sẽ bị ngược đầu).",
    axes: [
      { name: "Đường cao dọc", angle: Math.PI / 2 },
      { name: "Đường cao xiên trái", angle: Math.PI / 2 + Math.PI / 3 },
      { name: "Đường cao xiên phải", angle: Math.PI / 2 - Math.PI / 3 },
    ],
    hasCenter: false,
    markerPoint: { x: 0, y: -95 },
    draw: (size = 160) => {
      const height = (size * Math.sqrt(3)) / 2;
      const topY = (-2 * height) / 3; // centroid at origin
      const baseY = height / 3;
      const p = new Path2D();
      p.moveTo(0, topY);
      p.lineTo(size / 2, baseY);
      p.lineTo(-size / 2, baseY);
      p.closePath();
      return p;
    },
  },
  rhombus: {
    name: "Hình thoi",
    description:
      "Hình thoi có **2 trục đối xứng** (2 đường chéo) và **có tâm đối xứng** (giao điểm hai đường chéo).",
    axes: [
      { name: "Đường chéo ngang", angle: 0 },
      { name: "Đường chéo dọc", angle: Math.PI / 2 },
    ],
    hasCenter: true,
    markerPoint: { x: -95, y: 0 },
    draw: (size = 150) => {
      const width = size * 1.3;
      const height = size * 0.8;
      const p = new Path2D();
      p.moveTo(0, -height / 2);
      p.lineTo(width / 2, 0);
      p.lineTo(0, height / 2);
      p.lineTo(-width / 2, 0);
      p.closePath();
      return p;
    },
  },
  parallelogram: {
    name: "Hình bình hành",
    description:
      "Hình bình hành **KHÔNG có trục đối xứng** nào (khi gấp đôi hình theo bất kỳ đường nào đều không khớp) nhưng **có tâm đối xứng** (giao điểm hai đường chéo).",
    axes: [],
    hasCenter: true,
    markerPoint: { x: -55, y: -60 },
    draw: (size = 150) => {
      const width = size * 1.2;
      const height = size * 0.8;
      const skew = 35;
      let verts = [
        [-width / 2 + skew, -height / 2],
        [width / 2 + skew, -height / 2],
        [width / 2 - skew, height / 2],
        [-width / 2 - skew, height / 2],
      ];
      // center the polygon at origin
      const cx = verts.reduce((s, v) => s + v[0], 0) / verts.length;
      const cy = verts.reduce((s, v) => s + v[1], 0) / verts.length;
      verts = verts.map(([x, y]) => [x - cx, y - cy]);
      const p = new Path2D();
      verts.forEach(([x, y], i) => (i === 0 ? p.moveTo(x, y) : p.lineTo(x, y)));
      p.closePath();
      return p;
    },
  },
  hexagon: {
    name: "Lục giác đều",
    description:
      "Lục giác đều có **6 trục đối xứng** (3 đường chéo chính nối các đỉnh đối diện và 3 đường trung trực nối trung điểm các cạnh đối diện) và **có tâm đối xứng**.",
    axes: [
      { name: "Trục ngang qua 2 đỉnh", angle: 0 },
      { name: "Trục dọc nối trung điểm cạnh", angle: Math.PI / 2 },
      { name: "Trục chéo 30° qua đỉnh", angle: Math.PI / 6 },
      { name: "Trục chéo 60° nối trung điểm cạnh", angle: Math.PI / 3 },
      { name: "Trục chéo 120° nối trung điểm cạnh", angle: (2 * Math.PI) / 3 },
      { name: "Trục chéo 150° qua đỉnh", angle: (5 * Math.PI) / 6 },
    ],
    hasCenter: true,
    markerPoint: { x: -95, y: 0 },
    draw: (size = 95) => {
      const p = new Path2D();
      for (let i = 0; i < 6; i += 1) {
        const angle = (i * Math.PI) / 3;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        if (i === 0) p.moveTo(x, y);
        else p.lineTo(x, y);
      }
      p.closePath();
      return p;
    },
  },
  circle: {
    name: "Hình tròn",
    description:
      "Hình tròn có **vô số trục đối xứng** (mọi đường thẳng đi qua tâm đều là trục đối xứng) và **có tâm đối xứng** (chính là tâm O của hình tròn).",
    axes: [
      { name: "Đường kính ngang (0°)", angle: 0 },
      { name: "Đường kính chéo (45°)", angle: Math.PI / 4 },
      { name: "Đường kính dọc (90°)", angle: Math.PI / 2 },
      { name: "Đường kính chéo (135°)", angle: (3 * Math.PI) / 4 },
    ],
    hasCenter: true,
    hasInfiniteAxes: true,
    markerPoint: { x: 0, y: -95 },
    draw: (size = 95) => {
      const p = new Path2D();
      p.arc(0, 0, size, 0, Math.PI * 2);
      return p;
    },
  },
};

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeConfig,
  style: ShapeStyle = {},
) {
  ctx.save();
  ctx.strokeStyle = style.strokeStyle || "#3b82f6";
  ctx.fillStyle = style.fillStyle || "rgba(59, 130, 246, 0.2)";
  ctx.lineWidth = style.lineWidth || 3;
  ctx.setLineDash(style.lineDash || []);
  const path = typeof shape.draw === "function" ? shape.draw() : null;
  if (path) {
    ctx.fill(path);
    ctx.stroke(path);
  }
  ctx.restore();
}

function drawCanvasMessage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: string) {
  ctx.save();
  ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
  ctx.font = "600 15px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, canvas.width / 2, canvas.height - 28);
  ctx.restore();
}

export default function SymmetrySimulation() {
  const [shapeKey, setShapeKey] = useState("square");
  const [mode, setMode] = useState("axial");
  const [axisIndex, setAxisIndex] = useState(0);
  const [customAngleDeg, setCustomAngleDeg] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<{
    id: number | null;
    timeoutId: ReturnType<typeof setTimeout> | null;
    progress: number;
    direction: number;
    type: string;
  }>({
    id: null,
    timeoutId: null,
    progress: 0,
    direction: 1,
    type: "fold",
  });

  const shape = SHAPES[shapeKey];
  const activeAxis = useMemo(() => {
    if (shape.hasInfiniteAxes) {
      return {
        name: `Đường kính (${customAngleDeg}°)`,
        angle: (customAngleDeg * Math.PI) / 180,
      };
    }
    return shape.axes[axisIndex] || null;
  }, [axisIndex, customAngleDeg, shape]);
  const canAnimate = mode === "axial" ? Boolean(activeAxis) : shape.hasCenter;

  const matchingPresetIndex = useMemo(() => {
    if (!shape.hasInfiniteAxes) return axisIndex;
    return shape.axes.findIndex(
      (axis) => Math.round((axis.angle * 180) / Math.PI) === customAngleDeg,
    );
  }, [axisIndex, customAngleDeg, shape]);

  const descriptionHtml = useMemo(
    () =>
      shape.description.replace(
        /\*\*(.*?)\*\*/g,
        '<strong style="color: var(--color-success);">$1</strong>',
      ),
    [shape.description],
  );

  const clearAnimation = useCallback(() => {
    const animation = animationRef.current;
    if (animation.id) cancelAnimationFrame(animation.id);
    if (animation.timeoutId) clearTimeout(animation.timeoutId);

    animationRef.current = {
      id: null,
      timeoutId: null,
      progress: 0,
      direction: 1,
      type: "fold",
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const progress = animationRef.current.progress;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);

    if (mode === "axial") {
      if (activeAxis) {
        ctx.save();
        ctx.rotate(activeAxis.angle);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(-canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, 0);
        ctx.stroke();
        ctx.restore();

        if (isAnimating) {
          // Nửa trên cố định
          ctx.save();
          ctx.rotate(activeAxis.angle);
          ctx.beginPath();
          ctx.rect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height);
          ctx.clip();
          ctx.rotate(-activeAxis.angle);
          drawShape(ctx, shape);
          ctx.restore();

          // Nửa dưới gấp lên
          ctx.save();
          ctx.rotate(activeAxis.angle);
          ctx.scale(1, Math.cos(progress * Math.PI));
          ctx.beginPath();
          ctx.rect(-canvas.width, 0, canvas.width * 2, canvas.height);
          ctx.clip();
          ctx.rotate(-activeAxis.angle);
          drawShape(ctx, shape, {
            strokeStyle: "rgba(245, 158, 11, 0.9)",
            fillStyle: "rgba(245, 158, 11, 0.4)",
          });
          ctx.restore();
        } else {
          drawShape(ctx, shape);
        }

        if (shape.hasInfiniteAxes) {
          ctx.save();
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.rotate(activeAxis.angle);
          ctx.fillStyle = "#e2e8f0";
          ctx.font = "600 13px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("O", 0, -14);
          ctx.restore();
        }
      } else {
        drawShape(ctx, shape, {
          strokeStyle: "#94a3b8",
          fillStyle: "rgba(148, 163, 184, 0.14)",
        });
      }
    } else {
      drawShape(ctx, shape, {
        strokeStyle: "rgba(255, 255, 255, 0.18)",
        fillStyle: "rgba(255, 255, 255, 0.04)",
        lineWidth: 1.5,
        lineDash: [4, 4],
      });

      ctx.fillStyle = shape.hasCenter ? "#10b981" : "#ef4444";
      ctx.beginPath();

      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(isAnimating ? progress * Math.PI : 0);
      drawShape(ctx, shape, {
        strokeStyle: isAnimating ? "rgba(245, 158, 11, 0.9)" : "#3b82f6",
        fillStyle: isAnimating
          ? "rgba(245, 158, 11, 0.3)"
          : "rgba(59, 130, 246, 0.2)",
      });
      if (shape.hasInfiniteAxes) {
        ctx.save();
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(shape.markerPoint.x, shape.markerPoint.y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.fillStyle = "#ef4444"; // Màu đỏ nổi bật
      ctx.arc(shape.markerPoint.x, shape.markerPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    if (mode === "axial" && !activeAxis) {
      drawCanvasMessage(ctx, canvas, "Hình này không có trục đối xứng.");
    }

    if (mode === "rotational" && !shape.hasCenter) {
      drawCanvasMessage(
        ctx,
        canvas,
        "Hình này không có tâm đối xứng khi xoay 180°.",
      );
    }
  }, [activeAxis, isAnimating, mode, shape]);

  const runAnimation = useCallback(() => {
    const animation = animationRef.current;
    const speed = animation.type === "fold" ? 0.025 : 0.018;

    animation.progress += speed * animation.direction;

    if (animation.progress >= 1) {
      animation.progress = 1;
      draw();
      animation.timeoutId = setTimeout(() => {
        animationRef.current.direction = -1;
        animationRef.current.id = requestAnimationFrame(runAnimation);
      }, 900);
      return;
    }

    if (animation.progress <= 0 && animation.direction === -1) {
      animation.progress = 0;
      animation.id = null;
      setIsAnimating(false);
      draw();
      return;
    }

    draw();
    animation.id = requestAnimationFrame(runAnimation);
  }, [draw]);

  const startAnimation = (type: string) => {
    if (isAnimating || !canAnimate) return;

    clearAnimation();
    animationRef.current.type = type;
    setIsAnimating(true);
  };

  useEffect(() => {
    if (!isAnimating) {
      draw();
      return undefined;
    }

    animationRef.current.id = requestAnimationFrame(runAnimation);

    return () => {
      clearAnimation();
    };
  }, [clearAnimation, draw, isAnimating, runAnimation]);

  useEffect(() => {
    clearAnimation();
    setIsAnimating(false);
    setAxisIndex(0);
    setCustomAngleDeg(0);
  }, [clearAnimation, mode, shapeKey]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel">
          <canvas
            ref={canvasRef}
            id="symmetryCanvas"
            width="450"
            height="400"
            className="math-canvas"
            style={{
              maxWidth: "100%",
              height: "auto",
              background: "#111827",
              border: "2px dashed rgba(255, 255, 255, 0.1)",
              borderRadius: "0.5rem",
              boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.6)",
            }}
          />
        </div>

        <div className="control-panel">
          <div className="control-group">
            <label className="control-label" htmlFor="shapeSelect">
              Chọn hình
            </label>
            <select
              id="shapeSelect"
              className="select-control"
              value={shapeKey}
              disabled={isAnimating}
              onChange={(e) => setShapeKey(e.target.value)}
            >
              {Object.keys(SHAPES).map((key) => (
                <option key={key} value={key}>
                  {SHAPES[key].name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
            }}
          >
            <button
              className={`btn-action ${mode === "axial" ? "" : "btn-muted"}`}
              type="button"
              disabled={isAnimating}
              onClick={() => setMode("axial")}
            >
              Đối xứng trục
            </button>
            <button
              className={`btn-action ${mode === "rotational" ? "" : "btn-muted"}`}
              type="button"
              disabled={isAnimating}
              onClick={() => setMode("rotational")}
            >
              Đối xứng tâm
            </button>
          </div>

          {mode === "axial" ? (
            <div className="control-group">
              <label className="control-label" htmlFor="axisSelect">
                Trục kiểm tra
              </label>
              {shape.axes.length > 0 ? (
                <select
                  id="axisSelect"
                  className="select-control"
                  value={
                    shape.hasInfiniteAxes
                      ? matchingPresetIndex !== -1
                        ? String(matchingPresetIndex)
                        : "custom"
                      : String(axisIndex)
                  }
                  disabled={isAnimating}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") return;
                    const idx = Number(val);
                    setAxisIndex(idx);
                    if (shape.hasInfiniteAxes) {
                      setCustomAngleDeg(
                        Math.round((shape.axes[idx].angle * 180) / Math.PI),
                      );
                    }
                  }}
                >
                  {shape.axes.map((axis, index) => (
                    <option key={axis.name} value={index}>
                      {axis.name}
                    </option>
                  ))}
                  {shape.hasInfiniteAxes && matchingPresetIndex === -1 && (
                    <option value="custom">
                      Đường kính tùy chỉnh ({customAngleDeg}°)
                    </option>
                  )}
                </select>
              ) : (
                <div className="info-box">
                  Hình này không có trục đối xứng để chọn.
                </div>
              )}
              {shape.hasInfiniteAxes && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <label htmlFor="circleAxisSlider">
                      Xoay trục qua tâm O bất kỳ
                    </label>
                    <span
                      style={{
                        color: "var(--color-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {customAngleDeg}°
                    </span>
                  </div>
                  <input
                    id="circleAxisSlider"
                    type="range"
                    min={0}
                    max={180}
                    step={1}
                    value={customAngleDeg}
                    disabled={isAnimating}
                    onChange={(e) => setCustomAngleDeg(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#ef4444" }}
                  />
                </div>
              )}
              <button
                className="btn-action"
                type="button"
                disabled={isAnimating || !activeAxis}
                onClick={() => startAnimation("fold")}
              >
                {isAnimating ? "Đang gấp..." : "Gấp hình"}
              </button>
            </div>
          ) : (
            <div className="control-group">
              <button
                className="btn-action"
                type="button"
                disabled={isAnimating || !shape.hasCenter}
                onClick={() => startAnimation("rotate")}
              >
                {isAnimating ? "Đang xoay..." : "Xoay hình 180°"}
              </button>
              {!shape.hasCenter && (
                <div className="info-box">
                  Hình này không trùng lại với chính nó sau phép quay 180°.
                </div>
              )}
            </div>
          )}

          <div
            className="info-box"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
