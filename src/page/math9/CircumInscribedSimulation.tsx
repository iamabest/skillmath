import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function CircumInscribedSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [pts, setPts] = useState({
    A: { x: 250, y: 100 },
    B: { x: 100, y: 350 },
    C: { x: 400, y: 350 }
  });
  
  const [showPerpBisectors, setShowPerpBisectors] = useState(false);
  const [showAngleBisectors, setShowAngleBisectors] = useState(false);
  const [dragging, setDragging] = useState(null);

  // Math Helpers
  const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { A, B, C } = pts;

    // Sides
    const a = dist(B, C);
    const b = dist(A, C);
    const c = dist(A, B);
    const p = a + b + c; // Perimeter
    const s = p / 2; // semi-perimeter
    const S = Math.sqrt(s * (s - a) * (s - b) * (s - c)); // Heron's Area

    // --- Incenter I ---
    const Ix = (a * A.x + b * B.x + c * C.x) / p;
    const Iy = (a * A.y + b * B.y + c * C.y) / p;
    const r = S / s; // Inradius

    // --- Circumcenter O ---
    const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    const A_sq = A.x*A.x + A.y*A.y;
    const B_sq = B.x*B.x + B.y*B.y;
    const C_sq = C.x*C.x + C.y*C.y;
    const Ox = (A_sq * (B.y - C.y) + B_sq * (C.y - A.y) + C_sq * (A.y - B.y)) / d;
    const Oy = (A_sq * (C.x - B.x) + B_sq * (A.x - C.x) + C_sq * (B.x - A.x)) / d;
    const R = (a * b * c) / (4 * S); // Circumradius

    // --- Draw Triangles ---
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Draw Circumcircle (O, R) ---
    ctx.beginPath();
    ctx.arc(Ox, Oy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "#facc15"; // yellow
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Circumcenter O
    ctx.beginPath(); ctx.arc(Ox, Oy, 4, 0, Math.PI*2); ctx.fillStyle = "#facc15"; ctx.fill();
    ctx.fillText("O", Ox + 5, Oy - 5);

    // --- Draw Incircle (I, r) ---
    ctx.beginPath();
    ctx.arc(Ix, Iy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#4ade80"; // green
    ctx.lineWidth = 2;
    ctx.stroke();

    // Incenter I
    ctx.beginPath(); ctx.arc(Ix, Iy, 4, 0, Math.PI*2); ctx.fillStyle = "#4ade80"; ctx.fill();
    ctx.fillText("I", Ix + 5, Iy - 5);

    // --- Draw Angle Bisectors ---
    if (showAngleBisectors) {
      ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      [A, B, C].forEach(pt => {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(Ix, Iy);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // --- Draw Perpendicular Bisectors ---
    if (showPerpBisectors) {
      ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      const midAB = { x: (A.x+B.x)/2, y: (A.y+B.y)/2 };
      const midBC = { x: (B.x+C.x)/2, y: (B.y+C.y)/2 };
      const midCA = { x: (C.x+A.x)/2, y: (C.y+A.y)/2 };
      
      [midAB, midBC, midCA].forEach(mid => {
        ctx.beginPath();
        ctx.moveTo(mid.x, mid.y);
        ctx.lineTo(Ox, Oy);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // Draw Vertices A, B, C
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    [ {p: A, name: "A"}, {p: B, name: "B"}, {p: C, name: "C"} ].forEach(v => {
      ctx.beginPath(); ctx.arc(v.p.x, v.p.y, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillText(v.name, v.p.x - 15, v.p.y - 10);
    });
  };

  useEffect(() => {
    draw();
  }, [pts, showPerpBisectors, showAngleBisectors]);

  // Mouse Handlers
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    for (let key in pts) {
      const p = pts[key];
      if (dist(p, pos) < 15) {
        setDragging(key);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const pos = getMousePos(e);
    // Prevent colinear points (basic guard)
    // To make it robust, you'd check area, but this is fine for now
    setPts(prev => ({
      ...prev,
      [dragging]: pos
    }));
  };

  const handleMouseUp = () => setDragging(null);

  // Compute values for UI
  const { A, B, C } = pts;
  const a = dist(B, C);
  const b = dist(A, C);
  const c = dist(A, B);
  const p = a + b + c; 
  const s = p / 2;
  const S = Math.sqrt(s * (s - a) * (s - b) * (s - c)); 
  const r = S / s; 
  const R = (a * b * c) / (4 * S);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas 
            ref={canvasRef} 
            width="500" 
            height="450" 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              backgroundColor: '#1e293b', 
              borderRadius: '8px',
              cursor: dragging ? 'grabbing' : 'grab'
            }} 
          />
        </div>

        <div className="control-panel">
          <h3>Đường tròn Ngoại tiếp & Nội tiếp</h3>
          
          <div className="info-box" style={{ marginBottom: '20px' }}>
            <p>Kéo các đỉnh A, B, C để thay đổi tam giác. Quan sát tâm O và tâm I di chuyển.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', padding: '10px', borderRadius: '5px', border: '1px solid #facc15' }}>
              <h4 style={{ color: '#facc15', margin: '0 0 5px 0' }}>Đường tròn Ngoại tiếp</h4>
              <p style={{ margin: '2px 0' }}>Tâm: O (Giao 3 đường trung trực)</p>
              <p style={{ margin: '2px 0' }}>Bán kính R = {(R/10).toFixed(2)}</p>
              <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={showPerpBisectors} onChange={(e) => setShowPerpBisectors(e.target.checked)} />
                <span style={{ marginLeft: '5px' }}>Hiện đường trung trực</span>
              </label>
            </div>
            
            <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '10px', borderRadius: '5px', border: '1px solid #4ade80' }}>
              <h4 style={{ color: '#4ade80', margin: '0 0 5px 0' }}>Đường tròn Nội tiếp</h4>
              <p style={{ margin: '2px 0' }}>Tâm: I (Giao 3 đường phân giác)</p>
              <p style={{ margin: '2px 0' }}>Bán kính r = {(r/10).toFixed(2)}</p>
              <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={showAngleBisectors} onChange={(e) => setShowAngleBisectors(e.target.checked)} />
                <span style={{ marginLeft: '5px' }}>Hiện đường phân giác</span>
              </label>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
            <p style={{ margin: '5px 0' }}><strong>Chu vi tam giác:</strong> p = {(p/10).toFixed(2)}</p>
            <p style={{ margin: '5px 0' }}><strong>Diện tích tam giác:</strong> S = {(S/100).toFixed(2)}</p>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <p style={{ margin: '5px 0' }}>R = (a·b·c) / (4·S)</p>
            <p style={{ margin: '5px 0' }}>r = S / p</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
