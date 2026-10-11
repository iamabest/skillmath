import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function BinomialDistributionSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  
  const [hoverK, setHoverK] = useState(null);
  const [selectedK, setSelectedK] = useState(null);

  // Math Helpers
  const fact = (num) => {
    let r = 1;
    for (let i = 2; i <= num; i++) r *= i;
    return r;
  };
  
  const C = (n, k) => fact(n) / (fact(k) * fact(n - k));
  
  const binomialProb = (n, k, p) => {
    return C(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  // Generate Distribution Data
  const distData = [];
  let maxProb = 0;
  let maxProbIndex = 0;
  for (let k = 0; k <= n; k++) {
    const prob = binomialProb(n, k, p);
    distData.push(prob);
    if (prob > maxProb) {
      maxProb = prob;
      maxProbIndex = k;
    }
  }

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const paddingX = 40;
    const paddingY = 30;
    const w = canvas.width - paddingX * 2;
    const h = canvas.height - paddingY * 2;
    
    // Draw Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(paddingX, paddingY); ctx.lineTo(paddingX, canvas.height - paddingY); ctx.stroke(); // Y
    ctx.beginPath(); ctx.moveTo(paddingX, canvas.height - paddingY); ctx.lineTo(canvas.width - paddingX, canvas.height - paddingY); ctx.stroke(); // X

    // Determine Y axis scale
    const yMax = Math.ceil(maxProb * 10) / 10; // Round up to nearest 0.1
    
    // Y labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    for (let i = 0; i <= yMax; i += 0.1) {
      const y = canvas.height - paddingY - (i / yMax) * h;
      ctx.fillText(i.toFixed(1), paddingX - 10, y + 3);
      
      // Grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath(); ctx.moveTo(paddingX, y); ctx.lineTo(canvas.width - paddingX, y); ctx.stroke();
    }

    // X Bars
    const barW = (w / (n + 1)) * 0.8;
    const stepX = w / (n + 1);

    distData.forEach((prob, k) => {
      const x = paddingX + k * stepX + (stepX - barW) / 2;
      const barH = (prob / yMax) * h;
      const y = canvas.height - paddingY - barH;
      
      // Highlight highest, selected, and hover
      let fillStyle = "#3b82f6"; // default blue
      if (k === selectedK) fillStyle = "#facc15"; // yellow
      else if (k === hoverK) fillStyle = "#60a5fa"; // light blue
      else if (k === maxProbIndex) fillStyle = "#a855f7"; // purple for mode
      
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, y, barW, barH);
      
      // Label X
      if (n <= 10 || k % 2 === 0 || k === n) {
        ctx.fillStyle = "#cbd5e1";
        ctx.textAlign = "center";
        ctx.fillText(k, x + barW / 2, canvas.height - paddingY + 20);
      }
    });
  };

  useEffect(() => {
    draw();
  }, [n, p, hoverK, selectedK, distData, maxProbIndex]);

  // Mouse Interactivity
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const paddingX = 40;
    const paddingY = 30;
    const w = canvas.width - paddingX * 2;
    const stepX = w / (n + 1);
    const barW = stepX * 0.8;
    
    let found = null;
    if (mx >= paddingX && mx <= canvas.width - paddingX) {
      const k = Math.floor((mx - paddingX) / stepX);
      if (k >= 0 && k <= n) {
        const x = paddingX + k * stepX + (stepX - barW) / 2;
        if (mx >= x && mx <= x + barW) {
          found = k;
        }
      }
    }
    setHoverK(found);
  };

  const handleMouseClick = () => {
    if (hoverK !== null) {
      setSelectedK(hoverK);
    }
  };

  // Compute selected stats
  let cumProb = 0;
  if (selectedK !== null) {
    for (let k = 0; k <= selectedK; k++) {
      cumProb += distData[k];
    }
  }

  // Distribution Stats
  const E = n * p;
  const Var = n * p * (1 - p);
  const SD = Math.sqrt(Var);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>Phân phối Nhị thức B(n={n}, p={p})</h4>
          
          <canvas 
            ref={canvasRef} 
            width="500" 
            height="350" 
            style={{ backgroundColor: '#1e293b', borderRadius: '8px', cursor: hoverK !== null ? 'pointer' : 'default' }} 
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverK(null)}
            onClick={handleMouseClick}
          />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%', display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <h4 style={{ color: '#a855f7', marginTop: 0 }}>Đặc trưng phân phối</h4>
              <p>Kỳ vọng E(X) = np = <strong>{E.toFixed(2)}</strong></p>
              <p>Phương sai Var(X) = <strong>{Var.toFixed(2)}</strong></p>
              <p>Độ lệch chuẩn σ = <strong>{SD.toFixed(2)}</strong></p>
            </div>
            
            <div style={{ flex: 1, backgroundColor: 'rgba(250, 204, 21, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid #facc15' }}>
              <h4 style={{ color: '#facc15', marginTop: 0 }}>Tại X = {selectedK !== null ? selectedK : '?'} (Click vào cột)</h4>
              {selectedK !== null ? (
                <>
                  <p>Xác suất P(X={selectedK}) = <strong>{distData[selectedK].toFixed(4)}</strong></p>
                  <p>Tích lũy P(X≤{selectedK}) = <strong>{cumProb.toFixed(4)}</strong></p>
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>Click vào một cột trên biểu đồ để xem chi tiết xác suất.</p>
              )}
            </div>
          </div>
        </div>

        <div className="control-panel">
          <h3>Phân Phối Nhị Thức</h3>
          
          <div className="control-group">Số lần thử (n): {n}</div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={n}
            onChange={(e) => {
              setN(parseInt(e.target.value));
              setSelectedK(null);
            }}
            style={{ width: '100%', marginBottom: '20px' }}
          />

          <div className="control-group">Xác suất thành công (p): {p.toFixed(2)}</div>
          <input
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            value={p}
            onChange={(e) => {
              setP(parseFloat(e.target.value));
            }}
            style={{ width: '100%', marginBottom: '20px' }}
          />
          
          <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p><strong>Công thức tính xác suất:</strong></p>
            <p>P(X = k) = C(n, k) * pᵏ * (1-p)ⁿ⁻ᵏ</p>
            <p><strong>Ý nghĩa:</strong> Phân phối nhị thức mô hình hóa số lần "thành công" (X) trong <strong>n</strong> phép thử độc lập, mỗi phép thử có xác suất thành công là <strong>p</strong>.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
