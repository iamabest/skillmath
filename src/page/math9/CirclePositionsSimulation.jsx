// import React, { useState, useEffect, useRef } from 'react';
// import PageLayout from '../../components/PageLayout';

// /* ==========================================================
//    HẰNG SỐ
// ========================================================== */

// const CANVAS_WIDTH = 500;
// const CANVAS_HEIGHT = 450;
// const CENTER_Y = 225;
// const MARGIN = 25;
// const EPS = 1;

// /* ==========================================================
//    HÀM XÁC ĐỊNH VỊ TRÍ TƯƠNG ĐỐI
// ========================================================== */

// function getCircleRelationship(r1, r2, d) {
//   const R = Math.max(r1, r2);
//   const r = Math.min(r1, r2);

//   if (d === 0) {
//     if (Math.abs(R - r) < EPS) {
//       return {
//         type: "coincident",
//         name: "Trùng nhau",
//         desc: "Hai đường tròn có cùng tâm và cùng bán kính."
//       };
//     }

//     return {
//       type: "concentric",
//       name: "Đồng tâm",
//       desc: "Hai đường tròn có cùng tâm nhưng bán kính khác nhau."
//     };
//   }

//   if (Math.abs(d - (R + r)) <= EPS) {
//     return {
//       type: "external_tangent",
//       name: "Tiếp xúc ngoài",
//       desc: "Hai đường tròn có một điểm chung."
//     };
//   }

//   if (Math.abs(d - (R - r)) <= EPS) {
//     return {
//       type: "internal_tangent",
//       name: "Tiếp xúc trong",
//       desc: "Hai đường tròn có một điểm chung."
//     };
//   }

//   if (d > R + r) {
//     return {
//       type: "outside",
//       name: "Ngoài nhau",
//       desc: "Hai đường tròn không có điểm chung."
//     };
//   }

//   if (d < R - r) {
//     return {
//       type: "inside",
//       name: "Đựng nhau",
//       desc: "Đường tròn nhỏ nằm hoàn toàn trong đường tròn lớn."
//     };
//   }

//   return {
//     type: "intersect",
//     name: "Cắt nhau",
//     desc: "Hai đường tròn có hai điểm chung."
//   };
// }

// /* ==========================================================
//    TÍNH GIAO ĐIỂM HAI ĐƯỜNG TRÒN
// ========================================================== */

// function getIntersectionPoints(O1, R, O2, r) {

//   const dx = O2.x - O1.x;
//   const dy = O2.y - O1.y;

//   const d = Math.hypot(dx, dy);

//   if (d === 0) return [];

//   if (d > R + r) return [];

//   if (d < Math.abs(R - r)) return [];

//   const a = (R * R - r * r + d * d) / (2 * d);

//   const h2 = R * R - a * a;

//   if (h2 < 0) return [];

//   const h = Math.sqrt(h2);

//   const xm = O1.x + (a * dx) / d;
//   const ym = O1.y + (a * dy) / d;

//   const rx = -dy * (h / d);
//   const ry = dx * (h / d);

//   const P1 = {
//     x: xm + rx,
//     y: ym + ry
//   };

//   const P2 = {
//     x: xm - rx,
//     y: ym - ry
//   };

//   if (h < EPS) return [P1];

//   return [P1, P2];
// }

// /* ==========================================================
//    TỰ ĐỘNG CĂN CHỈNH TÂM
// ========================================================== */

// function getCenters(r1, r2, distance) {

//   const left = {
//     x: MARGIN + r1,
//     y: CENTER_Y
//   };

//   const maxDistance =
//     CANVAS_WIDTH -
//     MARGIN -
//     r2 -
//     left.x;

//   const d = Math.min(distance, Math.max(0, maxDistance));

//   return {
//     O1: left,
//     O2: {
//       x: left.x + d,
//       y: CENTER_Y
//     },
//     displayDistance: d
//   };
// }

// /* ==========================================================
//    VẼ LƯỚI
// ========================================================== */

