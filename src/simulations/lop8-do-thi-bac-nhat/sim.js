const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const sliderA = document.getElementById('sliderA');
const sliderB = document.getElementById('sliderB');

const valA = document.getElementById('valA');
const valB = document.getElementById('valB');

const formulaText = document.getElementById('formulaText');
const propDirection = document.getElementById('propDirection');
const propSlope = document.getElementById('propSlope');
const propOy = document.getElementById('propOy');
const propOx = document.getElementById('propOx');

// Tỉ lệ: 1 đơn vị toán học = 20 pixel trên canvas
const UNIT_PIXELS = 20;

// Tâm tọa độ (0,0) trên Canvas
const centerX = canvas.width / 2;  // 210 px
const centerY = canvas.height / 2; // 210 px

// Hàm chuyển đổi từ tọa độ Toán học sang tọa độ Canvas
function mathToCanvas(x, y) {
  return {
    x: centerX + x * UNIT_PIXELS,
    y: centerY - y * UNIT_PIXELS
  };
}

// Hàm chuyển đổi từ tọa độ Canvas sang tọa độ Toán học
function canvasToMath(cx, cy) {
  return {
    x: (cx - centerX) / UNIT_PIXELS,
    y: (centerY - cy) / UNIT_PIXELS
  };
}

function updateSimulation() {
  const a = parseFloat(sliderA.value);
  const b = parseFloat(sliderB.value);

  // Cập nhật nhãn giá trị
  valA.textContent = a;
  valB.textContent = b;

  // Định dạng công thức phương trình hiển thị
  let aStr = '';
  if (a === 1) aStr = 'x';
  else if (a === -1) aStr = '-x';
  else if (a === 0) aStr = '';
  else aStr = a + 'x';

  let bStr = '';
  if (b > 0) bStr = (a === 0) ? b : ' + ' + b;
  else if (b < 0) bStr = (a === 0) ? b : ' - ' + Math.abs(b);
  else bStr = (a === 0) ? '0' : '';

  formulaText.textContent = aStr + bStr;

  // Cập nhật bảng phân tích tính chất
  if (a > 0) {
    propDirection.textContent = `Đồng biến (a = ${a} > 0)`;
    propDirection.style.color = 'var(--color-success)';
    propSlope.textContent = 'Đi lên từ trái sang phải';
  } else if (a < 0) {
    propDirection.textContent = `Nghịch biến (a = ${a} < 0)`;
    propDirection.style.color = 'var(--color-danger)';
    propSlope.textContent = 'Đi xuống từ trái sang phải';
  } else {
    propDirection.textContent = 'Hàm hằng (a = 0)';
    propDirection.style.color = 'var(--text-secondary)';
    propSlope.textContent = 'Song song hoặc trùng trục Ox';
  }

  // Giao điểm với trục Oy: P(0, b)
  propOy.textContent = `P(0; ${b})`;

  // Giao điểm với trục Ox: Q(-b/a; 0)
  if (a !== 0) {
    const xIntersect = -b / a;
    // Làm tròn đến 2 chữ số thập phân
    const roundedX = Math.round(xIntersect * 100) / 100;
    propOx.textContent = `Q(${roundedX}; 0)`;
  } else {
    propOx.textContent = b === 0 ? 'Trùng với trục Ox' : 'Không có giao điểm (vô nghiệm)';
  }

  draw(a, b);
}

