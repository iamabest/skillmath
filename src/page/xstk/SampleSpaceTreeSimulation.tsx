import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

interface Level {
  name: string;
  nodes: string[];
}

export default function SampleSpaceTreeSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [experiment, setExperiment] = useState("1_coin"); // 1_coin, 2_coin, 1_dice, 2_dice
  const [selectedEvent, setSelectedEvent] = useState("none");
  
  // Data definitions
  const exData = {
    "1_coin": {
      name: "Tung 1 đồng xu",
      levels: [
        { name: "Lần 1", nodes: ["Sấp (S)", "Ngửa (N)"] }
      ],
      events: [
        { id: "none", name: "Không chọn", check: (path: string[]) => false },
        { id: "s", name: "Mặt Sấp", check: (path: string[]) => path[0] === "Sấp (S)" },
        { id: "n", name: "Mặt Ngửa", check: (path: string[]) => path[0] === "Ngửa (N)" }
      ]
    },
    "2_coin": {
      name: "Tung 2 đồng xu",
      levels: [
        { name: "Đồng 1", nodes: ["S", "N"] },
        { name: "Đồng 2", nodes: ["S", "N"] }
      ],
      events: [
        { id: "none", name: "Không chọn", check: (path: string[]) => false },
        { id: "same", name: "Hai mặt giống nhau", check: (path: string[]) => path[0] === path[1] },
        { id: "diff", name: "Hai mặt khác nhau", check: (path: string[]) => path[0] !== path[1] },
        { id: "at_least_1_s", name: "Ít nhất 1 mặt S", check: (path: string[]) => path.includes("S") }
      ]
    },
    "1_dice": {
      name: "Gieo 1 xúc xắc",
      levels: [
        { name: "Lần 1", nodes: ["1", "2", "3", "4", "5", "6"] }
      ],
      events: [
        { id: "none", name: "Không chọn", check: (path: string[]) => false },
        { id: "even", name: "Số chẵn", check: (path: string[]) => parseInt(path[0]) % 2 === 0 },
        { id: "odd", name: "Số lẻ", check: (path: string[]) => parseInt(path[0]) % 2 !== 0 },
        { id: "prime", name: "Số nguyên tố", check: (path: string[]) => ["2", "3", "5"].includes(path[0]) }
      ]
    },
    "2_dice": {
      name: "Gieo 2 xúc xắc (Rút gọn)", // Full tree is 36 leaves, too big. Maybe just 1-3 for demo? 
      // Actually we can draw a smaller tree or represent it in a grid if it's 2 dice.
      // But prompt says "Sơ đồ cây". Let's do 2 dice but only 1-3 for visual clarity if it gets too dense, 
      // or we just draw it small. 36 leaves = 400px height -> 11px per leaf. It's doable!
      levels: [
        { name: "XX1", nodes: ["1", "2", "3", "4", "5", "6"] },
        { name: "XX2", nodes: ["1", "2", "3", "4", "5", "6"] }
      ],
      events: [
        { id: "none", name: "Không chọn", check: (path: string[]) => false },
        { id: "sum_7", name: "Tổng = 7", check: (path: string[]) => parseInt(path[0]) + parseInt(path[1]) === 7 },
        { id: "same", name: "Hai mặt giống nhau", check: (path: string[]) => path[0] === path[1] },
        { id: "sum_gt_9", name: "Tổng > 9", check: (path: string[]) => parseInt(path[0]) + parseInt(path[1]) > 9 }
      ]
    }
  };

  const currentExpData = (exData as any)[experiment];
  const activeEvent = currentExpData.events.find((e: any) => e.id === selectedEvent);

  const generateTree = (levels: Level[]): string[][] => {
    let paths: string[][] = [[]];
    for (let lvl of levels) {
      let newPaths: string[][] = [];
      for (let p of paths) {
        for (let n of lvl.nodes) {
          newPaths.push([...p, n]);
        }
      }
      paths = newPaths;
    }
    return paths;
  };

  const allPaths = generateTree(currentExpData.levels);
  const favorableCount = activeEvent && activeEvent.id !== "none" 
    ? allPaths.filter(p => activeEvent.check(p)).length 
    : 0;

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const paddingX = 40;
    const paddingY = 20;
    const width = canvas.width - paddingX * 2;
    const height = canvas.height - paddingY * 2;
    const levelsCount = currentExpData.levels.length;
    const dx = width / (levelsCount + 1);

    const drawNode = (level: number, yStart: number, yEnd: number, parentX: number, parentY: number, currentPath: string[]) => {
      if (level > levelsCount) return;
      const myX = paddingX + level * dx;
      if (level === 0) {
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(myX, paddingY + height / 2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillText("Bắt đầu", myX - 30, paddingY + height / 2 - 10);
        drawNode(level + 1, paddingY, paddingY + height, myX, paddingY + height / 2, []);
      } else {
        const nodes = currentExpData.levels[level - 1].nodes;
        const dy = (yEnd - yStart) / nodes.length;
        for (let i = 0; i < nodes.length; i++) {
          const myY = yStart + dy * i + dy / 2;
          const newPath = [...currentPath, nodes[i]];
          const isFavorable = activeEvent && activeEvent.id !== "none" && allPaths
            .filter(p => p.slice(0, newPath.length).join(',') === newPath.join(','))
            .some(p => activeEvent.check(p));

          ctx.beginPath();
          ctx.moveTo(parentX, parentY);
          ctx.lineTo(myX, myY);
          ctx.strokeStyle = isFavorable ? "rgba(250, 204, 21, 0.8)" : "#475569";
          ctx.lineWidth = isFavorable ? 2 : 1;
          ctx.stroke();

          ctx.fillStyle = isFavorable ? "#facc15" : "#94a3b8";
          ctx.beginPath(); ctx.arc(myX, myY, 3, 0, Math.PI * 2); ctx.fill();
          ctx.font = levelsCount === 2 && nodes.length === 6 ? "10px Arial" : "12px Arial";
          ctx.fillText(nodes[i], myX + 5, myY + 3);

          if (level === levelsCount) {
            const leafFav = activeEvent && activeEvent.id !== "none" && activeEvent.check(newPath);
            ctx.fillStyle = leafFav ? "#facc15" : "#cbd5e1";
            ctx.fillText(newPath.join(", "), myX + 25, myY + 3);
          }
          drawNode(level + 1, yStart + dy * i, yStart + dy * (i + 1), myX, myY, newPath);
        }
      }
    };

    drawNode(0, 0, 0, 0, 0, []);
  };

  useEffect(() => { draw(); }, [experiment, selectedEvent]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <canvas ref={canvasRef} width="500" height="450" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>Kết quả Biến cố: {activeEvent?.name}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p>Số kết quả thuận lợi: <strong>{favorableCount}</strong></p>
              <p>Tổng số phần tử KGM n(Ω): <strong>{allPaths.length}</strong></p>
            </div>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            <h3 style={{ textAlign: 'center', margin: '10px 0', color: '#4ade80' }}>
              Xác suất P = {favorableCount} / {allPaths.length} 
              {activeEvent?.id !== "none" && ` ≈ ${((favorableCount / allPaths.length) * 100).toFixed(1)}%`}
            </h3>
          </div>
        </div>
        <div className="control-panel">
          <h3>Không Gian Mẫu - Sơ Đồ Cây</h3>
          <div className="control-group">Chọn Phép thử:</div>
          <select value={experiment} onChange={(e) => { setExperiment(e.target.value); setSelectedEvent("none"); }} style={{ width: '100%', padding: '8px', marginBottom: '20px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #475569', borderRadius: '4px' }}>
            <option value="1_coin">Tung 1 đồng xu</option>
            <option value="2_coin">Tung 2 đồng xu</option>
            <option value="1_dice">Gieo 1 xúc xắc</option>
            <option value="2_dice">Gieo 2 xúc xắc</option>
          </select>
          <div className="control-group">Chọn Biến cố (Sự kiện):</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentExpData.events.map((ev) => (
              <button key={ev.id} className={`btn-action ${selectedEvent !== ev.id ? 'btn-muted' : ''}`} onClick={() => setSelectedEvent(ev.id)} style={{ textAlign: 'left', paddingLeft: '15px' }}>
                {ev.name}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p><strong>Sơ đồ cây (Tree Diagram):</strong></p>
            <p>Sơ đồ cây giúp liệt kê trực quan tất cả các kết quả có thể xảy ra (không gian mẫu) của một phép thử có nhiều giai đoạn.</p>
            <p>Mỗi nhánh từ trái sang phải biểu diễn một lựa chọn/kết quả tại mỗi giai đoạn.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
