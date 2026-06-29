import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function LinearGraphSimulation() {
  const canvasRef = useRef(null);

  // State quản lý hệ số a (độ dốc) và b (tung độ gốc)
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);

  // 1. Xử lý chuỗi phương trình hiển thị (ẩn số 1, -1, 0 cho chuẩn Toán học)
  let aStr = '';
  if (a === 1) aStr = 'x';
  else if (a === -1) aStr = '-x';
  else if (a === 0) aStr = '';
  else aStr = a + 'x';

  let bStr = '';
  if (b > 0) bStr = (a === 0) ? b : ' + ' + b;
  else if (b < 0) bStr = (a === 0) ? b : ' - ' + Math.abs(b);
  else bStr = (a === 0) ? '0' : '';

  const currentFormula = aStr + bStr;

  // 2. Tính toán các tính chất biến thiên và giao điểm
  let directionText = '';
  let directionColor = '';
  let slopeText = '';

  if (a > 0) {
    directionText = `Đồng biến (a = ${a} > 0)`;
    directionColor = 'var(--color-success, #10b981)'; // Lấy màu chuẩn hoặc fallback
    slopeText = 'Đi lên từ trái sang phải';
  } else if (a < 0) {
    directionText = `Nghịch biến (a = ${a} < 0)`;
    directionColor = 'var(--color-danger, #ef4444)';
    slopeText = 'Đi xuống từ trái sang phải';
  } else {
    directionText = 'Hàm hằng (a = 0)';
    directionColor = 'var(--text-secondary, #9ca3af)';
    slopeText = 'Song song hoặc trùng trục Ox';
  }

  const pointOyStr = `P(0; ${b})`;
  let pointOxStr = '';
  let xIntersect = null;

  if (a !== 0) {
    xIntersect = -b / a;
    const roundedX = Math.round(xIntersect * 100) / 100;
    pointOxStr = `Q(${roundedX}; 0)`;
  } else {
    pointOxStr = b === 0 ? 'Trùng với trục Ox' : 'Không cắt trục hoành';
  }

  // 3. Render đồ họa đồ thị lên Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const UNIT_PIXELS = 20; // 1 đơn vị toán học = 20px
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const mathToCanvas = (x, y) => ({
      x: centerX + x * UNIT_PIXELS,
      y: centerY - y * UNIT_PIXELS
    });

    const drawArrow = (x, y, direction) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      if (direction === 'right') {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6, y - 4);
        ctx.lineTo(x - 6, y + 4);
      } else if (direction === 'up') {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 6);
        ctx.lineTo(x + 4, y + 6);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawPoint = (cx, cy, color, label) => {
      if (cx >= 0 && cx <= canvas.width && cy >= 0 && cy <= canvas.height) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        let offsetX = 10;
        let offsetY = -8;
        if (cx > centerX + 50) offsetX = -75; // Đảo nhãn nếu sát mép phải
        
        ctx.fillText(label, cx + offsetX, cy + offsetY);
      }
    };

    // Bắt đầu dọn dẹp và vẽ lại
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ lưới tọa độ mờ
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = -10; x <= 10; x++) {
      const pt = mathToCanvas(x, 0);
      ctx.beginPath();
      ctx.moveTo(pt.x, 0);
      ctx.lineTo(pt.x, canvas.height);
      ctx.stroke();
    }
    for (let y = -10; y <= 10; y++) {
      const pt = mathToCanvas(0, y);
      ctx.beginPath();
      ctx.moveTo(0, pt.y);
      ctx.lineTo(canvas.width, pt.y);
      ctx.stroke();
    }

    // Vẽ hệ trục tọa độ Ox, Oy
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // Trục Ox
    ctx.beginPath();
    ctx.moveTo(10, centerY);
    ctx.lineTo(canvas.width - 10, centerY);
    ctx.stroke();
    drawArrow(canvas.width - 10, centerY, 'right');

    // Trục Oy
    ctx.beginPath();
    ctx.moveTo(centerX, canvas.height - 10);
    ctx.lineTo(centerX, 10);
    ctx.stroke();
    drawArrow(centerX, 10, 'up');

    // Nhãn trục & Gốc O
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'italic 13px Inter, sans-serif';
    ctx.fillText('x', canvas.width - 15, centerY + 18);
    ctx.fillText('y', centerX - 18, 15);
    ctx.fillText('O', centerX - 15, centerY + 18);

    // Đánh số trên vạch tọa độ (hiển thị số chẵn)
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      
      const ptX = mathToCanvas(i, 0);
      ctx.beginPath();
      ctx.moveTo(ptX.x, centerY - 3);
      ctx.lineTo(ptX.x, centerY + 3);
      ctx.stroke();
      if (i % 2 === 0) ctx.fillText(i, ptX.x, centerY + 12);

      const ptY = mathToCanvas(0, i);
      ctx.beginPath();
      ctx.moveTo(centerX - 3, ptY.y);
      ctx.lineTo(centerX + 3, ptY.y);
      ctx.stroke();
      if (i % 2 === 0) ctx.fillText(i, centerX - 12, ptY.y);
    }

    // Vẽ đường thẳng đồ thị
    const xStart = -11;
    const xEnd = 11;
    const yStart = a * xStart + b;
    const yEnd = a * xEnd + b;

    const ptStart = mathToCanvas(xStart, yStart);
    const ptEnd = mathToCanvas(xEnd, yEnd);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(ptStart.x, ptStart.y);
    ctx.lineTo(ptEnd.x, ptEnd.y);
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset bóng

    // Vẽ các điểm giao cắt
    const ptOy = mathToCanvas(0, b);
    drawPoint(ptOy.x, ptOy.y, 'rgba(139, 92, 246, 1)', `P(0; ${b})`);

    if (xIntersect !== null) {
      const ptOx = mathToCanvas(xIntersect, 0);
      const roundedX = Math.round(xIntersect * 100) / 100;
      drawPoint(ptOx.x, ptOx.y, 'rgba(16, 185, 129, 1)', `Q(${roundedX}; 0)`);
    }

  }, [a, b]); // Canvas re-render khi a hoặc b thay đổi

  return (
    <PageLayout>
      <div className="simulation-container">
        {/* Bảng vẽ mô phỏng */}
        <div className="canvas-panel">
          <canvas 
            ref={canvasRef} 
            width="460" 
            height="460" 
            className="math-canvas"
            style={{
              background: '#111827',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)',
              maxWidth: '100%',
              height: 'auto',
              touchAction: 'none' // Hỗ trợ tương tác cảm ứng không cuộn trang
            }}
          />
        </div>

        {/* Bảng điều khiển */}
        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color, #374151)', paddingBottom: '0.5rem' }}>
            Thông số & Điều khiển
          </h3>
          
          <div className="control-group">
            <div className="control-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
              <span>Hệ số góc a (Độ dốc)</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary, #3b82f6)' }}>{a}</span>
            </div>
            <input 
              type="range" 
              min="-5" max="5" step="0.1" 
              value={a} 
              onChange={(e) => setA(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div className="control-group" style={{ marginTop: '1rem' }}>
            <div className="control-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
              <span>Hệ số tự do b (Giao điểm Oy)</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-accent, #8b5cf6)' }}>{b}</span>
            </div>
            <input 
              type="range" 
              min="-10" max="10" step="0.5" 
              value={b} 
              onChange={(e) => setB(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div className="control-group" style={{ marginTop: '1.5rem' }}>
            <label className="control-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              Phương trình hiện tại
            </label>
            <div className="math-display" style={{ fontSize: '1.2rem' }}>
              y = <span className="formula-highlight" style={{ fontWeight: 'bold', color: '#fbbf24' }}>{currentFormula}</span>
            </div>
          </div>

          <div className="control-group" style={{ marginTop: '1.5rem' }}>
            <label className="control-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              Tính chất của hàm số
            </label>
            <div className="status-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color, #374151)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Chiều biến thiên:</span>
                <span className="value-highlight" style={{ fontWeight: 'bold', color: directionColor }}>
                  {directionText}
                </span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Độ dốc đường thẳng:</span>
                <span className="value-highlight" style={{ fontWeight: 'bold' }}>
                  {slopeText}
                </span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Giao điểm trục tung Oy:</span>
                <span className="value-highlight" style={{ fontWeight: 'bold', color: 'var(--color-accent, #8b5cf6)' }}>
                  {pointOyStr}
                </span>
              </p>
              <p style={{ display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                <span>Giao điểm trục hoành Ox:</span>
                <span className="value-highlight" style={{ fontWeight: 'bold', color: 'var(--color-success, #10b981)' }}>
                  {pointOxStr}
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}