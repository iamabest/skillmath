import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function SimilarFiguresSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [k, setK] = useState(2);
  const [O, setO] = useState({ x: 250, y: 225 });
  const [pts, setPts] = useState({
    A: { x: 300, y: 150 },
    B: { x: 200, y: 200 },
    C: { x: 350, y: 300 }
  });
  
  const [dragging, setDragging] = useState(null);

  // Calculate Triangle Area
  const getArea = (p1, p2, p3) => {
    return 0.5 * Math.abs(p1.x*(p2.y - p3.y) + p2.x*(p3.y - p1.y) + p3.x*(p1.y - p2.y));
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { A, B, C } = pts;
    
    // Calculate Image points
    const A_prime = { x: O.x + k * (A.x - O.x), y: O.y + k * (A.y - O.y) };
    const B_prime = { x: O.x + k * (B.x - O.x), y: O.y + k * (B.y - O.y) };
    const C_prime = { x: O.x + k * (C.x - O.x), y: O.y + k * (C.y - O.y) };

    // Draw projection lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    [ {p: A, p_prime: A_prime}, {p: B, p_prime: B_prime}, {p: C, p_prime: C_prime} ].forEach(pair => {
      ctx.beginPath();
      ctx.moveTo(O.x, O.y);
      // Extend the line a bit past the furthest point
      const furthest = Math.abs(k) > 1 ? pair.p_prime : pair.p;
      // Actually just drawing to the furthest point is fine
      ctx.lineTo(pair.p_prime.x, pair.p_prime.y);
      ctx.stroke();
      
      // If k is negative, the line goes in opposite directions from O
      if (k < 0) {
        ctx.beginPath();
        ctx.moveTo(O.x, O.y);
        ctx.lineTo(pair.p.x, pair.p.y);
        ctx.stroke();
      }
    });
    ctx.setLineDash([]);

    // Draw Original Triangle
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
    ctx.fill();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Image Triangle
    ctx.beginPath();
    ctx.moveTo(A_prime.x, A_prime.y);
    ctx.lineTo(B_prime.x, B_prime.y);
    ctx.lineTo(C_prime.x, C_prime.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Labels & Vertices
    ctx.font = "14px Arial";
    
    // O
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(O.x, O.y, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillText("O", O.x - 15, O.y - 10);
    
    // Original points
    ctx.fillStyle = "#60a5fa";
    [ {p: A, name: "A"}, {p: B, name: "B"}, {p: C, name: "C"} ].forEach(v => {
      ctx.beginPath(); ctx.arc(v.p.x, v.p.y, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillText(v.name, v.p.x + 8, v.p.y - 8);
    });
    
    // Image points
    ctx.fillStyle = "#fbbf24";
    [ {p: A_prime, name: "A'"}, {p: B_prime, name: "B'"}, {p: C_prime, name: "C'"} ].forEach(v => {
      ctx.beginPath(); ctx.arc(v.p.x, v.p.y, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillText(v.name, v.p.x + 8, v.p.y - 8);
    });
  };

  useEffect(() => {
    draw();
  }, [k, O, pts]);

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
    
    // Check O first
    if (Math.sqrt(Math.pow(O.x - pos.x, 2) + Math.pow(O.y - pos.y, 2)) < 15) {
      setDragging("O");
      return;
    }
    
    // Check ABC
    for (let key in pts) {
      const p = pts[key];
      if (Math.sqrt(Math.pow(p.x - pos.x, 2) + Math.pow(p.y - pos.y, 2)) < 15) {
        setDragging(key);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const pos = getMousePos(e);
    
    if (dragging === "O") {
      setO(pos);
    } else {
      setPts(prev => ({
        ...prev,
        [dragging]: pos
      }));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const areaOrig = getArea(pts.A, pts.B, pts.C);
  const areaImg = areaOrig * (k * k);

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
              cursor: dragging ? 'grabbing' : 'grab'
            }} 
          />
        </div>

        <div className="control-panel">
          <h3>Hình Đồng Dạng & Phép Vị Tự</h3>
          
          <div className="info-box" style={{ marginBottom: '20px' }}>
            <p><strong>Tâm vị tự O:</strong> Kéo điểm O (màu trắng) để di chuyển.</p>
            <p><strong>Tam giác gốc ABC:</strong> Kéo các đỉnh A, B, C (màu xanh) để thay đổi hình dáng.</p>
          </div>

          <div className="control-group">Hệ số vị tự (k): {k}</div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.5"
            value={k}
            onChange={(e) => {
              let val = parseFloat(e.target.value);
              if (val === 0) val = 0.5; // Avoid k=0
              setK(val);
            }}
            style={{ width: '100%' }}
          />
          
          <div style={{ marginTop: '20px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ color: '#fbbf24', margin: '0 0 10px 0' }}>Phân tích tính chất:</h4>
            
            <p style={{ margin: '5px 0' }}>
              <span style={{ color: '#60a5fa' }}>S (ABC)</span> ≈ {(areaOrig / 100).toFixed(1)} đvdt
            </p>
            <p style={{ margin: '5px 0' }}>
              <span style={{ color: '#fbbf24' }}>S (A'B'C')</span> ≈ {(areaImg / 100).toFixed(1)} đvdt
            </p>
            
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            
            <p style={{ margin: '5px 0' }}>
              Tỉ số diện tích: S'/S = {(areaImg / areaOrig).toFixed(1)} = |k|²
            </p>
            <p style={{ margin: '5px 0' }}>
              Tỉ số đồng dạng cạnh: |k| = {Math.abs(k)}
            </p>
            <p style={{ margin: '5px 0' }}>
              Chiều: {k > 0 ? "Cùng chiều (k > 0)" : "Ngược chiều (k < 0)"}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
