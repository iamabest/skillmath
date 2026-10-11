import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Cylinder, Cone, Sphere } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import { useControls } from 'leva';
import PageLayout from '../../components/PageLayout';

const store = createXRStore();

export default function RevolutionSolidSimulation() {
  const [solidType, setSolidType] = useState('cylinder');

  return (
    <PageLayout>
      <div className="simulation-container spatial-workspace">
        <section className="canvas-panel spatial-canvas-panel" style={{ minHeight: '600px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: '10px' }}>
            <button 
              className={`btn-action ${solidType === 'cylinder' ? '' : 'btn-muted'}`}
              onClick={() => setSolidType('cylinder')}
            >
              Hình trụ
            </button>
            <button 
              className={`btn-action ${solidType === 'cone' ? '' : 'btn-muted'}`}
              onClick={() => setSolidType('cone')}
            >
              Hình nón
            </button>
            <button 
              className={`btn-action ${solidType === 'sphere' ? '' : 'btn-muted'}`}
              onClick={() => setSolidType('sphere')}
            >
              Hình cầu
            </button>
            <button
              className="btn-action bg-purple-600 text-white"
              onClick={() => store.enterAR()}
            >
              Xem AR
            </button>
          </div>

          <Canvas camera={{ position: [5, 5, 5], fov: 45 }} shadows dpr={[1, 2]}>
            <XR store={store}>
              <color attach="background" args={['#111827']} />
              <ambientLight intensity={0.65} />
              <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
              <gridHelper args={[20, 20, '#334155', '#1f2937']} position={[0, -2, 0]} />
              
              {solidType === 'cylinder' && <CylinderSolid />}
              {solidType === 'cone' && <ConeSolid />}
              {solidType === 'sphere' && <SphereSolid />}
              
              <OrbitControls enableDamping makeDefault />
            </XR>
          </Canvas>
        </section>

        <aside className="control-panel">
          <h2>Khối Tròn Xoay Lớp 9</h2>
          <div className="info-box">
            Sử dụng bảng điều khiển để thay đổi:
            <ul>
              <li>Bán kính</li>
              <li>Chiều cao</li>
              <li>Góc xoay (từ 0 đến 360 độ) để thấy quá trình tạo thành hình.</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}

function CylinderSolid() {
  const { radius, height, angle, color, wireframe } = useControls('Hình Trụ', {
    radius: { value: 2, min: 1, max: 5, step: 0.1, label: 'Bán kính (r)' },
    height: { value: 4, min: 1, max: 8, step: 0.1, label: 'Chiều cao (h)' },
    angle: { value: Math.PI * 2, min: 0, max: Math.PI * 2, step: 0.1, label: 'Góc quay' },
    color: { value: '#f59e0b', label: 'Màu sắc' },
    wireframe: { value: false, label: 'Khung dây' }
  });

  return (
    <group position={[0, height / 2 - 2, 0]}>
      <Cylinder args={[radius, radius, height, 32, 1, false, 0, angle]} castShadow receiveShadow>
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.5} transparent opacity={0.9} side={2} />
      </Cylinder>
    </group>
  );
}

function ConeSolid() {
  const { radius, height, angle, color, wireframe } = useControls('Hình Nón', {
    radius: { value: 2, min: 1, max: 5, step: 0.1, label: 'Bán kính (r)' },
    height: { value: 4, min: 1, max: 8, step: 0.1, label: 'Chiều cao (h)' },
    angle: { value: Math.PI * 2, min: 0, max: Math.PI * 2, step: 0.1, label: 'Góc quay' },
    color: { value: '#ef4444', label: 'Màu sắc' },
    wireframe: { value: false, label: 'Khung dây' }
  });

  return (
    <group position={[0, height / 2 - 2, 0]}>
      <Cone args={[radius, height, 32, 1, false, 0, angle]} castShadow receiveShadow>
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.5} transparent opacity={0.9} side={2} />
      </Cone>
    </group>
  );
}

function SphereSolid() {
  const { radius, angle, color, wireframe } = useControls('Hình Cầu', {
    radius: { value: 2.5, min: 1, max: 5, step: 0.1, label: 'Bán kính (r)' },
    angle: { value: Math.PI * 2, min: 0, max: Math.PI * 2, step: 0.1, label: 'Góc quay' },
    color: { value: '#8b5cf6', label: 'Màu sắc' },
    wireframe: { value: false, label: 'Khung dây' }
  });

  return (
    <group position={[0, 0, 0]}>
      <Sphere args={[radius, 32, 32, 0, angle]} castShadow receiveShadow>
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.5} transparent opacity={0.9} side={2} />
      </Sphere>
    </group>
  );
}
