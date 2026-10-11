import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function StatisticsChartsSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [rawData, setRawData] = useState("12, 15, 20, 15, 25, 30, 20, 15, 18, 22");
  const [parsedData, setParsedData] = useState<number[]>([]);
  const [freqData, setFreqData] = useState<{val: number, freq: number}[]>([]);
  const [chartType, setChartType] = useState("bar"); // bar, line, pie
  const [stats, setStats] = useState({ mean: 0, median: 0, mode: [] as number[], min: 0, max: 0, range: 0 });

  useEffect(() => {
    parseAndCalculate();
  }, [rawData]);

  const parseAndCalculate = () => {
    // Parse
    const nums = rawData.split(/[\s,]+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
    if (nums.length === 0) {
      setParsedData([]);
      setFreqData([]);
      return;
    }

    // Calculate stats
    const sorted = [...nums].sort((a, b) => a - b);
    
    // Mean
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    
    // Median
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    
    // Mode
    const counts: {[key: number]: number} = {};
    nums.forEach(n => counts[n] = (counts[n] || 0) + 1);
    let maxCount = 0;
    for (let k in counts) if (counts[k] > maxCount) maxCount = counts[k];
    const mode = Object.keys(counts).filter(k => counts[k] === maxCount).map(Number);
    
    // Min, Max, Range
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;
    
    // Calculate frequencies
    const freqMap: {[key: number]: number} = {};
    for (let num of sorted) {
      freqMap[num] = (freqMap[num] || 0) + 1;
    }
    
    const uniqueVals = Object.keys(freqMap).map(k => Number(k)).sort((a, b) => a - b);
    const fData = uniqueVals.map(v => ({ val: v, freq: freqMap[v] }));

    setParsedData(nums);
    setFreqData(fData);
    setStats({ mean, median, mode, min, max, range });
  };

  const generateRandom = () => {
    const len = Math.floor(Math.random() * 10) + 10; // 10 to 20 items
    const arr = [];
    for (let i=0; i<len; i++) {
      arr.push(Math.floor(Math.random() * 5) * 5 + 10); // 10, 15, 20, 25, 30
    }
    setRawData(arr.join(", "));
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (freqData.length === 0) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Không có dữ liệu hợp lệ", canvas.width/2, canvas.height/2);
      return;
    }

    const padding = 40;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;
    
    const maxFreq = Math.max(...freqData.map(d => d.freq));

    if (chartType === "bar" || chartType === "line") {
      // Draw Axes
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(padding, padding); ctx.lineTo(padding, canvas.height - padding); ctx.stroke(); // Y
      ctx.beginPath(); ctx.moveTo(padding, canvas.height - padding); ctx.lineTo(canvas.width - padding, canvas.height - padding); ctx.stroke(); // X
      
      // Y labels (Frequencies)
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      for (let i=0; i<=maxFreq; i++) {
        const y = canvas.height - padding - (i/maxFreq)*h;
        ctx.fillText(i.toString(), padding - 10, y + 4);
      }

      // X mapping
      const stepX = w / freqData.length;
      
      if (chartType === "bar") {
        freqData.forEach((d, i) => {
          const barW = stepX * 0.6;
          const x = padding + i*stepX + (stepX - barW)/2;
          const barH = (d.freq / maxFreq) * h;
          const y = canvas.height - padding - barH;
          
          // Gradient
          const grad = ctx.createLinearGradient(0, y, 0, y + barH);
          grad.addColorStop(0, "#a855f7");
          grad.addColorStop(1, "#3b82f6");
          
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barW, barH);
          
          // X label
          ctx.fillStyle = "#cbd5e1";
          ctx.textAlign = "center";
          ctx.fillText(d.val.toString(), x + barW/2, canvas.height - padding + 20);
        });
      } else {
        // Line chart
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;
        ctx.beginPath();
        parsedData.forEach((d, i) => {
          const x = padding + i*stepX + stepX/2;
          const y = canvas.height - padding - (d.freq / maxFreq) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Points and X labels
        parsedData.forEach((d, i) => {
          const x = padding + i*stepX + stepX/2;
          const y = canvas.height - padding - (d.freq / maxFreq) * h;
          
          ctx.fillStyle = "#3b82f6";
          ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = "white"; ctx.lineWidth = 1.5; ctx.stroke();
          
          ctx.fillStyle = "#cbd5e1";
          ctx.textAlign = "center";
          ctx.fillText(d.val, x, canvas.height - padding + 20);
        });
      }
    } else if (chartType === "pie") {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(w, h) / 2;
      
      const totalFreq = parsedData.reduce((a,b)=>a+b.freq, 0);
      let currentAngle = -Math.PI / 2;
      
      const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];
      
      parsedData.forEach((d, i) => {
        const sliceAngle = (d.freq / totalFreq) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Labels
        if (sliceAngle > 0.1) {
          const midAngle = currentAngle + sliceAngle / 2;
          const labelX = cx + Math.cos(midAngle) * (radius * 0.7);
          const labelY = cy + Math.sin(midAngle) * (radius * 0.7);
          
          ctx.fillStyle = "white";
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${d.val}`, labelX, labelY - 8);
          ctx.font = "12px Arial";
          ctx.fillText(`${Math.round((d.freq/totalFreq)*100)}%`, labelX, labelY + 8);
        }
        
        currentAngle += sliceAngle;
      });
    }
  };

  useEffect(() => {
    draw();
  }, [parsedData, chartType]);

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button className={`btn-action ${chartType !== 'bar' ? 'btn-muted' : ''}`} onClick={() => setChartType('bar')}>Biểu đồ Cột</button>
            <button className={`btn-action ${chartType !== 'line' ? 'btn-muted' : ''}`} onClick={() => setChartType('line')}>Biểu đồ Đường</button>
            <button className={`btn-action ${chartType !== 'pie' ? 'btn-muted' : ''}`} onClick={() => setChartType('pie')}>Biểu đồ Tròn</button>
          </div>

          <canvas ref={canvasRef} width="500" height="350" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
          
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            <h4 style={{ color: '#a855f7', marginBottom: '10px' }}>Chỉ số Thống kê Đặc trưng:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <p><strong>Số trung bình:</strong> {stats.mean.toFixed(2)}</p>
                <p><strong>Trung vị (Median):</strong> {stats.median}</p>
                <p><strong>Mốt (Mode):</strong> {stats.mode.join(", ")}</p>
              </div>
              <div>
                <p><strong>Min:</strong> {stats.min}</p>
                <p><strong>Max:</strong> {stats.max}</p>
                <p><strong>Khoảng biến thiên:</strong> {stats.range}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="control-panel">
          <h3>Biểu Đồ Thống Kê</h3>
          
          <div className="control-group">Nhập dữ liệu (phân cách bằng dấu phẩy):</div>
          <textarea
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            rows="5"
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', resize: 'vertical' }}
          />
          
          <button className="btn-action" style={{ width: '100%', marginTop: '10px' }} onClick={generateRandom}>
            Tạo dữ liệu ngẫu nhiên
          </button>
          
          <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <p><strong>Ý nghĩa các biểu đồ:</strong></p>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Biểu đồ cột:</strong> So sánh tần số của các giá trị khác nhau. Dễ nhìn nhất sự chênh lệch.</li>
              <li><strong>Biểu đồ đường:</strong> Tốt cho việc xem xu hướng tăng giảm (thường dùng cho chuỗi thời gian).</li>
              <li><strong>Biểu đồ tròn:</strong> Thể hiện cơ cấu, tỷ lệ phần trăm của từng phần so với tổng thể.</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
