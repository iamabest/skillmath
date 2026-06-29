const canvas = document.getElementById('parabolaCanvas');
const ctx = canvas.getContext('2d');

const sliderA = document.getElementById('sliderA');
const valA = document.getElementById('valA');
const formulaText = document.getElementById('formulaText');
const pointCoordinates = document.getElementById('pointCoordinates');
const btnRoll = document.getElementById('btnRoll');
const parabolaNotice = document.getElementById('parabolaNotice');

// Cấu hình tọa độ
const UNIT_PIXELS = 30; // 1 đơn vị = 30px
const centerX = canvas.width / 2; // 225 px
const centerY = canvas.height / 2; // 210 px

// Trạng thái bóng lăn
let ballX = -5.0; // Hoành độ xuất phát của bóng
let isRolling = false;
let rollAnimId = null;

function mathToCanvas(x, y) {
  return {
    x: centerX + x * UNIT_PIXELS,
    y: centerY - y * UNIT_PIXELS
  };
}

function updateSimulation() {
  const a = parseFloat(sliderA.value);
  valA.textContent = a.toFixed(2);
  
  // Cập nhật phương trình hiển thị
  if (a === 0) {
    formulaText.textContent = '0 (Đường thẳng trùng trục Ox)';
  } else {
    formulaText.textContent = `${a.toFixed(2)}x²`;
  }

  // Cập nhật nhận xét sư phạm
  if (a > 0) {
    parabolaNotice.innerHTML = `
      <ul style="padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.35rem;">
        <li>Bề lõm của đồ thị quay <strong>lên trên</strong>.</li>
        <li>Điểm thấp nhất là gốc tọa độ <strong>O(0; 0)</strong>.</li>
        <li>Hàm số <strong>nghịch biến</strong> khi \(x < 0\) và <strong>đồng biến</strong> khi \(x > 0\).</li>
      </ul>
    `;
  } else if (a < 0) {
    parabolaNotice.innerHTML = `
      <ul style="padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.35rem;">
        <li>Bề lõm của đồ thị quay <strong>xuống dưới</strong>.</li>
        <li>Điểm cao nhất là gốc tọa độ <strong>O(0; 0)</strong>.</li>
        <li>Hàm số <strong>đồng biến</strong> khi \(x < 0\) và <strong>nghịch biến</strong> khi \(x > 0\).</li>
      </ul>
    `;
  } else {
    parabolaNotice.innerHTML = 'Đồ thị thoái hóa thành đường thẳng trùng với trục hoành Ox.';
  }

  if (!isRolling) {
    // Nếu bóng đang đứng yên, đặt ở vị trí mặc định x = 2
    ballX = 2.0;
    updateCoordinatesText(ballX, a);
  }
  
  draw();
}

function updateCoordinatesText(x, a) {
  const y = a * x * x;
  pointCoordinates.textContent = `(${x.toFixed(2)}; ${y.toFixed(2)})`;
}

function startRolling() {
  if (isRolling) return;
  isRolling = true;
  ballX = -5.0; // Xuất phát từ bên trái hoành độ -5
  btnRoll.disabled = true;
  sliderA.disabled = true;
  animateRoll();
}

