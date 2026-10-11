import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function LinearProportionSimulation() {
  const [a, setA] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const UNIT = 25; // 25px = 1 unit
  const range = 8; // -8 to 8
  
  // Animation ref
  const animRef = useRef({
    x: -8,
    dir: 1
  });

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = -range; i <= range; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * UNIT, 0);
      ctx.lineTo(cx + i * UNIT, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cy - i * UNIT);
      ctx.lineTo(canvas.width, cy - i * UNIT);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();
    
    // Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Arial";
    ctx.fillText("x", canvas.width - 15, cy - 10);
    ctx.fillText("y", cx + 10, 15);
    ctx.fillText("O", cx - 15, cy + 15);

    // Ticks
    for (let i = -range; i <= range; i++) {
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

    // Draw Line y = ax
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Calculate endpoints
    const x1 = -range;
    const y1 = a * x1;
    const x2 = range;
    const y2 = a * x2;
    ctx.moveTo(cx + x1 * UNIT, cy - y1 * UNIT);
    ctx.lineTo(cx + x2 * UNIT, cy - y2 * UNIT);
    ctx.stroke();

    // Draw Moving Point
    const pX = animRef.current.x;
    const pY = a * pX;
    
    if (Math.abs(pY) <= range + 1) { // Only draw if roughly within bounds
      ctx.beginPath();
      ctx.arc(cx + pX * UNIT, cy - pY * UNIT, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dotted lines to axes
      ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx + pX * UNIT, cy - pY * UNIT);
      ctx.lineTo(cx + pX * UNIT, cy);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(cx + pX * UNIT, cy - pY * UNIT);
      ctx.lineTo(cx, cy - pY * UNIT);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = "#f59e0b";
      ctx.fillText(`(${pX.toFixed(1)}, ${pY.toFixed(1)})`, cx + pX * UNIT + 10, cy - pY * UNIT - 10);
    }
  };

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      animRef.current.x += 0.05 * animRef.current.dir;
      if (animRef.current.x >= range) animRef.current.dir = -1;
      if (animRef.current.x <= -range) animRef.current.dir = 1;
      
      draw();
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [a]);

  const testX = [-2, -1, 0, 1, 2];

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <canvas ref={canvasRef} width="500" height="450" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ color: '#3b82f6', marginBottom: '10px' }}>
              Phương trình: y = {a === 1 ? 'x' : a === -1 ? '-x' : a === 0 ? '0' : `${a}x`}
            </h3>
            <p style={{ fontWeight: 'bold', color: a > 0 ? '#4ade80' : a < 0 ? '#f87171' : '#cbd5e1' }}>
              {a > 0 ? "Hàm số đồng biến (Đồ thị đi lên)" : 
               a < 0 ? "Hàm số nghịch biến (Đồ thị đi xuống)" : 
               "Hàm hằng (Đồ thị nằm ngang)"}
            </p>
          </div>
        </div>

        <div className="control-panel">
          <h3>Đồ thị y = ax</h3>
          
          <div className="control-group">Hệ số a: {a}</div>
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={a}
            onChange={(e) => setA(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />

          <div style={{ marginTop: '30px' }}>
            <h4 className="control-heading h2">Bảng giá trị tương ứng</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #475569' }}>
                  <th style={{ padding: '8px', borderRight: '1px solid #475569', width: '50%' }}>x</th>
                  <th style={{ padding: '8px' }}>y = {a}x</th>
                </tr>
              </thead>
              <tbody>
                {testX.map(tx => (
                  <tr key={tx} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '8px', borderRight: '1px solid #475569' }}>{tx}</td>
                    <td style={{ padding: '8px', color: '#3b82f6', fontWeight: 'bold' }}>{(a * tx).toFixed(1).replace('.0', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            <p><strong>Khám phá:</strong></p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Đồ thị y = ax luôn đi qua gốc tọa độ O(0,0).</li>
              <li>a &gt; 0: Góc tạo bởi đường thẳng và trục Ox là góc nhọn.</li>
              <li>a &lt; 0: Góc tạo bởi đường thẳng và trục Ox là góc tù.</li>
              <li>|a| càng lớn, đường thẳng càng dốc.</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
