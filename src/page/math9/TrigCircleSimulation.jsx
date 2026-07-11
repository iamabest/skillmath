import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageLayout from '../../components/PageLayout';

const TWO_PI = Math.PI * 2;
const GRAPH_POINTS = 300; // điểm trên đồ thị sin/cos

export default function TrigCircleSimulation() {
  const circleCanvasRef = useRef(null);
  const graphCanvasRef = useRef(null);

  // Góc hiện tại (radian), kéo chuột trên vòng tròn để thay đổi
  const [angle, setAngle] = useState(Math.PI / 6); // 30°
  const [isDragging, setIsDragging] = useState(false);
  const [showSin, setShowSin] = useState(true);
  const [showCos, setShowCos] = useState(true);
  const [showTan, setShowTan] = useState(false);

  const RADIUS = 120;
  const CX = 180;
  const CY = 180;

  // Tính các giá trị lượng giác
  const sinVal = Math.sin(angle);
  const cosVal = Math.cos(angle);
  const tanVal = Math.abs(sinVal / cosVal) < 10 ? sinVal / cosVal : null;
  const degAngle = ((angle * 180) / Math.PI + 720) % 360;

  // Vẽ vòng tròn đơn vị
  useEffect(() => {
    const canvas = circleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Lưới mờ
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 20; i < W; i += 30) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
    }
    for (let i = 20; i < H; i += 30) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }

    // Trục tọa độ
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, H); ctx.stroke();

    // Nhãn trục
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('1', CX + RADIUS + 8, CY - 8);
    ctx.fillText('-1', CX - RADIUS - 10, CY - 8);
    ctx.fillText('1', CX + 8, CY - RADIUS - 4);
    ctx.fillText('-1', CX + 8, CY + RADIUS + 12);

    // Vòng tròn đơn vị
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS, 0, TWO_PI);
    ctx.stroke();

    // Điểm P trên vòng tròn
    const px = CX + RADIUS * cosVal;
    const py = CY - RADIUS * sinVal;

    // Bán kính OP (cạnh huyền)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Cạnh cos (hình chiếu trên Ox)
    if (showCos) {
      ctx.strokeStyle = '#ef4444'; // đỏ cho cos
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(px, CY);
      ctx.stroke();
      // Nhãn cos
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`cos = ${cosVal.toFixed(2)}`, (CX + px) / 2, CY + (sinVal >= 0 ? 16 : -8));
    }

    // Cạnh sin (hình chiếu trên Oy)
    if (showSin) {
      ctx.strokeStyle = '#3b82f6'; // xanh cho sin
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, CY);
      ctx.stroke();
      // Nhãn sin
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = cosVal >= 0 ? 'left' : 'right';
      ctx.fillText(`sin = ${sinVal.toFixed(2)}`, px + (cosVal >= 0 ? 6 : -6), (py + CY) / 2);
    }

    // Cạnh tan (trên đường x=1)
    if (showTan && tanVal !== null) {
      const tanY = CY - tanVal * RADIUS;
      const tanX = CX + RADIUS;
      ctx.strokeStyle = '#f59e0b'; // vàng cho tan
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tanX, CY);
      ctx.lineTo(tanX, tanY);
      ctx.stroke();
      // Đường từ O đến tan
      ctx.strokeStyle = 'rgba(245,158,11,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(tanX + 5, tanY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(`tan=${tanVal.toFixed(2)}`, tanX + 6, tanY);
    }

    // Đường nét đứt từ P xuống trục
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py); ctx.lineTo(px, CY); // dọc
    ctx.moveTo(px, py); ctx.lineTo(CX, py); // ngang
    ctx.stroke();
    ctx.setLineDash([]);

    // Cung góc
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    const arcEnd = -angle; // canvas y inverted
    ctx.beginPath();
    ctx.arc(CX, CY, 35, 0, arcEnd, angle < 0);
    ctx.stroke();

    // Nhãn góc
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 13px Inter';
    ctx.textAlign = 'center';
    const labelAngle = angle / 2;
    ctx.fillText(`${degAngle.toFixed(0)}°`, CX + 52 * Math.cos(-labelAngle), CY + 52 * Math.sin(-labelAngle));

    // Điểm P
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, TWO_PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', px, py);
    ctx.textBaseline = 'alphabetic';

  }, [angle, showSin, showCos, showTan, sinVal, cosVal, tanVal, degAngle]);

  // Vẽ đồ thị sin/cos theo thời gian
  useEffect(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const midY = H / 2;
    const amplitude = H * 0.38;

    // Trục
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, H); ctx.stroke();

    // Nhãn trục y
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText('1', 18, midY - amplitude + 4);
    ctx.fillText('-1', 18, midY + amplitude + 4);
    ctx.fillText('0', 18, midY + 4);

    // Vẽ sin
    if (showSin) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= GRAPH_POINTS; i++) {
        const t = (i / GRAPH_POINTS) * TWO_PI;
        const x = (i / GRAPH_POINTS) * W;
        const y = midY - Math.sin(t) * amplitude;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Vẽ cos
    if (showCos) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= GRAPH_POINTS; i++) {
        const t = (i / GRAPH_POINTS) * TWO_PI;
        const x = (i / GRAPH_POINTS) * W;
        const y = midY - Math.cos(t) * amplitude;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Đường dọc vị trí góc hiện tại
    const currentX = ((((angle % TWO_PI) + TWO_PI) % TWO_PI) / TWO_PI) * W;
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(currentX, 0); ctx.lineTo(currentX, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Điểm trên đồ thị tương ứng
    if (showSin) {
      const sinPy = midY - sinVal * amplitude;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(currentX, sinPy, 6, 0, TWO_PI);
      ctx.fill();
    }
    if (showCos) {
      const cosPy = midY - cosVal * amplitude;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(currentX, cosPy, 6, 0, TWO_PI);
      ctx.fill();
    }

    // Nhãn
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'left';
    if (showSin) { ctx.fillStyle = '#3b82f6'; ctx.fillText('sin θ', 4, 14); }
    if (showCos) { ctx.fillStyle = '#ef4444'; ctx.fillText('cos θ', 4, showSin ? 28 : 14); }

  }, [angle, showSin, showCos, sinVal, cosVal]);

  // Xử lý kéo thả điểm P
  const getAngleFromMouse = useCallback((e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (clientX - rect.left) * scaleX - CX;
    const my = -((clientY - rect.top) * scaleY - CY);
    return Math.atan2(my, mx);
  }, []);

  useEffect(() => {
    const canvas = circleCanvasRef.current;
    if (!canvas) return;

    const onDown = (e) => {
      setIsDragging(true);
      setAngle(getAngleFromMouse(e, canvas));
    };
    const onMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      setAngle(getAngleFromMouse(e, canvas));
    };
    const onUp = () => setIsDragging(false);

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, getAngleFromMouse]);

  return (
    <PageLayout>
      <div className="simulation-container">

        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Vòng tròn lượng giác */}
          <canvas
            ref={circleCanvasRef}
            width="360"
            height="360"
            className="math-canvas"
            style={{
              background: '#111827',
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
              maxWidth: '100%',
              height: 'auto',
              cursor: 'crosshair',
              touchAction: 'none',
            }}
          />
          {/* Đồ thị */}
          <canvas
            ref={graphCanvasRef}
            width="360"
            height="110"
            className="math-canvas"
            style={{
              background: '#111827',
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
              maxWidth: '100%',
              height: 'auto',
            }}
          />
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            * Kéo điểm P màu vàng trên vòng tròn để thay đổi góc và quan sát đồ thị phía dưới.
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Đường tròn lượng giác
          </h3>

          {/* Giá trị hiện tại */}
          <div className="stat-box" style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
              θ = {degAngle.toFixed(1)}°
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
              {showSin && (
                <div style={{ color: '#60a5fa' }}>
                  sin({degAngle.toFixed(0)}°) = <strong>{sinVal.toFixed(4)}</strong>
                </div>
              )}
              {showCos && (
                <div style={{ color: '#f87171' }}>
                  cos({degAngle.toFixed(0)}°) = <strong>{cosVal.toFixed(4)}</strong>
                </div>
              )}
              {showTan && (
                <div style={{ color: '#fbbf24' }}>
                  tan({degAngle.toFixed(0)}°) = <strong>{tanVal !== null ? tanVal.toFixed(4) : '∞ (không xác định)'}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Điều khiển góc */}
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Góc θ (kéo hoặc nhập):</label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={Math.round(degAngle)}
              onChange={e => setAngle((parseFloat(e.target.value) * Math.PI) / 180)}
              style={{ width: '100%', marginTop: '0.4rem' }}
            />
          </div>

          {/* Các góc đặc biệt */}
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Góc đặc biệt:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
              {[0, 30, 45, 60, 90, 120, 135, 150, 180, 270].map(deg => (
                <button
                  key={deg}
                  onClick={() => setAngle((deg * Math.PI) / 180)}
                  className={`btn-action btn-muted`}
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Hiển thị */}
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Hiển thị:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
              {[
                { key: 'showSin', setter: setShowSin, val: showSin, color: '#3b82f6', label: 'Đường sin (màu xanh)' },
                { key: 'showCos', setter: setShowCos, val: showCos, color: '#ef4444', label: 'Đường cos (màu đỏ)' },
                { key: 'showTan', setter: setShowTan, val: showTan, color: '#f59e0b', label: 'Đường tan (màu vàng)' },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={item.val} onChange={() => item.setter(v => !v)} />
                  <span style={{ background: item.color, width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span>
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="info-box">
            Trên đường tròn đơn vị (R=1):<br/>
            <strong>sin θ</strong> = tung độ của điểm P (cạnh đứng).<br/>
            <strong>cos θ</strong> = hoành độ của điểm P (cạnh ngang).<br/>
            <strong>tan θ</strong> = sin θ / cos θ.
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
