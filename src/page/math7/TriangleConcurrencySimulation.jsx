import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

// --- CÁC HÀM TOÁN HỌC HÌNH HỌC (Pure Functions) ---
const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

const pointToLineDistance = (p, l1, l2) => {
  const num = Math.abs((l2.y - l1.y) * p.x - (l2.x - l1.x) * p.y + l2.x * l1.y - l2.y * l1.x);
  const den = Math.hypot(l2.y - l1.y, l2.x - l1.x);
  return den === 0 ? 0 : num / den;
};

const getProjectionPoint = (p, l1, l2) => {
  const dx = l2.x - l1.x;
  const dy = l2.y - l1.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return l1;
  const t = ((p.x - l1.x) * dx + (p.y - l1.y) * dy) / len2;
  return { x: l1.x + t * dx, y: l1.y + t * dy };
};

const getLineIntersection = (p1, p2, p3, p4) => {
  const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (den === 0) return null;
  const numX = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x));
  const numY = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x));
  return { x: numX / den, y: numY / den };
};

const getBisectorD = (pA, pB, pC) => {
  const c = getDistance(pA, pB);
  const b = getDistance(pA, pC);
  return {
    x: (b * pB.x + c * pC.x) / (b + c),
    y: (b * pB.y + c * pC.y) / (b + c)
  };
};

