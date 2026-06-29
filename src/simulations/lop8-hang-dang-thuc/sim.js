const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');

const sliderA = document.getElementById('sliderA');
const sliderB = document.getElementById('sliderB');

const valA = document.getElementById('valA');
const valB = document.getElementById('valB');

const calcA2Expr = document.getElementById('calcA2Expr');
const calcA2Val = document.getElementById('calcA2Val');
const calcB2Expr = document.getElementById('calcB2Expr');
const calcB2Val = document.getElementById('calcB2Val');
const calc2AbExpr = document.getElementById('calc2AbExpr');
const calc2AbVal = document.getElementById('calc2AbVal');
const calcSumExpr = document.getElementById('calcSumExpr');
const calcSumVal = document.getElementById('calcSumVal');
const calcBigExpr = document.getElementById('calcBigExpr');
const calcBigVal = document.getElementById('calcBigVal');

function updateSimulation() {
  const a = parseInt(sliderA.value);
  const b = parseInt(sliderB.value);

  // Cập nhật text giá trị bên ngoài
  valA.textContent = a;
  valB.textContent = b;

  // Tính toán
  const a2 = a * a;
  const b2 = b * b;
  const ab = a * b;
  const sumSmall = a2 + 2 * ab + b2;
  const bigSquare = (a + b) * (a + b);

  // Cập nhật bảng tính toán
  calcA2Expr.textContent = `${a}²`;
  calcA2Val.textContent = a2.toLocaleString();
  
  calcB2Expr.textContent = `${b}²`;
  calcB2Val.textContent = b2.toLocaleString();

  calc2AbExpr.textContent = `2 × ${a} × ${b}`;
  calc2AbVal.textContent = (2 * ab).toLocaleString();

  calcSumVal.textContent = sumSmall.toLocaleString();

  calcBigExpr.textContent = `(${a} + ${b})²`;
  calcBigVal.textContent = bigSquare.toLocaleString();

  // Vẽ hình trên Canvas
  draw(a, b);
}

function draw(a, b) {
  // Xóa canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cấu hình vùng vẽ
  const padding = 50;
  const drawWidth = canvas.width - 2 * padding; // 320 px
  const drawHeight = canvas.height - 2 * padding; // 320 px

  // Tổng kích thước thực tế
  const totalReal = a + b;
  
  // Tỉ lệ scale để chuyển đổi kích thước thực sang px trên canvas
  const scale = drawWidth / totalReal;

  // Kích thước vẽ px của a và b
  const wA = a * scale;
  const wB = b * scale;

  // Tọa độ bắt đầu
  const startX = padding;
  const startY = padding;

  // Màu sắc thiết kế
  const colorA2 = 'rgba(16, 185, 129, 0.8)'; // Emerald
  const colorB2 = 'rgba(139, 92, 246, 0.8)'; // Violet
  const colorAB = 'rgba(245, 158, 11, 0.8)';  // Amber
  
  const textLight = '#f8fafc';
  const textDark = '#0f172a';

  // Vẽ 4 mảnh nhỏ
  
  // 1. Mảnh a² (Top-Left)
  ctx.fillStyle = colorA2;
  ctx.fillRect(startX, startY, wA, wA);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, startY, wA, wA);

  // 2. Mảnh ab thứ nhất (Top-Right)
  ctx.fillStyle = colorAB;
  ctx.fillRect(startX + wA, startY, wB, wA);
  ctx.strokeRect(startX + wA, startY, wB, wA);

  // 3. Mảnh ab thứ hai (Bottom-Left)
  ctx.fillStyle = colorAB;
  ctx.fillRect(startX, startY + wA, wA, wB);
  ctx.strokeRect(startX, startY + wA, wA, wB);

  // 4. Mảnh b² (Bottom-Right)
  ctx.fillStyle = colorB2;
  ctx.fillRect(startX + wA, startY + wA, wB, wB);
  ctx.strokeRect(startX + wA, startY + wA, wB, wB);

  // Vẽ viền ngoài cho hình vuông lớn (a+b)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(startX, startY, drawWidth, drawHeight);

  // Vẽ chữ mô tả diện tích vào lòng các hình (nếu đủ diện tích)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px Inter, sans-serif';

  // Nhãn a²
  if (wA > 40) {
    ctx.fillStyle = textLight;
    ctx.fillText('a²', startX + wA/2, startY + wA/2);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`${a}×${a}`, startX + wA/2, startY + wA/2 + 20);
  }

  ctx.font = 'bold 16px Inter, sans-serif';
  // Nhãn ab (phải)
  if (wA > 30 && wB > 30) {
    ctx.fillStyle = textLight;
    ctx.fillText('ab', startX + wA + wB/2, startY + wA/2);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`${a}×${b}`, startX + wA + wB/2, startY + wA/2 + 20);
  }

  ctx.font = 'bold 16px Inter, sans-serif';
  // Nhãn ab (dưới)
  if (wA > 30 && wB > 30) {
    ctx.fillStyle = textLight;
    ctx.fillText('ab', startX + wA/2, startY + wA + wB/2);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`${b}×${a}`, startX + wA/2, startY + wA + wB/2 + 20);
  }

  ctx.font = 'bold 16px Inter, sans-serif';
  // Nhãn b²
  if (wB > 40) {
    ctx.fillStyle = textLight;
    ctx.fillText('b²', startX + wA + wB/2, startY + wA + wB/2);
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`${b}×${b}`, startX + wA + wB/2, startY + wA + wB/2 + 20);
  }

  // --- VẼ CÁC KÍCH THƯỚC ĐO (MEASUREMENT LABELS / RULERS) ---
  ctx.strokeStyle = '#94a3b8';
  ctx.fillStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.font = '13px Inter, sans-serif';

  // 1. Phía trên: đoạn a và đoạn b
  // Đoạn a phía trên
  drawRuler(startX, startY - 15, startX + wA, startY - 15, 'a');
  // Đoạn b phía trên
  drawRuler(startX + wA, startY - 15, startX + drawWidth, startY - 15, 'b');
  // Đoạn a+b trên cùng
  drawRuler(startX, startY - 35, startX + drawWidth, startY - 35, 'a + b', true);

  // 2. Phía bên trái: đoạn a và đoạn b
  // Đoạn a bên trái
  drawVerticalRuler(startX - 15, startY, startX - 15, startY + wA, 'a');
  // Đoạn b bên trái
  drawVerticalRuler(startX - 15, startY + wA, startX - 15, startY + drawHeight, 'b');
  // Đoạn a+b bên ngoài cùng bên trái
  drawVerticalRuler(startX - 35, startY, startX - 35, startY + drawHeight, 'a + b', true);
}

