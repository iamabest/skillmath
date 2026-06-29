const canvas = document.getElementById('numberLineCanvas');
const ctx = canvas.getContext('2d');

const sliderX = document.getElementById('sliderX');
const sliderY = document.getElementById('sliderY');
const valX = document.getElementById('valX');
const valY = document.getElementById('valY');
const calcExpression = document.getElementById('calcExpression');
const btnPlay = document.getElementById('btnPlay');
const btnReset = document.getElementById('btnReset');
const opRadios = document.getElementsByName('operator');

// Cấu hình vẽ trục số
const paddingX = 40;
const centerY = canvas.height / 2 + 20;
const axisWidth = canvas.width - 2 * paddingX;
const unitWidth = axisWidth / 20; // Trục số từ -10 đến 10 có 20 đơn vị

// Trạng thái hoạt ảnh
let animationId = null;
let currentPos = 0; // Vị trí hiện tại của nhân vật (giá trị toán học)
let targetPos = 0;  // Vị trí đích
let startPos = 0;   // Vị trí bắt đầu
let stepIndex = 0;  // Số bước đã đi
let totalSteps = 0; // Tổng số bước cần đi
let stepDir = 1;    // Hướng đi (1: phải, -1: trái)
let isAnimating = false;
let animProgress = 0; // Tiến trình bước nhảy hiện tại (0 -> 1)
let pathHistory = []; // Lịch sử đường đi để vẽ lại

function getOperator() {
  for (let radio of opRadios) {
    if (radio.checked) return radio.value;
  }
  return 'add';
}

function getValues() {
  const x = parseInt(sliderX.value);
  let y = parseInt(sliderY.value);
  const op = getOperator();
  
  let result = 0;
  if (op === 'add') {
    result = x + y;
  } else {
    result = x - y;
  }
  
  return { x, y, op, result };
}

function updateFormulaText() {
  const { x, y, op, result } = getValues();
  valX.textContent = x;
  valY.textContent = y;
  
  const opSign = op === 'add' ? '+' : '-';
  const yStr = y < 0 ? `(${y})` : y;
  const resStr = result;
  
  calcExpression.textContent = `${x} ${opSign} ${yStr} = ${resStr}`;
}

// Đổi giá trị toán học sang tọa độ X trên canvas
function mathToCanvasX(val) {
  // val = 0 tương ứng với giữa trục (centerX)
  const centerX = canvas.width / 2;
  return centerX + val * unitWidth;
}

function initSimulation() {
  if (isAnimating) {
    cancelAnimationFrame(animationId);
    isAnimating = false;
  }
  const { x } = getValues();
  currentPos = x;
  pathHistory = [];
  animProgress = 0;
  draw();
}

function startAnimation() {
  if (isAnimating) return;
  
  const { x, y, op, result } = getValues();
  
  startPos = x;
  currentPos = x;
  targetPos = result;
  pathHistory = [];
  
  // Xác định số bước và hướng đi
  // Cộng số dương hoặc trừ số âm: Đi sang Phải
  // Cộng số âm hoặc trừ số dương: Đi sang Trái
  let delta = 0;
  if (op === 'add') {
    delta = y;
  } else {
    delta = -y;
  }
  
  totalSteps = Math.abs(delta);
  stepDir = delta >= 0 ? 1 : -1;
  stepIndex = 0;
  animProgress = 0;
  isAnimating = true;
  
  btnPlay.disabled = true;
  sliderX.disabled = true;
  sliderY.disabled = true;
  for (let r of opRadios) r.disabled = true;

  animateStep();
}

