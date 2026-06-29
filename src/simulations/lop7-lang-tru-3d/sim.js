const container = document.getElementById('canvas3dContainer');
const slider = document.getElementById('foldSlider');
const progressText = document.getElementById('foldProgressText');

let scene, camera, renderer, mainGroup;
let sideLeftGroup, sideRightGroup, topCapGroup, bottomCapGroup;

// Kích thước lăng trụ đứng tam giác đều
const w = 2.0; // chiều rộng mặt bên (cạnh tam giác đáy)
const h = 3.2; // chiều cao lăng trụ

// Góc gập cực đại (khi đóng khối, tiến trình = 0%)
const foldAngleSides = (120 * Math.PI) / 180; // 120 độ
const foldAngleCaps = (90 * Math.PI) / 180;   // 90 độ

// Trạng thái xoay chuột của người dùng
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function init3D() {
  // 1. KHỞI TẠO SCENE & CAMERA
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111827); // Trùng màu nền panel

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 4, 7);
  camera.lookAt(0, 0, 0);

  // 2. KHỞI TẠO RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 3. ÁNH SÁNG (LIGHTING)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.3); // Ánh sáng xanh bổ sung thẩm mỹ
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // 4. TẠO CÁC GROUP HÌNH HỌC (PHÂN CẤP BẢN LỀ)
  mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // Vật liệu
  const materialSideMain = new THREE.MeshStandardMaterial({
    color: 0x3b82f6, // Blue
    side: THREE.DoubleSide,
    roughness: 0.4,
    metalness: 0.1
  });
  
  const materialSideSub = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6, // Violet
    side: THREE.DoubleSide,
    roughness: 0.4,
    metalness: 0.1
  });

  const materialCap = new THREE.MeshStandardMaterial({
    color: 0x10b981, // Emerald
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0.1
  });

  // --- MẶT BÊN CHÍNH (Ở giữa, cố định) ---
  const geoMain = new THREE.PlaneGeometry(w, h);
  const meshMain = new THREE.Mesh(geoMain, materialSideMain);
  meshMain.rotation.x = -Math.PI / 2; // Đặt nằm ngang trên mặt đất X-Z
  mainGroup.add(meshMain);

  // --- MẶT BÊN TRÁI (Bản lề tại x = -w/2) ---
 sideLeftGroup = new THREE.Group();
// Pivot nằm đúng mép trái của mặt chính
sideLeftGroup.position.set(-w / 2, 0, 0);
mainGroup.add(sideLeftGroup);
const geoSub = new THREE.PlaneGeometry(w, h);
const meshLeft = new THREE.Mesh(
    geoSub,
    materialSideSub
);
meshLeft.position.set(-w / 2, 0, 0);
meshLeft.rotation.x = -Math.PI / 2;
sideLeftGroup.add(meshLeft);

  // --- MẶT BÊN PHẢI (Bản lề tại x = w/2) ---
  sideRightGroup = new THREE.Group();

sideRightGroup.position.set(w / 2, 0, 0);
mainGroup.add(sideRightGroup);

const meshRight = new THREE.Mesh(
    geoSub,
    materialSideSub
);

meshRight.position.set(w / 2, 0, 0);

meshRight.rotation.x = -Math.PI / 2;

