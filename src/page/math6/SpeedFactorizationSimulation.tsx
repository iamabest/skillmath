import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function SpeedFactorizationSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const [targetNum, setTargetNum] = useState(1);
  const [originalTarget, setOriginalTarget] = useState(1);
  const [particles, setParticles] = useState<any[]>([]);
  
  const primes = [2, 3, 5, 7, 11, 13, 17, 19];

  // Animation frame reference
  const requestRef = useRef<number>();

  const generateNewTarget = () => {
    // Generate a number between 10 and 100 that is composite
    let num = 1;
    while (num < 10 || primes.includes(num)) {
      const p1 = primes[Math.floor(Math.random() * 4)]; // 2, 3, 5, 7
      const p2 = primes[Math.floor(Math.random() * 4)];
      const p3 = Math.random() > 0.5 ? primes[Math.floor(Math.random() * 3)] : 1;
      num = p1 * p2 * p3;
    }
    if (num > 150) num = 150; // keep it reasonable
    setTargetNum(num);
    setOriginalTarget(num);
  };

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    generateNewTarget();
    setParticles([]);
  };

  const endGame = () => {
    setIsPlaying(false);
    setTargetNum(1);
  };

  // Timer
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [isPlaying, timeLeft]);

  // Handle Prime Click
  const handlePrimeClick = (p: number) => {
    if (!isPlaying) return;
    
    if (targetNum % p === 0) {
      // Correct!
      const newTarget = targetNum / p;
      setTargetNum(newTarget);
      setCombo(c => c + 1);
      
      // Add visual particles
      const newParticles = [];
      for(let i=0; i<10; i++) {
        newParticles.push({
          x: 250, y: 150,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.0,
          color: '#4ade80'
        });
      }
      setParticles(prev => [...prev, ...newParticles]);

      if (newTarget === 1) {
        // Solved completely!
        setScore(s => s + 10 + combo * 2);
        setTimeout(generateNewTarget, 400); // short delay
      } else {
        setScore(s => s + 2 + combo);
      }
    } else {
      // Wrong!
      setCombo(0);
      // Add red particles
      const newParticles = [];
      for(let i=0; i<10; i++) {
        newParticles.push({
          x: 250, y: 150,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.0,
          color: '#f87171'
        });
      }
      setParticles(prev => [...prev, ...newParticles]);
    }
  };

  // Animation Loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Target Circle
    ctx.beginPath();
    ctx.arc(250, 150, 60, 0, Math.PI * 2);
    
    // Pulse effect if solved
    if (targetNum === 1 && isPlaying) {
      ctx.fillStyle = "#4ade80";
      ctx.fill();
    } else {
      ctx.fillStyle = "#334155";
      ctx.fill();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isPlaying ? (targetNum > 1 ? targetNum : "OK!") : "?", 250, 150);
    
    if (isPlaying && targetNum > 1) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px Arial";
      ctx.fillText(`Mục tiêu ban đầu: ${originalTarget}`, 250, 240);
    }

    // Draw Particles
    setParticles(prev => {
      const remaining = [];
      prev.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life > 0) remaining.push(p);
      });
      return remaining;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, targetNum, originalTarget]); // Minimal dependencies for loop

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span style={{ color: '#4ade80' }}>Điểm: {score}</span>
            <span style={{ color: '#f59e0b' }}>Combo: x{combo}</span>
            <span style={{ color: timeLeft <= 10 ? '#f87171' : '#60a5fa' }}>Thời gian: {timeLeft}s</span>
          </div>
          
          <canvas ref={canvasRef} width="500" height="300" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {primes.map(p => (
              <button 
                key={p}
                className="btn-action"
                style={{ width: '60px', height: '60px', fontSize: '1.5rem', borderRadius: '50%' }}
                onClick={() => handlePrimeClick(p)}
                disabled={!isPlaying || targetNum === 1}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ color: '#f59e0b' }}>⚡ Thách thức Tốc độ: Phân tích Thừa số</h3>
          
          <div className="info-box" style={{ marginBottom: '20px' }}>
            <p><strong>Luật chơi:</strong></p>
            <ol style={{ paddingLeft: '20px' }}>
              <li>Một hợp số sẽ xuất hiện ở giữa màn hình.</li>
              <li>Nhanh chóng nhấp vào các số nguyên tố bên dưới là ước của số đó.</li>
              <li>Số sẽ tự động chia nhỏ cho đến khi bằng 1.</li>
              <li>Chọn sai sẽ mất chuỗi Combo. Hãy cẩn thận!</li>
            </ol>
          </div>

          {!isPlaying && timeLeft === 60 ? (
            <button className="btn-action" style={{ width: '100%', fontSize: '1.2rem', padding: '15px' }} onClick={startGame}>
              BẮT ĐẦU CHƠI (60s)
            </button>
          ) : !isPlaying && timeLeft === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#4ade80' }}>HẾT GIỜ!</h2>
              <p style={{ fontSize: '1.2rem' }}>Điểm chung cuộc: <strong>{score}</strong></p>
              <button className="btn-action" style={{ width: '100%', marginTop: '10px' }} onClick={startGame}>
                CHƠI LẠI
              </button>
            </div>
          ) : (
            <button className="btn-muted btn-action" style={{ width: '100%' }} onClick={endGame}>
              DỪNG CHƠI
            </button>
          )}
          
          <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p><strong>Mẹo:</strong> Thuộc lòng các dấu hiệu chia hết cho 2, 3 và 5 sẽ giúp bạn ghi điểm rất nhanh!</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
