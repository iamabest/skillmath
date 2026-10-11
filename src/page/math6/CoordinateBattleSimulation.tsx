import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

interface Ship {
  x: number;
  y: number;
}

interface Guess {
  x: number;
  y: number;
  hit: boolean;
}

export default function CoordinateBattleSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState("setup"); // setup, playing, won, lost
  const [playerShips, setPlayerShips] = useState<Ship[]>([]); // {x, y}
  const [botShips, setBotShips] = useState<Ship[]>([]);
  
  const [playerGuesses, setPlayerGuesses] = useState<Guess[]>([]); // {x, y, hit: boolean}
  const [botGuesses, setBotGuesses] = useState<Guess[]>([]);

  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);
  
  const [message, setMessage] = useState("Nhấp vào bản đồ để đặt 3 tọa độ tàu của bạn.");

  const GRID_SIZE = 40;
  const OFFSET_X = 250;
  const OFFSET_Y = 200;

  // Draw Grid
  const drawMap = (ctx: CanvasRenderingContext2D, isPlayerMap: boolean) => {
    ctx.clearRect(0, 0, 500, 400);
    
    // Draw Grid Lines
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    for(let i = -5; i <= 5; i++) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(OFFSET_X + i * GRID_SIZE, 0);
      ctx.lineTo(OFFSET_X + i * GRID_SIZE, 400);
      ctx.stroke();
      
      // horizontal
      ctx.beginPath();
      ctx.moveTo(0, OFFSET_Y + i * GRID_SIZE);
      ctx.lineTo(500, OFFSET_Y + i * GRID_SIZE);
      ctx.stroke();
    }
    
    // Axes
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, OFFSET_Y);
    ctx.lineTo(500, OFFSET_Y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(OFFSET_X, 0);
    ctx.lineTo(OFFSET_X, 400);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px Arial";
    for(let i = -5; i <= 5; i++) {
      if(i !== 0) {
        ctx.fillText(i, OFFSET_X + i * GRID_SIZE - 5, OFFSET_Y + 15);
        ctx.fillText(-i, OFFSET_X - 15, OFFSET_Y + i * GRID_SIZE + 5);
      }
    }
    ctx.fillText("X", 480, OFFSET_Y - 10);
    ctx.fillText("Y", OFFSET_X + 10, 20);
    ctx.fillText("O", OFFSET_X - 15, OFFSET_Y + 15);

    // Draw Ships (Player only sees their own ships)
    if (isPlayerMap) {
      playerShips.forEach(ship => {
        ctx.beginPath();
        ctx.arc(OFFSET_X + ship.x * GRID_SIZE, OFFSET_Y - ship.y * GRID_SIZE, 8, 0, Math.PI*2);
        ctx.fillStyle = "#60a5fa"; // blue
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();
      });

      // Draw Bot's guesses on Player's map
      botGuesses.forEach(g => {
        ctx.beginPath();
        if (g.hit) {
          ctx.arc(OFFSET_X + g.x * GRID_SIZE, OFFSET_Y - g.y * GRID_SIZE, 12, 0, Math.PI*2);
          ctx.fillStyle = "#ef4444"; // red explosion
          ctx.fill();
        } else {
          ctx.arc(OFFSET_X + g.x * GRID_SIZE, OFFSET_Y - g.y * GRID_SIZE, 6, 0, Math.PI*2);
          ctx.fillStyle = "#cbd5e1"; // gray miss
          ctx.fill();
        }
      });
    } else {
      // Bot Map (Player attacking)
      if (gameState === "lost") {
        // reveal bot ships if lost
        botShips.forEach(ship => {
          ctx.beginPath();
          ctx.arc(OFFSET_X + ship.x * GRID_SIZE, OFFSET_Y - ship.y * GRID_SIZE, 8, 0, Math.PI*2);
          ctx.fillStyle = "#f59e0b"; // orange
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.stroke();
        });
      }

      // Draw Player guesses
      playerGuesses.forEach(g => {
        ctx.beginPath();
        if (g.hit) {
          ctx.arc(OFFSET_X + g.x * GRID_SIZE, OFFSET_Y - g.y * GRID_SIZE, 12, 0, Math.PI*2);
          ctx.fillStyle = "#4ade80"; // green hit!
          ctx.fill();
        } else {
          ctx.moveTo(OFFSET_X + g.x * GRID_SIZE - 6, OFFSET_Y - g.y * GRID_SIZE - 6);
          ctx.lineTo(OFFSET_X + g.x * GRID_SIZE + 6, OFFSET_Y - g.y * GRID_SIZE + 6);
          ctx.moveTo(OFFSET_X + g.x * GRID_SIZE + 6, OFFSET_Y - g.y * GRID_SIZE - 6);
          ctx.lineTo(OFFSET_X + g.x * GRID_SIZE - 6, OFFSET_Y - g.y * GRID_SIZE + 6);
          ctx.strokeStyle = "#cbd5e1"; // gray X miss
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawMap(ctx, gameState === "setup" || gameState === "lost" ? true : false);
      }
    }
  }, [gameState, playerShips, botShips, playerGuesses, botGuesses]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "setup") return;
    
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xRaw = e.clientX - rect.left;
    const yRaw = e.clientY - rect.top;
    
    // Snap to grid
    const gridX = Math.round((xRaw - OFFSET_X) / GRID_SIZE);
    const gridY = Math.round((OFFSET_Y - yRaw) / GRID_SIZE);
    
    if (gridX >= -5 && gridX <= 5 && gridY >= -5 && gridY <= 5) {
      // check if already placed
      if (!playerShips.some(s => s.x === gridX && s.y === gridY)) {
        if (playerShips.length < 3) {
          setPlayerShips([...playerShips, {x: gridX, y: gridY}]);
          if (playerShips.length === 2) {
            setMessage("Đã đặt xong 3 tàu! Nhấn 'Bắt đầu' để sang phần Bản đồ Địch.");
          }
        }
      }
    }
  };

  const handleStart = () => {
    // Generate 3 bot ships
    const bShips: Ship[] = [];
    while(bShips.length < 3) {
      const rx = Math.floor(Math.random() * 11) - 5;
      const ry = Math.floor(Math.random() * 11) - 5;
      if (!bShips.some(s => s.x === rx && s.y === ry)) {
        bShips.push({x: rx, y: ry});
      }
    }
    setBotShips(bShips);
    setGameState("playing");
    setMessage("Đây là Bản đồ của Bot. Hãy nhập tọa độ (x, y) để tấn công!");
  };

  const checkWinCondition = (pGuesses: Guess[], bGuesses: Guess[]) => {
    const pWins = botShips.every(bs => pGuesses.some(pg => pg.hit && pg.x === bs.x && pg.y === bs.y));
    const bWins = playerShips.every(ps => bGuesses.some(bg => bg.hit && bg.x === ps.x && bg.y === ps.y));
    
    if (pWins) {
      setGameState("won");
      setMessage("Tuyệt vời! Bạn đã bắn chìm toàn bộ tàu của Bot AI!");
      return true;
    }
    if (bWins) {
      setGameState("lost");
      setMessage("Rất tiếc! Bot AI đã tìm ra toàn bộ tàu của bạn.");
      return true;
    }
    return false;
  };

  const handleAttack = () => {
    if (gameState !== "playing") return;
    
    // check bounds
    if (inputX < -5 || inputX > 5 || inputY < -5 || inputY > 5) {
      setMessage("Tọa độ không hợp lệ! Vui lòng nhập từ -5 đến 5.");
      return;
    }

    // check if already guessed
    if (playerGuesses.some(g => g.x === inputX && g.y === inputY)) {
      setMessage("Bạn đã bắn vào tọa độ này rồi!");
      return;
    }

    // Check hit
    const hit = botShips.some(s => s.x === inputX && s.y === inputY);
    const newPGuesses = [...playerGuesses, { x: inputX, y: inputY, hit }];
    setPlayerGuesses(newPGuesses);

    if (hit) {
      setMessage(`Trúng đích tại (${inputX}, ${inputY})! Tới lượt Bot...`);
    } else {
      setMessage(`Trượt tại (${inputX}, ${inputY})! Tới lượt Bot...`);
    }

    if (checkWinCondition(newPGuesses, botGuesses)) return;

    // Bot's turn
    setTimeout(() => {
      botLogic(newPGuesses);
    }, 1000);
  };

  const botLogic = (currentPGuesses: Guess[]) => {
    // Smart bot logic: if it hit something before but hasn't sunk all, it will search around.
    // For simplicity, mostly random but remembers past guesses.
    let bx: number = 0;
    let by: number = 0;
    let valid = false;
    while (!valid) {
      bx = Math.floor(Math.random() * 11) - 5;
      by = Math.floor(Math.random() * 11) - 5;
      if (!botGuesses.some(g => g.x === bx && g.y === by)) {
        valid = true;
      }
    }

    const hit = playerShips.some(s => s.x === bx && s.y === by);
    const newBGuesses = [...botGuesses, { x: bx, y: by, hit }];
    setBotGuesses(newBGuesses);
    
    if (hit) {
      setMessage(`Bot đã BẮN TRÚNG tàu của bạn tại (${bx}, ${by})! Lượt của bạn.`);
    } else {
      setMessage(`Bot bắn trượt tại (${bx}, ${by}). Lượt của bạn.`);
    }

    checkWinCondition(currentPGuesses, newBGuesses);
  };

  const resetGame = () => {
    setGameState("setup");
    setPlayerShips([]);
    setBotShips([]);
    setPlayerGuesses([]);
    setBotGuesses([]);
    setMessage("Nhấp vào bản đồ để đặt 3 tọa độ tàu của bạn.");
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0f172a' }}>
          <h3 style={{ color: gameState === 'setup' || gameState === 'lost' ? '#60a5fa' : '#f87171' }}>
            {gameState === 'setup' ? "Bản đồ của Bạn" : (gameState === 'lost' ? "Bản đồ của Bạn (Bị hủy diệt)" : "Bản đồ Địch (Nhập Tọa độ)")}
          </h3>
          <canvas ref={canvasRef} width="500" height="400" onClick={handleCanvasClick} style={{ backgroundColor: '#1e293b', borderRadius: '8px', cursor: gameState === 'setup' ? 'crosshair' : 'default' }} />
          
          <div style={{ marginTop: '15px', color: '#cbd5e1' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#4ade80', borderRadius: '50%', marginRight: '5px' }}></span> Bạn Bắn Trúng
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', margin: '0 5px 0 15px' }}></span> Địch Bắn Trúng Bạn
          </div>
        </div>

        <div className="control-panel">
          <h3 style={{ color: '#4ade80' }}>⚔️ Đấu trường Tọa độ</h3>
          
          <div className="info-box" style={{ marginBottom: '20px' }}>
            <p><strong>Trạng thái:</strong> {message}</p>
          </div>

          {gameState === "setup" && (
            <div className="control-group">
              <label className="control-label">Số tàu đã đặt: {playerShips.length} / 3</label>
              <button className="btn-action" onClick={handleStart} disabled={playerShips.length < 3}>
                BẮT ĐẦU TRẬN ĐẤU
              </button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="control-group">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label className="control-label">Tọa độ X:</label>
                  <input type="number" min="-5" max="5" value={inputX} onChange={e => setInputX(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="control-label">Tọa độ Y:</label>
                  <input type="number" min="-5" max="5" value={inputY} onChange={e => setInputY(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
              </div>
              <button className="btn-action" onClick={handleAttack}>TẤN CÔNG!</button>
            </div>
          )}

          {(gameState === "won" || gameState === "lost") && (
            <button className="btn-action" onClick={resetGame}>
              CHƠI LẠI TỪ ĐẦU
            </button>
          )}
          
          <div className="stat-box" style={{ marginTop: '20px' }}>
            <p>Tàu của Bạn: {playerShips.length - botGuesses.filter(g => g.hit).length} còn lại</p>
            <p>Tàu của Địch: {botShips.length - playerGuesses.filter(g => g.hit).length} còn lại</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
