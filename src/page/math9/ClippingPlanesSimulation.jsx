import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cone, Cylinder, Sphere } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import PageLayout from '../../components/PageLayout';

const ClippingObject = ({ shapeType, planeConstant, planeNormal }) => {
  const materialRef = useRef();
  
  // Tạo clipping plane
  const clippingPlane = useMemo(() => {
    return new THREE.Plane(
      new THREE.Vector3(...planeNormal).normalize(),
      planeConstant
    );
  }, [planeConstant, planeNormal]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.clippingPlanes = [clippingPlane];
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Hình cắt */}
      {shapeType === 'cube' && <Box args={[3, 3, 3]} castShadow receiveShadow>
        <meshStandardMaterial ref={materialRef} color="#3b82f6" side={THREE.DoubleSide} clipShadows />
      </Box>}
      {shapeType === 'cone' && <Cone args={[2, 4, 32]} castShadow receiveShadow>
        <meshStandardMaterial ref={materialRef} color="#ec4899" side={THREE.DoubleSide} clipShadows />
      </Cone>}
      {shapeType === 'cylinder' && <Cylinder args={[2, 2, 4, 32]} castShadow receiveShadow>
        <meshStandardMaterial ref={materialRef} color="#10b981" side={THREE.DoubleSide} clipShadows />
      </Cylinder>}
      {shapeType === 'sphere' && <Sphere args={[2, 32, 32]} castShadow receiveShadow>
        <meshStandardMaterial ref={materialRef} color="#f59e0b" side={THREE.DoubleSide} clipShadows />
      </Sphere>}
      
      {/* Mặt phẳng cắt (hiển thị trực quan) */}
      <mesh
        position={[
          planeNormal[0] * -planeConstant,
          planeNormal[1] * -planeConstant,
          planeNormal[2] * -planeConstant
        ]}
        // Cần tính góc xoay của mặt phẳng dựa trên pháp tuyến
        quaternion={new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(...planeNormal).normalize()
        )}
      >
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
};

export default function ClippingPlanesSimulation() {
  const { shapeType, constant, normalX, normalY, normalZ } = useControls('Mặt phẳng cắt', {
    shapeType: {
      options: {
        'Hình lập phương': 'cube',
        'Hình nón': 'cone',
        'Hình trụ': 'cylinder',
        'Hình cầu': 'sphere'
      },
      label: 'Khối 3D'
    },
    constant: { value: 0, min: -3, max: 3, step: 0.1, label: 'Tịnh tiến (d)' },
    normalX: { value: 0, min: -1, max: 1, step: 0.1, label: 'Góc nghiêng X' },
    normalY: { value: -1, min: -1, max: 1, step: 0.1, label: 'Góc nghiêng Y' },
    normalZ: { value: 0, min: -1, max: 1, step: 0.1, label: 'Góc nghiêng Z' }
  });

  return (
    <PageLayout>
      <div className="simulation-container">
  <section className="canvas-panel">
          {/* Quan trọng: Bật localClippingEnabled cho WebGLRenderer */}
          <Canvas 
            camera={{ position: [5, 5, 5], fov: 50 }} 
            shadows 
            gl={{ localClippingEnabled: true }}
          >
            <color attach="background" args={['#111827']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
            <directionalLight position={[-10, 10, -10]} intensity={0.5} />
            <gridHelper args={[10, 10, '#334155', '#1f2937']} position={[0, -3, 0]} />
            
            {/* Đảm bảo vector pháp tuyến không bao giờ là vector 0 */}
            <ClippingObject 
              shapeType={shapeType} 
              planeConstant={constant} 
              planeNormal={
                (normalX === 0 && normalY === 0 && normalZ === 0) 
                  ? [0, 1, 0] 
                  : [normalX, normalY, normalZ]
              } 
            />
            
            <OrbitControls enableDamping makeDefault />
          </Canvas>
        </section>

        <section className="control-panel">
          <h2 className="panel-title">Thiết diện của hình khối 3D</h2>
          <p className="text-gray-300 text-sm mb-4">
            Khám phá hình dạng mặt cắt (thiết diện) khi dùng một mặt phẳng cắt ngang qua các khối không gian.
          </p>

          <div className="info-box">
            <h3 className="font-semibold text-white mb-2">Thực hành:</h3>
            <ul className="list-disc pl-5 text-gray-300 space-y-2 text-sm">
              <li>Cắt <strong>Hình nón</strong> theo mặt phẳng song song với đáy để tạo thiết diện <em>hình tròn</em>.</li>
              <li>Cắt <strong>Hình nón</strong> theo mặt nghiêng để tạo thiết diện <em>elip</em> hoặc <em>parabol</em>.</li>
              <li>Cắt <strong>Hình lập phương</strong> qua các góc để tạo thiết diện <em>tam giác đều</em> hoặc <em>lục giác đều</em>.</li>
            </ul>
          </div>
          
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
            <p className="text-sm text-blue-200">
              💡 <strong>Mẹo:</strong> Kéo các thanh trượt bên phải để thay đổi vị trí và độ nghiêng của mặt phẳng cắt. Dùng chuột để xoay và nhìn từ trên xuống để thấy rõ hình dạng thiết diện.
            </p>
          </div>
        </section>

      
      </div>
    </PageLayout>
  );
}
