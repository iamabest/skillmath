import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function AlgebraIdentities2Simulation() {
  const [identity, setIdentity] = useState("diff_sq"); // "diff_sq" -> (a-b)^2, "sq_diff" -> a^2-b^2
  const [a, setA] = useState(5);
  const [b, setB] = useState(2);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ensure b < a
  useEffect(() => {
    if (b >= a) {
      setB(a - 1 > 0 ? a - 1 : 1);
    }
  }, [a, b]);

  const drawDiffSq = (ctx, canvas) => {
    const scale = 40;
    const paddingX = 50;
    const paddingY = 50;
    
    // Total size a*a
    const sa = a * scale;
    const sb = b * scale;
    const sab = (a - b) * scale;
    
    // Draw full a^2 background
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(paddingX, paddingY, sa, sa);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.strokeRect(paddingX, paddingY, sa, sa);
    
    // Draw regions
    // 1. (a-b)^2
    ctx.fillStyle = "#60a5fa"; // blue
    ctx.fillRect(paddingX, paddingY, sab, sab);
    ctx.strokeRect(paddingX, paddingY, sab, sab);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`(a-b)²`, paddingX + sab/2 - 20, paddingY + sab/2);
    
    // 2. b * (a-b) [Right]
    ctx.fillStyle = "rgba(248, 113, 113, 0.5)"; // red
    ctx.fillRect(paddingX + sab, paddingY, sb, sab);
    ctx.strokeRect(paddingX + sab, paddingY, sb, sab);
    
    // 3. (a-b) * b [Bottom]
    ctx.fillStyle = "rgba(248, 113, 113, 0.5)"; // red
    ctx.fillRect(paddingX, paddingY + sab, sab, sb);
    ctx.strokeRect(paddingX, paddingY + sab, sab, sb);
    
    // 4. b^2 [Bottom Right]
    ctx.fillStyle = "rgba(250, 204, 21, 0.8)"; // yellow
    ctx.fillRect(paddingX + sab, paddingY + sab, sb, sb);
    ctx.strokeRect(paddingX + sab, paddingY + sab, sb, sb);
    ctx.fillStyle = "black";
    ctx.fillText(`b²`, paddingX + sab + sb/2 - 10, paddingY + sab + sb/2 + 5);

    // Labels
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(`a`, paddingX + sa/2 - 5, paddingY - 15);
    ctx.fillText(`a`, paddingX - 25, paddingY + sa/2 + 5);
    
    // Brackets for a
    ctx.beginPath();
    ctx.moveTo(paddingX, paddingY - 5); ctx.lineTo(paddingX, paddingY - 10); ctx.lineTo(paddingX + sa, paddingY - 10); ctx.lineTo(paddingX + sa, paddingY - 5);
    ctx.stroke();
  };

  const drawSqDiff = (ctx, canvas) => {
    const scale = 30;
    const paddingX = 30;
    const paddingY = 50;
    
    const sa = a * scale;
    const sb = b * scale;
    
    // Shape 1: a^2 - b^2
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(paddingX, paddingY, sa, sa); // full a^2
    ctx.clearRect(paddingX + sa - sb, paddingY, sb, sb); // remove b^2 at top right
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    // Outline the remaining shape
    ctx.beginPath();
    ctx.moveTo(paddingX, paddingY);
    ctx.lineTo(paddingX + sa - sb, paddingY);
    ctx.lineTo(paddingX + sa - sb, paddingY + sb);
    ctx.lineTo(paddingX + sa, paddingY + sb);
    ctx.lineTo(paddingX + sa, paddingY + sa);
    ctx.lineTo(paddingX, paddingY + sa);
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = "white";
    ctx.fillText(`a² - b²`, paddingX + 20, paddingY + sa - 20);
    
    // Arrow
    ctx.font = "24px Arial";
    ctx.fillText("→", paddingX + sa + 20, paddingY + sa/2);
    
    // Shape 2: (a+b)(a-b)
    const offsetX = paddingX + sa + 60;
    
    // Rectangle (a-b) height, a width
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(offsetX, paddingY + sb, sa, sa - sb);
    ctx.strokeRect(offsetX, paddingY + sb, sa, sa - sb);
    
    // Rectangle (a-b) height, b width (moved from top left)
    ctx.fillStyle = "rgba(96, 165, 250, 0.5)"; // lighter blue
    ctx.fillRect(offsetX + sa, paddingY + sb, sb, sa - sb);
    ctx.strokeRect(offsetX + sa, paddingY + sb, sb, sa - sb);
    
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`(a-b)`, offsetX - 40, paddingY + sb + (sa-sb)/2 + 5);
    ctx.fillText(`(a+b)`, offsetX + (sa+sb)/2 - 20, paddingY + sa + 25);
    
    // Total rect is (a+b) x (a-b)
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (identity === "diff_sq") {
      drawDiffSq(ctx, canvas);
    } else {
      drawSqDiff(ctx, canvas);
    }
  };

  useEffect(() => {
    draw();
  }, [a, b, identity]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={canvasRef} width="500" height="400" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            {identity === "diff_sq" ? (
              <>
                <h4 style={{ color: '#60a5fa' }}>Bình phương của một hiệu</h4>
                <p style={{ margin: '10px 0', fontSize: '1.2rem' }}>
                  <strong>(a - b)² = a² - 2ab + b²</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  ({a} - {b})² = {a}² - 2({a})({b}) + {b}² = {a*a} - {2*a*b} + {b*b} = {Math.pow(a-b, 2)}
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  Lấy hình vuông a², trừ đi 2 hình chữ nhật ab (đỏ), ta đã trừ phần b² (vàng) hai lần. Do đó cần cộng thêm b² để bù lại.
                </p>
              </>
            ) : (
              <>
                <h4 style={{ color: '#60a5fa' }}>Hiệu hai bình phương</h4>
                <p style={{ margin: '10px 0', fontSize: '1.2rem' }}>
                  <strong>a² - b² = (a - b)(a + b)</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {a}² - {b}² = ({a} - {b})({a} + {b}) = {a-b} × {a+b} = {Math.pow(a,2) - Math.pow(b,2)}
                </p>
                <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  Bắt đầu từ hình vuông a², cắt bỏ hình vuông b². Phần còn lại có thể cắt và ghép thành hình chữ nhật có kích thước (a+b) × (a-b).
                </p>
              </>
            )}
          </div>
        </div>

        <div className="control-panel">
          <h3>Trực quan Hằng Đẳng Thức</h3>
          
          <div className="control-group">Chọn Hằng Đẳng Thức:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button 
              className={`btn-action ${identity !== 'diff_sq' ? 'btn-muted' : ''}`}
              onClick={() => setIdentity("diff_sq")}
            >
              (a - b)² = a² - 2ab + b²
            </button>
            <button 
              className={`btn-action ${identity !== 'sq_diff' ? 'btn-muted' : ''}`}
              onClick={() => setIdentity("sq_diff")}
            >
              a² - b² = (a - b)(a + b)
            </button>
          </div>

          <div className="control-group">Giá trị a: {a}</div>
          <input
            type="range"
            min="2"
            max="8"
            value={a}
            onChange={(e) => setA(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />

          <div className="control-group">Giá trị b: {b}</div>
          <input
            type="range"
            min="1"
            max={a - 1 > 0 ? a - 1 : 1}
            value={b}
            onChange={(e) => setB(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
