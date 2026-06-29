const canvas = document.getElementById('symmetryCanvas');
const ctx = canvas.getContext('2d');

const shapeSelect = document.getElementById('shapeSelect');
const axisSelect = document.getElementById('axisSelect');
const tabAxial = document.getElementById('tabAxial');
const tabRotational = document.getElementById('tabRotational');
const axialControls = document.getElementById('axialControls');
const rotationalControls = document.getElementById('rotationalControls');
const btnFold = document.getElementById('btnFold');
const btnRotate = document.getElementById('btnRotate');
const axialCountText = document.getElementById('axialCount');
const hasCenterText = document.getElementById('hasCenter');
const shapeDescription = document.getElementById('shapeDescription');

// Trạng thái chung
let currentMode = 'axial'; // 'axial' hoặc 'rotational'
let isAnimating = false;
let animProgress = 0; // 0 -> 1
let animId = null;

// Tọa độ tâm trên Canvas
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Định nghĩa dữ liệu các hình phẳng
const shapes = {
  square: {
    name: 'Hình vuông',
    description: 'Hình vuông có **4 trục đối xứng** (2 đường trung trực của các cạnh và 2 đường chéo) và **có tâm đối xứng** (giao điểm hai đường chéo).',
    axes: [
      { name: 'Đường trung trực ngang', angle: 0 },
      { name: 'Đường trung trực dọc', angle: Math.PI / 2 },
      { name: 'Đường chéo chính', angle: Math.PI / 4 },
      { name: 'Đường chéo phụ', angle: -Math.PI / 4 }
    ],
    hasCenter: true,
    draw: (context, size = 150) => {
      const half = size / 2;
      context.rect(-half, -half, size, size);
    }
  },
  rectangle: {
    name: 'Hình chữ nhật',
    description: 'Hình chữ nhật có **2 trục đối xứng** (2 đường trung trực của các cạnh) và **có tâm đối xứng** (giao điểm hai đường chéo). Lưu ý: Đường chéo KHÔNG PHẢI là trục đối xứng của hình chữ nhật.',
    axes: [
      { name: 'Đường trung trực ngang', angle: 0 },
      { name: 'Đường trung trực dọc', angle: Math.PI / 2 }
    ],
    hasCenter: true,
    draw: (context, size = 150) => {
      const w = size * 1.2;
      const h = size * 0.8;
      context.rect(-w / 2, -h / 2, w, h);
    }
  },
  equiTriangle: {
    name: 'Tam giác đều',
    description: 'Tam giác đều có **3 trục đối xứng** (3 đường trung trực, cũng là 3 đường cao/phân giác) nhưng **KHÔNG có tâm đối xứng** (khi xoay 180° hình sẽ bị ngược đầu).',
    axes: [
      { name: 'Đường cao dọc', angle: Math.PI / 2 },
      { name: 'Đường cao xiên trái', angle: Math.PI / 2 + Math.PI / 3 },
      { name: 'Đường cao xiên phải', angle: Math.PI / 2 - Math.PI / 3 }
    ],
    hasCenter: false,
    draw: (context, size = 160) => {
      const h = size * Math.sqrt(3) / 2;
      const r = h / 3; // khoảng cách từ trọng tâm tới đáy
      context.moveTo(0, -r * 2);
      context.lineTo(size / 2, r);
      context.lineTo(-size / 2, r);
      context.closePath();
    }
  },
  rhombus: {
    name: 'Hình thoi',
    description: 'Hình thoi có **2 trục đối xứng** (2 đường chéo) và **có tâm đối xứng** (giao điểm hai đường chéo).',
    axes: [
      { name: 'Đường chéo ngang', angle: 0 },
      { name: 'Đường chéo dọc', angle: Math.PI / 2 }
    ],
    hasCenter: true,
    draw: (context, size = 150) => {
      const w = size * 1.3;
      const h = size * 0.8;
      context.moveTo(0, -h / 2);
      context.lineTo(w / 2, 0);
      // context.moveTo(w / 2, 0);
      context.lineTo(0, h / 2);
      context.lineTo(-w / 2, 0);
      context.closePath();
    }
  },
  parallelogram: {
    name: 'Hình bình hành',
    description: 'Hình bình hành **KHÔNG có trục đối xứng** nào (khi gấp đôi hình theo bất kỳ đường nào đều không khớp) nhưng **có tâm đối xứng** (giao điểm hai đường chéo).',
    axes: [],
    hasCenter: true,
    draw: (context, size = 150) => {
      const w = size * 1.2;
      const h = size * 0.8;
      const skew = 35;
      context.moveTo(-w / 2 + skew, -h / 2);
      context.lineTo(w / 2 + skew, -h / 2);
      context.lineTo(w / 2 - skew, h / 2);
      context.lineTo(-w / 2 - skew, h / 2);
      context.closePath();
    }
  },
  hexagon: {
    name: 'Lục giác đều',
    description: 'Lục giác đều có **6 trục đối xứng** (3 đường chéo chính nối các đỉnh đối diện và 3 đường trung trực nối trung điểm các cạnh đối diện) và **có tâm đối xứng**.',
    axes: [
      { name: 'Trục ngang qua 2 đỉnh', angle: 0 },
      { name: 'Trục dọc nối trung điểm cạnh', angle: Math.PI / 2 },
      { name: 'Trục chéo 30° qua đỉnh', angle: Math.PI / 6 },
      { name: 'Trục chéo 60° nối trung điểm cạnh', angle: Math.PI / 3 },
      { name: 'Trục chéo 120° nối trung điểm cạnh', angle: 2 * Math.PI / 3 },
      { name: 'Trục chéo 150° qua đỉnh', angle: 5 * Math.PI / 6 }
    ],
    hasCenter: true,
    draw: (context, size = 95) => {
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
    }
  }
};

