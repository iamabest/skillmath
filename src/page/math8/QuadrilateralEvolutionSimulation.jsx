import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

// Hàm tính khoảng cách giữa 2 điểm
const getDist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

// Hàm tính góc tạo bởi 3 điểm (góc ở đỉnh p2)
const getAngle = (p1, p2, p3) => {
  const d12 = getDist(p1, p2);
  const d23 = getDist(p2, p3);
  const d13 = getDist(p1, p3);
  if (d12 === 0 || d23 === 0) return 0;
  const cos = (d12 * d12 + d23 * d23 - d13 * d13) / (2 * d12 * d23);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
};

// Hàm kiểm tra song song giữa AB và CD
const isParallel = (pA, pB, pC, pD, tolerance = 8) => {
  const angleAB = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const angleCD = Math.atan2(pD.y - pC.y, pD.x - pC.x);
  let diff = Math.abs(angleAB - angleCD) * 180 / Math.PI;
  diff = diff % 180;
  if (diff > 90) diff = 180 - diff;
  return diff < tolerance;
};

// Phân loại tứ giác dựa trên tọa độ đỉnh A, B, C, D
const classifyQuadrilateral = (A, B, C, D) => {
  if (!A || !B || !C || !D) return { name: 'Đang khởi tạo', desc: 'Đang tải tọa độ...' };

  const sideAB = getDist(A, B);
  const sideBC = getDist(B, C);
  const sideCD = getDist(C, D);
  const sideDA = getDist(D, A);

  const diagAC = getDist(A, C);
  const diagBD = getDist(B, D);

  const AB_parallel_CD = isParallel(A, B, D, C); 
  const AD_parallel_BC = isParallel(A, D, B, C); 

  const sideTol = 15;
  const sidesEqualAll = 
    Math.abs(sideAB - sideBC) < sideTol &&
    Math.abs(sideBC - sideCD) < sideTol &&
    Math.abs(sideCD - sideDA) < sideTol;

  const oppositeSidesEqual = 
    Math.abs(sideAB - sideCD) < sideTol && 
    Math.abs(sideBC - sideDA) < sideTol;

  const angleTol = 10;
  const angleA = getAngle(D, A, B);
  const angleB = getAngle(A, B, C);
  const angleC = getAngle(B, C, D);
  const angleD = getAngle(C, D, A);

  const hasRightAngle = 
    Math.abs(angleA - 90) < angleTol || 
    Math.abs(angleB - 90) < angleTol || 
    Math.abs(angleC - 90) < angleTol || 
    Math.abs(angleD - 90) < angleTol;

  const isDegenerate = 
    isParallel(A, B, B, C) || 
    isParallel(B, C, C, D) || 
    isParallel(C, D, D, A) || 
    isParallel(D, A, A, B);

  if (isDegenerate) {
    return { name: 'Tứ giác suy biến', desc: 'Các đỉnh đang thẳng hàng hoặc chồng chéo.' };
  }

  if (sidesEqualAll && hasRightAngle) {
    return { name: 'Hình vuông', desc: 'Tứ giác có 4 cạnh bằng nhau và 4 góc vuông.' };
  }

  if (sidesEqualAll) {
    return { name: 'Hình thoi', desc: 'Tứ giác có 4 cạnh bằng nhau.' };
  }

  if (oppositeSidesEqual && AD_parallel_BC && AB_parallel_CD && hasRightAngle) {
    return { name: 'Hình chữ nhật', desc: 'Tứ giác có 4 góc vuông.' };
  }

  if (AD_parallel_BC && AB_parallel_CD) {
    return { name: 'Hình bình hành', desc: 'Tứ giác có các cặp cạnh đối song song.' };
  }

  if (AB_parallel_CD) {
    const diagonalsEqual = Math.abs(diagAC - diagBD) < sideTol;
    const baseAnglesEqual = Math.abs(angleD - angleC) < angleTol;
    if (diagonalsEqual || baseAnglesEqual) {
      return { name: 'Hình thang cân', desc: 'Hình thang có hai đường chéo bằng nhau.' };
    }
    return { name: 'Hình thang', desc: 'Tứ giác có một cặp cạnh đối song song.' };
  }

  if (AD_parallel_BC) {
    const diagonalsEqual = Math.abs(diagAC - diagBD) < sideTol;
    const baseAnglesEqual = Math.abs(angleA - angleD) < angleTol;
    if (diagonalsEqual || baseAnglesEqual) {
      return { name: 'Hình thang cân', desc: 'Hình thang có hai đường chéo bằng nhau.' };
    }
    return { name: 'Hình thang', desc: 'Tứ giác có một cặp cạnh đối song song.' };
  }

  return { name: 'Tứ giác thường', desc: 'Tứ giác lồi không có tính chất đặc biệt.' };
};

const PRESETS = {
  normal: { A: { x: 130, y: 120 }, B: { x: 370, y: 150 }, C: { x: 330, y: 350 }, D: { x: 150, y: 320 } },
  trapezoid: { A: { x: 180, y: 120 }, B: { x: 320, y: 120 }, C: { x: 380, y: 320 }, D: { x: 120, y: 320 } },
  parallelogram: { A: { x: 180, y: 120 }, B: { x: 360, y: 120 }, C: { x: 300, y: 320 }, D: { x: 120, y: 320 } },
  rectangle: { A: { x: 150, y: 120 }, B: { x: 350, y: 120 }, C: { x: 350, y: 320 }, D: { x: 150, y: 320 } },
  rhombus: { A: { x: 250, y: 100 }, B: { x: 360, y: 220 }, C: { x: 250, y: 340 }, D: { x: 140, y: 220 } },
  square: { A: { x: 150, y: 120 }, B: { x: 350, y: 120 }, C: { x: 350, y: 320 }, D: { x: 150, y: 320 } }
};