// function drawGrid(ctx) {

//   ctx.strokeStyle = "rgba(255,255,255,0.03)";
//   ctx.lineWidth = 1;

//   for (let i = 0; i <= CANVAS_WIDTH; i += 25) {

//     ctx.beginPath();
//     ctx.moveTo(i, 0);
//     ctx.lineTo(i, CANVAS_HEIGHT);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(0, i);
//     ctx.lineTo(CANVAS_WIDTH, i);
//     ctx.stroke();
//   }
// }

// /* ==========================================================
//    VẼ MỘT ĐƯỜNG TRÒN
// ========================================================== */

// function drawCircle(ctx, center, radius, stroke, fill) {

//   ctx.beginPath();

//   ctx.arc(
//     center.x,
//     center.y,
//     radius,
//     0,
//     Math.PI * 2
//   );

//   ctx.fillStyle = fill;
//   ctx.fill();

//   ctx.lineWidth = 3;
//   ctx.strokeStyle = stroke;
//   ctx.stroke();
// }

// /* ==========================================================
//    VẼ TÂM
// ========================================================== */

// function drawCenter(ctx, center, label) {

//   ctx.fillStyle = "#fff";

//   ctx.beginPath();
//   ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
//   ctx.fill();

//   ctx.font = "bold 12px Inter";
//   ctx.textAlign = "center";
//   ctx.fillText(label, center.x, center.y + 18);
// }

// /* ==========================================================
//    VẼ GIAO ĐIỂM
// ========================================================== */

// function drawIntersectionPoints(ctx, points) {

//   ctx.fillStyle = "#22c55e";

//   points.forEach((p, index) => {

//     ctx.beginPath();
//     ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
//     ctx.fill();

//     ctx.font = "11px Inter";
//     ctx.fillText(
//       `I${index + 1}`,
//       p.x,
//       p.y - 12
//     );
//   });

// }export default function CirclePositionsSimulation() {

//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);

//   /* ==========================================================
//       STATE
//   ========================================================== */

//   const [targetR1, setTargetR1] = useState(80);
//   const [targetR2, setTargetR2] = useState(50);
//   const [targetD, setTargetD] = useState(160);

//   // Giá trị dùng để animation
//   const [r1, setR1] = useState(80);
//   const [r2, setR2] = useState(50);
//   const [d, setD] = useState(160);

//   /* ==========================================================
//       ANIMATION
//   ========================================================== */

//   useEffect(() => {

//     const animate = () => {

//       setR1(old => {

//         const next = old + (targetR1 - old) * 0.15;

//         if (Math.abs(next - targetR1) < 0.1)
//           return targetR1;

//         return next;
//       });

//       setR2(old => {

//         const next = old + (targetR2 - old) * 0.15;

//         if (Math.abs(next - targetR2) < 0.1)
//           return targetR2;

//         return next;
//       });

//       setD(old => {

//         const next = old + (targetD - old) * 0.15;

//         if (Math.abs(next - targetD) < 0.1)
//           return targetD;

//         return next;
//       });

//       animationRef.current = requestAnimationFrame(animate);

//     };

//     animationRef.current = requestAnimationFrame(animate);

//     return () => cancelAnimationFrame(animationRef.current);

//   }, [targetR1, targetR2, targetD]);

//   /* ==========================================================
//       THÔNG TIN
//   ========================================================== */

//   const relationship = getCircleRelationship(r1, r2, d);

//   const { O1, O2, displayDistance } =
//     getCenters(r1, r2, d);

//   const intersections =
//     getIntersectionPoints(
//       O1,
//       r1,
//       O2,
//       r2
//     );

//   /* ==========================================================
//       VẼ CANVAS
//   ========================================================== */

//   useEffect(() => {

//     const canvas = canvasRef.current;

//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");

//     if (!ctx) return;

//     ctx.clearRect(
//       0,
//       0,
//       CANVAS_WIDTH,
//       CANVAS_HEIGHT
//     );