function getSelectedShape() {
  return shapes[shapeSelect.value];
}

function updateShapeInfo() {
  const shape = getSelectedShape();
  shapeDescription.innerHTML = shape.description.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-success);">$1</strong>');
  
  // Cập nhật trục đối xứng lên select box
  axisSelect.innerHTML = '';
  if (shape.axes.length > 0) {
    shape.axes.forEach((axis, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = axis.name;
      axisSelect.appendChild(opt);
    });
    btnFold.disabled = false;
    axisSelect.disabled = false;
    axialCountText.textContent = `${shape.axes.length} trục`;
    axialCountText.style.color = 'var(--color-success)';
  } else {
    const opt = document.createElement('option');
    opt.textContent = 'Không có trục đối xứng';
    axisSelect.appendChild(opt);
    btnFold.disabled = true;
    axisSelect.disabled = true;
    axialCountText.textContent = 'Không có';
    axialCountText.style.color = 'var(--color-danger)';
  }

  // Cập nhật tâm đối xứng
  if (shape.hasCenter) {
    hasCenterText.textContent = 'Có tâm đối xứng';
    hasCenterText.style.color = 'var(--color-success)';
    btnRotate.disabled = false;
  } else {
    hasCenterText.textContent = 'Không có tâm';
    hasCenterText.style.color = 'var(--color-danger)';
    btnRotate.disabled = false; // Vẫn cho xoay để học sinh thấy nó không khớp
  }

  initSimulation();
}

function initSimulation() {
  if (isAnimating) {
    cancelAnimationFrame(animId);
    isAnimating = false;
  }
  animProgress = 0;
  draw();
}

function startFoldAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  animProgress = 0;
  
  btnFold.disabled = true;
  shapeSelect.disabled = true;
  axisSelect.disabled = true;
  tabAxial.disabled = true;
  tabRotational.disabled = true;
  
  animateFold();
}

function animateFold() {
  animProgress += 0.02; // Tốc độ gấp
  if (animProgress >= 1) {
    // Giữ trạng thái gấp một lúc rồi quay lại hoặc dừng ở trạng thái gấp
    animProgress = 1;
    draw();
    setTimeout(() => {
      // Cho bung hình ra trở lại
      animateUnfold();
    }, 1500);
  } else {
    draw();
    animId = requestAnimationFrame(animateFold);
  }
}

function animateUnfold() {
  animProgress -= 0.02;
  if (animProgress <= 0) {
    animProgress = 0;
    isAnimating = false;
    draw();
    
    // Bật lại các nút
    shapeSelect.disabled = false;
    tabAxial.disabled = false;
    tabRotational.disabled = false;
    updateShapeInfo();
  } else {
    draw();
    animId = requestAnimationFrame(animateUnfold);
  }
}

function startRotateAnimation() {
  if (isAnimating) return;
  isAnimating = true;
  animProgress = 0;

  btnRotate.disabled = true;
  shapeSelect.disabled = true;
  tabAxial.disabled = true;
  tabRotational.disabled = true;

  animateRotate();
}

function animateRotate() {
  animProgress += 0.015; // Tốc độ xoay
  if (animProgress >= 1) {
    animProgress = 1;
    draw();
    setTimeout(() => {
      animateUnrotate();
    }, 1500);
  } else {
    draw();
    animId = requestAnimationFrame(animateRotate);
  }
}

