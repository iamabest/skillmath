import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function TransversalAnglesSimulation() {
  const canvasRef = useRef(null);

  // Trạng thái điều khiển
  const [isParallel, setIsParallel] = useState(true);
  const [lineAngle, setLineAngle] = useState(0); 
  const [line2AngleOffset, setLine2AngleOffset] = useState(15); 
  const [transversalAngle, setTransversalAngle] = useState(60); 
  const [highlightType, setHighlightType] = useState('alternate_interior'); 

  // Vẽ Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Lưới mờ nền
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 25) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }

    // --- TÍNH TOÁN TOÁN HỌC (TỊNH TIẾN ĐIỂM) ---
    const angle1 = (lineAngle * Math.PI) / 180;
    const angle2 = isParallel ? angle1 : ((lineAngle + line2AngleOffset) * Math.PI) / 180;
    const angleTrans = (transversalAngle * Math.PI) / 180;

    const tan1 = Math.tan(angle1);
    const tan2 = Math.tan(angle2);
    const tanT = Math.tan(angleTrans);

    const xA = 250 - 75 / (tanT - tan1);
    const yA = 150 + tan1 * (xA - 250);

    const xB = 250 + 75 / (tanT - tan2);
    const yB = 300 + tan2 * (xB - 250);

    const intersectionA = { x: xA, y: yA };
    const intersectionB = { x: xB, y: yB };

    // --- Vẽ các đường thẳng ---
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.strokeStyle = '#3b82f6'; // d1
    ctx.beginPath(); ctx.moveTo(intersectionA.x - 300 * Math.cos(angle1), intersectionA.y - 300 * Math.sin(angle1)); ctx.lineTo(intersectionA.x + 300 * Math.cos(angle1), intersectionA.y + 300 * Math.sin(angle1)); ctx.stroke();

    ctx.strokeStyle = '#10b981'; // d2
    ctx.beginPath(); ctx.moveTo(intersectionB.x - 300 * Math.cos(angle2), intersectionB.y - 300 * Math.sin(angle2)); ctx.lineTo(intersectionB.x + 300 * Math.cos(angle2), intersectionB.y + 300 * Math.sin(angle2)); ctx.stroke();

    ctx.strokeStyle = '#f59e0b'; // c
    ctx.beginPath(); ctx.moveTo(250 - 300 * Math.cos(angleTrans), 225 - 300 * Math.sin(angleTrans)); ctx.lineTo(250 + 300 * Math.cos(angleTrans), 225 + 300 * Math.sin(angleTrans)); ctx.stroke();

    // Tên các đường thẳng
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 12px Inter';
    ctx.fillText('d1', intersectionA.x + 250 * Math.cos(angle1), intersectionA.y + 250 * Math.sin(angle1) - 10);
    ctx.fillText('d2', intersectionB.x + 250 * Math.cos(angle2), intersectionB.y + 250 * Math.sin(angle2) - 10);
    ctx.fillText('c', 250 + 260 * Math.cos(angleTrans) + 10, 225 + 260 * Math.sin(angleTrans));

    // --- LOGIC QUY ĐỔI 4 GÓC TẠI MỖI GIAO ĐIỂM ---
    // Để dễ kiểm soát, ta tính tọa độ radian cho từng cung tròn: 
    // 1: Trên Phải, 2: Trên Trái, 3: Dưới Trái, 4: Dưới Phải
    
    // Tại đỉnh A
    const arcA1 = [angleTrans + Math.PI, angle1 + 2 * Math.PI]; 
    const arcA2 = [angle1 + Math.PI, angleTrans + Math.PI];
    const arcA3 = [angleTrans, angle1 + Math.PI];
    const arcA4 = [angle1, angleTrans];

    // Tại đỉnh B
    const arcB1 = [angleTrans + Math.PI, angle2 + 2 * Math.PI];
    const arcB2 = [angle2 + Math.PI, angleTrans + Math.PI];
    const arcB3 = [angleTrans, angle2 + Math.PI];
    const arcB4 = [angle2, angleTrans];

    // Độ lớn bằng số (để in ra nhãn)
    const valA4 = Math.round(Math.abs((transversalAngle - lineAngle) % 180));
    const valA3 = 180 - valA4;
    const valA2 = valA4;
    const valA1 = valA3;

    const actualLine2Angle = isParallel ? lineAngle : lineAngle + line2AngleOffset;
    const valB4 = Math.round(Math.abs((transversalAngle - actualLine2Angle) % 180));
    const valB3 = 180 - valB4;
    const valB2 = valB4;
    const valB1 = valB3;

    // Hàm vẽ cung tròn
    const drawAngleArc = (center, startRad, endRad, color, label) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2; // Nền mờ cho góc
      
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.arc(center.x, center.y, 40, startRad, endRad);
      ctx.closePath();
      ctx.fill();
      
      ctx.globalAlpha = 1.0; 
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 40, startRad, endRad);
      ctx.stroke();

      // Vẽ chữ (chia trung bình góc để đặt text vào giữa)
      const midRad = (startRad + endRad) / 2;
      ctx.fillStyle = color;
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Khung nền đen cho text dễ đọc
      const textX = center.x + 58 * Math.cos(midRad);
      const textY = center.y + 58 * Math.sin(midRad);
      
      ctx.fillText(label, textX, textY);
    };

    // Bảng màu cho các cặp góc
    const colorPink = '#f472b6';
    const colorBlue = '#60a5fa';
    const colorYellow = '#fbbf24';
    const colorGreen = '#34d399';

    // --- HIỂN THỊ HIGHLIGHT CÁC CẶP GÓC ---
    if (highlightType === 'alternate_interior') {
      // 2 cặp góc so le trong: (A3, B1) và (A4, B2)
      drawAngleArc(intersectionA, arcA3[0], arcA3[1], colorPink, `A3 (${valA3}°)`);
      drawAngleArc(intersectionB, arcB1[0], arcB1[1], colorPink, `B1 (${valB1}°)`);
      
      drawAngleArc(intersectionA, arcA4[0], arcA4[1], colorBlue, `A4 (${valA4}°)`);
      drawAngleArc(intersectionB, arcB2[0], arcB2[1], colorBlue, `B2 (${valB2}°)`);
      
    } else if (highlightType === 'corresponding') {
      // 4 cặp góc đồng vị
      drawAngleArc(intersectionA, arcA1[0], arcA1[1], colorPink, `A1 (${valA1}°)`);
      drawAngleArc(intersectionB, arcB1[0], arcB1[1], colorPink, `B1 (${valB1}°)`);
      
      drawAngleArc(intersectionA, arcA2[0], arcA2[1], colorBlue, `A2 (${valA2}°)`);
      drawAngleArc(intersectionB, arcB2[0], arcB2[1], colorBlue, `B2 (${valB2}°)`);
      
      drawAngleArc(intersectionA, arcA3[0], arcA3[1], colorYellow, `A3 (${valA3}°)`);
      drawAngleArc(intersectionB, arcB3[0], arcB3[1], colorYellow, `B3 (${valB3}°)`);

      drawAngleArc(intersectionA, arcA4[0], arcA4[1], colorGreen, `A4 (${valA4}°)`);
      drawAngleArc(intersectionB, arcB4[0], arcB4[1], colorGreen, `B4 (${valB4}°)`);
      
    } else if (highlightType === 'consecutive_interior') {
      // 2 cặp góc trong cùng phía: (A3, B2) và (A4, B1)
      drawAngleArc(intersectionA, arcA3[0], arcA3[1], colorPink, `A3 (${valA3}°)`);
      drawAngleArc(intersectionB, arcB2[0], arcB2[1], colorPink, `B2 (${valB2}°)`);
      
      drawAngleArc(intersectionA, arcA4[0], arcA4[1], colorBlue, `A4 (${valA4}°)`);
      drawAngleArc(intersectionB, arcB1[0], arcB1[1], colorBlue, `B1 (${valB1}°)`);
    }

    // Vẽ tâm giao điểm
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(intersectionA.x, intersectionA.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(intersectionB.x, intersectionB.y, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Inter';
    ctx.fillText('A', intersectionA.x - 18, intersectionA.y - 10);
    ctx.fillText('B', intersectionB.x - 18, intersectionB.y + 20);

  }, [isParallel, lineAngle, line2AngleOffset, transversalAngle, highlightType]);

  const toggleParallel = () => setIsParallel(!isParallel);

  const getRelationText = () => {
    if (!isParallel) {
      return 'Khi hai đường thẳng không song song, các cặp góc so le trong và đồng vị thường KHÔNG bằng nhau, tổng các góc trong cùng phía KHÔNG bằng 180°.';
    }
    if (highlightType === 'alternate_interior') {
      return 'Tính chất: Khi d1 ∥ d2, các cặp góc so le trong BẰNG NHAU (Màu hồng: A3=B1, Màu xanh: A4=B2).';
    }
    if (highlightType === 'corresponding') {
      return 'Tính chất: Khi d1 ∥ d2, các cặp góc đồng vị BẰNG NHAU (Các cặp góc cùng màu có số đo bằng nhau).';
    }
    if (highlightType === 'consecutive_interior') {
      return 'Tính chất: Khi d1 ∥ d2, các cặp góc trong cùng phía BÙ NHAU (Tổng góc hồng = 180°, Tổng góc xanh = 180°).';
    }
    return '';
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        
        <div className="canvas-panel">
          <canvas
            ref={canvasRef}
            width="650"
            height="500"
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
            * Các cặp góc tương ứng được highlight bằng cùng một màu sắc để dễ quan sát.
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Khảo sát các cặp góc
          </h3>

          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Mối quan hệ d1 và d2:</label>
            <div style={{ marginTop: '0.4rem' }}>
              <button
                className={`btn-action ${isParallel ? '' : 'btn-muted'}`}
                onClick={toggleParallel}
                style={{ width: '100%' }}
              >
                {isParallel ? '✓ Hai đường song song (d1 ∥ d2)' : '✗ Hai đường không song song'}
              </button>
            </div>
          </div>

          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Hiển thị cặp góc:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
              <button
                className={`btn-action ${highlightType === 'alternate_interior' ? '' : 'btn-muted'}`}
                onClick={() => setHighlightType('alternate_interior')}
              >
                Các cặp góc So le trong
              </button>
              <button
                className={`btn-action ${highlightType === 'corresponding' ? '' : 'btn-muted'}`}
                onClick={() => setHighlightType('corresponding')}
              >
                Các cặp góc Đồng vị
              </button>
              <button
                className={`btn-action ${highlightType === 'consecutive_interior' ? '' : 'btn-muted'}`}
                onClick={() => setHighlightType('consecutive_interior')}
              >
                Các cặp góc Trong cùng phía
              </button>
            </div>
          </div>

          <div className="control-group" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
            <label className="control-label">Xoay chuyển hệ thống:</label>
            
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Xoay đường d1: {lineAngle}°</label>
              <input type="range" min="-30" max="30" value={lineAngle} onChange={e => setLineAngle(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

            {!isParallel && (
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Lệch d2 so với d1: {line2AngleOffset}°</label>
                <input type="range" min="-30" max="30" value={line2AngleOffset} onChange={e => setLine2AngleOffset(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Xoay cát tuyến c: {transversalAngle}°</label>
              <input type="range" min="45" max="135" value={transversalAngle} onChange={e => setTransversalAngle(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>

          <div className="stat-box" style={{ borderColor: isParallel ? '#4ade80' : '#fbbf24', background: isParallel ? 'rgba(74, 222, 128, 0.05)' : 'rgba(251, 191, 36, 0.05)' }}>
            <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0, lineHeight: '1.4' }}>
              {getRelationText()}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
// import React, { useState, useEffect, useRef } from 'react';
// import PageLayout from '../../components/PageLayout';

// export default function TransversalAnglesSimulation() {
//   const canvasRef = useRef(null);

//   // Trạng thái điều khiển
//   const [isParallel, setIsParallel] = useState(true);
//   const [lineAngle, setLineAngle] = useState(0); // độ nghiêng của d1 (và d2 nếu song song)
//   const [line2AngleOffset, setLine2AngleOffset] = useState(15); // độ lệch nghiêng của d2 khi không song song
//   const [transversalAngle, setTransversalAngle] = useState(60); // cát tuyến c
//   const [highlightType, setHighlightType] = useState('alternate_interior'); // 'alternate_interior', 'corresponding', 'consecutive_interior', 'none'

//   // Vẽ Canvas
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     const W = canvas.width;
//     const H = canvas.height;
//     ctx.clearRect(0, 0, W, H);

//     // Lưới mờ nền
//     ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
//     ctx.lineWidth = 1;
//     for (let i = 0; i < W; i += 25) {
//       ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
//       ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
//     }

//     // --- TÍNH TOÁN TOÁN HỌC (TỊNH TIẾN ĐIỂM) ---
//     const angle1 = (lineAngle * Math.PI) / 180;
//     const angle2 = isParallel ? angle1 : ((lineAngle + line2AngleOffset) * Math.PI) / 180;
//     const angleTrans = (transversalAngle * Math.PI) / 180;

//     const tan1 = Math.tan(angle1);
//     const tan2 = Math.tan(angle2);
//     const tanT = Math.tan(angleTrans);

//     // Tính điểm giao cắt thực tế dựa trên phương trình đường thẳng
//     // Cát tuyến c quay quanh tâm (250, 225).
//     // d1 neo tại y=150 (cách tâm dọc 75px), d2 neo tại y=300 (cách tâm dọc -75px).
//     const xA = 250 - 75 / (tanT - tan1);
//     const yA = 150 + tan1 * (xA - 250);

//     const xB = 250 + 75 / (tanT - tan2);
//     const yB = 300 + tan2 * (xB - 250);

//     const intersectionA = { x: xA, y: yA };
//     const intersectionB = { x: xB, y: yB };

//     // --- Vẽ các đường thẳng ---
//     ctx.lineWidth = 3;
//     ctx.lineCap = 'round';

//     // 1. Vẽ đường thẳng d1
//     ctx.strokeStyle = '#3b82f6'; // xanh dương
//     ctx.beginPath();
//     ctx.moveTo(intersectionA.x - 300 * Math.cos(angle1), intersectionA.y - 300 * Math.sin(angle1));
//     ctx.lineTo(intersectionA.x + 300 * Math.cos(angle1), intersectionA.y + 300 * Math.sin(angle1));
//     ctx.stroke();

//     // 2. Vẽ đường thẳng d2
//     ctx.strokeStyle = '#10b981'; // xanh lá
//     ctx.beginPath();
//     ctx.moveTo(intersectionB.x - 300 * Math.cos(angle2), intersectionB.y - 300 * Math.sin(angle2));
//     ctx.lineTo(intersectionB.x + 300 * Math.cos(angle2), intersectionB.y + 300 * Math.sin(angle2));
//     ctx.stroke();

//     // 3. Vẽ cát tuyến c (xoay quanh tâm 250, 225)
//     ctx.strokeStyle = '#f59e0b'; // vàng cam
//     ctx.beginPath();
//     ctx.moveTo(250 - 300 * Math.cos(angleTrans), 225 - 300 * Math.sin(angleTrans));
//     ctx.lineTo(250 + 300 * Math.cos(angleTrans), 225 + 300 * Math.sin(angleTrans));
//     ctx.stroke();

//     // Tên các đường thẳng
//     ctx.fillStyle = '#9ca3af';
//     ctx.font = 'bold 12px Inter';
//     ctx.fillText('d1', intersectionA.x + 250 * Math.cos(angle1), intersectionA.y + 250 * Math.sin(angle1) - 10);
//     ctx.fillText('d2', intersectionB.x + 250 * Math.cos(angle2), intersectionB.y + 250 * Math.sin(angle2) - 10);
//     ctx.fillText('c', 250 + 260 * Math.cos(angleTrans) + 10, 225 + 260 * Math.sin(angleTrans));

//     // Tính độ lớn góc
//     const actualAngleA = (transversalAngle - lineAngle + 360) % 180;
//     const actualAngleB = isParallel ? actualAngleA : (transversalAngle - (lineAngle + line2AngleOffset) + 360) % 180;

//     // Hàm vẽ cung tròn của góc với fill trong suốt chuẩn xác
//     const drawAngleArc = (center, startRad, endRad, color, label) => {
//       ctx.strokeStyle = color;
//       ctx.fillStyle = color;
      
//       ctx.globalAlpha = 0.15; // Nền mờ
//       ctx.beginPath();
//       ctx.moveTo(center.x, center.y);
//       ctx.arc(center.x, center.y, 35, startRad, endRad);
//       ctx.closePath();
//       ctx.fill();
      
//       ctx.globalAlpha = 1.0; // Viền rõ nét
//       ctx.lineWidth = 2.5;
//       ctx.stroke();

//       // Vẽ text nhãn góc nằm chính giữa phần góc
//       const midRad = (startRad + endRad) / 2;
//       ctx.fillStyle = color;
//       ctx.font = 'bold 10px Inter';
//       ctx.textAlign = 'center';
//       ctx.textBaseline = 'middle';
//       ctx.fillText(label, center.x + 50 * Math.cos(midRad), center.y + 50 * Math.sin(midRad));
//     };

//     // Vector các hướng (để chia vùng góc chuẩn xác bất kể xoay bao nhiêu)
//     const v0 = angle1;                   // Phải d1
//     const v1 = angleTrans;               // Dưới cát tuyến c
//     const v3 = angleTrans + Math.PI;     // Trên cát tuyến c

//     const u0 = angle2;                   // Phải d2
//     const u1 = angleTrans;               // Dưới cát tuyến c
//     const u2 = angle2 + Math.PI;         // Trái d2
//     const u3 = angleTrans + Math.PI;     // Trên cát tuyến c

//     // --- HIỂN THỊ HIGHLIGHT CÁC CẶP GÓC ---
//     if (highlightType === 'alternate_interior') {
//       // Góc so le trong (Góc dưới bên phải A và Góc trên bên trái B)
//       drawAngleArc(intersectionA, v0, v1, '#f472b6', `A3 (${Math.round(actualAngleA)}°)`);
//       drawAngleArc(intersectionB, u2, u3, '#f472b6', `B1 (${Math.round(actualAngleB)}°)`);
      
//     } else if (highlightType === 'corresponding') {
//       // Góc đồng vị (Góc trên bên phải A và Góc trên bên phải B)
//       drawAngleArc(intersectionA, v3, v0 + 2 * Math.PI, '#60a5fa', `A1 (${Math.round(180 - actualAngleA)}°)`);
//       drawAngleArc(intersectionB, u3, u0 + 2 * Math.PI, '#60a5fa', `B1 (${Math.round(180 - actualAngleB)}°)`);
      
//     } else if (highlightType === 'consecutive_interior') {
//       // Góc trong cùng phía (Góc dưới bên phải A và Góc trên bên phải B)
//       drawAngleArc(intersectionA, v0, v1, '#fbbf24', `A3 (${Math.round(actualAngleA)}°)`);
//       drawAngleArc(intersectionB, u3, u0 + 2 * Math.PI, '#fbbf24', `B2 (${Math.round(180 - actualAngleB)}°)`);
//     }

//     // Vẽ chấm tròn tâm giao điểm
//     ctx.fillStyle = '#ffffff';
//     ctx.beginPath();
//     ctx.arc(intersectionA.x, intersectionA.y, 5, 0, Math.PI * 2);
//     ctx.arc(intersectionB.x, intersectionB.y, 5, 0, Math.PI * 2);
//     ctx.fill();

//     ctx.fillStyle = '#ffffff';
//     ctx.font = 'bold 12px Inter';
//     ctx.fillText('A', intersectionA.x - 14, intersectionA.y - 14);
//     ctx.fillText('B', intersectionB.x - 14, intersectionB.y + 20);

//   }, [isParallel, lineAngle, line2AngleOffset, transversalAngle, highlightType]);

//   const toggleParallel = () => {
//     setIsParallel(!isParallel);
//   };

//   const getRelationText = () => {
//     if (!isParallel) {
//       return 'Khi hai đường thẳng không song song, các cặp góc so le trong và đồng vị thường KHÔNG bằng nhau, tổng các góc trong cùng phía KHÔNG bằng 180°.';
//     }
//     if (highlightType === 'alternate_interior') {
//       return 'Tính chất: Khi một cát tuyến cắt hai đường thẳng song song, các góc so le trong BẰNG NHAU (A3 = B1).';
//     }
//     if (highlightType === 'corresponding') {
//       return 'Tính chất: Khi một cát tuyến cắt hai đường thẳng song song, các góc đồng vị BẰNG NHAU (A1 = B1).';
//     }
//     if (highlightType === 'consecutive_interior') {
//       return 'Tính chất: Khi một cát tuyến cắt hai đường thẳng song song, hai góc trong cùng phía BÙ NHAU (Tổng bằng 180°).';
//     }
//     return '';
//   };

//   return (
//     <PageLayout>
//       <div className="simulation-container">
        
//         <div className="canvas-panel">
//           <canvas
//             ref={canvasRef}
//             width="500"
//             height="450"
//             className="math-canvas"
//             style={{
//               background: '#111827',
//               border: '2px dashed rgba(255,255,255,0.1)',
//               borderRadius: '0.5rem',
//               boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)',
//               maxWidth: '100%',
//               height: 'auto',
//             }}
//           />
//           <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
//             * Sử dụng các thanh điều khiển bên phải để xoay đường thẳng và cát tuyến.
//           </div>
//         </div>

//         <div className="control-panel">
//           <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
//             Góc tạo bởi cát tuyến
//           </h3>

//           <div className="control-group" style={{ marginBottom: '1rem' }}>
//             <label className="control-label">Mối quan hệ d1 và d2:</label>
//             <div style={{ marginTop: '0.4rem' }}>
//               <button
//                 className={`btn-action ${isParallel ? '' : 'btn-muted'}`}
//                 onClick={toggleParallel}
//                 style={{ width: '100%' }}
//               >
//                 {isParallel ? '✓ Hai đường song song (d1 ∥ d2)' : '✗ Hai đường không song song'}
//               </button>
//             </div>
//           </div>

//           <div className="control-group" style={{ marginBottom: '1rem' }}>
//             <label className="control-label">Khảo sát góc:</label>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
//               <button
//                 className={`btn-action ${highlightType === 'alternate_interior' ? '' : 'btn-muted'}`}
//                 onClick={() => setHighlightType('alternate_interior')}
//               >
//                 Cặp góc So le trong
//               </button>
//               <button
//                 className={`btn-action ${highlightType === 'corresponding' ? '' : 'btn-muted'}`}
//                 onClick={() => setHighlightType('corresponding')}
//               >
//                 Cặp góc Đồng vị
//               </button>
//               <button
//                 className={`btn-action ${highlightType === 'consecutive_interior' ? '' : 'btn-muted'}`}
//                 onClick={() => setHighlightType('consecutive_interior')}
//               >
//                 Cặp góc Trong cùng phía
//               </button>
//             </div>
//           </div>

//           <div className="control-group" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
//             <label className="control-label">Xoay chuyển các đường thẳng:</label>
            
//             <div style={{ marginTop: '0.5rem' }}>
//               <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Xoay đường d1: {lineAngle}°</label>
//               <input
//                 type="range"
//                 min="-30"
//                 max="30"
//                 value={lineAngle}
//                 onChange={e => setLineAngle(parseInt(e.target.value))}
//                 style={{ width: '100%' }}
//               />
//             </div>

//             {!isParallel && (
//               <div style={{ marginTop: '0.5rem' }}>
//                 <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Lệch d2 so với d1: {line2AngleOffset}°</label>
//                 <input
//                   type="range"
//                   min="-30"
//                   max="30"
//                   value={line2AngleOffset}
//                   onChange={e => setLine2AngleOffset(parseInt(e.target.value))}
//                   style={{ width: '100%' }}
//                 />
//               </div>
//             )}

//             <div style={{ marginTop: '0.5rem' }}>
//               <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Xoay cát tuyến c: {transversalAngle}°</label>
//               <input
//                 type="range"
//                 min="45"
//                 max="135"
//                 value={transversalAngle}
//                 onChange={e => setTransversalAngle(parseInt(e.target.value))}
//                 style={{ width: '100%' }}
//               />
//             </div>
//           </div>

//           <div className="stat-box" style={{ borderColor: isParallel ? '#4ade80' : '#fbbf24', background: isParallel ? 'rgba(74, 222, 128, 0.05)' : 'rgba(251, 191, 36, 0.05)' }}>
//             <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0, lineHeight: '1.4' }}>
//               {getRelationText()}
//             </p>
//           </div>
//         </div>
//       </div>
//     </PageLayout>
//   );
// }