const container = document.getElementById('canvas3dContainer');
const slider = document.getElementById('foldSlider');
const progressText = document.getElementById('foldProgressText');

// === KÍCH THƯỚC HỘP ===
const W = 2.0;  // Chiều rộng (trục X)
const D = 2.0;  // Chiều sâu (trục Z)
const H = 3.0;  // Chiều cao (trục Y)

const MAX_ANGLE = Math.PI / 2; // 90 độ

// === BIẾN TOÀN CỤC ===
let scene, camera, renderer, mainGroup;
let faceGroups = {};
let isDragging = false;
let prevMouse = { x: 0, y: 0 };

// === HÀM TẠO MẶT PHẲNG ===
function createPlane(width, height, color, pos, rot) {
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshStandardMaterial({
        color: color,
        side: THREE.DoubleSide,
        roughness: 0.4,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.set(rot.x, rot.y, rot.z);
    return mesh;
}

// === THÊM ĐƯỜNG VIỀN ===
function addEdgesToMesh(mesh, parent) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
    const line = new THREE.LineSegments(edges, lineMat);
    line.position.copy(mesh.position);
    line.rotation.copy(mesh.rotation);
    parent.add(line);
}

// === KHỞI TẠO 3D ===
function init3D() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Ánh sáng
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    // Nhóm chính
    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Màu sắc
    const colors = {
        bottom: 0x3b82f6,
        top: 0x60a5fa,
        left: 0x8b5cf6,
        right: 0xa78bfa,
        front: 0x10b981,
        back: 0x34d399
    };

    // ----- 1. Mặt đáy (cố định) -----
    const bottom = createPlane(W, D, colors.bottom,
        { x: 0, y: -H/2, z: 0 },
        { x: -Math.PI/2, y: 0, z: 0 }
    );
    mainGroup.add(bottom);
    addEdgesToMesh(bottom, mainGroup);

    // ----- 2. Mặt trái (bản lề tại cạnh trái) -----
    const leftGroup = new THREE.Group();
    leftGroup.position.set(-W/2, -H/2, 0);
    mainGroup.add(leftGroup);

    const left = createPlane(H, D, colors.left,
        { x: 0, y: H/2, z: 0 },          // Dịch lên nửa chiều cao
        { x: 0, y: Math.PI/2, z: 0 }      // Xoay Y 90° để pháp tuyến hướng -X
    );
    leftGroup.add(left);
    addEdgesToMesh(left, leftGroup);
    faceGroups.left = { group: leftGroup, mesh: left };

    // ----- 3. Mặt phải (bản lề tại cạnh phải) -----
    const rightGroup = new THREE.Group();
    rightGroup.position.set(W/2, -H/2, 0);
    mainGroup.add(rightGroup);

    const right = createPlane(H, D, colors.right,
        { x: 0, y: H/2, z: 0 },
        { x: 0, y: -Math.PI/2, z: 0 }     // Xoay Y -90° để pháp tuyến hướng +X
    );
    rightGroup.add(right);
    addEdgesToMesh(right, rightGroup);
    faceGroups.right = { group: rightGroup, mesh: right };

    // ----- 4. Mặt trước (bản lề tại cạnh trước) -----
    const frontGroup = new THREE.Group();
    frontGroup.position.set(0, -H/2, D/2);
    mainGroup.add(frontGroup);

    const front = createPlane(W, H, colors.front,
        { x: 0, y: H/2, z: 0 },
        { x: 0, y: 0, z: 0 }              // Pháp tuyến mặc định +Z (đứng thẳng)
    );
    frontGroup.add(front);
    addEdgesToMesh(front, frontGroup);
    faceGroups.front = { group: frontGroup, mesh: front };

    // ----- 5. Mặt sau (bản lề tại cạnh sau) -----
    const backGroup = new THREE.Group();
    backGroup.position.set(0, -H/2, -D/2);
    mainGroup.add(backGroup);

    const back = createPlane(W, H, colors.back,
        { x: 0, y: H/2, z: 0 },
        { x: 0, y: Math.PI, z: 0 }        // Xoay Y 180° để pháp tuyến hướng -Z
    );
    backGroup.add(back);
    addEdgesToMesh(back, backGroup);
    faceGroups.back = { group: backGroup, mesh: back };

    // ----- 6. Mặt trên (không gập, di chuyển) -----
    const top = createPlane(W, D, colors.top,
        { x: 0, y: H/2, z: 0 },
        { x: -Math.PI/2, y: 0, z: 0 }
    );
    mainGroup.add(top);
    addEdgesToMesh(top, mainGroup);
    faceGroups.top = { mesh: top };

    // Xoay khối ban đầu để nhìn đẹp
    mainGroup.rotation.x = 0.3;
    mainGroup.rotation.y = -0.5;

    // Thiết lập tương tác và cập nhật
    setupDragInteraction();
    updateFolding();
    animate();
}