//     drawGrid(ctx);

//     /*---------------------------------------
//         Đường nối tâm
//     ---------------------------------------*/

//     ctx.strokeStyle = "#fdba74";

//     ctx.lineWidth = 2;

//     ctx.setLineDash([6, 5]);

//     ctx.beginPath();

//     ctx.moveTo(O1.x, O1.y);

//     ctx.lineTo(O2.x, O2.y);

//     ctx.stroke();

//     ctx.setLineDash([]);

//     /*---------------------------------------
//         Đường tròn
//     ---------------------------------------*/

//     drawCircle(
//       ctx,
//       O1,
//       r1,
//       "#3b82f6",
//       "rgba(59,130,246,.08)"
//     );

//     drawCircle(
//       ctx,
//       O2,
//       r2,
//       "#ec4899",
//       "rgba(236,72,153,.08)"
//     );

//     /*---------------------------------------
//         Bán kính
//     ---------------------------------------*/

//     ctx.strokeStyle = "#60a5fa";

//     ctx.beginPath();

//     ctx.moveTo(O1.x, O1.y);

//     ctx.lineTo(O1.x, O1.y - r1);

//     ctx.stroke();

//     ctx.strokeStyle = "#f472b6";

//     ctx.beginPath();

//     ctx.moveTo(O2.x, O2.y);

//     ctx.lineTo(O2.x, O2.y - r2);

//     ctx.stroke();

//     /*---------------------------------------
//         Tâm
//     ---------------------------------------*/

//     drawCenter(ctx, O1, "O₁");

//     drawCenter(ctx, O2, "O₂");

//     /*---------------------------------------
//         Hiện khoảng cách
//     ---------------------------------------*/

//     ctx.fillStyle = "#fdba74";

//     ctx.font = "bold 13px Inter";

//     ctx.textAlign = "center";

//     ctx.fillText(
//       `d = ${displayDistance.toFixed(1)}`,
//       (O1.x + O2.x) / 2,
//       O1.y - 12
//     );

//     /*---------------------------------------
//         Hiện giao điểm
//     ---------------------------------------*/

//     if (intersections.length > 0) {

//       drawIntersectionPoints(
//         ctx,
//         intersections
//       );

//     }

//     /*---------------------------------------
//         Vẽ dây chung
//     ---------------------------------------*/

//     if (intersections.length === 2) {

//       ctx.strokeStyle = "#22c55e";

//       ctx.lineWidth = 2;

//       ctx.beginPath();

//       ctx.moveTo(
//         intersections[0].x,
//         intersections[0].y
//       );

//       ctx.lineTo(
//         intersections[1].x,
//         intersections[1].y
//       );

//       ctx.stroke();

//     }

//     /*---------------------------------------
//         Tiếp xúc
//     ---------------------------------------*/

//     if (
//       relationship.type ===
//       "external_tangent" ||
//       relationship.type ===
//       "internal_tangent"
//     ) {

//       const p = intersections[0];

//       if (p) {

//         ctx.fillStyle = "#fde047";

//         ctx.beginPath();

//         ctx.arc(
//           p.x,
//           p.y,
//           7,
//           0,
//           Math.PI * 2
//         );

//         ctx.fill();

//       }

//     }

//   }, [
//     r1,
//     r2,
//     d,
//     relationship
//   ]);
//   return (
//   <PageLayout>
//     <div className="simulation-container">

//       {/* ================= Canvas ================= */}

//       <div className="canvas-panel">

//         <canvas
//           ref={canvasRef}
//           width={CANVAS_WIDTH}
//           height={CANVAS_HEIGHT}
//           className="math-canvas"
//           style={{
//             background: "#111827",
//             border: "2px dashed rgba(255,255,255,.1)",
//             borderRadius: 8,
//             maxWidth: "100%",
//             height: "auto",
//             boxShadow: "inset 0 0 20px rgba(0,0,0,.55)"
//           }}
//         />

