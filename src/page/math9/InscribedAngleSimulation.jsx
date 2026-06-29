import React, { useEffect, useRef, useState } from 'react';
import PageLayout from '../../components/PageLayout'


export default function InscribedAngleSimulation() {
  const canvasRef = useRef(null);
    // Trạng thái để hiển thị số đo góc trên UI
  const [angleInscribed, setAngleInscribed] = useState('45.0');
  const [angleCenter, setAngleCenter] = useState('90.0');

  // Lưu trữ dữ liệu cấu hình vẽ bằng useRef để không gây re-render khi kéo thả
  const config = useRef({
    thetaA: 4.2, // Đỉnh cung lớn
    thetaB: 0.6, // Biên cung nhỏ B
    thetaC: 2.5, // Biên cung nhỏ C
    activeVertex: null
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const O = { x: canvas.width / 2, y: canvas.height / 2 };
    const R = 140;

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const getPointCoords = (theta) => ({
      x: O.x + R * Math.cos(theta),
      y: O.y + R * Math.sin(theta)
    });

    const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const checkVertexClick = (pos) => {
      const radius = 18;
      const ptA = getPointCoords(config.current.thetaA);
      const ptB = getPointCoords(config.current.thetaB);
      const ptC = getPointCoords(config.current.thetaC);

      if (getDistance(pos, ptA) < radius) return 'A';
      if (getDistance(pos, ptB) < radius) return 'B';
      if (getDistance(pos, ptC) < radius) return 'C';
      return null;
    };

    const normalizeAngle = (a) => {
      let angle = a;
      while (angle < 0) angle += 2 * Math.PI;
      while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
      return angle;
    };

    const drawVertex = (p, label, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const dx = p.x - O.x;
      const dy = p.y - O.y;
      const len = Math.hypot(dx, dy);
      const offset = 18;
      const labelX = O.x + (len + offset) * (dx / len);
      const labelY = O.y + (len + offset) * (dy / len);
      
      ctx.fillText(label, labelX, labelY);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ptA = getPointCoords(config.current.thetaA);
      const ptB = getPointCoords(config.current.thetaB);
      const ptC = getPointCoords(config.current.thetaC);

      // 1. Vẽ đường tròn chính
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(O.x, O.y, R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(O.x, O.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('O', O.x - 14, O.y + 16);

      // 2. Vẽ cung bị chắn BC
      const angleB = normalizeAngle(config.current.thetaB);
      const angleC = normalizeAngle(config.current.thetaC);
      
      let startAngle = angleB;
      let endAngle = angleC;
      const diff = Math.abs(angleB - angleC);
      
      if (diff > Math.PI) {
        if (angleB < angleC) {
          startAngle = angleC;
          endAngle = angleB + 2 * Math.PI;
        } else {
          startAngle = angleB;
          endAngle = angleC + 2 * Math.PI;
        }
      } else {
        if (angleB > angleC) {
          startAngle = angleC;
          endAngle = angleB;
        }
      }

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(O.x, O.y, R, startAngle, endAngle);
      ctx.stroke();

      // 3. Vẽ góc ở tâm BOC
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ptB.x, ptB.y);
      ctx.lineTo(O.x, O.y);
      ctx.lineTo(ptC.x, ptC.y);
      ctx.stroke();
      ctx.setLineDash([]);

      let angleBOC_rad = Math.abs(config.current.thetaB - config.current.thetaC);
      if (angleBOC_rad > Math.PI) angleBOC_rad = 2 * Math.PI - angleBOC_rad;
      const angleBOC_deg = angleBOC_rad * 180 / Math.PI;
      
      // Cập nhật State góc ở tâm
      setAngleCenter(angleBOC_deg.toFixed(1));

      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(O.x, O.y, 25, startAngle, endAngle);
      ctx.stroke();

      // 4. Vẽ góc nội tiếp BAC
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ptB.x, ptB.y);
      ctx.lineTo(ptA.x, ptA.y);
      ctx.lineTo(ptC.x, ptC.y);
      ctx.stroke();

      const vAB = { x: ptB.x - ptA.x, y: ptB.y - ptA.y };
      const vAC = { x: ptC.x - ptA.x, y: ptC.y - ptA.y };
      
      const dotProd = vAB.x * vAC.x + vAB.y * vAC.y;
      const lenAB = Math.hypot(vAB.x, vAB.y);
      const lenAC = Math.hypot(vAC.x, vAC.y);
      
      const cosBAC = dotProd / (lenAB * lenAC);
      const angleBAC_rad = Math.acos(Math.max(-1, Math.min(1, cosBAC)));
      const angleBAC_deg = angleBAC_rad * 180 / Math.PI;
      
      // Cập nhật State góc nội tiếp
      setAngleInscribed(angleBAC_deg.toFixed(1));

      const angleAB = Math.atan2(ptB.y - ptA.y, ptB.x - ptA.x);
      const angleAC = Math.atan2(ptC.y - ptA.y, ptC.x - ptA.x);
      
      let startArc = angleAB;
      let endArc = angleAC;
      if (Math.abs(angleAB - angleAC) > Math.PI) {
        if (angleAB < angleAC) {
          startArc = angleAC;
          endArc = angleAB + 2 * Math.PI;
        } else {
          startArc = angleAB;
          endArc = angleAC + 2 * Math.PI;
        }
      } else {
        if (angleAB > angleAC) {
          startArc = angleAC;
          endArc = angleAB;
        }
      }

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ptA.x, ptA.y, 20, startArc, endArc);
      ctx.stroke();

      // 5. Vẽ các đỉnh
      drawVertex(ptB, 'B', '#ef4444');
      drawVertex(ptC, 'C', '#ef4444');
      drawVertex(ptA, 'A', '#10b981');
    };

    // Sự kiện chuột & cảm ứng
    const onStart = (e) => {
      const pos = getMousePos(e);
      config.current.activeVertex = checkVertexClick(pos);
    };

    const onMove = (e) => {
      if (!config.current.activeVertex) return;
      e.preventDefault();
      const pos = getMousePos(e);
      const angle = Math.atan2(pos.y - O.y, pos.x - O.x);
      
      if (config.current.activeVertex === 'A') {
        config.current.thetaA = angle;
      } else if (config.current.activeVertex === 'B') {
        config.current.thetaB = angle;
      } else if (config.current.activeVertex === 'C') {
        config.current.thetaC = angle;
      }
      draw();
    };

    const onEnd = () => {
      config.current.activeVertex = null;
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    // Vẽ lần đầu tiên
    draw();

    // Dọn dẹp sự kiện khi unmount
    return () => {
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);

      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  return (
    <PageLayout>
      <div className="simulation-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '1rem' }}>
        {/* Bảng vẽ hình học */}
        <div className="canvas-panel">
          <canvas
            ref={canvasRef}
            width="460"
            height="420"
            className="math-canvas"
            style={{
              background: '#111827',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)',
              maxWidth: '100%',
              height: 'auto',
              cursor: 'crosshair',
              touchAction: 'none' // Ngăn trình duyệt cuộn khi kéo trên mobile
            }}
          />
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            * Nhấp chuột và kéo thả các đỉnh A (màu lục), B (màu đỏ), C (màu đỏ) dọc đường tròn.
          </div>
        </div>

        {/* Bảng điều khiển */}
        <div className="control-panel" style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Số đo & Định lý
          </h3>
          
          <div className="control-group" style={{ marginBottom: '1.5rem' }}>
            <label className="control-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              Góc nội tiếp chắn cung BC
            </label>
            <div className="math-display" style={{ fontSize: '1.2rem', textAlign: 'left' }}>
              <div>Góc nội tiếp ∠BAC:</div>
              <div style={{ color: '#10b981', fontWeight: 'bold', marginTop: '0.25rem' }}>
                ∠BAC = <span>{angleInscribed}°</span>
              </div>
            </div>
          </div>

          <div className="control-group" style={{ marginBottom: '1.5rem' }}>
            <label className="control-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              Góc ở tâm chắn cung BC
            </label>
            <div className="math-display" style={{ fontSize: '1.2rem', textAlign: 'left' }}>
              <div>Góc ở tâm ∠BOC:</div>
              <div style={{ color: '#60a5fa', fontWeight: 'bold', marginTop: '0.25rem' }}>
                ∠BOC = <span>{angleCenter}°</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              Phát biểu định lý (Toán 9)
            </label>
            <div className="info-box" style={{ fontSize: '0.85rem', lineHeight: '1.6', background: '#1f2937', padding: '1rem', borderRadius: '0.5rem' }}>
              Trong một đường tròn, số đo của <strong>góc nội tiếp</strong> bằng <strong>nửa số đo</strong> của <strong>góc ở tâm</strong> cùng chắn một cung:
              <div style={{ fontSize: '1.05rem', textAlign: 'center', marginTop: '0.5rem', color: '#fbbf24', fontWeight: 'bold' }}>
                ∠BAC = 1/2 ∠BOC
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}