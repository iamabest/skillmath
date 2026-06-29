import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function BinomialIdentitySimulation() {
  const canvasRef = useRef(null);

  // Khởi tạo State cho 2 độ dài cạnh a và b
  const [a, setA] = useState(150);
  const [b, setB] = useState(100);

  // Các giá trị tính toán phái sinh tự động cập nhật khi a hoặc b thay đổi
  const a2 = a * a;
  const b2 = b * b;
  const ab = a * b;
  const sumSmall = a2 + 2 * ab + b2;
  const bigSquare = (a + b) * (a + b);

  // Xử lý đồ họa Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Các hàm vẽ thước đo phụ trợ
    const drawRuler = (x1, y1, x2, y2, label, isBig = false) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x1, y1 - 4);
      ctx.lineTo(x1, y1 + 4);
      ctx.moveTo(x2, y2 - 4);
      ctx.lineTo(x2, y2 + 4);
      ctx.stroke();

      ctx.fillStyle = isBig ? '#60a5fa' : '#94a3b8';
      ctx.font = isBig ? 'bold 12px Inter' : '12px Inter';
      ctx.clearRect((x1 + x2) / 2 - 12 - (isBig ? 15 : 0), y1 - 8, 24 + (isBig ? 30 : 0), 16);
      ctx.fillText(label, (x1 + x2) / 2, y1);
    };

    const drawVerticalRuler = (x1, y1, x2, y2, label, isBig = false) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x1 - 4, y1);
      ctx.lineTo(x1 + 4, y1);
      ctx.moveTo(x2 - 4, y2);
      ctx.lineTo(x2 + 4, y2);
      ctx.stroke();

      ctx.fillStyle = isBig ? '#60a5fa' : '#94a3b8';
      ctx.font = isBig ? 'bold 12px Inter' : '12px Inter';
      ctx.save();
      ctx.translate(x1, (y1 + y2) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.clearRect(-12 - (isBig ? 15 : 0), -8, 24 + (isBig ? 30 : 0), 16);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    };

    // Bắt đầu vẽ
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 50;
    const drawWidth = canvas.width - 2 * padding;
    const drawHeight = canvas.height - 2 * padding;

    const totalReal = a + b;
    const scale = drawWidth / totalReal;

    const wA = a * scale;
    const wB = b * scale;

    const startX = padding;
    const startY = padding;

    const colorA2 = 'rgba(16, 185, 129, 0.8)'; // Xanh Emerald
    const colorB2 = 'rgba(139, 92, 246, 0.8)'; // Tím Violet
    const colorAB = 'rgba(245, 158, 11, 0.8)'; // Vàng Amber
    const textLight = '#f8fafc';

    // 1. Mảnh a² (Top-Left)
    ctx.fillStyle = colorA2;
    ctx.fillRect(startX, startY, wA, wA);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY, wA, wA);

    // 2. Mảnh ab thứ nhất (Top-Right)
    ctx.fillStyle = colorAB;
    ctx.fillRect(startX + wA, startY, wB, wA);
    ctx.strokeRect(startX + wA, startY, wB, wA);

    // 3. Mảnh ab thứ hai (Bottom-Left)
    ctx.fillStyle = colorAB;
    ctx.fillRect(startX, startY + wA, wA, wB);
    ctx.strokeRect(startX, startY + wA, wA, wB);

    // 4. Mảnh b² (Bottom-Right)
    ctx.fillStyle = colorB2;
    ctx.fillRect(startX + wA, startY + wA, wB, wB);
    ctx.strokeRect(startX + wA, startY + wA, wB, wB);

    // Vẽ viền bao ngoài hình vuông lớn (a+b)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(startX, startY, drawWidth, drawHeight);

    // Viết nhãn diện tích vào giữa các hình
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (wA > 40) {
      ctx.fillStyle = textLight;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('a²', startX + wA / 2, startY + wA / 2);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${a}×${a}`, startX + wA / 2, startY + wA / 2 + 20);
    }

    if (wA > 30 && wB > 30) {
      // ab phải
      ctx.fillStyle = textLight;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('ab', startX + wA + wB / 2, startY + wA / 2);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${a}×${b}`, startX + wA + wB / 2, startY + wA / 2 + 20);
      
      // ab dưới
      ctx.fillStyle = textLight;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('ab', startX + wA / 2, startY + wA + wB / 2);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${b}×${a}`, startX + wA / 2, startY + wA + wB / 2 + 20);
    }

    if (wB > 40) {
      ctx.fillStyle = textLight;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('b²', startX + wA + wB / 2, startY + wA + wB / 2);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`${b}×${b}`, startX + wA + wB / 2, startY + wA + wB / 2 + 20);
    }

    // Vẽ thước đo (Rulers)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    
    // Thước ngang
    drawRuler(startX, startY - 15, startX + wA, startY - 15, 'a');
    drawRuler(startX + wA, startY - 15, startX + drawWidth, startY - 15, 'b');
    drawRuler(startX, startY - 35, startX + drawWidth, startY - 35, 'a + b', true);

    // Thước dọc
    drawVerticalRuler(startX - 15, startY, startX - 15, startY + wA, 'a');
    drawVerticalRuler(startX - 15, startY + wA, startX - 15, startY + drawHeight, 'b');
    drawVerticalRuler(startX - 35, startY, startX - 35, startY + drawHeight, 'a + b', true);

  }, [a, b]); // Canvas sẽ tự động vẽ lại mỗi khi State 'a' hoặc 'b' thay đổi

  return (
    <PageLayout>
      <div className="simulation-container">
        
        {/* Khu vực bảng vẽ mô phỏng */}
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
              height: 'auto'
            }}
          />
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color, #374151)' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: 'rgba(16, 185, 129, 0.85)' }}></span>
              <span>Diện tích a²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color, #374151)' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: 'rgba(139, 92, 246, 0.85)' }}></span>
              <span>Diện tích b²</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color, #374151)' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: 'rgba(245, 158, 11, 0.85)' }}></span>
              <span>Diện tích ab (x2)</span>
            </div>
          </div>
        </div>

        {/* Bảng điều khiển */}
        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color, #374151)', paddingBottom: '0.5rem' }}>
            Thông số & Điều khiển
          </h3>
          
          <div className="control-group">
            <div className="control-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Độ dài cạnh a</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-success, #10b981)' }}>{a}</span>
            </div>
            <input 
              type="range" 
              min="30" max="250" 
              value={a} 
              onChange={(e) => setA(parseInt(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>

          <div className="control-group">
            <div className="control-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Độ dài cạnh b</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-accent, #8b5cf6)' }}>{b}</span>
            </div>
            <input 
              type="range" 
              min="30" max="250" 
              value={b} 
              onChange={(e) => setB(parseInt(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem' }}
            />
          </div>

          <div className="control-group">
            <label className="control-label">Công thức đại số</label>
            <div className="math-display" style={{ fontSize: '1.2rem', textAlign: 'center', margin: '0.5rem 0', fontWeight: 'bold' }}>
              (a + b)² = a² + 2ab + b²
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Tính toán giá trị thực</label>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-color, #374151)', color: '#9ca3af', fontWeight: 500 }}>Thành phần</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-color, #374151)', color: '#9ca3af', fontWeight: 500 }}>Phép tính</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid var(--border-color, #374151)', color: '#9ca3af', fontWeight: 500 }}>Diện tích</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)', color: 'var(--color-success, #10b981)', fontWeight: 500 }}>Mảnh a²</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>{a}²</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>{a2.toLocaleString()} px²</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)', color: 'var(--color-accent, #8b5cf6)', fontWeight: 500 }}>Mảnh b²</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>{b}²</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>{b2.toLocaleString()} px²</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)', color: '#f59e0b', fontWeight: 500 }}>2 Mảnh ab</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>2 × {a} × {b}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>{(2 * ab).toLocaleString()} px²</td>
                </tr>
                <tr style={{ borderTop: '2px solid var(--border-color, #374151)', fontWeight: 'bold' }}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>Tổng mảnh nhỏ</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>a² + 2ab + b²</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>{sumSmall.toLocaleString()} px²</td>
                </tr>
                <tr style={{ fontWeight: 'bold', color: '#60a5fa' }}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>Hình lớn (a+b)²</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>({a} + {b})²</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color, #374151)' }}>{bigSquare.toLocaleString()} px²</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}