//         <div
//           style={{
//             marginTop: 12,
//             color: "#9ca3af",
//             fontSize: ".82rem"
//           }}
//         >
//           Thay đổi bán kính hoặc khoảng cách tâm để quan sát sự thay đổi
//           vị trí tương đối giữa hai đường tròn.
//         </div>

//       </div>

//       {/* ================= Điều khiển ================= */}

//       <div className="control-panel">

//         <h3
//           style={{
//             fontSize: "1.2rem",
//             borderBottom: "1px solid #374151",
//             paddingBottom: ".6rem",
//             marginBottom: "1rem"
//           }}
//         >
//           Vị trí tương đối của hai đường tròn
//         </h3>

//         {/* Badge */}

//         <div
//           className="stat-box"
//           style={{
//             background: "rgba(236,72,153,.06)",
//             borderColor: "#ec4899",
//             marginBottom: "1rem"
//           }}
//         >
//           <div
//             style={{
//               color: "#ec4899",
//               fontSize: ".72rem",
//               textTransform: "uppercase",
//               letterSpacing: ".08em"
//             }}
//           >
//             Trạng thái
//           </div>

//           <h2
//             style={{
//               color: "#fff",
//               margin: "6px 0"
//             }}
//           >
//             {relationship.name}
//           </h2>

//           <div
//             style={{
//               color: "#d1d5db",
//               fontSize: ".85rem"
//             }}
//           >
//             {relationship.desc}
//           </div>

//         </div>

//         {/* Slider */}

//         <div className="control-group">

//           <label>Bán kính R</label>

//           <input
//             type="range"
//             min={40}
//             max={120}
//             value={targetR1}
//             onChange={(e)=>
//               setTargetR1(Number(e.target.value))
//             }
//           />

//           <div>{targetR1}</div>

//           <label>Bán kính r</label>

//           <input
//             type="range"
//             min={20}
//             max={100}
//             value={targetR2}
//             onChange={(e)=>
//               setTargetR2(Number(e.target.value))
//             }
//           />

//           <div>{targetR2}</div>

//           <label>Khoảng cách d</label>

//           <input
//             type="range"
//             min={0}
//             max={260}
//             value={targetD}
//             onChange={(e)=>
//               setTargetD(Number(e.target.value))
//             }
//           />

//           <div>{targetD}</div>

//         </div>

//         {/* Nút đặt nhanh */}

//         <div
//           style={{
//             marginTop:20,
//             display:"grid",
//             gridTemplateColumns:"1fr 1fr",
//             gap:8
//           }}
//         >

//           <button
//             className="btn-action"
//             onClick={()=>{
//               setTargetR1(80);
//               setTargetR2(50);
//               setTargetD(170);
//             }}
//           >
//             Ngoài nhau
//           </button>

//           <button
//             className="btn-action"
//             onClick={()=>{
//               setTargetR1(80);
//               setTargetR2(50);
//               setTargetD(130);
//             }}
//           >
//             Tiếp xúc ngoài
//           </button>

//           <button
//             className="btn-action"
//             onClick={()=>{
//               setTargetR1(80);
//               setTargetR2(50);
//               setTargetD(95);
//             }}
//           >
//             Cắt nhau
//           </button>

//           <button
//             className="btn-action"
//             onClick={()=>{
//               setTargetR1(80);
//               setTargetR2(50);
//               setTargetD(30);
//             }}
//           >
//             Tiếp xúc trong
//           </button>

//           <button
//             className="btn-action"
//             onClick={()=>{
//               setTargetR1(80);
//               setTargetR2(50);
//               setTargetD(15);
//             }}
//           >
//             Đựng nhau
//           </button>

//           <button
//             className="btn-action"
//             onClick={()=>{
//               setTargetR1(80);
//               setTargetR2(50);
//               setTargetD(0);
//             }}
//           >
//             Đồng tâm
//           </button>

