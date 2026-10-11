import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function TriangleAnglesSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [pts, setPts] = useState({
    A: { x: 250, y: 100 },
    B: { x: 100, y: 350 },
    C: { x: 400, y: 350 }
  });
  
  const [angles, setAngles] = useState({ A: 0, B: 0, C: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [isProving, setIsProving] = useState(false);
  
  const animRef = useRef<{progress: number, id: number | null}>({ progress: 0, id: null });

  // Calculate angles
  const getAngle = (p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}) => {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    return Math.acos(dot / (mag1 * mag2)); // in radians
  };
  
  // Calculate start angle for drawing arc
  const getStartAngle = (p2: {x: number, y: number}, p1: {x: number, y: number}) => {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x);
  };

  useEffect(() => {
    const aA = getAngle(pts.B, pts.A, pts.C);
    const aB = getAngle(pts.C, pts.B, pts.A);
    const aC = getAngle(pts.A, pts.C, pts.B);
    
    // Convert to degrees and adjust for rounding to make sum exactly 180
    let degA = Math.round(aA * 180 / Math.PI);
    let degB = Math.round(aB * 180 / Math.PI);
    let degC = 180 - degA - degB;
    
    // Basic bounds check to prevent flat triangles
    if (degA <= 0 || degB <= 0 || degC <= 0) {
      // Revert if flattened too much, keeping it simple
      return; 
    }

    setAngles({ A: degA, B: degB, C: degC });
  }, [pts]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { A, B, C } = pts;
    const prog = animRef.current.progress;

    // Normal State Draw
    if (prog === 0) {
      // Draw Triangle
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

      // Draw Angles
      const drawAngle = (p, p1, p2, color, name, deg) => {
        const rad = 40;
        const sa = getStartAngle(p, p1);
        const ea = getStartAngle(p, p2);
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, rad, sa, ea, false); // Might need angle sort for strict correctness, but works for simple cases
        // Actually arc drawing is tricky if we don't know clockwise vs counter.
        // Let's use a simpler approach: draw full wedge based on start angle and internal angle.
      };
      
      // Simpler robust angle drawing:
      const drawWedge = (center, p1, p2, color, name, val) => {
        const sa = Math.atan2(p1.y - center.y, p1.x - center.x);
        let ea = Math.atan2(p2.y - center.y, p2.x - center.x);
        
        // Ensure we draw the interior angle
        let diff = ea - sa;
        if (diff > Math.PI) ea -= Math.PI * 2;
        if (diff < -Math.PI) ea += Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, 40, sa, ea, diff < 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();

        // Label
        const midA = sa + (ea - sa) / 2;
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(name, center.x + Math.cos(midA) * 20 - 4, center.y + Math.sin(midA) * 20 + 5);
      };

      drawWedge(A, B, C, "rgba(239, 68, 68, 0.7)", "A", angles.A); // Red
      drawWedge(B, C, A, "rgba(59, 130, 246, 0.7)", "B", angles.B); // Blue
      drawWedge(C, A, B, "rgba(34, 197, 94, 0.7)", "C", angles.C); // Green

      // Draw Vertices
      [A, B, C].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      });
    } else {
      // Proving Animation State
      const cx = canvas.width / 2;
      const cy = 300;
      
      // Draw straight line
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy);
      ctx.lineTo(cx + 150, cy);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.stroke();

      const radA = angles.A * Math.PI / 180;
      const radB = angles.B * Math.PI / 180;
      const radC = angles.C * Math.PI / 180;

      const drawAnimWedge = (startRad: number, valRad: number, color: string, name: string, labelDeg: number) => {
        const sa = Math.PI + startRad * prog;
        const ea = sa + valRad * prog;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 100, sa, ea);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        
        if (prog > 0.5) {
          const midA = sa + (ea - sa) / 2;
          ctx.fillStyle = "white";
          ctx.font = "14px Arial";
          ctx.fillText(`${name} (${labelDeg}°)`, cx + Math.cos(midA) * 60 - 20, cy + Math.sin(midA) * 60);
        }
      };

      // Lay them out side by side
      drawAnimWedge(0, radA, "rgba(239, 68, 68, 0.7)", "A", angles.A);
      drawAnimWedge(radA, radB, "rgba(59, 130, 246, 0.7)", "B", angles.B);
      drawAnimWedge(radA + radB, radC, "rgba(34, 197, 94, 0.7)", "C", angles.C);
      
      if (prog === 1) {
        ctx.fillStyle = "white";
        ctx.font = "bold 20px Arial";
        ctx.fillText("Tổng = 180° (Góc bẹt)", cx - 100, cy - 120);
      }
    }
  };

  const startProve = () => {
    if (isProving) return;
    setIsProving(true);
    animRef.current.progress = 0;
    
    const animate = () => {
      animRef.current.progress += 0.02;
      if (animRef.current.progress >= 1) {
        animRef.current.progress = 1;
        draw();
        return;
      }
      draw();
      animRef.current.id = requestAnimationFrame(animate);
    };
    animate();
  };

  const resetProve = () => {
    setIsProving(false);
    animRef.current.progress = 0;
    if (animRef.current.id) cancelAnimationFrame(animRef.current.id);
    draw();
  };

  useEffect(() => {
    draw();
  }, [pts, angles, isProving]);

  // Mouse Handlers
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isProving) return;
    const pos = getMousePos(e);
    for (let key in pts) {
      const p = pts[key];
      const dist = Math.sqrt(Math.pow(p.x - pos.x, 2) + Math.pow(p.y - pos.y, 2));
      if (dist < 15) {
        setDragging(key);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isProving || !dragging) return;
    const pos = getMousePos(e);
    setPts(prev => ({
      ...prev,
      [dragging]: pos
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
              cursor: dragging ? 'grabbing' : (isProving ? 'default' : 'grab')
            }} 
          />
        </div>

        <div className="control-panel">
          <h3>Tổng 3 góc của tam giác</h3>
          
          <div className="info-box" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>
              <span style={{ color: '#f87171' }}>{angles.A}°</span> + 
              <span style={{ color: '#60a5fa' }}> {angles.B}°</span> + 
              <span style={{ color: '#4ade80' }}> {angles.C}°</span> = 180°
            </h2>
            <p>Kéo các đỉnh A, B, C để thay đổi hình dạng tam giác.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-action" onClick={startProve} disabled={isProving}>
              Chứng minh động (Ghép góc)
            </button>
            <button className="btn-muted btn-action" onClick={resetProve} disabled={!isProving}>
              Quay lại Tam giác
            </button>
          </div>
          
          <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p><strong>Lý thuyết:</strong></p>
            <p>Tổng số đo ba góc của một tam giác luôn luôn bằng 180° (bằng một góc bẹt).</p>
            <p>Bằng cách "cắt" ba góc của tam giác và ghép chúng lại cạnh nhau, ta luôn thu được một đường thẳng (góc bẹt).</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
