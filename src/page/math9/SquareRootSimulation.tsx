import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function SquareRootSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [n, setN] = useState(16);
  
  // Challenge mode state
  const [challengeMode, setChallengeMode] = useState(false);
  const [targetN, setTargetN] = useState(0);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");

  const simplifySquareRoot = (num) => {
    if (num === 0) return "0";
    let maxSquareFactor = 1;
    for (let i = 1; i * i <= num; i++) {
      if (num % (i * i) === 0) {
        maxSquareFactor = i * i;
      }
    }
    const rootOut = Math.sqrt(maxSquareFactor);
    const inRoot = num / maxSquareFactor;
    
    if (inRoot === 1) return `${rootOut}`;
    if (rootOut === 1) return `√${inRoot}`;
    return `${rootOut}√${inRoot}`;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 30; // Shift up a bit to leave room for number line

    const rootN = Math.sqrt(n);
    const maxRoot = 12; // Max n is 144
    const scale = 15; // px per unit

    // --- Draw Square ---
    const sidePx = rootN * scale;
    
    // Grid background
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i=0; i<maxRoot*scale; i+=scale) {
      ctx.beginPath(); ctx.moveTo(cx - maxRoot*scale/2, cy - maxRoot*scale/2 + i); ctx.lineTo(cx + maxRoot*scale/2, cy - maxRoot*scale/2 + i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - maxRoot*scale/2 + i, cy - maxRoot*scale/2); ctx.lineTo(cx - maxRoot*scale/2 + i, cy + maxRoot*scale/2); ctx.stroke();
    }

    // The Square
    const xSq = cx - sidePx / 2;
    const ySq = cy - sidePx / 2;
    
    ctx.fillStyle = "rgba(74, 222, 128, 0.2)";
    ctx.fillRect(xSq, ySq, sidePx, sidePx);
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 2;
    ctx.strokeRect(xSq, ySq, sidePx, sidePx);
    
    // Labels
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Diện tích = ${n}`, cx, cy);
    
    ctx.fillStyle = "#4ade80";
    ctx.fillText(`Cạnh = √${n} ≈ ${rootN.toFixed(2)}`, cx, cy + sidePx / 2 + 20);

    // --- Draw Number Line ---
    const lineY = canvas.height - 40;
    const startX = 30;
    const endX = canvas.width - 30;
    const lineLen = endX - startX;
    
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(startX, lineY); ctx.lineTo(endX, lineY); ctx.stroke();
    
    // Ticks
    for (let i = 0; i <= 12; i++) {
      const tx = startX + (i / 12) * lineLen;
      ctx.beginPath(); ctx.moveTo(tx, lineY - 5); ctx.lineTo(tx, lineY + 5); ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Arial";
      ctx.fillText(i, tx, lineY + 20);
    }
    
    // Mark rootN
    const px = startX + (rootN / 12) * lineLen;
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.arc(px, lineY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillText(`√${n}`, px, lineY - 15);
  };

  useEffect(() => {
    draw();
  }, [n]);

  const startChallenge = () => {
    const randomN = Math.floor(Math.random() * 144) + 1;
    setTargetN(randomN);
    setChallengeMode(true);
    setUserGuess("");
    setFeedback("");
  };

  const checkGuess = () => {
    const guess = parseInt(userGuess);
    if (guess === targetN) {
      setFeedback("Chính xác! 🎉");
      setN(targetN);
      setTimeout(() => setChallengeMode(false), 2000);
    } else {
      const rootT = Math.sqrt(targetN);
      const nearestSq = Math.round(rootT) * Math.round(rootT);
      if (guess < targetN) {
        setFeedback(`Quá nhỏ! Gợi ý: Gần số chính phương ${nearestSq}`);
      } else {
        setFeedback(`Quá lớn! Gợi ý: Gần số chính phương ${nearestSq}`);
      }
    }
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <canvas ref={canvasRef} width="500" height="350" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            <h4 style={{ color: '#4ade80', marginBottom: '10px' }}>Phân tích & Rút gọn:</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '5px 0' }}>Giá trị thực: √{n} ≈ {Math.sqrt(n).toFixed(3)}</p>
                <p style={{ margin: '5px 0', color: '#f59e0b', fontWeight: 'bold' }}>
                  Dạng rút gọn: {simplifySquareRoot(n)}
                </p>
              </div>
              <div style={{ textAlign: 'right', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <p>Số chính phương gần nhất:</p>
                <p>
                  Dưới: {Math.pow(Math.floor(Math.sqrt(n)), 2)} &nbsp;&nbsp;|&nbsp;&nbsp;
                  Trên: {Math.pow(Math.ceil(Math.sqrt(n)), 2) === Math.pow(Math.floor(Math.sqrt(n)), 2) ? "..." : Math.pow(Math.ceil(Math.sqrt(n)), 2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="control-panel">
          <h3>Trực quan Căn thức Bậc hai</h3>
          
          {!challengeMode ? (
            <>
              <div className="control-group">Diện tích (n): {n}</div>
              <input
                type="range"
                min="0"
                max="144"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '20px' }}
              />

              <button className="btn-action" style={{ width: '100%' }} onClick={startChallenge}>
                Thử thách: Tìm n
              </button>
              
              <div style={{ marginTop: '20px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <p><strong>Ý nghĩa hình học:</strong></p>
                <p>Căn bậc hai của n (√n) chính là độ dài cạnh của một hình vuông có diện tích bằng n.</p>
              </div>
            </>
          ) : (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#f59e0b', marginTop: 0 }}>Chế độ Thử thách</h4>
              <p>Hệ thống đang nghĩ đến một số <strong>n</strong> sao cho:</p>
              <h3 style={{ textAlign: 'center', fontSize: '1.5rem', margin: '15px 0' }}>
                √n ≈ {Math.sqrt(targetN).toFixed(2)}
              </h3>
              
              <div className="control-group">Theo bạn n bằng bao nhiêu?</div>
              <input 
                type="number" 
                value={userGuess} 
                onChange={(e) => setUserGuess(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button className="btn-action" onClick={checkGuess} style={{ width: '100%', marginBottom: '10px' }}>
                Kiểm tra
              </button>
              
              {feedback && (
                <p style={{ color: feedback.includes('Chính xác') ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                  {feedback}
                </p>
              )}
              
              <button className="btn-muted btn-action" onClick={() => setChallengeMode(false)} style={{ width: '100%', marginTop: '10px' }}>
                Hủy thử thách
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