//           <button
//             className="btn-action"
//             onClick={()=>{
//               setTargetR1(80);
//               setTargetR2(80);
//               setTargetD(0);
//             }}
//           >
//             Trùng nhau
//           </button>

//         </div>

//         {/* Công thức */}

//         <div
//           className="info-box"
//           style={{
//             marginTop:20
//           }}
//         >

//           <strong>Kiểm tra điều kiện</strong>

//           <div
//             style={{
//               marginTop:10,
//               display:"flex",
//               flexDirection:"column",
//               gap:6,
//               fontFamily:"monospace"
//             }}
//           >

//             <div>
//               d = <strong>{d.toFixed(1)}</strong>
//             </div>

//             <div>
//               R + r =
//               {" "}
//               <strong>
//                 {(r1+r2).toFixed(1)}
//               </strong>
//             </div>

//             <div>
//               |R - r| =
//               {" "}
//               <strong>
//                 {Math.abs(r1-r2).toFixed(1)}
//               </strong>
//             </div>

//             <hr />

//             <div
//               style={{
//                 color:"#22c55e",
//                 fontWeight:"bold"
//               }}
//             >
//               {relationship.name}
//             </div>

//             <div
//               style={{
//                 color:"#9ca3af"
//               }}
//             >
//               {relationship.desc}
//             </div>

//           </div>

//         </div>

//       </div>

//     </div>

//   </PageLayout>
// );
// }