export default function TriangleConcurrencySimulation() {
  const canvasRef = useRef(null);

  // Quản lý trạng thái hiển thị các đường đồng quy
  const [showMedians, setShowMedians] = useState(true);
  const [showBisectors, setShowBisectors] = useState(false);
  const [showPerpendiculars, setShowPerpendiculars] = useState(false);
  const [showAltitudes, setShowAltitudes] = useState(false);

  // Quản lý trạng thái tọa độ nội bộ (không gây re-render component)
  const stateRef = useRef({
    A: { x: 230, y: 70 },
    B: { x: 80, y: 320 },
    C: { x: 380, y: 320 },
    activeVertex: null
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawVertex = (p, label) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let labelY = p.y - 18;
      if (p.y < 50) labelY = p.y + 18;
      ctx.fillText(label, p.x, labelY);
    };

    const drawPoint = (p, color, label) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, p.x + 8, p.y - 4);
    };

    const drawRightAngleSymbol = (fromPt, footPt, sidePt) => {
      const dX = fromPt.x - footPt.x;
      const dY = fromPt.y - footPt.y;
      const dS_X = sidePt.x - footPt.x;
      const dS_Y = sidePt.y - footPt.y;

      const lenH = Math.hypot(dX, dY);
      const lenS = Math.hypot(dS_X, dS_Y);

      if (lenH === 0 || lenS === 0) return;

      const size = 8;
      const uH = { x: dX / lenH * size, y: dY / lenH * size };
      const uS = { x: dS_X / lenS * size, y: dS_Y / lenS * size };

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(footPt.x + uH.x, footPt.y + uH.y);
      ctx.lineTo(footPt.x + uH.x + uS.x, footPt.y + uH.y + uS.y);
      ctx.lineTo(footPt.x + uS.x, footPt.y + uS.y);
      ctx.stroke();
    };

    // Hàm vẽ chính (kích hoạt lại mỗi khi toạ độ thay đổi hoặc toggle tính năng)
    const draw = () => {
      const { A, B, C } = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const a = getDistance(B, C);
      const b = getDistance(A, C);
      const c = getDistance(A, B);

      const M_BC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
      const M_AC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
      const M_AB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

      // 1. Vẽ khung tam giác ABC
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y);
      ctx.closePath();
      ctx.stroke();

      // 2. Trung tuyến & Trọng tâm G
      if (showMedians) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(A.x, A.y); ctx.lineTo(M_BC.x, M_BC.y);
        ctx.moveTo(B.x, B.y); ctx.lineTo(M_AC.x, M_AC.y);
        ctx.moveTo(C.x, C.y); ctx.lineTo(M_AB.x, M_AB.y);
        ctx.stroke();

        const G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
        drawPoint(G, '#3b82f6', 'G (Trọng tâm)');
      }

      // 3. Phân giác & Tâm nội tiếp I
      if (showBisectors) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const D_A = getBisectorD(A, B, C);
        const D_B = getBisectorD(B, C, A);
        const D_C = getBisectorD(C, A, B);

        ctx.beginPath();
        ctx.moveTo(A.x, A.y); ctx.lineTo(D_A.x, D_A.y);
        ctx.moveTo(B.x, B.y); ctx.lineTo(D_B.x, D_B.y);
        ctx.moveTo(C.x, C.y); ctx.lineTo(D_C.x, D_C.y);
        ctx.stroke();

        const I = {
          x: (a * A.x + b * B.x + c * C.x) / (a + b + c),
          y: (a * A.y + b * B.y + c * C.y) / (a + b + c)
        };
        drawPoint(I, '#10b981', 'I (Tâm nội tiếp)');

        const r = pointToLineDistance(I, B, C);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(I.x, I.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Trung trực & Tâm ngoại tiếp O
      if (showPerpendiculars) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const vBC_normal = { x: B.y - C.y, y: C.x - B.x };
        const pBC_end = { x: M_BC.x + vBC_normal.x, y: M_BC.y + vBC_normal.y };

        const vAC_normal = { x: A.y - C.y, y: C.x - A.x };
        const pAC_end = { x: M_AC.x + vAC_normal.x, y: M_AC.y + vAC_normal.y };

        const O = getLineIntersection(M_BC, pBC_end, M_AC, pAC_end);

        if (O) {
          ctx.beginPath();
          ctx.moveTo(M_BC.x, M_BC.y); ctx.lineTo(O.x, O.y);
          ctx.moveTo(M_AC.x, M_AC.y); ctx.lineTo(O.x, O.y);
          ctx.moveTo(M_AB.x, M_AB.y); ctx.lineTo(O.x, O.y);
          ctx.stroke();

          drawPoint(O, '#f59e0b', 'O (Tâm ngoại tiếp)');

          const R = getDistance(O, A);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(O.x, O.y, R, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 5. Đường cao & Trực tâm H
      if (showAltitudes) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const H_A = getProjectionPoint(A, B, C);
        const H_B = getProjectionPoint(B, A, C);
        const H_C = getProjectionPoint(C, A, B);

        const H = getLineIntersection(A, H_A, B, H_B);

        if (H) {
          ctx.beginPath();
          ctx.moveTo(A.x, A.y); ctx.lineTo(H_A.x, H_A.y);
          ctx.moveTo(B.x, B.y); ctx.lineTo(H_B.x, H_B.y);
          ctx.moveTo(C.x, C.y); ctx.lineTo(H_C.x, H_C.y);
          ctx.moveTo(H_A.x, H_A.y); ctx.lineTo(H.x, H.y);
          ctx.stroke();

          drawPoint(H, '#ef4444', 'H (Trực tâm)');

          drawRightAngleSymbol(A, H_A, B);
          drawRightAngleSymbol(B, H_B, A);
        }
      }

      // 6. Các đỉnh để kéo thả
      ctx.setLineDash([]);
      drawVertex(A, 'A');
      drawVertex(B, 'B');
      drawVertex(C, 'C');
    };

    // --- SỰ KIỆN CHUỘT / CẢM ỨNG ---
    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const checkVertexClick = (pos) => {
      const { A, B, C } = stateRef.current;
      const radius = 15;
      if (getDistance(pos, A) < radius) return 'A';
      if (getDistance(pos, B) < radius) return 'B';
      if (getDistance(pos, C) < radius) return 'C';
      return null;
    };

    const onStart = (e) => {
      const pos = getMousePos(e);
      stateRef.current.activeVertex = checkVertexClick(pos);
    };

    const onMove = (e) => {
      if (!stateRef.current.activeVertex) return;
      e.preventDefault();
      const pos = getMousePos(e);
      
      const padding = 15;
      const limitX = Math.max(padding, Math.min(canvas.width - padding, pos.x));
      const limitY = Math.max(padding, Math.min(canvas.height - padding, pos.y));
      
      if (stateRef.current.activeVertex === 'A') {
        stateRef.current.A = { x: limitX, y: limitY };
      } else if (stateRef.current.activeVertex === 'B') {
        stateRef.current.B = { x: limitX, y: limitY };
      } else if (stateRef.current.activeVertex === 'C') {
        stateRef.current.C = { x: limitX, y: limitY };
      }
      draw();
    };

    const onEnd = () => {
      stateRef.current.activeVertex = null;
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    // Kích hoạt hàm vẽ lần đầu
    draw();

    // Dọn dẹp sự kiện
    return () => {
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);

      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [showMedians, showBisectors, showPerpendiculars, showAltitudes]); 
  // Hook chạy lại mỗi khi thay đổi các checkbox

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
              cursor: 'crosshair',
              touchAction: 'none'
            }}
          />
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted, #9ca3af)' }}>
            * Nhấp chuột và kéo thả các chấm tròn màu đỏ ở đỉnh A, B, C để xoay chuyển tam giác.
          </div>
        </div>

        {/* Bảng điều khiển */}
        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color, #374151)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Đường đồng quy hiển thị
          </h3>
          
          <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color, #374151)' }}>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={showMedians} onChange={() => setShowMedians(!showMedians)} />
              <span className="color-dot" style={{ background: '#3b82f6', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Đường trung tuyến (Trọng tâm G)</span>
            </label>
            
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={showBisectors} onChange={() => setShowBisectors(!showBisectors)} />
              <span className="color-dot" style={{ background: '#10b981', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Đường phân giác (Tâm nội tiếp I)</span>
            </label>
            
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={showPerpendiculars} onChange={() => setShowPerpendiculars(!showPerpendiculars)} />
              <span className="color-dot" style={{ background: '#f59e0b', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Đường trung trực (Tâm ngoại tiếp O)</span>
            </label>
            
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={showAltitudes} onChange={() => setShowAltitudes(!showAltitudes)} />
              <span className="color-dot" style={{ background: '#ef4444', width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Đường cao (Trực tâm H)</span>
            </label>
          </div>

          {/* Bảng thuyết minh sư phạm */}
          <div className="control-group" style={{ marginTop: '1.5rem' }}>
            <label className="control-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Đặc điểm sư phạm</label>
            <div className="info-box" style={{ background: '#1f2937', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              Kéo các đỉnh để thấy:
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>Trọng tâm G</strong> luôn nằm trong tam giác và chia trung tuyến theo tỷ lệ 2/3.</li>
                <li><strong>Trực tâm H</strong> và <strong>Tâm ngoại tiếp O</strong> có thể nằm ngoài tam giác nếu tam giác là tam giác tù.</li>
                <li>Trong tam giác đều, cả 4 tâm <strong>G, I, O, H</strong> trùng nhau.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}