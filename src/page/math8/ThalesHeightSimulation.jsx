import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function ThalesHeightSimulation() {
  const canvasRef = useRef(null);

  // Trạng thái thông số
  const [treeHeight, setTreeHeight] = useState(8); // chiều cao cây (m)
  const [stickHeight, setStickHeight] = useState(2); // chiều cao thước đo (m)
  const [sunAngle, setSunAngle] = useState(45); // góc nắng của mặt trời (độ)
  
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  // Tính bóng đổ trên mặt đất dựa vào góc nắng: shadow = height / tan(angle)
  const angleRad = (sunAngle * Math.PI) / 180;
  const tanAngle = Math.tan(angleRad);
  const treeShadow = parseFloat((treeHeight / tanAngle).toFixed(2));
  const stickShadow = parseFloat((stickHeight / tanAngle).toFixed(2));

  // Tạo cây ngẫu nhiên mới
  const generateNewChallenge = () => {
    const heights = [6, 7.5, 9, 10.5, 12];
    const randTree = heights[Math.floor(Math.random() * heights.length)];
    setTreeHeight(randTree);
    const angles = [35, 40, 50, 55, 60];
    const randAngle = angles[Math.floor(Math.random() * angles.length)];
    setSunAngle(randAngle);
    setUserGuess('');
    setFeedback('');
  };

  // Vẽ khung cảnh
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Vẽ nền trời xanh đậm đến nhạt
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 350);
    skyGrad.addColorStop(0, '#1e1b4b'); // indigo-950
    skyGrad.addColorStop(1, '#0f172a'); // slate-900
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Vẽ mặt đất
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 320, W, H - 320);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 320); ctx.lineTo(W, 320); ctx.stroke();

    // Tỉ lệ vẽ: 1m thực tế = 20px trên canvas
    const scale = 20;
    const groundY = 320;

    const treeX = 120;
    const stickX = 360;

    // --- 1. Vẽ bóng đổ màu vàng mờ trên mặt đất ---
    ctx.fillStyle = 'rgba(253, 224, 71, 0.2)'; // yellow-300 transparent
    // Bóng cây
    ctx.beginPath();
    ctx.ellipse(treeX + (treeShadow * scale) / 2, groundY, (treeShadow * scale) / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bóng thước
    ctx.beginPath();
    ctx.ellipse(stickX + (stickShadow * scale) / 2, groundY, (stickShadow * scale) / 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. Vẽ tia nắng mặt trời (Đường nét đứt màu vàng) ---
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);

    // Tia nắng từ ngọn cây chạm đất
    ctx.beginPath();
    ctx.moveTo(treeX, groundY - treeHeight * scale);
    ctx.lineTo(treeX + treeShadow * scale, groundY);
    ctx.stroke();

    // Tia nắng từ đầu thước chạm đất
    ctx.beginPath();
    ctx.moveTo(stickX, groundY - stickHeight * scale);
    ctx.lineTo(stickX + stickShadow * scale, groundY);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- 3. Vẽ Cây ---
    // Thân cây
    ctx.fillStyle = '#78350f'; // brown-900
    ctx.fillRect(treeX - 6, groundY - treeHeight * scale, 12, treeHeight * scale);
    // Tán cây hình tam giác xếp tầng
    ctx.fillStyle = '#065f46'; // emerald-800
    for (let i = 0; i < 3; i++) {
      const topY = groundY - treeHeight * scale + (i * 30);
      ctx.beginPath();
      ctx.moveTo(treeX, topY - 20);
      ctx.lineTo(treeX - 35 + (i * 5), topY + 40);
      ctx.lineTo(treeX + 35 - (i * 5), topY + 40);
      ctx.closePath();
      ctx.fill();
    }

    // Nhãn chiều cao cây "?"
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 15px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('H = ?', treeX, groundY - treeHeight * scale - 15);

    // --- 4. Vẽ Thước đo ---
    ctx.strokeStyle = '#60a5fa'; // xanh dương
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(stickX, groundY);
    ctx.lineTo(stickX, groundY - stickHeight * scale);
    ctx.stroke();

    // Nhãn chiều cao thước
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 11px Inter';
    ctx.fillText(`h = ${stickHeight}m`, stickX, groundY - stickHeight * scale - 10);

    // --- 5. Vẽ nhãn độ dài bóng đổ ---
    ctx.fillStyle = '#fdba74'; // cam
    ctx.font = 'bold 11px Inter';
    ctx.fillText(`Bóng cây S = ${treeShadow}m`, treeX + (treeShadow * scale) / 2, groundY + 22);
    ctx.fillText(`Bóng thước s = ${stickShadow}m`, stickX + (stickShadow * scale) / 2, groundY + 22);

    // Vẽ mũi tên chỉ bóng
    const drawArrow = (fromX, toX, y) => {
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fromX, y);
      ctx.lineTo(toX, y);
      ctx.stroke();

      // Đầu mũi tên
      ctx.beginPath();
      ctx.moveTo(fromX + 5, y - 3); ctx.lineTo(fromX, y); ctx.lineTo(fromX + 5, y + 3);
      ctx.moveTo(toX - 5, y - 3); ctx.lineTo(toX, y); ctx.lineTo(toX - 5, y + 3);
      ctx.stroke();
    };

    drawArrow(treeX, treeX + treeShadow * scale, groundY + 8);
    drawArrow(stickX, stickX + stickShadow * scale, groundY + 8);

    // --- 6. Vẽ ông mặt trời ---
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(W - 450, 60, 20, 0, Math.PI * 2);
    ctx.fill();
    // Vẽ tia sáng mặt trời
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    for (let angleSun = 0; angleSun < 360; angleSun += 45) {
      const radSun = (angleSun * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(W - 450 + 26 * Math.cos(radSun), 60 + 26 * Math.sin(radSun));
      ctx.lineTo(W - 450 + 38 * Math.cos(radSun), 60 + 38 * Math.sin(radSun));
      ctx.stroke();
    }

  }, [treeHeight, stickHeight, sunAngle, treeShadow, stickShadow]);

  const checkGuess = () => {
    const guess = parseFloat(userGuess);
    if (isNaN(guess)) {
      setFeedback('Vui lòng nhập một số hợp lệ!');
      return;
    }
    const diff = Math.abs(guess - treeHeight);
    if (diff < 0.2) {
      setFeedback(`Chính xác! Chiều cao của cây là ${treeHeight}m. (+10 điểm)`);
      setScore(score + 10);
    } else {
      setFeedback(`Chưa đúng! Chiều cao thực của cây là ${treeHeight}m. Bạn tính ra ${guess}m.`);
    }
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        
        <div className="canvas-panel">
          <canvas
            ref={canvasRef}
            width="500"
            height="450"
            className="math-canvas"
            style={{
              background: '#111827',
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)',
              maxWidth: '100%',
              height: 'auto',
            }}
          />
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            * Sử dụng các số liệu về <strong>bóng cây (S)</strong>, <strong>chiều cao thước (h)</strong> và <strong>bóng thước (s)</strong> để tính <strong>chiều cao cây (H)</strong>.
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Đo chiều cao bằng định lý Thales
          </h3>

          {/* Điều chỉnh góc nắng mặt trời */}
          <div className="control-group" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
            <label className="control-label">Điều chỉnh góc nắng mặt trời: {sunAngle}°</label>
            <input
              type="range"
              min="30"
              max="70"
              value={sunAngle}
              onChange={e => { setSunAngle(parseInt(e.target.value)); setFeedback(''); }}
              style={{ width: '100%', marginTop: '0.4rem' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem', margin: 0 }}>
              * Khi thay đổi góc nắng, cả hai bóng dập (S) và (s) sẽ co giãn đồng dạng tỷ lệ với nhau!
            </p>
          </div>

          {/* Form giải đố tính toán */}
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Nhập chiều cao cây bạn tính được (H):</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <input
                type="number"
                step="0.1"
                placeholder="Ví dụ: 8.5"
                value={userGuess}
                onChange={e => setUserGuess(e.target.value)}
                style={{ flex: 1, padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
              />
              <button className="btn-action" onClick={checkGuess}>Kiểm tra</button>
            </div>
          </div>

          {/* Feedback và Điểm số */}
          {feedback && (
            <div className="stat-box" style={{ borderColor: feedback.includes('Chính xác') ? '#4ade80' : '#fbbf24', margin: '1rem 0' }}>
              <p style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>{feedback}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Điểm số: <strong style={{ color: '#fbbf24' }}>{score}</strong></span>
            <button className="btn-action btn-muted" onClick={generateNewChallenge} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Cây khác ➡
            </button>
          </div>

          {/* Công thức gợi ý */}
          <div className="info-box" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
            <strong>Công thức Đồng dạng (Định lý Thales):</strong>
            <div style={{ margin: '0.4rem 0', fontFamily: 'monospace', color: '#a78bfa', textAlign: 'center', fontSize: '1rem' }}>
              H / h = S / s  ➡  H = h × (S / s)
            </div>
            Trong đó:<br/>
            - <strong>h = {stickHeight}m</strong> (chiều cao thước)<br/>
            - <strong>s = {stickShadow}m</strong> (bóng thước)<br/>
            - <strong>S = {treeShadow}m</strong> (bóng cây)<br/>
            <div style={{ marginTop: '0.4rem', borderTop: '1px solid #4b5563', paddingTop: '0.4rem', color: '#fbbf24' }}>
              Gợi ý tính: {stickHeight} × ({treeShadow} / {stickShadow}) = <strong>{(stickHeight * (treeShadow / stickShadow)).toFixed(1)}m</strong>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
