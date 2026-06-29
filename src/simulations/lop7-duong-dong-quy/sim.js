const canvas = document.getElementById('triangleCanvas');
const ctx = canvas.getContext('2d');

const chkMedians = document.getElementById('chkMedians');
const chkBisectors = document.getElementById('chkBisectors');
const chkPerpendiculars = document.getElementById('chkPerpendiculars');
const chkAltitudes = document.getElementById('chkAltitudes');

// Định nghĩa 3 đỉnh mặc định
let A = { x: 230, y: 70 };
let B = { x: 80, y: 320 };
let C = { x: 380, y: 320 };

// Xử lý kéo thả đỉnh
let activeVertex = null;

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function getDistance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function checkVertexClick(pos) {
  const radius = 15; // vùng click nhạy
  if (getDistance(pos, A) < radius) return 'A';
  if (getDistance(pos, B) < radius) return 'B';
  if (getDistance(pos, C) < radius) return 'C';
  return null;
}

// Sự kiện chuột / cảm ứng
function onStart(e) {
  const pos = getMousePos(e);
  activeVertex = checkVertexClick(pos);
}

function onMove(e) {
  if (!activeVertex) return;
  e.preventDefault();
  const pos = getMousePos(e);
  
  // Khống chế đỉnh nằm trong vùng canvas
  const padding = 15;
  const limitX = Math.max(padding, Math.min(canvas.width - padding, pos.x));
  const limitY = Math.max(padding, Math.min(canvas.height - padding, pos.y));
  
  if (activeVertex === 'A') { A.x = limitX; A.y = limitY; }
  else if (activeVertex === 'B') { B.x = limitX; B.y = limitY; }
  else if (activeVertex === 'C') { C.x = limitX; C.y = limitY; }
  
  draw();
}

function onEnd() {
  activeVertex = null;
}

canvas.addEventListener('mousedown', onStart);
canvas.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onEnd);

canvas.addEventListener('touchstart', onStart, { passive: false });
canvas.addEventListener('touchmove', onMove, { passive: false });
window.addEventListener('touchend', onEnd);

// ---- THUẬT TOÁN HÌNH HỌC ----

// Khoảng cách từ một điểm tới đường thẳng đi qua hai điểm
function pointToLineDistance(p, l1, l2) {
  const num = Math.abs((l2.y - l1.y) * p.x - (l2.x - l1.x) * p.y + l2.x * l1.y - l2.y * l1.x);
  const den = Math.hypot(l2.y - l1.y, l2.x - l1.x);
  return den === 0 ? 0 : num / den;
}

// Chân đường cao hạ từ p xuống đường thẳng l1-l2
function getProjectionPoint(p, l1, l2) {
  const dx = l2.x - l1.x;
  const dy = l2.y - l1.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return l1;
  const t = ((p.x - l1.x) * dx + (p.y - l1.y) * dy) / len2;
  return {
    x: l1.x + t * dx,
    y: l1.y + t * dy
  };
}

// Giao điểm hai đường thẳng p1-p2 và p3-p4
function getLineIntersection(p1, p2, p3, p4) {
  const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (den === 0) return null; // Song song
  
  const numX = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x));
  const numY = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x));
  
  return {
    x: numX / den,
    y: numY / den
  };
}

