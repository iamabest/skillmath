import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";
import { getPrimeFactors } from "../../utils/mathUtils";

export default function GCDLCMSimulation() {
  const [num1, setNum1] = useState(12);
  const [num2, setNum2] = useState(18);
  const [analyzed, setAnalyzed] = useState(false);
  const [factors1, setFactors1] = useState<number[]>([]);
  const [factors2, setFactors2] = useState<number[]>([]);
  const [commonFactors, setCommonFactors] = useState<number[]>([]);
  const [unique1, setUnique1] = useState<number[]>([]);
  const [unique2, setUnique2] = useState<number[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const handleAnalyze = () => {
    let n1 = Math.max(1, Math.min(100, num1));
    let n2 = Math.max(1, Math.min(100, num2));
    setNum1(n1);
    setNum2(n2);
    
    const f1 = getPrimeFactors(n1);
    const f2 = getPrimeFactors(n2);
    setFactors1(f1);
    setFactors2(f2);
    
    // Find common and unique factors
    let tempF2 = [...f2];
    let common: number[] = [];
    let u1: number[] = [];
    
    for (let factor of f1) {
      const idx = tempF2.indexOf(factor);
      if (idx !== -1) {
        common.push(factor);
        tempF2.splice(idx, 1);
      } else {
        u1.push(factor);
      }
    }
    
    setCommonFactors(common);
    setUnique1(u1);
    setUnique2(tempF2); // remaining are unique to f2
    
    setAnalyzed(true);
  };

  useEffect(() => {
    if (!analyzed) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rX = 100;
    const rY = 120;
    
    // Left Ellipse (Num1)
    ctx.beginPath();
    ctx.ellipse(cx - 50, cy, rX, rY, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(167, 139, 250, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Right Ellipse (Num2)
    ctx.beginPath();
    ctx.ellipse(cx + 50, cy, rX, rY, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Titles
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Số ${num1}`, cx - 100, cy - 140);
    ctx.fillText(`Số ${num2}`, cx + 100, cy - 140);
    
    ctx.font = "18px Arial";
    // Draw Unique 1
    unique1.forEach((f, i) => {
      ctx.fillStyle = "#fef08a"; // Yellow for unique
      ctx.fillText(f, cx - 90, cy - 60 + i * 30);
    });
    
    // Draw Common
    commonFactors.forEach((f, i) => {
      ctx.fillStyle = "#4ade80"; // Green for common
      ctx.fillText(f, cx, cy - 60 + i * 30);
    });
    
    // Draw Unique 2
    unique2.forEach((f, i) => {
      ctx.fillStyle = "#fef08a"; // Yellow for unique
      ctx.fillText(f, cx + 90, cy - 60 + i * 30);
    });

  }, [analyzed, num1, num2, unique1, unique2, commonFactors]);

  const gcd = commonFactors.reduce((acc, val) => acc * val, 1);
  const lcm = (num1 * num2) / gcd;

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={canvasRef} width="400" height="350" />
          
          {analyzed && (
            <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <h4 style={{ color: '#a78bfa' }}>UCLN ({num1}, {num2}) = {gcd}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Tích các thừa số chung: {commonFactors.length > 0 ? commonFactors.join(' × ') : '1'}
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#3b82f6' }}>BCNN ({num1}, {num2}) = {lcm}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                    ({num1} × {num2}) / UCLN = {(num1 * num2)} / {gcd} = {lcm}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="control-panel">
          <h3>Phân tích GCD & LCM</h3>
          
          <div className="control-group">Số thứ nhất:</div>
          <input
            type="number"
            min="1"
            max="100"
            value={num1}
            onChange={(e) => setNum1(parseInt(e.target.value) || 1)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />

          <div className="control-group">Số thứ hai:</div>
          <input
            type="number"
            min="1"
            max="100"
            value={num2}
            onChange={(e) => setNum2(parseInt(e.target.value) || 1)}
            style={{ width: '100%', padding: '8px', marginBottom: '20px' }}
          />

          <button className="btn-action" style={{ width: '100%' }} onClick={handleAnalyze}>
            Phân tích thừa số nguyên tố
          </button>

          {analyzed && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '10px' }}><strong>Phân tích {num1}:</strong></p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {factors1.map((f, i) => {
                  // Determine color logic for UI array display (approximate matching for visuals)
                  let color = commonFactors.includes(f) && commonFactors.filter(cf => cf === f).length >= factors1.slice(0, i+1).filter(f1 => f1 === f).length ? '#4ade80' : '#fef08a';
                  return (
                    <span key={i} style={{ padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.1)', color, borderRadius: '4px', border: `1px solid ${color}` }}>
                      {f}
                    </span>
                  );
                })}
              </div>

              <p style={{ marginBottom: '10px' }}><strong>Phân tích {num2}:</strong></p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {factors2.map((f, i) => {
                  let color = commonFactors.includes(f) && commonFactors.filter(cf => cf === f).length >= factors2.slice(0, i+1).filter(f2 => f2 === f).length ? '#4ade80' : '#fef08a';
                  return (
                    <span key={i} style={{ padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.1)', color, borderRadius: '4px', border: `1px solid ${color}` }}>
                      {f}
                    </span>
                  );
                })}
              </div>
              
              <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <span style={{ color: '#4ade80' }}>■ Thừa số chung (xanh)</span><br/>
                <span style={{ color: '#fef08a' }}>■ Thừa số riêng (vàng)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