sideRightGroup.add(meshRight);

  // --- ĐÁY DƯỚI (Tam giác đều, bản lề tại z = h/2) ---
  bottomCapGroup = new THREE.Group();
  bottomCapGroup.position.set(0, 0, h / 2);
  mainGroup.add(bottomCapGroup);

  // Vẽ hình tam giác đều
  const triShape = new THREE.Shape();
  const triH = (w * Math.sqrt(3)) / 2; // chiều cao tam giác đều
  triShape.moveTo(-w / 2, 0);
  triShape.lineTo(w / 2, 0);
  triShape.lineTo(0, triH);
  triShape.closePath();

  const geoCap = new THREE.ShapeGeometry(triShape);
  const meshBottom = new THREE.Mesh(geoCap, materialCap);
  meshBottom.rotation.x = -Math.PI / 2; // Nằm ngang
  meshBottom.rotation.z = Math.PI;      // Quay đầu tam giác ra ngoài
  bottomCapGroup.add(meshBottom);

  // --- ĐÁY TRÊN (Tam giác đều, bản lề tại z = -h/2) ---
  topCapGroup = new THREE.Group();
  topCapGroup.position.set(0, 0, -h / 2);
  mainGroup.add(topCapGroup);

  const meshTop = new THREE.Mesh(geoCap, materialCap);
  meshTop.rotation.x = -Math.PI / 2;
  topCapGroup.add(meshTop);

  // Đặt góc xoay mặc định của toàn khối 3D để nhìn chéo đẹp mắt
  mainGroup.rotation.x = 0.3;
  mainGroup.rotation.y = -0.6;

  // Lắng nghe sự kiện xoay chuột trên khung 3D
  setupDragInteraction();
  
  // Vẽ khung hình đầu tiên
  updateFolding();
  animate();
}

function setupDragInteraction() {
  const dom = renderer.domElement;

  dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  dom.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };

    // Cập nhật góc xoay của nhóm lăng trụ chính
    mainGroup.rotation.y += deltaMove.x * 0.01;
    mainGroup.rotation.x += deltaMove.y * 0.01;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Hỗ trợ cảm ứng trên di động
  dom.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, { passive: true });

  dom.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaMove = {
      x: e.touches[0].clientX - previousMousePosition.x,
      y: e.touches[0].clientY - previousMousePosition.y
    };

    mainGroup.rotation.y += deltaMove.x * 0.01;
    mainGroup.rotation.x += deltaMove.y * 0.01;

    previousMousePosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, { passive: true });

  dom.addEventListener('touchend', () => {
    isDragging = false;
  });
}

function updateFolding() {
  const progressPercent = parseInt(slider.value);
  
  // Tính hệ số gập (0: Đóng khối hoàn toàn, 1: Trải phẳng hoàn toàn)
  const foldFactor = progressPercent / 100;

  // Cập nhật text trạng thái
  if (progressPercent === 0) {
    progressText.textContent = '0% (Khối kín 3D)';
    progressText.style.color = 'var(--color-danger)';
  } else if (progressPercent === 100) {
    progressText.textContent = '100% (Trải phẳng)';
    progressText.style.color = 'var(--color-success)';
  } else {
    progressText.textContent = `${progressPercent}%`;
    progressText.style.color = 'var(--color-primary)';
  }

  // Góc quay các bộ phận
  // foldFactor = 1 -> góc xoay = 0 (trải phẳng)
  // foldFactor = 0 -> góc xoay = cực đại (đóng khối)
  const angleSides = foldAngleSides * (1 - foldFactor);
  const angleCaps = foldAngleCaps * (1 - foldFactor);

  // Xoay mặt bên trái quanh trục Y (trục hướng lên thẳng)
  sideLeftGroup.rotation.z = angleSides;
  // Xoay mặt bên phải quanh trục Y (xoay ngược chiều)
  sideRightGroup.rotation.z = -angleSides;

  // Xoay nắp đáy dưới quanh trục X
  bottomCapGroup.rotation.x = angleCaps;
  // Xoay nắp đáy trên quanh trục X (ngược chiều)
  topCapGroup.rotation.x = -angleCaps;
}

function animate() {
  requestAnimationFrame(animate);
  
  // Tự động xoay nhẹ khi người dùng không tương tác để tạo hiệu ứng sinh động
  if (!isDragging) {
    mainGroup.rotation.y += 0.002;
  }

  renderer.render(scene, camera);
}

slider.addEventListener('input', updateFolding);

// Lắng nghe resize cửa sổ để responsive camera 3D
window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
});

// Khởi động
init3D();