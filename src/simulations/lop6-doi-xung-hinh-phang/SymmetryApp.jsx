import React, { useState, useEffect, useRef, useCallback } from 'react';

// Giữ lại cấu trúc dữ liệu shapes như cũ (có thể đặt ngoài component)
const SHAPES = {
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

const SymmetryApp = () => {
  const canvasRef = useRef(null);
  const [selectedShape, setSelectedShape] = useState('square');
  const [mode, setMode] = useState('axial'); // 'axial' | 'rotational'
  const [axisIndex, setAxisIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const shapeData = SHAPES[selectedShape];

  // Logic vẽ (Canvas)
  const draw = useCallback((progress) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);

    // Chèn logic vẽ từ source 2 vào đây, sử dụng 'progress' thay vì 'animProgress' state
    // ... logic vẽ chi tiết ...

    ctx.restore();
  }, [selectedShape, mode, axisIndex]);

  // Cập nhật khi thay đổi hình hoặc mode
  useEffect(() => {
    setAxisIndex(0);
    draw(0);
  }, [selectedShape, mode, draw]);

  // Handle Animation
  useEffect(() => {
    if (!isAnimating) return;
    let frameId;
    const animate = () => {
      setAnimProgress(prev => {
        const next = prev + (mode === 'axial' ? 0.02 : 0.015);
        if (next >= 1) {
          setTimeout(() => setIsAnimating(false), 1500);
          return 1;
        }
        draw(next);
        frameId = requestAnimationFrame(animate);
        return next;
      });
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAnimating, mode, draw]);

  return (
    <main className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Đối xứng của các Hình phẳng</h2>
        <p className="text-gray-400">Tìm hiểu về trục và tâm đối xứng.</p>
      </div>

      <div className="flex gap-6">
        <div className="canvas-panel">
          <canvas ref={canvasRef} width="450" height="400" className="math-canvas" />
        </div>

        <div className="control-panel w-80 space-y-4">
          <select 
            value={selectedShape} 
            onChange={(e) => setSelectedShape(e.target.value)}
            className="select-style"
          >
            {Object.keys(SHAPES).map(key => (
              <option key={key} value={key}>{SHAPES[key].name}</option>
            ))}
          </select>

          <div className="tab-group">
            <button 
              className={`tab-btn ${mode === 'axial' ? 'active' : ''}`}
              onClick={() => setMode('axial')}
            >Đối xứng trục</button>
            <button 
              className={`tab-btn ${mode === 'rotational' ? 'active' : ''}`}
              onClick={() => setMode('rotational')}
            >Đối xứng tâm</button>
          </div>

          {/* Controls UI */}
          {mode === 'axial' ? (
             <div className="control-group">
               <select onChange={(e) => setAxisIndex(e.target.value)} className="select-style">
                 {shapeData.axes.map((ax, i) => <option key={i} value={i}>{ax.name}</option>)}
               </select>
               <button onClick={() => setIsAnimating(true)} className="btn-action w-full mt-2">
                 Gấp hình
               </button>
             </div>
          ) : (
            <button onClick={() => setIsAnimating(true)} className="btn-action w-full">
              Xoay hình
            </button>
          )}

          <div className="info-box" dangerouslySetInnerHTML={{ __html: shapeData.description }} />
        </div>
      </div>
    </main>
  );
};

export default SymmetryApp;