// === TƯƠNG TÁC KÉO THẢ ===
function setupDragInteraction() {
    const dom = renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        mainGroup.rotation.y += dx * 0.01;
        mainGroup.rotation.x += dy * 0.01;
        prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Hỗ trợ cảm ứng
    dom.addEventListener('touchstart', (e) => {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - prevMouse.x;
        const dy = e.touches[0].clientY - prevMouse.y;
        mainGroup.rotation.y += dx * 0.01;
        mainGroup.rotation.x += dy * 0.01;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    dom.addEventListener('touchend', () => { isDragging = false; });
}

// === CẬP NHẬT TRẠNG THÁI GẬP ===
function updateFolding() {
    const percent = parseInt(slider.value);
    const foldFactor = percent / 100;          // 0 → 1
    const angle = MAX_ANGLE * foldFactor;      // 0 → 90°

    // Hiển thị trạng thái
    if (percent === 0) {
        progressText.textContent = '0% (Hộp kín)';
        progressText.style.color = '#ef4444';
    } else if (percent === 100) {
        progressText.textContent = '100% (Trải phẳng)';
        progressText.style.color = '#22c55e';
    } else {
        progressText.textContent = `${percent}%`;
        progressText.style.color = '#3b82f6';
    }

    // --- Gập các mặt bên ---
    // Mặt trái: xoay quanh trục Z (bản lề dọc theo Z)
    if (faceGroups.left) {
        faceGroups.left.group.rotation.z = angle;
        faceGroups.left.mesh.material.opacity = 0.6 + 0.4 * (1 - foldFactor);
    }
    // Mặt phải: xoay ngược chiều
    if (faceGroups.right) {
        faceGroups.right.group.rotation.z = -angle;
        faceGroups.right.mesh.material.opacity = 0.6 + 0.4 * (1 - foldFactor);
    }
    // Mặt trước: xoay quanh trục X (bản lề dọc theo X)
    if (faceGroups.front) {
        faceGroups.front.group.rotation.x = angle;
        faceGroups.front.mesh.material.opacity = 0.6 + 0.4 * (1 - foldFactor);
    }
    // Mặt sau: xoay ngược chiều
    if (faceGroups.back) {
        faceGroups.back.group.rotation.x = -angle;
        faceGroups.back.mesh.material.opacity = 0.6 + 0.4 * (1 - foldFactor);
    }

    // --- Mặt trên di chuyển xuống khi gập ---
    if (faceGroups.top) {
        // Khi foldFactor = 0 → y = H/2, khi = 1 → y = -H/2
        const yTop = -H/2 + H * (1 - foldFactor);
        faceGroups.top.mesh.position.y = yTop;
        // Làm mờ dần khi gập
        faceGroups.top.mesh.material.opacity = 0.3 + 0.7 * (1 - foldFactor);
    }
}

// === VÒNG LẶP ANIMATION ===
function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
        mainGroup.rotation.y += 0.002;
    }
    renderer.render(scene, camera);
}

// === SỰ KIỆN SLIDER ===
slider.addEventListener('input', updateFolding);

// === RESPONSIVE ===
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
});

// === KHỞI ĐỘNG ===
init3D();