function animateStep() {
  if (!isAnimating) return;

  if (stepIndex < totalSteps) {
    animProgress += 0.05; // Tốc độ di chuyển của bước nhảy
    if (animProgress >= 1) {
      // Đã nhảy xong 1 bước
      const nextPos = startPos + (stepIndex + 1) * stepDir;
      pathHistory.push({
        from: startPos + stepIndex * stepDir,
        to: nextPos
      });
      stepIndex++;
      currentPos = nextPos;
      animProgress = 0;
    }
    draw();
    animationId = requestAnimationFrame(animateStep);
  } else {
    // Đã hoàn thành toàn bộ phép tính
    isAnimating = false;
    currentPos = targetPos;
    draw();
    
    // Khôi phục nút bấm
    btnPlay.disabled = false;
    sliderX.disabled = false;
    sliderY.disabled = false;
    for (let r of opRadios) r.disabled = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Vẽ tiêu đề chỉ dẫn sư phạm bên trong canvas
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Cộng số dương / Trừ số âm ➜ Đi sang PHẢI (Chiều dương)', canvas.width / 2, 40);
  ctx.fillText('Cộng số âm / Trừ số dương ➜ Đi sang TRÁI (Chiều âm)', canvas.width / 2, 60);

  // 2. VẼ TRỤC SỐ
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  
  // Trục chính
  ctx.beginPath();
  ctx.moveTo(paddingX, centerY);
  ctx.lineTo(canvas.width - paddingX, centerY);
  ctx.stroke();

  // Mũi tên chiều dương (phải)
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(canvas.width - paddingX, centerY);
  ctx.lineTo(canvas.width - paddingX - 10, centerY - 6);
  ctx.lineTo(canvas.width - paddingX - 10, centerY + 6);
  ctx.fill();

  // Mũi tên chiều âm (trái)
  ctx.beginPath();
  ctx.moveTo(paddingX, centerY);
  ctx.lineTo(paddingX + 10, centerY - 6);
  ctx.lineTo(paddingX + 10, centerY + 6);
  ctx.fill();

  // Ghi nhãn hướng (+), (-)
  ctx.font = 'bold 12px Inter';
  ctx.fillText('+', canvas.width - paddingX + 15, centerY);
  ctx.fillText('-', paddingX - 15, centerY);

  // Vẽ các vạch chia đơn vị từ -10 đến 10
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let i = -10; i <= 10; i++) {
    const x = mathToCanvasX(i);
    
    // Vạch chia
    ctx.strokeStyle = i === 0 ? '#60a5fa' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = i === 0 ? 3 : 1;
    ctx.beginPath();
    ctx.moveTo(x, centerY - 8);
    ctx.lineTo(x, centerY + 8);
    ctx.stroke();

    // Số ghi tọa độ
    ctx.font = i === 0 ? 'bold 12px Inter' : '11px Inter';
    ctx.fillStyle = i === 0 ? '#60a5fa' : '#94a3b8';
    ctx.fillText(i, x, centerY + 24);
  }

  // 3. VẼ LỊCH SỬ CÁC BƯỚC NHẢY (CÁC CUNG TRÒN)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)'; // Màu Amber
  ctx.lineWidth = 2.5;
  ctx.setLineDash([]);
  
  pathHistory.forEach(step => {
    drawJumpArc(step.from, step.to);
  });

  // Vẽ bước nhảy đang diễn ra (hoạt ảnh)
  if (isAnimating && stepIndex < totalSteps) {
    const fromVal = startPos + stepIndex * stepDir;
    const toVal = fromVal + stepDir;
    drawJumpArc(fromVal, toVal, animProgress);
  }

  // 4. VẼ VỊ TRÍ NHÂN VẬT/ĐIỂM HIỆN TẠI
  let activeX = 0;
  if (isAnimating && stepIndex < totalSteps) {
    // Nội suy vị trí X của nhân vật đang nhảy
    const fromX = mathToCanvasX(startPos + stepIndex * stepDir);
    const toX = mathToCanvasX(startPos + (stepIndex + 1) * stepDir);
    // Nhảy theo hình Parabol (tung độ đi lên rồi đi xuống)
    activeX = fromX + (toX - fromX) * animProgress;
  } else {
    activeX = mathToCanvasX(currentPos);
  }

  // Vẽ hình tròn nhân vật
  ctx.fillStyle = '#3b82f6'; // Xanh dương
  ctx.beginPath();
  
  // Tính độ cao nhảy Y (độ cao nhảy lớn nhất ở giữa bước nhảy)
  let jumpY = centerY;
  if (isAnimating && stepIndex < totalSteps) {
    // Parabol: y = -4 * height * p * (1 - p)
    const jumpHeight = 35;
    jumpY = centerY - 4 * jumpHeight * animProgress * (1 - animProgress);
  }
  
  ctx.arc(activeX, jumpY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Đánh dấu điểm bắt đầu (X)
  const { x, result } = getValues();
  const startCanvasX = mathToCanvasX(x);
  ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
  ctx.beginPath();
  ctx.arc(startCanvasX, centerY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 10px Inter';
  ctx.fillText('Đầu', startCanvasX, centerY - 25);

  // Đánh dấu kết quả đích (Z) nếu không trùng bắt đầu
  if (currentPos === result && result !== x) {
    const endCanvasX = mathToCanvasX(result);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.beginPath();
    ctx.arc(endCanvasX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.fillText('Đích', endCanvasX, centerY - 25);
  }
}

// Hàm vẽ cung nhảy từ điểm A sang B
function drawJumpArc(fromVal, toVal, progress = 1) {
  const x1 = mathToCanvasX(fromVal);
  const x2 = mathToCanvasX(toVal);
  const cpX = (x1 + x2) / 2;
  const cpY = centerY - 40; // Độ cong của cung nhảy

  ctx.beginPath();
  ctx.moveTo(x1, centerY);
  
  if (progress === 1) {
    // Vẽ toàn bộ cung tròn
    ctx.quadraticCurveTo(cpX, cpY, x2, centerY);
    ctx.stroke();
    
    // Vẽ mũi tên ở điểm đích của cung nhảy
    drawArrowOnArc(cpX, cpY, x2, centerY, toVal > fromVal ? 1 : -1);
  } else {
    // Vẽ cung tròn từng phần bằng công thức nội suy quadratic Bezier
    ctx.beginPath();
    ctx.moveTo(x1, centerY);
    for (let t = 0; t <= progress; t += 0.05) {
      const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpX + t * t * x2;
      const by = (1 - t) * (1 - t) * centerY + 2 * (1 - t) * t * cpY + t * t * centerY;
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }
}

function drawArrowOnArc(cpX, cpY, x2, y2, dir) {
  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
  
  // Tính góc tiếp tuyến tại điểm cuối của cung
  // Đạo hàm Bezier bậc 2 tại t=1 là: 2*(x2 - cpX) và 2*(y2 - cpY)
  const angle = Math.atan2(y2 - cpY, x2 - cpX);
  
  ctx.translate(x2, y2);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, -4);
  ctx.lineTo(-8, 4);
  ctx.fill();
  ctx.restore();
}

// Lắng nghe sự kiện thay đổi thông số
sliderX.addEventListener('input', () => {
  updateFormulaText();
  initSimulation();
});

sliderY.addEventListener('input', () => {
  updateFormulaText();
  initSimulation();
});

for (let r of opRadios) {
  r.addEventListener('change', () => {
    updateFormulaText();
    initSimulation();
  });
}

btnPlay.addEventListener('click', startAnimation);
btnReset.addEventListener('click', () => {
  sliderX.value = 0;
  sliderY.value = 3;
  opRadios[0].checked = true; // reset to add
  updateFormulaText();
  initSimulation();
});

// Khởi tạo chạy thử
updateFormulaText();
initSimulation();
