import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { createXRStore, XR } from '@react-three/xr';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { buildNetShape, netShapeOptions } from './netShapes.js';
import { Link } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout.jsx';
import { Joyride, STATUS } from 'react-joyride';

const store = createXRStore();

export default function SpatialNetSimulation() {
  const [shapeId, setShapeId] = useState('cube');
  const [progress, setProgress] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Only run tour once per session
    if (!sessionStorage.getItem('tour_spatial_nets')) {
      setRunTour(true);
      sessionStorage.setItem('tour_spatial_nets', 'true');
    }
  }, []);

  const tourSteps = [
    {
      target: '.spatial-canvas-panel',
      content: 'Đây là không gian 3D. Bạn có thể dùng chuột để xoay và thu phóng hình khối.',
      disableBeacon: true,
    },
    {
      target: '.select-control',
      content: 'Chọn một hình khối khác ở đây.',
    },
    {
      target: 'input[type="range"]',
      content: 'Kéo thanh trượt này để tự tay mở phẳng hình khối.',
    },
    {
      target: '.button-row button:first-child',
      content: 'Hoặc bấm vào đây để hệ thống tự động mở khối cho bạn xem nhé!',
    }
  ];
  const shapeOption = netShapeOptions.find((shape) => shape.id === shapeId) || netShapeOptions[0];
  const shape = useMemo(() => buildNetShape(shapeOption), [shapeOption]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <PageLayout>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#3b82f6',
          },
        }}
      />
      <div className="simulation-container spatial-workspace">
        <section className="canvas-panel spatial-canvas-panel">
          <Canvas
            camera={{ position: shape.camera, fov: 45 }}
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true }}
          >
            <XR store={store}>
              <color attach="background" args={['#111827']} />
              <ambientLight intensity={0.65} />
              <directionalLight position={[5, 7, 4]} intensity={1.2} castShadow />
              <directionalLight position={[-4, 3, -5]} intensity={0.45} />
              <gridHelper args={[9, 18, '#334155', '#1f2937']} position={[0, -0.015, 0]} />
              <NetModel
                key={shape.id}
                shape={shape}
                targetProgress={progress / 100}
                autoPlay={autoPlay}
                onAutoProgress={(value) => setProgress(value)}
              />
              <OrbitControls enableDamping makeDefault />
            </XR>
          </Canvas>
        </section>

        <aside className="control-panel">
          <h2>Điều khiển mô phỏng</h2>

          <label className="control-group">
            <span className="control-label">Chọn hình khối</span>
            <select
              className="select-control"
              value={shapeId}
              onChange={(event) => {
                setShapeId(event.target.value);
                setProgress(0);
                setAutoPlay(false);
              }}
            >
              {netShapeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <div className="control-group">
            <div className="control-label">
              <span>Tiến trình trải phẳng</span>
              <strong>{progress}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(event) => {
                setProgress(Number(event.target.value));
                setAutoPlay(false);
              }}
            />
          </div>

          <div className="button-row">
            <button
              className="btn-action"
              type="button"
              onClick={() => setAutoPlay((current) => !current)}
            >
              {autoPlay ? 'Tạm dừng' : 'Tự động mở'}
            </button>
            <button
              className="btn-action btn-muted"
              type="button"
              onClick={() => {
                setProgress(0);
                setAutoPlay(false);
              }}
            >
              Đóng khối
            </button>
            <button
              className="btn-action btn-muted"
              type="button"
              onClick={() => {
                setProgress(100);
                setAutoPlay(false);
              }}
            >
              Trải phẳng
            </button>
            <button
              className="btn-action bg-purple-600 text-white mt-2 w-full"
              type="button"
              onClick={() => store.enterAR()}
            >
              Xem AR
            </button>
          </div>

          <div className="math-display spatial-info mt-4">
            <strong>{shape.name}</strong>
            <span>{shape.formula}</span>
            <small>{shape.note}</small>
          </div>

          <div className="info-box">
            Khi tiến trình bằng 0%, các mặt tạo thành khối kín. Khi đạt 100%, mỗi mặt
            được mở quanh cạnh bản lề để học sinh nhìn rõ cấu trúc lưới phẳng và liên hệ
            trực tiếp với công thức diện tích.
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}

function NetModel({ shape, targetProgress, autoPlay, onAutoProgress }) {
  const autoDirection = useRef(1);
  const autoValue = useRef(targetProgress);

  useFrame((_, delta) => {
    if (!autoPlay) {
      autoValue.current = targetProgress;
      return;
    }

    autoValue.current += autoDirection.current * delta * 0.22;
    if (autoValue.current >= 1) {
      autoValue.current = 1;
      autoDirection.current = -1;
    }
    if (autoValue.current <= 0) {
      autoValue.current = 0;
      autoDirection.current = 1;
    }
    onAutoProgress(Math.round(autoValue.current * 100));
  });

  return (
    <group rotation={[0, -0.35, 0]} position={[0, 0.02, 0]}>
      {shape.faces.map((face) => (
        <DynamicFace
          key={face.id}
          face={face}
          progress={autoPlay ? autoValue : targetProgress}
        />
      ))}
    </group>
  );
}

function DynamicFace({ face, progress }) {
  const meshRef = useRef();
  const lineRef = useRef();
  const current = useRef(typeof progress === 'number' ? progress : progress.current);
  const geometry = useMemo(() => createGeometry(face.from), [face.from]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  useFrame((_, delta) => {
    const target = typeof progress === 'number' ? progress : progress.current;
    current.current = THREE.MathUtils.damp(current.current, target, 8, delta);
    const vertices = interpolateVertices(face.from, face.to, current.current);
    updateGeometry(geometry, vertices);
    updateLineGeometry(lineGeometry, vertices);
  });

  return (
    <>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={face.color}
          metalness={0.08}
          roughness={0.42}
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#f8fafc" transparent opacity={0.45} />
      </lineSegments>
    </>
  );
}

function createGeometry(vertices) {
  const geometry = new THREE.BufferGeometry();
  updateGeometry(geometry, vertices);
  return geometry;
}

function updateGeometry(geometry, vertices) {
  const triangles = triangulate(vertices);
  const positions = new Float32Array(triangles.flatMap((index) => vertices[index]));

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

function updateLineGeometry(geometry, vertices) {
  const points = [];
  vertices.forEach((vertex, index) => {
    points.push(...vertex, ...vertices[(index + 1) % vertices.length]);
  });
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.computeBoundingSphere();
}

function triangulate(vertices) {
  if (vertices.length === 3) return [0, 1, 2];
  if (vertices.length === 4) return [0, 1, 2, 0, 2, 3];
  const points = vertices.map(([x, , z]) => new THREE.Vector2(x, z));
  return THREE.ShapeUtils.triangulateShape(points, []).flat();
}

function interpolateVertices(from, to, progress) {
  return from.map((vertex, index) => [
    THREE.MathUtils.lerp(vertex[0], to[index][0], progress),
    THREE.MathUtils.lerp(vertex[1], to[index][1], progress),
    THREE.MathUtils.lerp(vertex[2], to[index][2], progress),
  ]);
}
