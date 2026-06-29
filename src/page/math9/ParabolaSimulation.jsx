import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function ParabolaSimulation() {
  const canvasRef = useRef(null);
  
  // Quản lý trạng thái hệ số a, vị trí bóng x, và trạng thái chuyển động
  const [a, setA] = useState(0.5);
  const [ballX, setBallX] = useState(2.0);
  const [isRolling, setIsRolling] = useState(false);

  // Cấu hình hệ tọa độ hiển thị của hệ thống Canvas
  const UNIT_PIXELS = 30; // 1 đơn vị toán học = 30px trên màn hình

  // Đồng bộ hóa trạng thái lăn của bóng bằng Animation Loop trong React
  useEffect(() => {
  if (!isRolling) return;

  let animationId;
  let lastTime = performance.now();

  const SPEED = 2; // đơn vị/giây

  const animate = (time) => {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    setBallX((prev) => {
      const next = prev + SPEED * delta;

      if (next >= 5) {
        setIsRolling(false);
        return 5;
      }

      return next;
    });

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(animationId);
}, [isRolling]);

  // Trục xử lý đồ họa chính trên Canvas mỗi khi hệ số hoặc vị trí bóng thay đổi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2; // 225 px
    const centerY = canvas.height / 2; // 210 px

    // Chuyển đổi từ tọa độ Toán học sang tọa độ Pixel trên Canvas
    const mathToCanvas = (x, y) => ({
      x: centerX + x * UNIT_PIXELS,
      y: centerY - y * UNIT_PIXELS
    });

    // Hàm vẽ mũi tên định hướng trục số
    const drawArrow = (x, y, direction) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
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

    // --- BẮT ĐẦU VẼ ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Vẽ lưới tọa độ mờ nền
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = -7; x <= 7; x++) {
      const pt = mathToCanvas(x, 0);
      ctx.beginPath();
      ctx.moveTo(pt.x, 0);
      ctx.lineTo(pt.x, canvas.height);
      ctx.stroke();
    }
    for (let y = -7; y <= 7; y++) {
      const pt = mathToCanvas(0, y);
      ctx.beginPath();
      ctx.moveTo(0, pt.y);
      ctx.lineTo(canvas.width, pt.y);
      ctx.stroke();
    }

    // 2. Vẽ hai trục Ox và Oy chính
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // Trục hoành Ox
    ctx.beginPath();
    ctx.moveTo(15, centerY);
    ctx.lineTo(canvas.width - 15, centerY);
    ctx.stroke();
    drawArrow(canvas.width - 15, centerY, 'right');

    // Trục tung Oy
    ctx.beginPath();
    ctx.moveTo(centerX, canvas.height - 15);
    ctx.lineTo(centerX, 15);
    ctx.stroke();
    drawArrow(centerX, 15, 'up');

    // Nhãn tên trục và gốc tọa độ O
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'italic 12px Inter, sans-serif';
    ctx.fillText('x', canvas.width - 25, centerY + 18);
    ctx.fillText('y', centerX - 18, 25);
    ctx.fillText('O', centerX - 14, centerY + 18);

    // Vạch chia đơn vị chẵn
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = -6; i <= 6; i++) {
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

    // 3. Vẽ đường cong Parabol y = ax²
    if (a !== 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      const xMin = -7.0;
      const xMax = 7.0;
      const step = 0.05;
      
      let first = true;
      for (let x = xMin; x <= xMax; x += step) {
        const y = a * x * x;
        const pt = mathToCanvas(x, y);
        
        if (pt.y >= 0 && pt.y <= canvas.height) {
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset hiệu ứng đổ bóng
    }

    // 4. Vẽ các đường gióng và cặp điểm đối xứng M & M' (chỉ hiển thị khi bóng đứng yên)
    if (a !== 0 && !isRolling) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      const xVal = 2;
      const yVal = a * xVal * xVal;

      const ptRight = mathToCanvas(xVal, yVal);
      const ptLeft = mathToCanvas(-xVal, yVal);
      const ptXRight = mathToCanvas(xVal, 0);
      const ptXLeft = mathToCanvas(-xVal, 0);
      const ptY = mathToCanvas(0, yVal);

      // Gióng điểm bên phải
      ctx.beginPath();
      ctx.moveTo(ptRight.x, ptRight.y); ctx.lineTo(ptXRight.x, ptXRight.y);
      ctx.moveTo(ptRight.x, ptRight.y); ctx.lineTo(ptY.x, ptY.y);
      ctx.stroke();

      // Gióng điểm bên trái đối xứng
      ctx.beginPath();
      ctx.moveTo(ptLeft.x, ptLeft.y); ctx.lineTo(ptXLeft.x, ptXLeft.y);
      ctx.moveTo(ptLeft.x, ptLeft.y); ctx.lineTo(ptY.x, ptY.y);
      ctx.stroke();

      ctx.setLineDash([]); // Reset nét đứt

      // Vẽ nút giao M
      ctx.fillStyle = 'rgba(139, 92, 246, 1)';
      ctx.beginPath();
      ctx.arc(ptRight.x, ptRight.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(`M(2; ${yVal.toFixed(1)})`, ptRight.x + 22, ptRight.y - 8);

      // Vẽ nút giao M' đối xứng
      ctx.fillStyle = 'rgba(139, 92, 246, 1)';
      ctx.beginPath();
      ctx.arc(ptLeft.x, ptLeft.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`M'(-2; ${yVal.toFixed(1)})`, ptLeft.x - 22, ptLeft.y - 8);
    }

    // 5. Vẽ quả bóng trượt động trên mặt Parabol
    const ballY = a * ballX * ballX;
    const ptBall = mathToCanvas(ballX, ballY);
    
    if (ptBall.y >= 0 && ptBall.y <= canvas.height) {
      ctx.fillStyle = '#10b981'; // Màu lục Emerald sinh động
      ctx.beginPath();
      ctx.arc(ptBall.x, ptBall.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [a, ballX, isRolling]);

  // Xử lý sự kiện khi kéo thanh trượt hệ số a
  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setA(val);
    if (!isRolling) {
      setBallX(2.0); // Reset quả bóng về vị trí khảo sát mặc định x = 2 khi đổi đồ thị
    }
  };

  // Kích hoạt chu trình chuyển động thả bóng
  const startRolling = () => {
    if (isRolling) return;
    setBallX(-5.0); // Bóng xuất phát từ rìa trái (hoành độ -5)
    setIsRolling(true);
  };

  // Tính toán nhanh tọa độ hiển thị trên bảng thông tin bảng điều khiển
  const displayBallY = a * ballX * ballX;

  // Khối định nghĩa Style đặc thù thừa kế từ cấu trúc mã cũ của bạn
  const canvasStyle = {
    background: '#111827',
    border: '2px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)',
    maxWidth: '100%',
    height: 'auto',
    touchAction: 'none'
  };

  const btnActionStyle = {
    background: isRolling ? '#9ca3af' : 'var(--color-primary, #3b82f6)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '0.375rem',
    fontWeight: '600',
    cursor: isRolling ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center',
    flex: 1,
    boxShadow: isRolling ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)',
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        {/* Khu vực dựng hình hình học */}
        <div className="canvas-panel">
          <canvas 
            ref={canvasRef} 
            width="460" 
            height="460" 
            style={canvasStyle} 
            className="math-canvas"
          />
        </div>

        {/* Khu vực điều khiển tương tác */}
        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color, #374151)', paddingBottom: '0.5rem' }}>
            Hệ số & Chuyển động
          </h3>
          
          {/* Thanh trượt điều chỉnh hệ số a */}
          <div className="control-group">
            <div className="control-label" style={{ display: 'flex', justifyContent: 'between', width: '100%' }}>
              <span>Hệ số a</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary, #3b82f6)', marginLeft: 'auto' }}>
                {a.toFixed(2)}
              </span>
            </div>
            <input 
              type="range" 
              min="-1.5" 
              max="1.5" 
              step="0.05" 
              value={a} 
              onChange={handleSliderChange}
              disabled={isRolling}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>

          {/* Hiển thị phương trình tương ứng */}
          <div className="control-group">
            <label className="control-label">Phương trình Parabol</label>
            <div className="math-display">
              y = {a === 0 ? <span className="formula-highlight">0 (Đường thẳng trùng trục Ox)</span> : <span className="formula-highlight">{a.toFixed(2)}x²</span>}
            </div>
          </div>

          {/* Trình diễn tọa độ điểm chạy thực tế */}
          <div className="control-group">
            <label className="control-label">Tọa độ bóng trượt động</label>
            <div className="math-display" style={{ fontSize: '1.1rem', background: 'rgba(0, 0, 0, 0.3)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              M(x; y) = <span style={{ color: 'var(--color-success, #10b981)', fontWeight: 'bold' }}>({ballX.toFixed(2)}; {displayBallY.toFixed(2)})</span>
            </div>
          </div>

          {/* Nút kích hoạt hiệu ứng động */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              className="btn-action" 
              style={btnActionStyle} 
              onClick={startRolling}
              disabled={isRolling}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Thả bóng trượt
            </button>
          </div>

          {/* Khối thông tin kết luận Sư phạm hỗ trợ bài giảng */}
          <div className="control-group">
            <label className="control-label">Nhận xét sư phạm</label>
            <div className="info-box" style={{ fontSize: '0.85rem' }}>
              {a > 0 && (
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                  <li>Bề lõm của đồ thị quay <strong>lên trên</strong>.</li>
                  <li>Điểm thấp nhất là gốc tọa độ <strong>O(0; 0)</strong>.</li>
                  <li>Hàm số <strong>nghịch biến</strong> khi x &lt; 0 và <strong>đồng biến</strong> khi x &gt; 0.</li>
                </ul>
              )}
              {a < 0 && (
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                  <li>Bề lõm của đồ thị quay <strong>xuống dưới</strong>.</li>
                  <li>Điểm cao nhất là gốc tọa độ <strong>O(0; 0)</strong>.</li>
                  <li>Hàm số <strong>đồng biến</strong> khi x &lt; 0 và <strong>nghịch biến</strong> khi x &gt; 0.</li>
                </ul>
              )}
              {a === 0 && (
                <span>Đồ thị thoái hóa thành đường thẳng trùng với trục hoành Ox.</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}