// Hàm vẽ thước đo ngang (Ruler)
function drawRuler(x1, y1, x2, y2, label, isBig = false) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  // Vẽ các vạch chặn ở 2 đầu
  ctx.moveTo(x1, y1 - 4);
  ctx.lineTo(x1, y1 + 4);
  ctx.moveTo(x2, y2 - 4);
  ctx.lineTo(x2, y2 + 4);
  ctx.stroke();

  // Vẽ chữ nhãn ở giữa đoạn
  ctx.fillStyle = isBig ? '#60a5fa' : '#94a3b8';
  ctx.font = isBig ? 'bold 12px Inter' : '12px Inter';
  ctx.clearRect((x1 + x2)/2 - 12 - (isBig ? 15 : 0), y1 - 8, 24 + (isBig ? 30 : 0), 16); // Xóa nền phía dưới chữ để không đè vạch kẻ
  ctx.fillText(label, (x1 + x2)/2, y1);
}

// Hàm vẽ thước đo dọc (Ruler)
function drawVerticalRuler(x1, y1, x2, y2, label, isBig = false) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  // Vẽ các vạch chặn ở 2 đầu
  ctx.moveTo(x1 - 4, y1);
  ctx.lineTo(x1 + 4, y1);
  ctx.moveTo(x2 - 4, y2);
  ctx.lineTo(x2 + 4, y2);
  ctx.stroke();

  // Vẽ chữ nhãn ở giữa đoạn
  ctx.fillStyle = isBig ? '#60a5fa' : '#94a3b8';
  ctx.font = isBig ? 'bold 12px Inter' : '12px Inter';
  ctx.save();
  ctx.translate(x1, (y1 + y2)/2);
  ctx.rotate(-Math.PI / 2);
  ctx.clearRect(-12 - (isBig ? 15 : 0), -8, 24 + (isBig ? 30 : 0), 16);
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

// Đăng ký sự kiện lắng nghe thanh trượt thay đổi
sliderA.addEventListener('input', updateSimulation);
sliderB.addEventListener('input', updateSimulation);

// Khởi chạy mô phỏng lần đầu
updateSimulation();