// Giao điểm đường phân giác trong góc A với cạnh BC
function getBisectorD(pA, pB, pC) {
  const c = getDistance(pA, pB);
  const b = getDistance(pA, pC);
  // D chia BC theo tỉ lệ c/b
  return {
    x: (b * pB.x + c * pC.x) / (b + c),
    y: (b * pB.y + c * pC.y) / (b + c)
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Độ dài 3 cạnh
  const a = getDistance(B, C);
  const b = getDistance(A, C);
  const c = getDistance(A, B);

  // Trung điểm các cạnh
  const M_BC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const M_AC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const M_AB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

  // 1. VẼ TAM GIÁC CHÍNH ABC
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.closePath();
  ctx.stroke();

  // 2. VẼ ĐƯỜNG TRUNG TUYẾN & TRỌNG TÂM G
  if (chkMedians.checked) {
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'; // Blue
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(A.x, A.y); ctx.lineTo(M_BC.x, M_BC.y);
    ctx.moveTo(B.x, B.y); ctx.lineTo(M_AC.x, M_AC.y);
    ctx.moveTo(C.x, C.y); ctx.lineTo(M_AB.x, M_AB.y);
    ctx.stroke();

    // Trọng tâm G
    const G = {
      x: (A.x + B.x + C.x) / 3,
      y: (A.y + B.y + C.y) / 3
    };
    drawPoint(G, '#3b82f6', 'G (Trọng tâm)');
  }

  // 3. VẼ ĐƯỜNG PHÂN GIÁC & TÂM NỘI TIẾP I
  if (chkBisectors.checked) {
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)'; // Emerald
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Tìm chân đường phân giác trên các cạnh
    const D_A = getBisectorD(A, B, C);
    const D_B = getBisectorD(B, C, A);
    const D_C = getBisectorD(C, A, B);

    ctx.beginPath();
    ctx.moveTo(A.x, A.y); ctx.lineTo(D_A.x, D_A.y);
    ctx.moveTo(B.x, B.y); ctx.lineTo(D_B.x, D_B.y);
    ctx.moveTo(C.x, C.y); ctx.lineTo(D_C.x, D_C.y);
    ctx.stroke();

    // Tâm nội tiếp I
    const I = {
      x: (a * A.x + b * B.x + c * C.x) / (a + b + c),
      y: (a * A.y + b * B.y + c * C.y) / (a + b + c)
    };
    drawPoint(I, '#10b981', 'I (Tâm nội tiếp)');

    // Vẽ đường tròn nội tiếp
    const r = pointToLineDistance(I, B, C);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(I.x, I.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 4. VẼ ĐƯỜNG TRUNG TRỰC & TÂM NGOẠI TIẾP O
  let O = null;
  if (chkPerpendiculars.checked) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)'; // Amber
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Tạo các đường trung trực bằng cách vẽ vuông góc từ trung điểm
    // Ta tìm giao điểm O trước để dễ giới hạn nét vẽ trung trực từ trung điểm đến O
    // Vector chỉ phương cạnh BC: (C.x - B.x, C.y - B.y) => Pháp tuyến: (B.y - C.y, C.x - B.x)
    const vBC_normal = { x: B.y - C.y, y: C.x - B.x };
    const pBC_end = { x: M_BC.x + vBC_normal.x, y: M_BC.y + vBC_normal.y };

    const vAC_normal = { x: A.y - C.y, y: C.x - A.x };
    const pAC_end = { x: M_AC.x + vAC_normal.x, y: M_AC.y + vAC_normal.y };

    O = getLineIntersection(M_BC, pBC_end, M_AC, pAC_end);

    if (O) {
      ctx.beginPath();
      ctx.moveTo(M_BC.x, M_BC.y); ctx.lineTo(O.x, O.y);
      ctx.moveTo(M_AC.x, M_AC.y); ctx.lineTo(O.x, O.y);
      ctx.moveTo(M_AB.x, M_AB.y); ctx.lineTo(O.x, O.y);
      ctx.stroke();

      drawPoint(O, '#f59e0b', 'O (Tâm ngoại tiếp)');

      // Vẽ đường tròn ngoại tiếp
      const R = getDistance(O, A);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(O.x, O.y, R, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 5. VẼ ĐƯỜNG CAO & TRỰC TÂM H
  if (chkAltitudes.checked) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // Red
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Chân đường cao hạ từ các đỉnh
    const H_A = getProjectionPoint(A, B, C);
    const H_B = getProjectionPoint(B, A, C);
    const H_C = getProjectionPoint(C, A, B);

    // Tính Trực tâm H
    // Sử dụng Euler Line: H = 3G - 2O (nếu có O), hoặc tìm giao điểm đường cao
    const H = getLineIntersection(A, H_A, B, H_B);

    if (H) {
      ctx.beginPath();
      // Vẽ kéo dài đường cao từ đỉnh đến chân đường cao
      ctx.moveTo(A.x, A.y); ctx.lineTo(H_A.x, H_A.y);
      ctx.moveTo(B.x, B.y); ctx.lineTo(H_B.x, H_B.y);
      ctx.moveTo(C.x, C.y); ctx.lineTo(H_C.x, H_C.y);
      // Vẽ thêm vạch nối tới Trực tâm nếu H nằm ngoài tam giác
      ctx.moveTo(H_A.x, H_A.y); ctx.lineTo(H.x, H.y);
      ctx.stroke();

      drawPoint(H, '#ef4444', 'H (Trực tâm)');

      // Vẽ ký hiệu góc vuông ở chân đường cao
      drawRightAngleSymbol(A, H_A, B);
      drawRightAngleSymbol(B, H_B, A);
    }
  }

  // 6. VẼ ĐỈNH TAM GIÁC ĐỂ KÉO THẢ (NỔI BẬT LÊN TRÊN CÙNG)
  ctx.setLineDash([]);
  
  // Đỉnh A
  drawVertex(A, 'A');
  // Đỉnh B
  drawVertex(B, 'B');
  // Đỉnh C
  drawVertex(C, 'C');
}

function drawVertex(p, label) {
  ctx.fillStyle = '#ef4444'; // Đỏ nổi bật để nhận biết điểm kéo thả
  ctx.beginPath();
  ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Tên đỉnh
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let labelY = p.y - 18;
  if (p.y < 50) labelY = p.y + 18; // tránh nhãn bị tràn mép trên
  ctx.fillText(label, p.x, labelY);
}

function drawPoint(p, color, label) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(label, p.x + 8, p.y - 4);
}

// Vẽ ký hiệu góc vuông nhỏ tại chân đường cao H_A
function drawRightAngleSymbol(fromPt, footPt, sidePt) {
  // Vector chỉ hướng từ chân đường cao đến đỉnh và đến góc đáy
  const dX = fromPt.x - footPt.x;
  const dY = fromPt.y - footPt.y;
  const dS_X = sidePt.x - footPt.x;
  const dS_Y = sidePt.y - footPt.y;

  const lenH = Math.hypot(dX, dY);
  const lenS = Math.hypot(dS_X, dS_Y);

  if (lenH === 0 || lenS === 0) return;

  // Lấy độ dài ký hiệu 8px
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
}

// Đăng ký sự kiện checkbox thay đổi
[chkMedians, chkBisectors, chkPerpendiculars, chkAltitudes].forEach(chk => {
  chk.addEventListener('change', draw);
});

// Chạy vẽ lần đầu
draw();