function animateUnrotate() {
  animProgress -= 0.02;
  if (animProgress <= 0) {
    animProgress = 0;
    isAnimating = false;
    draw();
    
    shapeSelect.disabled = false;
    tabAxial.disabled = false;
    tabRotational.disabled = false;
    btnRotate.disabled = false;
  } else {
    draw();
    animId = requestAnimationFrame(animateUnrotate);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const shape = getSelectedShape();
  
  // Vẽ các đối tượng tĩnh ở hậu cảnh (tâm O, hướng dẫn)
  ctx.save();
  ctx.translate(centerX, centerY);
  
  if (currentMode === 'axial') {
    // 1. CHẾ ĐỘ ĐỐI XỨNG TRỤC
    
    // Lấy góc của trục đối xứng đang chọn
    const axisIndex = parseInt(axisSelect.value) || 0;
    const axis = shape.axes[axisIndex];
    const axisAngle = axis ? axis.angle : 0;
    
    // Vẽ đường trục đối xứng (nét đứt màu đỏ dốc xiên qua tâm)
    ctx.save();
    ctx.rotate(axisAngle);
    ctx.strokeStyle = '#ef4444'; // Red
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(-canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, 0);
    ctx.stroke();
    ctx.restore();
    
    // Hoạt ảnh gấp hình theo trục đối xứng
    if (isAnimating) {
      // Để dễ gấp, ta xoay hệ trục tọa độ sao cho trục đối xứng nằm ngang trùng Ox
      ctx.save();
      ctx.rotate(axisAngle);
      
      // Vẽ nửa cố định (ở phía trên trục hoành, y < 0)
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 3;
      
      // Cắt bớt phần bên dưới
      ctx.save();
      ctx.beginPath();
      ctx.rect(-centerX, -centerY, canvas.width, centerY); // Vùng y < 0
      ctx.clip();
      
      ctx.beginPath();
      shape.draw(ctx);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
      // Vẽ nửa gấp (ở phía dưới trục hoành y > 0, được gấp ngược lên bằng cách thay đổi tỷ lệ Y)
      // Tỷ lệ thay đổi từ 1 (ban đầu) về -1 (gấp ngược lên hoàn toàn)
      // Hàm cosine chạy từ 0 đến pi cho giá trị từ 1 về -1
      const scaleY = Math.cos(animProgress * Math.PI);
      
      ctx.save();
      ctx.scale(1, scaleY);
      
      // Clip vùng y > 0 để chỉ lật nửa phía dưới
      ctx.beginPath();
      ctx.rect(-centerX, 0, canvas.width, centerY);
      ctx.clip();
      
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)'; // Màu hổ phách cho nửa lật
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      shape.draw(ctx);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
      ctx.restore(); // Khôi phục xoay trục đối xứng
    } else {
      // Trạng thái tĩnh: Vẽ toàn bộ hình bình thường
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      shape.draw(ctx);
      ctx.fill();
      ctx.stroke();
    }
    
  } else {
    // 2. CHẾ ĐỘ ĐỐI XỨNG TÂM
    
    // Vẽ hình bóng mờ cố định phía sau làm mốc so sánh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    shape.draw(ctx);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Vẽ tâm đối xứng O
    ctx.fillStyle = '#10b981'; // Emerald
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 11px Inter';
    ctx.fillText('Tâm O', 8, -8);
    
    // Hoạt ảnh xoay hình
    // Góc xoay chạy từ 0 đến 180 độ (pi rad)
    const currentAngle = animProgress * Math.PI;
    
    ctx.save();
    ctx.rotate(currentAngle);
    
    ctx.strokeStyle = isAnimating ? 'rgba(245, 158, 11, 0.9)' : '#3b82f6';
    ctx.fillStyle = isAnimating ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    shape.draw(ctx);
    ctx.fill();
    ctx.stroke();
    
    // Đánh dấu một đỉnh bằng một chấm nhỏ để học sinh thấy sự chuyển dịch xoay vòng
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    if (shapeSelect.value === 'square') {
      ctx.arc(-75, -75, 6, 0, Math.PI * 2);
    } else if (shapeSelect.value === 'rectangle') {
      ctx.arc(-90, -60, 6, 0, Math.PI * 2);
    } else if (shapeSelect.value === 'equiTriangle') {
      ctx.arc(0, -62, 6, 0, Math.PI * 2);
    } else if (shapeSelect.value === 'hexagon') {
      ctx.arc(95, 0, 6, 0, Math.PI * 2);
    } else {
      ctx.arc(0, -60, 6, 0, Math.PI * 2);
    }
    ctx.fill();
    
    ctx.restore();
    
    // Thêm ghi chú văn bản xoay
    if (isAnimating) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'center';
      const deg = Math.round(animProgress * 180);
      ctx.fillText(`Xoay quanh tâm O: ${deg}°`, 0, centerY - 60);
    }
  }
  
  ctx.restore();
}

// Cấu hình sự kiện Tab điều khiển
tabAxial.addEventListener('click', () => {
  tabAxial.classList.add('active');
  tabRotational.classList.remove('active');
  axialControls.style.display = 'block';
  rotationalControls.style.display = 'none';
  currentMode = 'axial';
  initSimulation();
});

tabRotational.addEventListener('click', () => {
  tabRotational.classList.add('active');
  tabAxial.classList.remove('active');
  rotationalControls.style.display = 'block';
  axialControls.style.display = 'none';
  currentMode = 'rotational';
  initSimulation();
});

shapeSelect.addEventListener('change', updateShapeInfo);
axisSelect.addEventListener('change', initSimulation);
btnFold.addEventListener('click', startFoldAnimation);
btnRotate.addEventListener('click', startRotateAnimation);

// Khởi tạo chạy lần đầu
updateShapeInfo();
