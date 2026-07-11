import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function TriangleBuilderSimulation() {
  const canvasRef = useRef(null);
  const [a, setA] = useState(6);
  const [b, setB] = useState(5);
  const [c, setC] = useState(8);

  const isValid = a + b > c && a + c > b && b + c > a;

  // Vẽ tam giác
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Lưới nền mờ
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 25) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }

    const scale = 30; // tỉ lệ xích px / đơn vị độ dài
    const startX = 120;
    const startY = 280;

    // Đặt cạnh đáy lớn nhất làm nền để vẽ cân đối nhất
    // Ở đây ta cố định cạnh c làm cạnh đáy nằm ngang: B(startX, startY) và C(startX + c*scale, startY)
    const ptB = { x: startX, y: startY };
    const ptC = { x: startX + c * scale, y: startY };

    if (isValid) {
      // Tính toán tọa độ đỉnh A dựa trên định lý Cosine: cos(B) = (c^2 + a^2 - b^2) / (2 * c * a)
      // Cạnh đối diện B là b, cạnh đối diện C là c, cạnh đối diện A là a.
      // Dùng hệ tọa độ chuẩn: B ở gốc, BC nằm trên trục hoành.
      const cosB = (c * c + a * a - b * b) / (2 * c * a);
      const sinB = Math.sqrt(1 - cosB * cosB);

      const ptA = {
        x: startX + a * scale * cosB,
        y: startY - a * scale * sinB
      };

      // Vẽ tam giác màu tím neon trong suốt
      ctx.fillStyle = 'rgba(167, 139, 250, 0.1)';
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(ptB.x, ptB.y);
      ctx.lineTo(ptC.x, ptC.y);
      ctx.lineTo(ptA.x, ptA.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vẽ đỉnh
      const drawVertex = (p, label, color) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Inter';
        ctx.fillText(label, p.x - 4, p.y - 12);
      };

      drawVertex(ptA, 'A', '#ef4444');
      drawVertex(ptB, 'B', '#3b82f6');
      drawVertex(ptC, 'C', '#10b981');

      // Nhãn độ dài các cạnh
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      
      // Cạnh c (BC)
      ctx.fillText(`c = ${c}`, (ptB.x + ptC.x) / 2, ptB.y + 18);
      // Cạnh a (AB)
      ctx.fillText(`a = ${a}`, (ptA.x + ptB.x) / 2 - 15, (ptA.y + ptB.y) / 2);
      // Cạnh b (AC)
      ctx.fillText(`b = ${b}`, (ptA.x + ptC.x) / 2 + 15, (ptA.y + ptC.y) / 2);

    } else {
      // Trường hợp không dựng được tam giác
      // Vẽ cạnh đáy c nằm ngang
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ptB.x, ptB.y);
      ctx.lineTo(ptC.x, ptC.y);
      ctx.stroke();

      // Vẽ cung xoay của cạnh a từ B và cạnh b từ C để học sinh thấy chúng không cắt nhau
      ctx.strokeStyle = '#3b82f6'; // xanh
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(ptB.x, ptB.y, a * scale, -Math.PI, 0);
      ctx.stroke();

      ctx.strokeStyle = '#10b981'; // xanh lá
      ctx.beginPath();
      ctx.arc(ptC.x, ptC.y, b * scale, -Math.PI, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vẽ đoạn thẳng của cạnh a và b nằm bẹt xuống để biểu diễn trực quan
      ctx.strokeStyle = '#ef4444'; // cạnh a
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ptB.x, ptB.y);
      ctx.lineTo(ptB.x + a * scale, ptB.y);
      ctx.stroke();

      ctx.strokeStyle = '#f59e0b'; // cạnh b
      ctx.beginPath();
      ctx.moveTo(ptC.x, ptC.y);
      ctx.lineTo(ptC.x - b * scale, ptC.y);
      ctx.stroke();

      // Điểm đỉnh B, C
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(ptB.x, ptB.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(ptC.x, ptC.y, 6, 0, Math.PI * 2); ctx.fill();

      // Chữ cảnh báo
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ Không thể ghép thành tam giác!', W / 2, H / 2 - 30);
      ctx.font = '12px Inter';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Tổng hai cạnh ngắn nhỏ hơn cạnh dài nhất, hai đầu mút không chạm nhau.', W / 2, H / 2 - 10);
    }
  }, [a, b, c, isValid]);

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
            * Thay đổi độ dài các cạnh bên thanh điều khiển để quan sát Bất đẳng thức tam giác.
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Xưởng lắp ráp tam giác
          </h3>

          {/* Bảng trạng thái */}
          <div className="stat-box" style={{ borderColor: isValid ? '#4ade80' : '#f87171', background: isValid ? 'rgba(74, 222, 128, 0.05)' : 'rgba(248, 113, 113, 0.05)', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: isValid ? '#4ade80' : '#f87171', textTransform: 'uppercase' }}>Trạng thái dựng hình:</span>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff', margin: '4px 0' }}>
              {isValid ? 'Dựng được tam giác' : 'Không dựng được tam giác'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#d1d5db', margin: 0 }}>
              Bất đẳng thức: a + b &gt; c ({a} + {b} = {a+b} {a+b > c ? '>' : '≤'} {c})
            </p>
          </div>

          {/* Điều chỉnh cạnh */}
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Độ dài các cạnh:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>Cạnh a (đỏ)</span>
                  <span>{a}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={a}
                  onChange={e => setA(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>Cạnh b (xanh lá)</span>
                  <span>{b}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={b}
                  onChange={e => setB(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>Cạnh c (đáy)</span>
                  <span>{c}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={c}
                  onChange={e => setC(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Thuyết minh sư phạm */}
          <div className="info-box">
            <strong>Bất đẳng thức tam giác:</strong> Trong một tam giác, tổng độ dài của hai cạnh bất kỳ bao giờ cũng lớn hơn độ dài cạnh còn lại:
            <div style={{ marginTop: '0.4rem', fontFamily: 'monospace', color: '#a78bfa' }}>
              • a + b &gt; c<br/>
              • a + c &gt; b<br/>
              • b + c &gt; a
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
