import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function ParabolaAdvancedSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  
  const RANGE = 6; // -6 to 6
  const UNIT = 35; // px per unit (500/14 approx, leaves padding)

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // --- Grid ---
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = -RANGE; i <= RANGE; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i*UNIT, 0); ctx.lineTo(cx + i*UNIT, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy - i*UNIT); ctx.lineTo(canvas.width, cy - i*UNIT); ctx.stroke();
    }

    // --- Axes ---
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();
    
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Arial";
    ctx.fillText("x", canvas.width - 15, cy - 10);
    ctx.fillText("y", cx + 10, 15);
    ctx.fillText("O", cx - 15, cy + 15);

    // Ticks
    for (let i = -RANGE; i <= RANGE; i++) {
      if (i === 0) continue;
      if (i % 2 === 0) {
        ctx.textAlign = "center";
        ctx.fillText(i, cx + i * UNIT, cy + 18);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(i, cx - 8, cy - i * UNIT);
      }
    }
    ctx.textBaseline = "alphabetic";

    // --- Calculations ---
    const xV = -b / (2 * a);
    const yV = c - (b * b) / (4 * a);
    const delta = b * b - 4 * a * c;

    // --- Draw Parabola ---
    ctx.strokeStyle = "#3b82f6"; // blue
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= canvas.width; px++) {
      const mathX = (px - cx) / UNIT;
      const mathY = a * mathX * mathX + b * mathX + c;
      const py = cy - mathY * UNIT;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // --- Axis of symmetry ---
    ctx.strokeStyle = "rgba(248, 113, 113, 0.7)"; // red
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + xV * UNIT, 0);
    ctx.lineTo(cx + xV * UNIT, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Vertex ---
    ctx.fillStyle = "#facc15"; // yellow
    ctx.beginPath(); ctx.arc(cx + xV * UNIT, cy - yV * UNIT, 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillText(`V(${xV.toFixed(1)}, ${yV.toFixed(1)})`, cx + xV * UNIT + 10, cy - yV * UNIT - 10);

    // --- Roots (x-intercepts) ---
    if (delta >= 0) {
      const x1 = (-b - Math.sqrt(delta)) / (2 * a);
      const x2 = (-b + Math.sqrt(delta)) / (2 * a);
      
      ctx.fillStyle = "#4ade80"; // green
      if (delta === 0) {
        ctx.beginPath(); ctx.arc(cx + x1 * UNIT, cy, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(cx + x1 * UNIT, cy, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + x2 * UNIT, cy, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      }
    }
  };

  useEffect(() => {
    draw();
  }, [a, b, c]);

  const delta = b * b - 4 * a * c;

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={canvasRef} width="500" height="450" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            <h4 style={{ color: '#3b82f6' }}>Phân tích đồ thị y = {a}x² {b >= 0 ? '+' : ''} {b}x {c >= 0 ? '+' : ''} {c}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div>
                <p><strong>Bề lõm:</strong> {a > 0 ? "Quay lên (a > 0)" : "Quay xuống (a < 0)"}</p>
                <p><strong>Đỉnh V:</strong> ({Object.is(-b/(2*a), -0) ? 0 : (-b/(2*a)).toFixed(2)}, {(c - (b*b)/(4*a)).toFixed(2)})</p>
                <p><strong>Trục đối xứng:</strong> x = {(-b/(2*a)).toFixed(2)}</p>
              </div>
              <div>
                <p><strong>Δ (Delta) = </strong> {b}² - 4({a})({c}) = {delta}</p>
                <p>
                  <strong>Nghiệm (Giao Ox): </strong>
                  {delta < 0 ? <span style={{color: '#f87171'}}>Vô nghiệm</span> : 
                   delta === 0 ? <span style={{color: '#facc15'}}>Nghiệm kép (x={(-b/(2*a)).toFixed(2)})</span> : 
                   <span style={{color: '#4ade80'}}>2 nghiệm phân biệt</span>}
                </p>
                <p><strong>Giao Oy:</strong> y = {c}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="control-panel">
          <h3>Đồ thị Parabola y = ax² + bx + c</h3>
          
          <div className="control-group">Hệ số a: {a}</div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={a}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val !== 0) setA(val);
              else setA(0.1); // Prevent a=0 which makes it a line
            }}
            style={{ width: '100%', marginBottom: '15px' }}
          />

          <div className="control-group">Hệ số b: {b}</div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.5"
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
            style={{ width: '100%', marginBottom: '15px' }}
          />

          <div className="control-group">Hệ số c: {c}</div>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.5"
            value={c}
            onChange={(e) => setC(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          
          <div style={{ marginTop: '20px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p><strong>Mẹo quan sát:</strong></p>
            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
              <li>Kéo <strong>c</strong> để di chuyển đồ thị lên/xuống.</li>
              <li>Khi <strong>b = 0</strong>, đỉnh luôn nằm trên trục Oy.</li>
              <li>Nếu <strong>a</strong> và <strong>c</strong> trái dấu, đồ thị luôn cắt trục hoành tại 2 điểm (Δ &gt; 0).</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
