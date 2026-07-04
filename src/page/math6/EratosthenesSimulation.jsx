

import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Center } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import PageLayout from "../../components/PageLayout";

const MAX_NUM = 100;
const GRID_COLS = 10;

const getPrimeData = (max) => {
  const isPrime = Array(max + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;
  for (let p = 2; p * p <= max; p++) {
    if (isPrime[p]) {
      for (let i = p * p; i <= max; i += p) {
        isPrime[i] = false;
      }
    }
  }
  return isPrime;
};

const NumberBlock = ({ num, status, position }) => {
  const isEliminated = status === "eliminated";
  const isPrime = status === "prime";
  const isCurrentPrime = status === "current_prime";

  const { scale, posY, color } = useSpring({
    scale: isEliminated ? 0 : 1,
    posY: isEliminated ? position[1] - 5 : position[1],
    color: isCurrentPrime
      ? "#facc15" // yellow-400
      : isPrime
      ? "#4ade80" // green-400
      : "#3b82f6", // blue-500
    config: { mass: 1, tension: 170, friction: 20 },
  });

  // Đã bỏ dòng điều kiện if(isEliminated && scale.get() < 0.1) 
  // Chỉ cần scale về 0 là khối tự biến mất mượt mà

  return (
    <animated.mesh 
      // SỬA LỖI: Tách riêng các trục position để @react-spring có thể nội suy posY
      position-x={position[0]} 
      position-y={posY} 
      position-z={position[2]} 
      scale={scale}
    >
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <animated.meshStandardMaterial color={color} />
      <Text
        position={[0, 0, 0.41]}
        fontSize={0.4}
        color={isCurrentPrime || isPrime ? "#000000" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
      >
        {num}
      </Text>
    </animated.mesh>
  );
};

export default function EratosthenesSimulation() {
  const [numbers, setNumbers] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentP, setCurrentP] = useState(null);
  const [message, setMessage] = useState(
    "Nhấn Bắt đầu để tìm các số nguyên tố từ 2 đến 100."
  );

  const isPrimeRef = useMemo(() => getPrimeData(MAX_NUM), []);

  useEffect(() => {
    const nums = [];
    const initStatus = {};
    for (let i = 2; i <= MAX_NUM; i++) {
      nums.push(i);
      initStatus[i] = "idle";
    }
    setNumbers(nums);
    setStatusMap(initStatus);
  }, []);

  const runSieve = async () => {
    setIsRunning(true);
    let currentStatuses = { ...statusMap };

    for (let i = 2; i <= MAX_NUM; i++) {
      currentStatuses[i] = "idle";
    }
    setStatusMap({ ...currentStatuses });

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    for (let p = 2; p <= Math.sqrt(MAX_NUM); p++) {
      if (currentStatuses[p] === "eliminated") continue;

      setCurrentP(p);
      setMessage(`Xét số ${p}. ${p} là số nguyên tố.`);
      currentStatuses[p] = "current_prime";
      setStatusMap({ ...currentStatuses });
      await delay(1000);

      let hasMultiples = false;
      for (let i = p * p; i <= MAX_NUM; i += p) {
        if (currentStatuses[i] !== "eliminated") {
          currentStatuses[i] = "eliminated";
          hasMultiples = true;
        }
      }

      if (hasMultiples) {
        setMessage(`Loại bỏ các bội số của ${p}.`);
        setStatusMap({ ...currentStatuses });
        await delay(1200);
      }

      currentStatuses[p] = "prime";
      setStatusMap({ ...currentStatuses });
    }

    for (let i = 2; i <= MAX_NUM; i++) {
      if (currentStatuses[i] === "idle") {
        currentStatuses[i] = "prime";
      }
    }
    setMessage("Hoàn thành! Các khối còn lại là số nguyên tố.");
    setStatusMap({ ...currentStatuses });
    setCurrentP(null);
    setIsRunning(false);
  };

  const resetSieve = () => {
    const initStatus = {};
    for (let i = 2; i <= MAX_NUM; i++) {
      initStatus[i] = "idle";
    }
    setStatusMap(initStatus);
    setMessage("Nhấn Bắt đầu để tìm các số nguyên tố từ 2 đến 100.");
    setCurrentP(null);
  };

  return (
    <PageLayout>
      {/* Thêm style mặc định để đảm bảo layout chia lưới hoặc hiển thị tốt */}
      <div className="simulation-container" >
        
        {/* SỬA LỖI: Thêm minHeight và width cụ thể cho thẻ bọc ngoài Canvas */}
        <section className="canvas-panel" style={{ height: '600px', width: '100%', backgroundColor: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
          <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 10]}
              intensity={1}
              castShadow
            />

            <Center>
              <group position={[0, 0, 0]}>
                {numbers.map((num) => {
                  const idx = num - 2;
                  const col = idx % GRID_COLS;
                  const row = Math.floor(idx / GRID_COLS);

                  const x = (col - GRID_COLS / 2 + 0.5) * 1.1;
                  const y = (GRID_COLS / 2 - row - 0.5) * 1.1;
                  const z = 0;

                  return (
                    <NumberBlock
                      key={num}
                      num={num}
                      status={statusMap[num] || "idle"}
                      position={[x, y, z]}
                    />
                  );
                })}
              </group>
            </Center>

            <OrbitControls enableDamping makeDefault />
          </Canvas>
        </section>

        <section className="control-panel">
          <h2 className="panel-title text-2xl font-bold mb-4">Tìm số nguyên 3D</h2>

          <div className="stat-box">
            <p className="text-lg font-medium text-blue-300">{message}</p>
          </div>

          <div className="button-row flex gap-4">
            <button
              className="btn-action bg-gr een-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
              onClick={runSieve}
              disabled={isRunning}
            >
              {isRunning ? "Đang chạy..." : "Bắt đầu sàng"}
            </button>
            <button
              className="btn-action bg-gray-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
              onClick={resetSieve}
              disabled={isRunning}
            >
              Làm lại
            </button>
          </div>

          <div className="info-box">
            <h3 className="font-semibold mb-2">Chú giải:</h3>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Số chưa xét</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm">Số nguyên tố đang xét</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm">Số nguyên tố đã xác nhận</span>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
