import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';

export default function ProtractorSimulation() {
  const canvasRef = useRef(null);

  // Trạng thái mô phỏng
  const [mode, setMode] = useState('measure'); // 'measure': Đo góc ngẫu nhiên, 'create': Dựng góc
  const [showProtractor, setShowProtractor] = useState(true);
  
  // Trạng thái góc cần đo/dựng
  const [targetAngle, setTargetAngle] = useState(60); // dùng cho mode 'create'
  const [hiddenAngle, setHiddenAngle] = useState(45); // dùng cho mode 'measure'
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);

  // Trạng thái thước đo góc
  const [protractorPos, setProtractorPos] = useState({ x: 250, y: 300 });
  const [protractorRotation, setProtractorRotation] = useState(0); // độ

  // Trạng thái tia di động (cho mode 'create')
  const [createAngle, setCreateAngle] = useState(30); // góc của tia di động

  // Đỉnh O của góc cố định ở giữa canvas
  const angleVertex = { x: 250, y: 250 };
  const baselineAngle = 0; // tia OA cố định nằm ngang sang phải

  // Khởi tạo góc ngẫu nhiên khi vào game
  useEffect(() => {
    generateRandomAngle();
  }, [mode]);

  const generateRandomAngle = () => {
    const angles = [30, 45, 60, 75, 90, 105, 120, 135, 150, 165];
    const rand = angles[Math.floor(Math.random() * angles.length)];
    if (mode === 'measure') {
      setHiddenAngle(rand);
      setUserGuess('');
      setFeedback('');
    } else {
      setTargetAngle(rand);
      setCreateAngle(10); // reset tia dựng góc
      setFeedback('');
    }
  };

  // Vẽ canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 1. Vẽ lưới mờ nền
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 25) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }

    // 2. Vẽ góc cần khảo sát
    const drawAngle = (val) => {
      // Tia cố định OA (sang phải)
      ctx.strokeStyle = '#3b82f6'; // xanh dương
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(angleVertex.x, angleVertex.y);
      ctx.lineTo(angleVertex.x + 180, angleVertex.y);
      ctx.stroke();

      // Tia di động OB (quay góc val độ ngược chiều kim đồng hồ)
      const rad = -(val * Math.PI) / 180;
      ctx.strokeStyle = '#ef4444'; // đỏ
      ctx.beginPath();
      ctx.moveTo(angleVertex.x, angleVertex.y);
      ctx.lineTo(angleVertex.x + 180 * Math.cos(rad), angleVertex.y + 180 * Math.sin(rad));
      ctx.stroke();

      // Đỉnh O
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(angleVertex.x, angleVertex.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Vẽ vòng cung góc
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(angleVertex.x, angleVertex.y, 40, 0, rad, true);
      ctx.stroke();

      // Kí hiệu góc
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      const midRad = rad / 2;
      ctx.fillText(
        mode === 'create' ? `${Math.round(val)}°` : '?',
        angleVertex.x + 55 * Math.cos(midRad),
        angleVertex.y + 55 * Math.sin(midRad) + 4
      );
    };

    if (mode === 'measure') {
      drawAngle(hiddenAngle);
    } else {
      drawAngle(createAngle);
    }

    // 3. Vẽ thước đo góc (nếu được bật)
    if (showProtractor) {
      ctx.save();
      ctx.translate(protractorPos.x, protractorPos.y);
      ctx.rotate(-(protractorRotation * Math.PI) / 180);

      // Thân thước đo góc (nửa hình tròn trong suốt)
      const pr = 170; // bán kính thước
      ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, pr, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vòng tròn nhỏ trung tâm
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI, true);
      ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
      ctx.moveTo(0, 0); ctx.lineTo(0, -15);
      ctx.stroke();

      // Vẽ các vạch chia độ
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let d = 0; d <= 180; d += 1) {
        const radD = -(d * Math.PI) / 180;
        let tickLen = 5;
        if (d % 5 === 0) tickLen = 8;
        if (d % 10 === 0) tickLen = 14;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = d % 10 === 0 ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.moveTo(pr * Math.cos(radD), pr * Math.sin(radD));
        ctx.lineTo((pr - tickLen) * Math.cos(radD), (pr - tickLen) * Math.sin(radD));
        ctx.stroke();

        // Ghi số đo (mỗi 10 độ)
        if (d % 10 === 0 && d > 0 && d < 180) {
          ctx.font = '12px Inter';
          // Dãy số vòng ngoài (0 -> 180)
          const textDist1 = pr - 22;
          ctx.fillText(
            d.toString(),
            textDist1 * Math.cos(radD),
            textDist1 * Math.sin(radD)
          );

          // Dãy số vòng trong (180 -> 0)
          ctx.font = '9px Inter';
          ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'; // màu vàng cam
          const textDist2 = pr - 34;
          ctx.fillText(
            (180 - d).toString(),
            textDist2 * Math.cos(radD),
            textDist2 * Math.sin(radD)
          );
          ctx.fillStyle = '#e2e8f0';
        }
      }

      // Đỉnh & chữ 0 / 180 ở hai đầu ngang
      ctx.font = 'bold 9px Inter';
      ctx.fillText('0 / 180', pr - 22, 10);
      ctx.fillText('180 / 0', -pr + 22, 10);

      // Điểm tâm thước nổi bật
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }, [mode, targetAngle, hiddenAngle, createAngle, showProtractor, protractorPos, protractorRotation]);

  // Xử lý kéo thả thước đo góc
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!showProtractor) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Khoảng cách tới tâm thước đo góc
    const dist = Math.hypot(mouseX - protractorPos.x, mouseY - protractorPos.y);
    if (dist < 130) { // trong phạm vi thước
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: mouseX - protractorPos.x,
        y: mouseY - protractorPos.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    setProtractorPos({
      x: mouseX - dragStartRef.current.x,
      y: mouseY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Kiểm tra kết quả chế độ đo góc
  const checkMeasure = () => {
    const guess = parseInt(userGuess);
    if (isNaN(guess)) {
      setFeedback('Vui lòng nhập một số hợp lệ!');
      return;
    }
    const diff = Math.abs(guess - hiddenAngle);
    if (diff <= 2) {
      setFeedback(`Chính xác! Góc đó là ${hiddenAngle}°. (+10 điểm)`);
      setScore(score + 10);
    } else {
      setFeedback(`Sai rồi! Số đo đúng là ${hiddenAngle}°. Bạn lệch ${diff}°`);
    }
  };

  // Kiểm tra kết quả chế độ dựng góc
  const checkCreate = () => {
    const diff = Math.abs(createAngle - targetAngle);
    if (diff <= 2) {
      setFeedback(`Tuyệt vời! Bạn đã dựng chính xác góc ${targetAngle}°. (+10 điểm)`);
      setScore(score + 10);
    } else {
      setFeedback(`Chưa đúng! Góc hiện tại là ${Math.round(createAngle)}°. Bạn cần dựng góc ${targetAngle}°.`);
    }
  };

  const alignProtractor = () => {
    // Tự động căn tâm thước trùng khớp với đỉnh O của góc để giúp học sinh dễ đo
    setProtractorPos({ ...angleVertex });
    setProtractorRotation(0);
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        
        <div className="canvas-panel">
          <canvas
            ref={canvasRef}
            width="500"
            height="450"
            className="math-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            style={{
              background: '#111827',
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
              maxWidth: '100%',
              height: 'auto',
              cursor: isDraggingRef.current ? 'grabbing' : 'grab',
              touchAction: 'none'
            }}
          />
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            * Kéo trực tiếp để di chuyển <strong>Thước đo góc</strong>. Dùng bảng điều khiển để xoay thước.
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Thước đo góc ảo tương tác
          </h3>

          {/* Chọn chế độ */}
          <div className="control-group" style={{ marginBottom: '1rem' }}>
            <label className="control-label">Chế độ học tập:</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button
                className={`btn-action ${mode === 'measure' ? '' : 'btn-muted'}`}
                onClick={() => setMode('measure')}
              >
                Đo góc ngẫu nhiên
              </button>
              <button
                className={`btn-action ${mode === 'create' ? '' : 'btn-muted'}`}
                onClick={() => setMode('create')}
              >
                Dựng góc theo yêu cầu
              </button>
            </div>
          </div>

          {/* Điều khiển thước đo */}
          <div className="control-group" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
            <label className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Điều khiển Thước đo góc:</span>
              <button 
                onClick={() => setShowProtractor(!showProtractor)}
                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {showProtractor ? 'Ẩn thước' : 'Hiện thước'}
              </button>
            </label>
            {showProtractor && (
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Xoay thước: {protractorRotation}°</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={protractorRotation}
                  onChange={e => setProtractorRotation(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <button 
                  className="btn-action btn-muted" 
                  onClick={alignProtractor}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '4px', fontSize: '0.8rem' }}
                >
                  🎯 Đặt tâm thước vào góc
                </button>
              </div>
            )}
          </div>

          {/* Nội dung tương tác tương ứng với từng chế độ */}
          {mode === 'measure' ? (
            <div className="control-group" style={{ marginBottom: '1rem' }}>
              <label className="control-label">Nhập số đo góc cần đo (°):</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                <input
                  type="number"
                  placeholder="Ví dụ: 60"
                  value={userGuess}
                  onChange={e => setUserGuess(e.target.value)}
                  style={{ flex: 1, padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                />
                <button className="btn-action" onClick={checkMeasure}>Kiểm tra</button>
              </div>
            </div>
          ) : (
            <div className="control-group" style={{ marginBottom: '1rem' }}>
              <label className="control-label" style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                Yêu cầu: Hãy dựng góc {targetAngle}°
              </label>
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Điều chỉnh tia di động: {Math.round(createAngle)}°</label>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={createAngle}
                  onChange={e => setCreateAngle(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '0.2rem' }}
                />
                <button className="btn-action" onClick={checkCreate} style={{ width: '100%', marginTop: '0.5rem' }}>
                  Kiểm tra góc đã dựng
                </button>
              </div>
            </div>
          )}

          {/* Feedback và Điểm số */}
          {feedback && (
            <div className="stat-box" style={{ borderColor: feedback.includes('Chính xác') || feedback.includes('Tuyệt vời') ? '#4ade80' : '#fbbf24', margin: '1rem 0' }}>
              <p style={{ fontSize: '0.9rem', color: '#fff' }}>{feedback}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Điểm số: <strong style={{ color: '#fbbf24' }}>{score}</strong></span>
            <button className="btn-action btn-muted" onClick={generateRandomAngle} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Góc tiếp theo ➡
            </button>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
