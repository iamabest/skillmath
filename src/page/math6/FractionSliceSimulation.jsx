import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Cylinder, Html } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import PageLayout from '../../components/PageLayout';

// Hàm rút gọn phân số
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const simplifyFraction = (n, d) => {
  const divisor = gcd(n, d);
  return { num: n / divisor, den: d / divisor };
};

export default function FractionSliceSimulation() {
  const { percentage, color } = useControls('Điều khiển Lát cắt', {
    percentage: {
      value: 75,
      min: 0,
      max: 100,
      step: 1,
      label: 'Phần trăm (%)'
    },
    color: {
      value: '#ec4899', // pink-500
      label: 'Màu sắc'
    }
  });

  const thetaLength = (percentage / 100) * Math.PI * 2;
  const decimal = (percentage / 100).toFixed(2);
  const { num, den } = simplifyFraction(percentage, 100);

  return (
    <PageLayout>
      <div className="simulation-container">
         <section className="canvas-panel relative">
          <Canvas camera={{ position: [0, 4, 6], fov: 45 }} shadows>
            <color attach="background" args={['#111827']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <gridHelper args={[10, 10, '#334155', '#1f2937']} position={[0, -0.5, 0]} />
            
            <group position={[0, 0, 0]}>
              {/* Khối nền trong suốt (phần còn lại) */}
              <Cylinder args={[2, 2, 1, 64]} castShadow receiveShadow>
                <meshPhysicalMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.1} 
                  roughness={0.1}
                  transmission={0.9}
                  thickness={0.5}
                />
              </Cylinder>

              {/* Lát cắt */}
              {percentage > 0 && (
                <Cylinder 
                  args={[2.01, 2.01, 1.01, 64, 1, false, 0, thetaLength]} 
                  rotation={[0, -Math.PI / 2, 0]} // Xoay để bắt đầu từ trên cùng/chính diện
                >
                  <meshStandardMaterial 
                    color={color} 
                    roughness={0.3} 
                    metalness={0.2} 
                    side={THREE.DoubleSide} 
                  />
                </Cylinder>
              )}
            </group>

            <OrbitControls enableDamping makeDefault />
          </Canvas>
        </section>
        <section className="relative control-panel">
          <h2 className="panel-title">Mô phỏng Phân số & Tỷ số Phần trăm</h2>
          <p className="text-gray-300 text-sm mb-6">
            Khám phá mối liên hệ giữa phân số, số thập phân và tỷ số phần trăm thông qua lát cắt 3D trực quan.
          </p>

          <div className="stat-box">
            <h3 className="text-ml font-semibold mb-4 text-white ">Kết quả tương đương:</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-900 p-4 rounded border border-gray-600">
                <p className="text-sm text-gray-400 mb-2">Phần trăm</p>
                <p className="text-2xl font-bold text-pink-400">{percentage}%</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded border border-gray-600">
                <p className="text-sm text-gray-400 mb-2">Số thập phân</p>
                <p className="text-2xl font-bold text-blue-400">{decimal}</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded border border-gray-600 flex flex-col items-center justify-center">
                <p className="text-sm text-gray-400 mb-2">Phân số</p>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-green-400 border-b-2 border-green-400 px-2 leading-none pb-1">{percentage}</span>
                  <span className="text-xl font-bold text-green-400 px-2 leading-none pt-1">100</span>
                </div>
                {num !== percentage && (
                  <div className="mt-2 text-gray-300 flex items-center gap-2">
                    <span>=</span>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold border-b border-gray-300 px-1 leading-none pb-0.5">{num}</span>
                      <span className="text-lg font-bold px-1 leading-none pt-0.5">{den}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="info-box">
            <p className="text-sm text-blue-200">
              💡 <strong>Mẹo:</strong> Kéo thanh trượt bên phải để thay đổi tỷ lệ lát cắt. Bạn có thể dùng chuột để xoay khối 3D.
            </p>
          </div>
        </section>

       
      </div>
    </PageLayout>
  );
}