import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function CirclePositionsSimulation() {
  const canvasRef = useRef(null);

  // Trạng thái các thông số
  const [r1, setR1] = useState(80); // Bán kính đường tròn 1 (R)
  const [r2, setR2] = useState(50); // Bán kính đường tròn 2 (r)
  const [d, setD] = useState(160);   // Khoảng cách tâm

  // Hàm xác định vị trí tương đối
  const getCircleRelationship = (radius1, radius2, dist) => {
    const R = Math.max(radius1, radius2);
    const r = Math.min(radius1, radius2);

    if (dist === 0) {
      if (radius1 === radius2) {
        return { name: 'Trùng nhau', desc: 'Hai đường tròn trùng khít nhau.', formula: 'd = 0, R = r' };
      }
      return { name: 'Đồng tâm', desc: 'Hai đường tròn có cùng tâm nhưng bán kính khác nhau.', formula: 'd = 0, R ≠ r' };
    }
    
    // Sử dụng sai số epsilon nhỏ (để mượt mà khi kéo slider số nguyên)
    if (dist > R + r) {
      return { name: 'Ngoài nhau', desc: 'Hai đường tròn không có điểm chung và nằm ngoài nhau.', formula: 'd > R + r' };
    }
    if (Math.abs(dist - (R + r)) <= 1) {
      return { name: 'Tiếp xúc ngoài', desc: 'Hai đường tròn có duy nhất 1 điểm chung và nằm ngoài nhau.', formula: 'd = R + r' };
    }
    if (dist < R - r) {
      return { name: 'Đựng nhau', desc: 'Đường tròn nhỏ nằm hoàn toàn bên trong đường tròn lớn.', formula: 'd < R - r' };
    }
    if (Math.abs(dist - (R - r)) <= 1) {
      return { name: 'Tiếp xúc trong', desc: 'Hai đường tròn có duy nhất 1 điểm chung, một đường nằm trong đường kia.', formula: 'd = R - r' };
    }
    return { name: 'Cắt nhau', desc: 'Hai đường tròn có đúng 2 điểm chung.', formula: 'R - r < d < R + r' };
  };

  const relationship = getCircleRelationship(r1, r2, d);

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

    // --- TỰ ĐỘNG CĂN CHỈNH VỊ TRÍ TRÊN CANVAS ---
    // Giữ cho toàn bộ hệ thống 2 đường tròn luôn nằm trung tâm theo chiều ngang
    const centerX = W / 2;
    const centerY = H / 2;
    const O1 = { x: centerX - d / 2, y: centerY };
    const O2 = { x: centerX + d / 2, y: centerY };

    // --- 1. Vẽ đường nối tâm ---
    ctx.strokeStyle = '#fdba74'; // cam
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(O1.x, O1.y);
    ctx.lineTo(O2.x, O2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- 2. Vẽ Đường tròn 1 (màu xanh dương) ---
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(O1.x, O1.y, r1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bán kính R1 (vẽ hướng lên trên góc 45 độ để tránh đè chữ)
    const angle1 = -Math.PI / 4;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(O1.x, O1.y);
    ctx.lineTo(O1.x + r1 * Math.cos(angle1), O1.y + r1 * Math.sin(angle1));
    ctx.stroke();
    
    ctx.fillStyle = '#60a5fa';
    ctx.font = '11px Inter';
    ctx.fillText(`R = ${r1}`, O1.x + (r1/2) * Math.cos(angle1) - 10, O1.y + (r1/2) * Math.sin(angle1) - 5);

    // --- 3. Vẽ Đường tròn 2 (màu hồng) ---
    ctx.strokeStyle = '#ec4899';
    ctx.fillStyle = 'rgba(236, 72, 153, 0.06)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(O2.x, O2.y, r2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bán kính R2
    const angle2 = -Math.PI * 3 / 4;
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(O2.x, O2.y);
    ctx.lineTo(O2.x + r2 * Math.cos(angle2), O2.y + r2 * Math.sin(angle2));
    ctx.stroke();
    
    ctx.fillStyle = '#f472b6';
    ctx.font = '11px Inter';
    ctx.fillText(`r = ${r2}`, O2.x + (r2/2) * Math.cos(angle2) - 10, O2.y + (r2/2) * Math.sin(angle2) - 5);

    // --- 4. TÍNH VÀ VẼ GIAO ĐIỂM / TIẾP ĐIỂM ---
    const R = Math.max(r1, r2);
    const r = Math.min(r1, r2);

    // Điểm tương tác (giao điểm hoặc tiếp điểm)
    let pointsToDraw = [];

    if (d > 0) {
      if (Math.abs(d - (r1 + r2)) <= 1) {
        // Tiếp xúc ngoài: Điểm nằm trên đoạn O1O2, cách O1 một khoảng r1
        const px = O1.x + (r1 / d) * (O2.x - O1.x);
        const py = O1.y;
        pointsToDraw.push({ x: px, y: py, label: 'Tiếp điểm P' });
      } else if (Math.abs(d - Math.abs(r1 - r2)) <= 1) {
        // Tiếp xúc trong: Điểm nằm trên đường thẳng O1O2
        const sign = r1 > r2 ? 1 : -1;
        const px = O1.x + sign * (r1 / d) * (O2.x - O1.x);
        const py = O1.y;
        pointsToDraw.push({ x: px, y: py, label: 'Tiếp điểm P' });
      } else if (d < r1 + r2 && d > Math.abs(r1 - r2)) {
        // Cắt nhau: Tính toán tọa độ 2 giao điểm bằng công thức lượng hình tam giác O1-O2-GiaoĐiểm
        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));

        // Điểm hạ hình chiếu của giao điểm xuống O1O2
        const p2x = O1.x + (a / d) * (O2.x - O1.x);
        
        pointsToDraw.push({ x: p2x, y: O1.y - h, label: 'A' });
        pointsToDraw.push({ x: p2x, y: O1.y + h, label: 'B' });
      }
    }

    // Vẽ các điểm giao/tiếp xúc phát hiện được
    pointsToDraw.forEach(pt => {
      ctx.fillStyle = '#f59e0b'; // Màu vàng hổ phách nổi bật
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(pt.label, pt.x, pt.y - 10);
    });

    // --- 5. Vẽ điểm tâm O1, O2 ---
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(O1.x, O1.y, 4, 0, Math.PI * 2);
    ctx.arc(O2.x, O2.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('O1', O1.x, O1.y + 18);
    ctx.fillText('O2', O2.x, O2.y + 18);

    // Hiển thị giá trị số khoảng cách d ở giữa đoạn nối tâm
    ctx.fillStyle = '#fdba74';
    ctx.font = '600 12px Inter';
    ctx.fillText(`d = ${d}`, O1.x + d/2, O1.y - 8);

    // --- 6. CÔNG THỨC ĐỘNG TRÊN CANVAS ---
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    let dynamicMath = `Hệ thức: d = ${d}`;
    if (relationship.formula.includes('>')) {
      dynamicMath += ` > R + r (${r1 + r2})`;
    } else if (relationship.formula.includes('<') && relationship.formula.includes('R - r')) {
      dynamicMath += ` (Thỏa mãn: ${Math.abs(r1 - r2)} < ${d} < ${r1 + r2})`;
    } else if (relationship.formula.includes('<')) {
      dynamicMath += ` < R - r (${Math.abs(r1 - r2)})`;
    } else if (relationship.formula.includes('=')) {
      dynamicMath += ` = ${relationship.formula.split('=')[1].trim() === 'R + r' ? r1+r2 : Math.abs(r1-r2)}`;
    }
    ctx.fillText(dynamicMath, 20, 35);

  }, [r1, r2, d, relationship]);

  return (
    <PageLayout>
      <div className="simulation-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '1rem' }}>
        
        <div className="canvas-panel" style={{ flex: '1 1 500px' }}>
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
            * Hệ thống tự động dịch chuyển tâm để mô phỏng luôn nằm gọn trong khung hình.
          </div>
        </div>

        <div className="control-panel" style={{ flex: '1 1 300px', minWidth: '300px' }}>
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#fff' }}>
            Mô phỏng Vị trí tương đối
          </h3>

          {/* Badge nhận diện vị trí tương đối */}
          <div className="stat-box" style={{ border: '1px solid #ec4899', borderRadius: '8px', padding: '1rem', background: 'rgba(236, 72, 153, 0.05)', marginBottom: '1.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái hiện tại:</span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: '4px 0' }}>{relationship.name}</h4>
            <p style={{ fontSize: '0.85rem', color: '#d1d5db', margin: 0 }}>{relationship.desc}</p>
            <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#f59e0b', fontFamily: 'monospace' }}>Điều kiện: {relationship.formula}</div>
          </div>

          {/* Thanh trượt điều chỉnh */}
          <div className="control-group" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
            <label style={{ color: '#fff', fontWeight: '500', fontSize: '0.9rem' }}>Điều chỉnh thông số:</label>
            
            <div style={{ marginTop: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span>Bán kính R (Đường tròn 1)</span>
                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{r1} px</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                value={r1}
                onChange={e => setR1(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            <div style={{ marginTop: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span>Bán kính r (Đường tròn 2)</span>
                <span style={{ color: '#ec4899', fontWeight: 'bold' }}>{r2} px</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={r2}
                onChange={e => setR2(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ec4899' }}
              />
            </div>

            <div style={{ marginTop: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span>Khoảng cách tâm d</span>
                <span style={{ color: '#fdba74', fontWeight: 'bold' }}>{d} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="260"
                value={d}
                onChange={e => setD(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#fdba74' }}
              />
            </div>
          </div>

          {/* So sánh toán học số thực */}
          <div className="info-box" style={{ fontSize: '0.85rem', color: '#9ca3af', background: '#1f2937', padding: '0.8rem', borderRadius: '6px' }}>
            <strong style={{ color: '#fff' }}>Thông số kiểm chứng:</strong>
            <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontFamily: 'monospace' }}>
              <div>• Khoảng cách d = <strong style={{ color: '#fdba74' }}>{d}</strong></div>
              <div>• Tổng R + r = {r1} + {r2} = <strong style={{ color: '#fff' }}>{r1 + r2}</strong></div>
              <div>• Hiệu R - r = |{r1} - {r2}| = <strong style={{ color: '#fff' }}>{Math.abs(r1 - r2)}</strong></div>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}