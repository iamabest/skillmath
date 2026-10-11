import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function EquationBalanceSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(7);
  
  const [tilt, setTilt] = useState(0); // -1 (left down), 0 (balanced), 1 (right down)
  const [animating, setAnimating] = useState(false);
  
  // Step state
  const [step, setStep] = useState(0); // 0: ax+b=c, 1: ax=c-b, 2: x=(c-b)/a

  const generateRandom = () => {
    // Generate simple whole number equations
    const newA = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const x = Math.floor(Math.random() * 5) + 1; // 1 to 5
    const newB = Math.floor(Math.random() * 10) + 1; // 1 to 10
    const newC = newA * x + newB;
    
    setA(newA);
    setB(newB);
    setC(newC);
    setStep(0);
    setTilt(0);
  };

  const drawBalance = (ctx, canvas) => {
    const cx = canvas.width / 2;
    const cy = 250;
    
    // Draw Base
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx + 30, cy + 80);
    ctx.lineTo(cx - 30, cy + 80);
    ctx.fill();
    ctx.stroke();

    // Draw Beam (Rotated)
    ctx.save();
    ctx.translate(cx, cy - 20);
    const maxAngle = Math.PI / 12; // 15 degrees
    ctx.rotate(tilt * maxAngle);
    
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(-180, -5, 360, 10);
    
    // Left Pan (ax + b)
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.strokeStyle = "#94a3b8";
    ctx.beginPath(); ctx.moveTo(-150, 5); ctx.lineTo(-110, 40); ctx.lineTo(-190, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
    
    // Right Pan (c)
    ctx.beginPath(); ctx.moveTo(150, 5); ctx.lineTo(190, 40); ctx.lineTo(110, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
    
    // Draw Items based on step
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const drawBox = (x, y, w, h, color, text) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - w/2, y - h, w, h);
      ctx.strokeStyle = "white";
      ctx.strokeRect(x - w/2, y - h, w, h);
      ctx.fillStyle = "white";
      ctx.fillText(text, x, y - h/2);
    };

    if (step === 0) {
      // Left: 'a' x-boxes + 'b' value box
      let totalW = a * 30 + 40;
      let startX = -150 - totalW/2 + 15;
      for (let i=0; i<a; i++) {
        drawBox(startX + i*30, 40, 25, 25, "#3b82f6", "x");
      }
      drawBox(startX + a*30 + 15, 40, 35, 25, "#f59e0b", b.toString());
      
      // Right: 'c' value box
      drawBox(150, 40, 40, 35, "#f59e0b", c.toString());
    } else if (step === 1) {
      // Left: 'a' x-boxes
      let totalW = a * 30;
      let startX = -150 - totalW/2 + 15;
      for (let i=0; i<a; i++) {
        drawBox(startX + i*30, 40, 25, 25, "#3b82f6", "x");
      }
      
      // Right: 'c - b' value box
      drawBox(150, 40, 40, 35, "#f59e0b", (c-b).toString());
    } else if (step === 2) {
      // Left: 1 x-box
      drawBox(-150, 40, 25, 25, "#3b82f6", "x");
      
      // Right: value box
      drawBox(150, 40, 40, 35, "#10b981", ((c-b)/a).toFixed(2).replace(".00", ""));
    }

    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBalance(ctx, canvas);
  };

  useEffect(() => {
    draw();
  }, [a, b, c, step, tilt]);

  const testBalance = () => {
    if (animating) return;
    setAnimating(true);
    
    // Check if the displayed equation is actually true
    let isBalanced = false;
    let actualLeft = a * ((c-b)/a) + b;
    // Just fake animation to show checking
    
    let frames = 0;
    let currentTilt = 0;
    const maxFrames = 60;
    
    const animate = () => {
      frames++;
      // Wobble
      currentTilt = Math.sin(frames * 0.2) * (1 - frames/maxFrames);
      setTilt(currentTilt);
      
      if (frames < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        setTilt(0);
        setAnimating(false);
      }
    };
    animate();
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={canvasRef} width="500" height="400" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            <h4 style={{ color: '#3b82f6' }}>Các bước giải:</h4>
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontWeight: step === 0 ? 'bold' : 'normal', color: step === 0 ? 'white' : '#cbd5e1' }}>
                Bước 1: {a}x + {b} = {c}
              </p>
              <p style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? 'white' : '#cbd5e1' }}>
                Bước 2: {a}x = {c} - {b}  =&gt;  {a}x = {c-b}
              </p>
              <p style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#4ade80' : '#cbd5e1' }}>
                Bước 3: x = {c-b} / {a}  =&gt;  x = {((c-b)/a).toFixed(2).replace(".00", "")}
              </p>
            </div>
          </div>
        </div>

        <div className="control-panel">
          <h3>Giải Phương Trình Bậc Nhất</h3>
          <p style={{ color: '#94a3b8' }}>Dạng: ax + b = c</p>
          
          <div className="control-group">Hệ số a (số lượng x): {a}</div>
          <input type="range" min="1" max="10" value={a} onChange={(e) => {setA(parseInt(e.target.value)); setStep(0);}} style={{ width: '100%' }} />

          <div className="control-group">Hệ số b: {b}</div>
          <input type="range" min="1" max="20" value={b} onChange={(e) => {setB(parseInt(e.target.value)); setStep(0);}} style={{ width: '100%' }} />

          <div className="control-group">Hằng số c (vế phải): {c}</div>
          <input type="range" min="1" max="50" value={c} onChange={(e) => {setC(parseInt(e.target.value)); setStep(0);}} style={{ width: '100%' }} />

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-action" onClick={() => setStep((step + 1) % 3)} disabled={animating}>
              Chuyển bước ({step + 1}/3)
            </button>
            <button className="btn-muted btn-action" onClick={testBalance} disabled={animating}>
              Kiểm tra thăng bằng
            </button>
            <button className="btn-muted btn-action" onClick={generateRandom} disabled={animating}>
              Tạo phương trình ngẫu nhiên
            </button>
          </div>
          
          <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p><strong>Nguyên tắc thăng bằng:</strong></p>
            <p>Để tìm giá trị của một khối 'x', ta phải loại bỏ các khối khác trên đĩa cân bằng cách thực hiện cùng một thao tác (cộng, trừ, nhân, chia) trên cả hai đĩa cân để duy trì sự thăng bằng.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