function animateRoll() {
  const a = parseFloat(sliderA.value);
  
  ballX += 0.08; // Tốc độ lăn
  if (ballX >= 5.0) {
    ballX = 5.0;
    isRolling = false;
    btnRoll.disabled = false;
    sliderA.disabled = false;
    updateCoordinatesText(ballX, a);
    draw();
    cancelAnimationFrame(rollAnimId);
  } else {
    updateCoordinatesText(ballX, a);
    draw();
    rollAnimId = requestAnimationFrame(animateRoll);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const a = parseFloat(sliderA.value);

  // 1. VẼ LƯỚI TỌA ĐỘ
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  
  // Trục đứng dọc
  for (let x = -7; x <= 7; x++) {
    const pt = mathToCanvas(x, 0);
    ctx.beginPath();
    ctx.moveTo(pt.x, 0);
    ctx.lineTo(pt.x, canvas.height);
    ctx.stroke();
  }
  
  // Trục ngang
  for (let y = -7; y <= 7; y++) {
    const pt = mathToCanvas(0, y);
    ctx.beginPath();
    ctx.moveTo(0, pt.y);
    ctx.lineTo(canvas.width, pt.y);
    ctx.stroke();
  }

  // 2. VẼ TRỤC CHÍNH Ox, Oy
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  
  // Ox
  ctx.beginPath();
  ctx.moveTo(15, centerY);
  ctx.lineTo(canvas.width - 15, centerY);
  ctx.stroke();
  drawArrow(canvas.width - 15, centerY, 'right');

  // Oy
  ctx.beginPath();
  ctx.moveTo(centerX, canvas.height - 15);
  ctx.lineTo(centerX, 15);
  ctx.stroke();
  drawArrow(centerX, 15, 'up');

  // Chữ tên trục
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = 'italic 12px Inter';
  ctx.fillText('x', canvas.width - 25, centerY + 18);
  ctx.fillText('y', centerX - 18, 25);
  ctx.fillText('O', centerX - 14, centerY + 18);

  // Vạch đơn vị chẵn
  ctx.font = '9px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = -6; i <= 6; i++) {
    if (i === 0) continue;
    
    // Ox
    const ptX = mathToCanvas(i, 0);
    ctx.beginPath();
    ctx.moveTo(ptX.x, centerY - 3);
    ctx.lineTo(ptX.x, centerY + 3);
    ctx.stroke();
    if (i % 2 === 0) ctx.fillText(i, ptX.x, centerY + 12);

    // Oy
    const ptY = mathToCanvas(0, i);
    ctx.beginPath();
    ctx.moveTo(centerX - 3, ptY.y);
    ctx.lineTo(centerX + 3, ptY.y);
    ctx.stroke();
    if (i % 2 === 0) ctx.fillText(i, centerX - 12, ptY.y);
  }

  // 3. VẼ ĐƯỜNG CONG PARABOL y = ax²
  if (a !== 0) {
    ctx.strokeStyle = '#3b82f6'; // Xanh dương
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
    ctx.shadowBlur = 8;
    
    ctx.beginPath();
    
    // Tính tọa độ vẽ đường cong
    const xMin = -7.0;
    const xMax = 7.0;
    const step = 0.05;
    
    let first = true;
    for (let x = xMin; x <= xMax; x += step) {
      const y = a * x * x;
      const pt = mathToCanvas(x, y);
      
      // Giới hạn trong canvas
      if (pt.y >= 0 && pt.y <= canvas.height) {
        if (first) {
          ctx.moveTo(pt.x, pt.y);
          first = false;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  }

  // 4. VẼ ĐƯỜNG GIỚI HẠN/CHIẾU ĐỐI XỨNG CỦA ĐIỂM MẪU (tại x = 2 và x = -2 để học sinh học tính đối xứng)
  if (a !== 0 && !isRolling) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const xVal = 2;
    const yVal = a * xVal * xVal;

    const ptRight = mathToCanvas(xVal, yVal);
    const ptLeft = mathToCanvas(-xVal, yVal);
    const ptXRight = mathToCanvas(xVal, 0);
    const ptXLeft = mathToCanvas(-xVal, 0);
    const ptY = mathToCanvas(0, yVal);

    // Vẽ nét đứt chiếu điểm bên phải
    ctx.beginPath();
    ctx.moveTo(ptRight.x, ptRight.y); ctx.lineTo(ptXRight.x, ptXRight.y);
    ctx.moveTo(ptRight.x, ptRight.y); ctx.lineTo(ptY.x, ptY.y);
    ctx.stroke();

    // Vẽ nét đứt chiếu điểm bên trái đối xứng
    ctx.beginPath();
    ctx.moveTo(ptLeft.x, ptLeft.y); ctx.lineTo(ptXLeft.x, ptXLeft.y);
    ctx.moveTo(ptLeft.x, ptLeft.y); ctx.lineTo(ptY.x, ptY.y);
    ctx.stroke();

    ctx.setLineDash([]); // reset

    // Điểm M(2; y)
    ctx.fillStyle = 'rgba(139, 92, 246, 1)'; // Violet
    ctx.beginPath();
    ctx.arc(ptRight.x, ptRight.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px Inter';
    ctx.fillText(`M(2; ${yVal.toFixed(1)})`, ptRight.x + 22, ptRight.y - 8);

    // Điểm M'(-2; y)
    ctx.fillStyle = 'rgba(139, 92, 246, 1)';
    ctx.beginPath();
    ctx.arc(ptLeft.x, ptLeft.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`M'(-2; ${yVal.toFixed(1)})`, ptLeft.x - 22, ptLeft.y - 8);
  }

  // 5. VẼ QUẢ BÓNG TRƯỢT
  const ballY = a * ballX * ballX;
  const ptBall = mathToCanvas(ballX, ballY);
  
  if (ptBall.y >= 0 && ptBall.y <= canvas.height) {
    ctx.fillStyle = '#10b981'; // Emerald
    ctx.beginPath();
    ctx.arc(ptBall.x, ptBall.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawArrow(x, y, direction) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
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

// Đăng ký sự kiện
sliderA.addEventListener('input', updateSimulation);
btnRoll.addEventListener('click', startRolling);

// Chạy lần đầu
updateSimulation();
