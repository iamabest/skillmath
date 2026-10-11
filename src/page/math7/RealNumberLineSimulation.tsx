import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function RealNumberLineSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for number line bounds
  const [minVal, setMinVal] = useState(-1);
  const [maxVal, setMaxVal] = useState(4);
  
  // Custom user point
  const [userNum, setUserNum] = useState("");
  
  // Compare values
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [compResult, setCompResult] = useState("");
  
  // Zoom inputs
  const [zoomA, setZoomA] = useState("");
  const [zoomB, setZoomB] = useState("");

  const specialPoints = [
    { val: Math.SQRT2, label: "√2", color: "#f87171" },
    { val: Math.sqrt(3), label: "√3", color: "#60a5fa" },
    { val: Math.PI, label: "π", color: "#4ade80" },
  ];

  const handleZoom = () => {
    let a = parseFloat(zoomA);
    let b = parseFloat(zoomB);
    if (!isNaN(a) && !isNaN(b) && a < b) {
      setMinVal(a);
      setMaxVal(b);
    }
  };
  
  const resetZoom = () => {
    setMinVal(-1);
    setMaxVal(4);
    setZoomA("");
    setZoomB("");
  };

  const handleCompare = () => {
    let v1 = parseFloat(comp1);
    let v2 = parseFloat(comp2);
    if (!isNaN(v1) && !isNaN(v2)) {
      if (v1 > v2) setCompResult(">");
      else if (v1 < v2) setCompResult("<");
      else setCompResult("=");
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const PADDING = 40;
    const width = canvas.width - PADDING * 2;
    const cy = canvas.height / 2;
    const range = maxVal - minVal;
    
    // Draw Axis line
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING - 20, cy);
    ctx.lineTo(canvas.width - PADDING + 20, cy);
    ctx.stroke();
    
    // Draw Arrows
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath(); ctx.moveTo(canvas.width - PADDING + 25, cy); ctx.lineTo(canvas.width - PADDING + 15, cy - 5); ctx.lineTo(canvas.width - PADDING + 15, cy + 5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(PADDING - 25, cy); ctx.lineTo(PADDING - 15, cy - 5); ctx.lineTo(PADDING - 15, cy + 5); ctx.fill();

    const valToX = (v) => PADDING + ((v - minVal) / range) * width;

    // Decide tick intervals based on range
    let tickStep = 1;
    if (range <= 0.1) tickStep = 0.01;
    else if (range <= 1) tickStep = 0.1;
    else if (range <= 5) tickStep = 0.5;
    else if (range > 20) tickStep = 5;

    // Draw integer/major ticks
    const startTick = Math.ceil(minVal / tickStep) * tickStep;
    for (let v = startTick; v <= maxVal; v += tickStep) {
      const x = valToX(v);
      ctx.strokeStyle = Math.abs(v) < 0.0001 ? "#3b82f6" : "#94a3b8"; // Highlight 0
      ctx.lineWidth = Math.abs(v) < 0.0001 ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x, cy - 8);
      ctx.lineTo(x, cy + 8);
      ctx.stroke();
      
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      // Format to avoid floating point issues (e.g. 0.300000000004)
      const label = Number(v.toFixed(3)).toString();
      ctx.fillText(label, x, cy + 25);
    }

    // Function to draw a point
    const drawPoint = (val: number, label: string, color: string, isCustom = false) => {
      if (val < minVal || val > maxVal) return; // Out of bounds
      const x = valToX(val);
      
      // Line
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x, cy - (isCustom ? 50 : 30));
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Dot
      ctx.beginPath();
      ctx.arc(x, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = "white";
      ctx.font = "bold 14px Arial";
      ctx.fillText(label, x, cy - (isCustom ? 55 : 35));
      
      // Decimal value based on zoom
      let decimals = 2;
      if (range < 0.1) decimals = 6;
      else if (range < 1) decimals = 4;
      
      ctx.font = "11px Arial";
      ctx.fillStyle = color;
      ctx.fillText(val.toFixed(decimals), x, cy - (isCustom ? 70 : 50));
    };

    // Draw special points
    specialPoints.forEach(p => drawPoint(p.val, p.label, p.color));

    // Draw user point
    let uVal = parseFloat(userNum);
    if (!isNaN(uVal)) {
      drawPoint(uVal, "Điểm của bạn", "#a855f7", true);
    }
    
    // Draw compare points if they exist and are valid
    let c1 = parseFloat(comp1);
    let c2 = parseFloat(comp2);
    if (!isNaN(c1)) {
      ctx.beginPath(); ctx.arc(valToX(c1), cy, 4, 0, Math.PI*2); ctx.fillStyle = "#fbbf24"; ctx.fill();
    }
    if (!isNaN(c2)) {
      ctx.beginPath(); ctx.arc(valToX(c2), cy, 4, 0, Math.PI*2); ctx.fillStyle = "#fbbf24"; ctx.fill();
    }
  };

  useEffect(() => {
    draw();
  }, [minVal, maxVal, userNum, comp1, comp2]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <canvas ref={canvasRef} width="500" height="300" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            <h4 style={{ color: '#4ade80', marginBottom: '10px' }}>Số thực là gì?</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Tập hợp số thực bao gồm cả số hữu tỉ (phân số, số thập phân hữu hạn/vô hạn tuần hoàn) và số vô tỉ (ví dụ: √2, π). 
              Mỗi điểm trên trục số này biểu diễn chính xác một số thực. Không có lỗ hổng nào trên trục số thực!
            </p>
          </div>
        </div>

        <div className="control-panel">
          <h3>Trục Số Thực</h3>
          
          <div className="control-group">1. Biểu diễn số của bạn:</div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="number"
              value={userNum}
              onChange={(e) => setUserNum(e.target.value)}
              placeholder="VD: 2.5, -0.5..."
              style={{ flex: 1, padding: '8px' }}
            />
          </div>

          <div className="control-group">2. Phóng to vùng [a, b]:</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <input type="number" value={zoomA} onChange={(e) => setZoomA(e.target.value)} placeholder="a" style={{ width: '60px', padding: '8px' }} />
            <span>đến</span>
            <input type="number" value={zoomB} onChange={(e) => setZoomB(e.target.value)} placeholder="b" style={{ width: '60px', padding: '8px' }} />
            <button className="btn-action" style={{ padding: '8px 12px' }} onClick={handleZoom}>Zoom</button>
          </div>
          <button className="btn-muted btn-action" style={{ width: '100%', marginBottom: '20px' }} onClick={resetZoom}>
            Khôi phục trục số (-1 đến 4)
          </button>

          <div className="control-group">3. So sánh hai số:</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="number" value={comp1} onChange={(e) => {setComp1(e.target.value); setCompResult("");}} style={{ width: '60px', padding: '8px' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24', minWidth: '20px', textAlign: 'center' }}>
              {compResult || "?"}
            </span>
            <input type="number" value={comp2} onChange={(e) => {setComp2(e.target.value); setCompResult("");}} style={{ width: '60px', padding: '8px' }} />
            <button className="btn-action" style={{ padding: '8px 12px' }} onClick={handleCompare}>So sánh</button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