function draw(a, b) {
  // Xóa màn hình
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. VẼ HỆ LƯỚI TỌA ĐỘ (GRID)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  // Vẽ lưới dọc
  for (let x = -10; x <= 10; x++) {
    const pt = mathToCanvas(x, 0);
    ctx.beginPath();
    ctx.moveTo(pt.x, 0);
    ctx.lineTo(pt.x, canvas.height);
    ctx.stroke();
  }

  // Vẽ lưới ngang
  for (let y = -10; y <= 10; y++) {
    const pt = mathToCanvas(0, y);
    ctx.beginPath();
    ctx.moveTo(0, pt.y);
    ctx.lineTo(canvas.width, pt.y);
    ctx.stroke();
  }

  // 2. VẼ TRỤC TỌA ĐỘ CHÍNH Ox, Oy
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;

  // Trục Ox
  ctx.beginPath();
  ctx.moveTo(10, centerY);
  ctx.lineTo(canvas.width - 10, centerY);
  ctx.stroke();
  // Mũi tên Ox
  drawArrow(canvas.width - 10, centerY, 'right');

  // Trục Oy
  ctx.beginPath();
  ctx.moveTo(centerX, canvas.height - 10);
  ctx.lineTo(centerX, 10);
  ctx.stroke();
  // Mũi tên Oy
  drawArrow(centerX, 10, 'up');

  // Vẽ các nhãn tên trục và gốc O
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'italic 13px Inter';
  ctx.fillText('x', canvas.width - 15, centerY + 18);
  ctx.fillText('y', centerX - 18, 15);
  ctx.fillText('O', centerX - 15, centerY + 18);

  // Vẽ vạch chia đơn vị & số tọa độ
  ctx.font = '10px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let i = -10; i <= 10; i++) {
    if (i === 0) continue;
    // Số trên trục Ox
    const ptX = mathToCanvas(i, 0);
    ctx.beginPath();
    ctx.moveTo(ptX.x, centerY - 3);
    ctx.lineTo(ptX.x, centerY + 3);
    ctx.stroke();
    // Ghi số (chỉ ghi chẵn để đỡ rối)
    if (i % 2 === 0) {
      ctx.fillText(i, ptX.x, centerY + 12);
    }

    // Số trên trục Oy
    const ptY = mathToCanvas(0, i);
    ctx.beginPath();
    ctx.moveTo(centerX - 3, ptY.y);
    ctx.lineTo(centerX + 3, ptY.y);
    ctx.stroke();
    if (i % 2 === 0) {
      ctx.fillText(i, centerX - 12, ptY.y);
    }
  }

  // 3. VẼ ĐƯỜNG THẲNG ĐỒ THỊ y = ax + b
  // Lấy giới hạn x của hệ tọa độ vẽ (từ -11 đến 11 để vẽ tràn viền)
  const xStart = -11;
  const xEnd = 11;
  const yStart = a * xStart + b;
  const yEnd = a * xEnd + b;

  const ptStart = mathToCanvas(xStart, yStart);
  const ptEnd = mathToCanvas(xEnd, yEnd);

  ctx.strokeStyle = '#3b82f6'; // Xanh dương
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(ptStart.x, ptStart.y);
  ctx.lineTo(ptEnd.x, ptEnd.y);
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;

  // 4. VẼ VÀ ĐÁNH DẤU CÁC GIAO ĐIỂM CỦA ĐỒ THỊ VỚI TRỤC TỌA ĐỘ
  
  // Giao điểm trục tung: P(0, b)
  const ptOy = mathToCanvas(0, b);
  drawPoint(ptOy.x, ptOy.y, 'rgba(139, 92, 246, 1)', `P(0; ${b})`);

  // Giao điểm trục hoành: Q(-b/a, 0)
  if (a !== 0) {
    const xIntersect = -b / a;
    const ptOx = mathToCanvas(xIntersect, 0);
    const roundedX = Math.round(xIntersect * 100) / 100;
    drawPoint(ptOx.x, ptOx.y, 'rgba(16, 185, 129, 1)', `Q(${roundedX}; 0)`);
  }
}

// Hàm vẽ mũi tên trục tọa độ
function drawArrow(x, y, direction) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  if (direction === 'right') {
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y - 4);
    ctx.lineTo(x - 6, y + 4);
  } else if (direction === 'up') {
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + 6);
    ctx.lineTo(x + 4, y + 6);
  }
  ctx.closePath();
  ctx.fill();
}

// Hàm vẽ điểm giao điểm trên đồ thị kèm nhãn
function drawPoint(cx, cy, color, label) {
  // Chỉ vẽ nếu điểm nằm trong khung canvas
  if (cx >= 0 && cx <= canvas.width && cy >= 0 && cy <= canvas.height) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Viền trắng
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Nhãn điểm
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Tránh nhãn đè lên trục chính, xê dịch nhãn khôn ngoan
    let offsetX = 10;
    let offsetY = -8;
    if (cx > centerX + 50) offsetX = -75; // Đẩy sang trái nếu ở quá bên phải
    
    ctx.fillText(label, cx + offsetX, cy + offsetY);
  }
}

// Đăng ký sự kiện
sliderA.addEventListener('input', updateSimulation);
sliderB.addEventListener('input', updateSimulation);

// Khởi chạy
updateSimulation();
