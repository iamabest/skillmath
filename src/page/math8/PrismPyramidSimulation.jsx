import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Cylinder, Cone, Html } from '@react-three/drei';
import { createXRStore, XR } from '@react-three/xr';
import { useControls } from 'leva';
import PageLayout from '../../components/PageLayout';
import * as THREE from 'three';

const store = createXRStore();

export default function PrismPyramidSimulation() {
  const [shapeType, setShapeType] = useState('prism');

  return (
    <PageLayout>
      <div className="simulation-container spatial-workspace">
        <section className="canvas-panel spatial-canvas-panel" style={{ minHeight: '600px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: '10px' }}>
            <button 
              className={`btn-action ${shapeType === 'prism' ? '' : 'btn-muted'}`}
              onClick={() => setShapeType('prism')}
            >
              Lăng trụ đứng
            </button>
            <button 
              className={`btn-action ${shapeType === 'pyramid' ? '' : 'btn-muted'}`}
              onClick={() => setShapeType('pyramid')}
            >
              Hình chóp đều
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
              
              {shapeType === 'prism' ? <PrismModel /> : <PyramidModel />}
              
              <OrbitControls enableDamping makeDefault />
            </XR>
          </Canvas>
        </section>

        <aside className="control-panel">
          <h2>Phòng Thí Nghiệm 3D: {shapeType === 'prism' ? 'Lăng trụ' : 'Hình chóp'}</h2>
          <div className="info-box">
            Sử dụng bảng điều khiển (góc trên bên phải màn hình 3D) để thay đổi:
            <ul>
              <li>Số cạnh đáy (từ 3 đến 12)</li>
              <li>Bán kính đáy</li>
              <li>Chiều cao của khối</li>
            </ul>
            Dùng chuột để xoay, thu phóng hình không gian.
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}

function PrismModel() {
  const { edges, radius, height, color, wireframe } = useControls('Lăng Trụ', {
    edges: { value: 3, min: 3, max: 12, step: 1, label: 'Số cạnh đáy' },
    radius: { value: 2, min: 1, max: 5, step: 0.1, label: 'Bán kính' },
    height: { value: 4, min: 1, max: 8, step: 0.1, label: 'Chiều cao' },
    color: { value: '#3b82f6', label: 'Màu sắc' },
    wireframe: { value: false, label: 'Khung dây' }
  });

  return (
    <group position={[0, height / 2 - 2, 0]}>
      <Cylinder args={[radius, radius, height, edges]} castShadow receiveShadow>
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.5} transparent opacity={0.9} />
      </Cylinder>
      <Cylinder args={[radius, radius, height, edges]} >
        <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.2} />
      </Cylinder>
    </group>
  );
}

function PyramidModel() {
  const { edges, radius, height, color, wireframe } = useControls('Hình Chóp', {
    edges: { value: 4, min: 3, max: 12, step: 1, label: 'Số cạnh đáy' },
    radius: { value: 2, min: 1, max: 5, step: 0.1, label: 'Bán kính' },
    height: { value: 4, min: 1, max: 8, step: 0.1, label: 'Chiều cao' },
    color: { value: '#10b981', label: 'Màu sắc' },
    wireframe: { value: false, label: 'Khung dây' }
  });

  return (
    <group position={[0, height / 2 - 2, 0]}>
      <Cone args={[radius, height, edges]} castShadow receiveShadow>
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.5} transparent opacity={0.9} />
      </Cone>
      <Cone args={[radius, height, edges]} >
        <meshBasicMaterial color="#ffffff" wireframe={true} transparent opacity={0.2} />
      </Cone>
    </group>
  );
}