export default function QuadrilateralEvolutionSimulation() {
  const canvasRef = useRef(null);
  const morphFrameRef = useRef(null);

  const [vertices, setVertices] = useState(PRESETS.normal);
  const [activeVertex, setActiveVertex] = useState(null);
  const [targetPreset, setTargetPreset] = useState(null);

  // [SỬA ĐỔI QUAN TRỌNG]: Đồng bộ liên tục tọa độ vào Ref để phục vụ vòng lặp Animation an toàn
  const verticesRef = useRef(vertices);
  verticesRef.current = vertices;

  const shapeInfo = classifyQuadrilateral(vertices.A, vertices.B, vertices.C, vertices.D);

  // [SỬA ĐỔI QUAN TRỌNG]: Viết lại cơ chế Morphing bằng Ref chặn đứng lỗi Stale Closure
  const startMorph = (presetKey) => {
    cancelAnimationFrame(morphFrameRef.current);
    const target = PRESETS[presetKey];
    if (!target) return;
    setTargetPreset(presetKey);

    const step = () => {
      const prev = verticesRef.current;
      const next = {};
      let done = true;

      for (const k of ['A', 'B', 'C', 'D']) {
        if (!prev[k] || !target[k]) continue;
        const dx = target[k].x - prev[k].x;
        const dy = target[k].y - prev[k].y;
        
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          done = false;
          next[k] = { x: prev[k].x + dx * 0.15, y: prev[k].y + dy * 0.15 };
        } else {
          next[k] = { x: target[k].x, y: target[k].y };
        }
      }

      setVertices(next);

      if (!done) {
        morphFrameRef.current = requestAnimationFrame(step);
      } else {
        setTargetPreset(null);
      }
    };

    morphFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(morphFrameRef.current);
  }, []);

  // Vẽ Canvas với màng lọc bảo vệ bảo mật Context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // [BẢO VỆ]: Tránh crash nếu Three.js xung đột chiếm dụng Canvas trước

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Vẽ lưới nền mờ
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 25) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }

    const { A, B, C, D } = vertices;
    if (!A || !B || !C || !D) return;

    // Vẽ đa giác chính
    ctx.fillStyle = 'rgba(167, 139, 250, 0.12)'; 
    ctx.strokeStyle = '#a78bfa'; 
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.lineTo(D.x, D.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vẽ đường chéo nét đứt
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(C.x, C.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(D.x, D.y); ctx.stroke();
    ctx.setLineDash([]);

    const drawVertex = (p, label) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, p.x, p.y - 16);
    };

    drawVertex(A, 'A');
    drawVertex(B, 'B');
    drawVertex(C, 'C');
    drawVertex(D, 'D');

  }, [vertices]);

  // Bộ lọc tính toán vị trí chuột/Touch an toàn tuyệt đối
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (targetPreset) return;
    const pos = getMousePos(e);
    const radius = 18;

    for (const k of ['A', 'B', 'C', 'D']) {
      if (vertices[k] && getDist(pos, vertices[k]) < radius) {
        setActiveVertex(k);
        break;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!activeVertex) return;
    e.preventDefault(); 
    const pos = getMousePos(e);

    const padding = 20;
    const limitX = Math.max(padding, Math.min(480, pos.x));
    const limitY = Math.max(padding, Math.min(430, pos.y));

    setVertices(prev => ({
      ...prev,
      [activeVertex]: { x: limitX, y: limitY }
    }));
  };

  const handleMouseUp = () => {
    setActiveVertex(null);
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} 
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            style={{
              background: '#111827',
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)',
              maxWidth: '100%',
              height: 'auto',
              cursor: activeVertex ? 'grabbing' : 'grab',
              touchAction: 'none'
            }}
          />
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            * Bạn có thể kéo tự do các đỉnh <strong>A, B, C, D</strong> để tạo nên loại tứ giác mong muốn.
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Cỗ máy tiến hóa Tứ giác
          </h3>

          <div className="stat-box" style={{ borderColor: '#a78bfa', background: 'rgba(167, 139, 250, 0.05)', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hình nhận diện được:</span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: '4px 0' }}>{shapeInfo.name}</h4>
            <p style={{ fontSize: '0.85rem', color: '#d1d5db', margin: 0 }}>{shapeInfo.desc}</p>
          </div>

          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Tiến hóa nhanh (Morphing):</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem' }}>
              <button className="btn-action" onClick={() => startMorph('normal')}>Tứ giác thường</button>
              <button className="btn-action" onClick={() => startMorph('trapezoid')}>Hình thang</button>
              <button className="btn-action" onClick={() => startMorph('parallelogram')}>Hình bình hành</button>
              <button className="btn-action" onClick={() => startMorph('rectangle')}>Hình chữ nhật</button>
              <button className="btn-action" onClick={() => startMorph('rhombus')}>Hình thoi</button>
              <button className="btn-action" onClick={() => startMorph('square')}>Hình vuông</button>
            </div>
          </div>

          <div className="info-box" style={{ fontSize: '0.85rem' }}>
            <strong>Cây tiến hóa Tứ giác:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><strong>Hình thang</strong> + Cạnh bên song song ➡ <strong>Hình bình hành</strong></li>
              <li><strong>Hình bình hành</strong> + 1 góc vuông ➡ <strong>Hình chữ nhật</strong></li>
              <li><strong>Hình bình hành</strong> + 2 cạnh kề bằng nhau ➡ <strong>Hình thoi</strong></li>
              <li><strong>Hình chữ nhật</strong> + 2 cạnh kề bằng nhau ➡ <strong>Hình vuông</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}