import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";
import { Point, drawGrid, drawPoint, drawText, drawLine } from "../../utils/canvasHelper";

interface MapPoint extends Point {
  color?: string;
}

export default function CoordinateMapSimulation() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [hiddenMode, setHiddenMode] = useState(false);
  const [hiddenPoint, setHiddenPoint] = useState<Point | null>(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Click lên bản đồ để đặt điểm.");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const UNIT = 20; // 20px = 1 unit

  const generateHiddenPoint = () => {
    const x = Math.floor(Math.random() * 19) - 9; // -9 to 9
    const y = Math.floor(Math.random() * 19) - 9;
    setHiddenPoint({ x, y });
    setMessage(`Hãy tìm điểm bí mật tại (${x}, ${y})!`);
  };

  const toggleHiddenMode = () => {
    if (!hiddenMode) {
      setHiddenMode(true);
      setPoints([]);
      setScore(0);
      generateHiddenPoint();
    } else {
      setHiddenMode(false);
      setHiddenPoint(null);
      setMessage("Click lên bản đồ để đặt điểm.");
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel to coordinate
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    // Round to nearest 0.5 unit for better interaction
    const mathX = Math.round(((clickX - cx) / UNIT) * 2) / 2;
    const mathY = Math.round(((cy - clickY) / UNIT) * 2) / 2;

    if (mathX < -10 || mathX > 10 || mathY < -10 || mathY > 10) return;

    if (hiddenMode && hiddenPoint) {
      const dist = Math.sqrt(Math.pow(mathX - hiddenPoint.x, 2) + Math.pow(mathY - hiddenPoint.y, 2));
      if (dist <= 1) {
        setScore(score + 10);
        setMessage(`Chính xác! (+10 điểm). Đang tìm điểm mới...`);
        // Highlight found point temporarily
        setPoints([{ x: hiddenPoint.x, y: hiddenPoint.y, color: '#4ade80' }]);
        setTimeout(() => {
          generateHiddenPoint();
          setPoints([]);
        }, 1500);
      } else {
        setMessage(`Sai rồi. Điểm bạn vừa bấm là (${mathX}, ${mathY}). Cách đích ${dist.toFixed(1)} đơn vị.`);
        setPoints([{ x: mathX, y: mathY, color: '#ef4444' }]);
      }
    } else {
      // Normal mode
      if (points.length >= 5) {
        setPoints([{ x: mathX, y: mathY, color: '#3b82f6' }]);
      } else {
        setPoints([...points, { x: mathX, y: mathY, color: '#3b82f6' }]);
      }
      setMessage(`Đã đặt điểm tại (${mathX}, ${mathY})`);
    }
  };

  const clearPoints = () => {
    setPoints([]);
    if (!hiddenMode) setMessage("Đã xóa tất cả điểm.");
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    drawGrid(ctx, canvas.width, canvas.height, UNIT, { x: cx, y: cy });

    // Arrows and Labels
    drawText(ctx, "x", { x: canvas.width - 15, y: cy - 10 }, { color: "#94a3b8" });
    drawText(ctx, "y", { x: cx + 10, y: 15 }, { color: "#94a3b8" });
    drawText(ctx, "O", { x: cx - 15, y: cy + 15 }, { color: "#94a3b8" });

    // Ticks
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      // X ticks
      drawLine(ctx, { x: cx + i * UNIT, y: cy - 4 }, { x: cx + i * UNIT, y: cy + 4 }, { color: "#94a3b8", lineWidth: 2 });
      if (i % 2 === 0) {
        drawText(ctx, String(i), { x: cx + i * UNIT, y: cy + 18 }, { color: "#94a3b8", align: "center", baseline: "middle" });
      }
      
      // Y ticks
      drawLine(ctx, { x: cx - 4, y: cy - i * UNIT }, { x: cx + 4, y: cy - i * UNIT }, { color: "#94a3b8", lineWidth: 2 });
      if (i % 2 === 0) {
        drawText(ctx, String(i), { x: cx - 8, y: cy - i * UNIT }, { color: "#94a3b8", align: "right", baseline: "middle" });
      }
    }

    // Draw Points
    points.forEach((p, idx) => {
      const px = cx + p.x * UNIT;
      const py = cy - p.y * UNIT;
      
      drawPoint(ctx, { x: px, y: py }, { fillColor: p.color || "#3b82f6", color: "white", lineWidth: 1, radius: 6 });

      // Draw label
      drawText(ctx, `${hiddenMode ? '' : String.fromCharCode(65 + idx)}(${p.x}, ${p.y})`, { x: px + 8, y: py - 8 }, { color: "white", align: "left" });
    });
  };

  useEffect(() => {
    draw();
  }, [points, hiddenMode, hiddenPoint]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas 
            ref={canvasRef} 
            width="500" 
            height="450" 
            onClick={handleCanvasClick}
            style={{ cursor: 'crosshair', backgroundColor: '#1e293b', borderRadius: '8px' }}
          />
        </div>

        <div className="control-panel">
          <h3>Bản đồ Tọa độ 2D</h3>
          
          <div className="info-box" style={{ marginBottom: '20px' }}>
            <p style={{ margin: 0 }}>{message}</p>
            {hiddenMode && (
              <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#4ade80' }}>
                Điểm: {score}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className={`btn-action ${hiddenMode ? 'btn-muted' : ''}`} 
              onClick={toggleHiddenMode}
            >
              {hiddenMode ? "Tắt Chế độ Giấu điểm" : "Bật Chế độ Giấu điểm"}
            </button>
            
            {!hiddenMode && (
              <button className="btn-muted btn-action" onClick={clearPoints}>
                Xóa tất cả điểm
              </button>
            )}
          </div>

          {!hiddenMode && (
            <div style={{ marginTop: '20px' }}>
              <h4 className="control-heading h2">Danh sách điểm (tối đa 5)</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {points.length === 0 ? (
                  <li style={{ color: '#94a3b8' }}>Chưa có điểm nào</li>
                ) : (
                  points.map((p, i) => (
                    <li key={i} style={{ marginBottom: '5px' }}>
                      <span style={{ display: 'inline-block', width: '20px', color: '#3b82f6', fontWeight: 'bold' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      ({p.x}, {p.y})
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
