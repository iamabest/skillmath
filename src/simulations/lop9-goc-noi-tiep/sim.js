const canvas = document.getElementById('circleCanvas');
const ctx = canvas.getContext('2d');

const angleInscribedText = document.getElementById('angleInscribed');
const angleCenterText = document.getElementById('angleCenter');

// Cấu hình đường tròn
const O = { x: canvas.width / 2, y: canvas.height / 2 };
const R = 140;

// Các góc của điểm A, B, C (radian)
let thetaA = 4.2; // Đỉnh cung lớn
let thetaB = 0.6; // Biên cung nhỏ B
let thetaC = 2.5; // Biên cung nhỏ C

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

function getPointCoords(theta) {
  return {
    x: O.x + R * Math.cos(theta),
    y: O.y + R * Math.sin(theta)
  };
}

function getDistance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// Xử lý kéo thả các điểm
function checkVertexClick(pos) {
  const radius = 18;
  const ptA = getPointCoords(thetaA);
  const ptB = getPointCoords(thetaB);
  const ptC = getPointCoords(thetaC);

  if (getDistance(pos, ptA) < radius) return 'A';
  if (getDistance(pos, ptB) < radius) return 'B';
  if (getDistance(pos, ptC) < radius) return 'C';
  return null;
}

function onStart(e) {
  const pos = getMousePos(e);
  activeVertex = checkVertexClick(pos);
}

function onMove(e) {
  if (!activeVertex) return;
  e.preventDefault();
  const pos = getMousePos(e);

  // Tính góc từ O đến điểm chuột hiện tại
  const angle = Math.atan2(pos.y - O.y, pos.x - O.x);
  
  if (activeVertex === 'A') {
    thetaA = angle;
  } else if (activeVertex === 'B') {
    thetaB = angle;
  } else if (activeVertex === 'C') {
    thetaC = angle;
  }

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

// ---- TÍNH TOÁN GÓC HÌNH HỌC ----

// Chuẩn hóa góc về khoảng [0, 2*pi)
function normalizeAngle(a) {
  while (a < 0) a += 2 * Math.PI;
  while (a >= 2 * Math.PI) a -= 2 * Math.PI;
  return a;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ptA = getPointCoords(thetaA);
  const ptB = getPointCoords(thetaB);
  const ptC = getPointCoords(thetaC);

  // 1. VẼ ĐƯỜNG TRÒN CHÍNH (TÂM O)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(O.x, O.y, R, 0, Math.PI * 2);
  ctx.stroke();

  // Tâm O
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(O.x, O.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 12px Inter';
  ctx.fillText('O', O.x - 14, O.y + 16);

  // 2. VẼ CUNG BỊ CHẮN BC (Tô đậm để học sinh nhận dạng)
  // Tính góc cung nhỏ BC
  let angleB = normalizeAngle(thetaB);
  let angleC = normalizeAngle(thetaC);
  
  // Xác định hướng vẽ cung nhỏ BC
  let startAngle = angleB;
  let endAngle = angleC;
  let diff = Math.abs(angleB - angleC);
  
  if (diff > Math.PI) {
    // Nếu hiệu góc lớn hơn 180 độ, cung nhỏ đi theo chiều ngược lại
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

  // Vẽ cung bị chắn màu cam đậm
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)'; // Amber
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(O.x, O.y, R, startAngle, endAngle);
  ctx.stroke();

  // 3. VẼ GÓC Ở TÂM BOC
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'; // Blue
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(ptB.x, ptB.y);
  ctx.lineTo(O.x, O.y);
  ctx.lineTo(ptC.x, ptC.y);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Vẽ cung ký hiệu góc ở tâm nhỏ
  let angleBOC_rad = Math.abs(thetaB - thetaC);
  if (angleBOC_rad > Math.PI) angleBOC_rad = 2 * Math.PI - angleBOC_rad;
  const angleBOC_deg = angleBOC_rad * 180 / Math.PI;
  angleCenterText.textContent = `${angleBOC_deg.toFixed(1)}°`;

  // Vẽ vòng cung nhỏ ký hiệu góc ở tâm
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(O.x, O.y, 25, startAngle, endAngle);
  ctx.stroke();

  // 4. VẼ GÓC NỘI TIẾP BAC
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)'; // Emerald
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(ptB.x, ptB.y);
  ctx.lineTo(ptA.x, ptA.y);
  ctx.lineTo(ptC.x, ptC.y);
  ctx.stroke();

  // Tính số đo góc nội tiếp BAC bằng vector
  const vAB = { x: ptB.x - ptA.x, y: ptB.y - ptA.y };
  const vAC = { x: ptC.x - ptA.x, y: ptC.y - ptA.y };
  
  const dotProd = vAB.x * vAC.x + vAB.y * vAC.y;
  const lenAB = Math.hypot(vAB.x, vAB.y);
  const lenAC = Math.hypot(vAC.x, vAC.y);
  
  const cosBAC = dotProd / (lenAB * lenAC);
  const angleBAC_rad = Math.acos(Math.max(-1, Math.min(1, cosBAC)));
  const angleBAC_deg = angleBAC_rad * 180 / Math.PI;
  
  angleInscribedText.textContent = `${angleBAC_deg.toFixed(1)}°`;

  // Vẽ vòng cung nhỏ ký hiệu góc nội tiếp tại đỉnh A
  // Vector chỉ hướng phân giác góc BAC
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

  // 5. VẼ CÁC CHẤM ĐỈNH KÉO THẢ
  
  // Đỉnh B (Màu đỏ)
  drawVertex(ptB, 'B', '#ef4444');
  // Đỉnh C (Màu đỏ)
  drawVertex(ptC, 'C', '#ef4444');
  // Đỉnh A (Màu xanh lá)
  drawVertex(ptA, 'A', '#10b981');
}

function drawVertex(p, label, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ghi nhãn
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Dịch chuyển nhãn ra ngoài đường tròn
  const dx = p.x - O.x;
  const dy = p.y - O.y;
  const len = Math.hypot(dx, dy);
  const offset = 18;
  const labelX = O.x + (len + offset) * (dx / len);
  const labelY = O.y + (len + offset) * (dy / len);
  
  ctx.fillText(label, labelX, labelY);
}

// Chạy vẽ lần đầu
draw();
