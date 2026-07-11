import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

// Hàm làm tròn đẹp
const fmt = (v) => parseFloat(v.toFixed(2));

export default function ProportionBalanceSimulation() {
  const canvasRef = useRef(null);

  // Bốn giá trị trên cân đòn: a/b = c/d
  const [values, setValues] = useState({ a: 3, b: 4, c: 6, d: 8 });
  const [animAngle, setAnimAngle] = useState(0); // góc nghiêng cân

  // Định nghĩa mảng danh sách các bộ số mẫu (Presets)
  const presets = [
    { name: 'Cân bằng (3/4 = 6/8)', a: 3, b: 4, c: 6, d: 8 },
    { name: 'Vế trái nặng hơn', a: 5, b: 2, c: 4, d: 3 },
    { name: 'Số thập phân', a: 1.5, b: 3, c: 2, d: 4 }
  ];

  // Tính tỉ lệ hai vế và góc nghiêng
  const ratioLeft = values.b !== 0 ? fmt(values.a / values.b) : 0;
  const ratioRight = values.d !== 0 ? fmt(values.c / values.d) : 0;
  const isBalanced = Math.abs(ratioLeft - ratioRight) < 0.001;
  const diff = ratioLeft - ratioRight; // dương = trái nặng hơn

  // Animate góc nghiêng đến target
  const targetAngle = isBalanced ? 0 : Math.max(-22, Math.min(22, diff * 25));
  const angleRef = useRef(animAngle);
  const frameRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      const current = angleRef.current;
      const delta = (targetAngle - current) * 0.08;
      if (Math.abs(delta) > 0.01) {
        angleRef.current = current + delta;
        setAnimAngle(current + delta);
        frameRef.current = requestAnimationFrame(animate);
      } else {
        angleRef.current = targetAngle;
        setAnimAngle(targetAngle);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetAngle]);

  // Vẽ cân đòn lên canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const pivotY = 110;
    const armLen = 170;
    const angle = (angleRef.current * Math.PI) / 180;

    // Vẽ bóng đổ nhẹ cho trụ và đế để tạo chiều sâu
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;

    // Vẽ trụ đỡ
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, pivotY);
    ctx.lineTo(cx, pivotY + 180);
    ctx.stroke();

    // Đế cân
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(cx - 70, pivotY + 175, 140, 16, 8);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Điểm tựa trung tâm (Fulcrum)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx, pivotY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(cx, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tính toán vị trí 2 đầu đòn cân
    const leftX = cx - Math.cos(angle) * armLen;
    const leftY = pivotY - Math.sin(angle) * armLen;
    const rightX = cx + Math.cos(angle) * armLen;
    const rightY = pivotY + Math.sin(angle) * armLen;

    // Thanh đòn cân
    ctx.strokeStyle = isBalanced ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();

    // Hàm vẽ đĩa cân & khối lượng
    const drawPan = (px, py, label, ratio, isLeft) => {
      // Dây treo đĩa cân
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - 25, py + 50);
      ctx.moveTo(px, py);
      ctx.lineTo(px + 25, py + 50);
      ctx.stroke();

      // Đĩa cân
      const panY = py + 50;
      ctx.fillStyle = isLeft ? '#2563eb' : '#db2777';
      ctx.strokeStyle = isLeft ? '#60a5fa' : '#f472b6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(px, panY, 45, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Khối lượng
      const blockH = Math.max(15, Math.min(80, ratio * 35)); 
      const gradient = ctx.createLinearGradient(px - 25, panY - blockH, px + 25, panY);
      gradient.addColorStop(0, isLeft ? '#60a5fa' : '#f472b6');
      gradient.addColorStop(1, isLeft ? '#1d4ed8' : '#9d174d');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(px - 25, panY - blockH, 50, blockH, 6);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Chữ hiển thị giá trị ngay trên khối lượng
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, px, panY - blockH / 2);
    };

    drawPan(leftX, leftY, `${values.a}/${values.b}`, ratioLeft, true);
    drawPan(rightX, rightY, `${values.c}/${values.d}`, ratioRight, false);

  }, [animAngle, values, isBalanced, ratioLeft, ratioRight]);

  const handleChange = (key, raw) => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= 0) {
      setValues(prev => ({ ...prev, [key]: v }));
    }
  };

  return (
    <PageLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#f1f5f9',
        maxWidth: '1050px',
        margin: '0 auto'
      }}>
        
        {/* PANEL TRÁI: CANVAS HIỂN THỊ TRỰC QUAN */}
        <div style={{ flex: '1 1 450px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '1rem',
            padding: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <canvas
              ref={canvasRef}
              width="480"
              height="320"
              style={{
                maxWidth: '100%',
                height: 'auto',
                background: '#0b0f19',
                borderRadius: '0.75rem',
              }}
            />
            
            <div style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '0.95rem',
              background: isBalanced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isBalanced ? '#10b981' : '#ef4444'}`,
              color: isBalanced ? '#34d399' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              {isBalanced ? (
                <><span>✓</span> Thăng bằng! Đây là tỉ lệ thức đúng.</>
              ) : (
                <><span>✗</span> Mất cân bằng! Vế {diff > 0 ? 'Trái' : 'Phải'} nặng hơn.</>
              )}
            </div>
          </div>
          
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
            💡 Mẹo: Thay đổi trực tiếp các ô nhập liệu bên phải để thấy đòn cân chuyển dịch thời gian thực.
          </div>
        </div>

        {/* PANEL PHẢI: BẢNG ĐIỀU KHIỂN & BIỂU THỨC TOÁN HỌC */}
        <div style={{
          flex: '1 1 400px',
          minWidth: '320px',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 1.25rem 0', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
            ⚖️ Mô phỏng Tỉ lệ thức
          </h3>

          {/* KHU VỰC PHÂN TÍCH VÀ ĐIỀU CHỈNH ACTIVE BUTTONS */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Thử nhanh các bộ số mẫu:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {presets.map((p, idx) => {
                // Kiểm tra xem bộ số hiện tại trên State có trùng với Preset này không
                const isActive = values.a === p.a && values.b === p.b && values.c === p.c && values.d === p.d;

                return (
                  <button
                    key={idx}
                    onClick={() => setValues({ a: p.a, b: p.b, c: p.c, d: p.d })}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      // Style thay đổi động khi nút được kích hoạt (Active)
                      background: isActive ? '#2563eb' : '#334155',
                      color: isActive ? '#ffffff' : '#cbd5e1',
                      border: isActive ? '1px solid #60a5fa' : '1px solid #475569',
                      fontWeight: isActive ? '600' : '400',
                      boxShadow: isActive ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* KHU VỰC PHÂN SỐ TOÁN HỌC TRỰC QUAN */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            background: '#0f172a',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            border: '1px dashed #475569'
          }}>
            {/* Phân số vế Trái (Xanh dương) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '600' }}>Tử số (a)</span>
              <input
                type="number"
                value={values.a}
                step="0.5"
                min="0.1"
                onChange={e => handleChange('a', e.target.value)}
                style={{ width: '70px', padding: '8px', background: '#1e293b', border: '2px solid #2563eb', borderRadius: '8px', color: '#fff', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
              />
              <div style={{ width: '85px', height: '3px', background: '#60a5fa', borderRadius: '2px' }} />
              <input
                type="number"
                value={values.b}
                step="0.5"
                min="0.1"
                onChange={e => handleChange('b', e.target.value)}
                style={{ width: '70px', padding: '8px', background: '#1e293b', border: '2px solid #2563eb', borderRadius: '8px', color: '#fff', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '600' }}>Mẫu số (b)</span>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>= <strong style={{ color: '#fff' }}>{ratioLeft}</strong></div>
            </div>

            {/* Dấu bằng / Không bằng động */}
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isBalanced ? '#10b981' : '#ef4444', marginTop: '-20px' }}>
              {isBalanced ? '=' : '≠'}
            </div>

            {/* Phân số vế Phải (Hồng) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: '600' }}>Tử số (c)</span>
              <input
                type="number"
                value={values.c}
                step="0.5"
                min="0.1"
                onChange={e => handleChange('c', e.target.value)}
                style={{ width: '70px', padding: '8px', background: '#1e293b', border: '2px solid #db2777', borderRadius: '8px', color: '#fff', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
              />
              <div style={{ width: '85px', height: '3px', background: '#f472b6', borderRadius: '2px' }} />
              <input
                type="number"
                value={values.d}
                step="0.5"
                min="0.1"
                onChange={e => handleChange('d', e.target.value)}
                style={{ width: '70px', padding: '8px', background: '#1e293b', border: '2px solid #db2777', borderRadius: '8px', color: '#fff', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: '600' }}>Mẫu số (d)</span>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>= <strong style={{ color: '#fff' }}>{ratioRight}</strong></div>
            </div>
          </div>

          {/* BOX KIỂM TRA TÍCH CHÉO */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            padding: '1rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#cbd5e1' }}>
              🔍 Quy tắc tích chéo (Kiểm tra nhanh):
            </div>
            <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.95rem' }}>
              a × d = {values.a} × {values.d} = <strong style={{ color: isBalanced ? '#34d399' : '#f59e0b' }}>{fmt(values.a * values.d)}</strong>
              <br />
              b × c = {values.b} × {values.c} = <strong style={{ color: isBalanced ? '#34d399' : '#f59e0b' }}>{fmt(values.b * values.c)}</strong>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
              {isBalanced 
                ? 'Vì hai tích chéo bằng nhau nên đây lập thành một tỉ lệ thức.' 
                : 'Vì hai tích chéo khác nhau nên cân đòn bị lệch.'}
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}