import React, { useEffect, useRef, useState, ReactNode } from "react";
import PageLayout from "../../components/PageLayout";
import { getGCD, getLCM } from "../../utils/mathUtils";

export default function FractionCalculatorSimulation() {
  const [num1, setNum1] = useState(1);
  const [den1, setDen1] = useState(2);
  const [num2, setNum2] = useState(1);
  const [den2, setDen2] = useState(3);
  const [operator, setOperator] = useState("+");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawFractionPie = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, num: number, den: number, color: string) => {
    if (den === 0) return;
    const absNum = Math.abs(num);
    const wholeParts = Math.floor(absNum / den);
    const remainder = absNum % den;
    
    // Draw whole parts if any (simplified representation)
    if (wholeParts > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${wholeParts}`, cx - radius - 15, cy);
    }

    // Draw the fractional part
    const angleStep = (Math.PI * 2) / den;
    
    // Background empty slices
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let i = 0; i < den; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, i * angleStep - Math.PI / 2, (i + 1) * angleStep - Math.PI / 2);
      ctx.lineTo(cx, cy);
      if (i < remainder) {
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.stroke();
    }
    
    if (num < 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("-", cx, cy + radius + 15);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const radius = 50;
    const cy = canvas.height / 2;

    // Draw Frac 1
    drawFractionPie(ctx, 100, cy, radius, num1, den1, "#a78bfa");
    
    // Draw Operator
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(operator === '*' ? '×' : operator === '/' ? '÷' : operator, 200, cy);

    // Draw Frac 2
    drawFractionPie(ctx, 300, cy, radius, num2, den2, "#a78bfa");

    // Draw Equals
    ctx.fillText("=", 400, cy);

    // Calculate Result
    let resNum = 0;
    let resDen = 1;

    if (operator === "+") {
      resNum = num1 * den2 + num2 * den1;
      resDen = den1 * den2;
    } else if (operator === "-") {
      resNum = num1 * den2 - num2 * den1;
      resDen = den1 * den2;
    } else if (operator === "*") {
      resNum = num1 * num2;
      resDen = den1 * den2;
    } else if (operator === "/") {
      resNum = num1 * den2;
      resDen = den1 * num2;
    }

    if (resDen < 0) {
      resNum = -resNum;
      resDen = -resDen;
    }

    const divisor = getGCD(resNum, resDen);
    resNum = resNum / divisor;
    resDen = resDen / divisor;

    // Draw Result
    if (resDen === 0) {
      ctx.fillText("Undefined", 500, cy);
    } else {
      drawFractionPie(ctx, 500, cy, radius, resNum, resDen, "#4ade80");
    }
  };

  useEffect(() => {
    draw();
  }, [num1, den1, num2, den2, operator]);

  // Steps calculation for UI display
  const renderSteps = () => {
    if (den1 === 0 || den2 === 0) return <p>Mẫu số không thể bằng 0</p>;
    
    let resNum = 0;
    let resDen = 1;
    let steps: ReactNode[] = [];

    const opSymbol = operator === '*' ? '×' : operator === '/' ? '÷' : operator;

    if (operator === "+" || operator === "-") {
      const commonDen = getLCM(den1, den2);
      const mult1 = commonDen / den1;
      const mult2 = commonDen / den2;
      const newNum1 = num1 * mult1;
      const newNum2 = num2 * mult2;

      steps.push(
        <div key="1">
          1. Quy đồng mẫu số (BCNN của {den1} và {den2} là {commonDen}):<br/>
          ({num1}×{mult1})/({den1}×{mult1}) {opSymbol} ({num2}×{mult2})/({den2}×{mult2})<br/>
          = {newNum1}/{commonDen} {opSymbol} {newNum2}/{commonDen}
        </div>
      );

      resNum = operator === "+" ? newNum1 + newNum2 : newNum1 - newNum2;
      resDen = commonDen;
      
      steps.push(
        <div key="2" style={{ marginTop: "10px" }}>
          2. Thực hiện phép {operator === "+" ? "cộng" : "trừ"} tử số:<br/>
          = ({newNum1} {opSymbol} {newNum2}) / {commonDen}<br/>
          = {resNum}/{resDen}
        </div>
      );
    } else if (operator === "*") {
      resNum = num1 * num2;
      resDen = den1 * den2;
      steps.push(
        <div key="1">
          1. Nhân tử với tử, mẫu với mẫu:<br/>
          = ({num1} × {num2}) / ({den1} × {den2})<br/>
          = {resNum}/{resDen}
        </div>
      );
    } else if (operator === "/") {
      if (num2 === 0) return <p>Không thể chia cho 0</p>;
      const flipNum = den2;
      const flipDen = num2;
      resNum = num1 * flipNum;
      resDen = den1 * flipDen;
      steps.push(
        <div key="1">
          1. Nhân với phân số nghịch đảo của phân số thứ hai:<br/>
          = ({num1}/{den1}) × ({flipNum}/{flipDen})
        </div>
      );
      steps.push(
        <div key="2" style={{ marginTop: "10px" }}>
          2. Nhân tử với tử, mẫu với mẫu:<br/>
          = ({num1} × {flipNum}) / ({den1} × {flipDen})<br/>
          = {resNum}/{resDen}
        </div>
      );
    }

    if (resDen < 0) {
      resNum = -resNum;
      resDen = -resDen;
    }

    const divisor = getGCD(resNum, resDen);
    if (divisor > 1) {
      steps.push(
        <div key="3" style={{ marginTop: "10px" }}>
          3. Rút gọn kết quả (chia cả tử và mẫu cho UCLN = {divisor}):<br/>
          = ({resNum} ÷ {divisor}) / ({resDen} ÷ {divisor})<br/>
          = {resNum / divisor}/{resDen / divisor}
        </div>
      );
    }

    return steps;
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <canvas ref={canvasRef} width="600" height="400" />
          <div className="info-box" style={{ marginTop: '20px', width: '90%' }}>
            <h4 style={{ color: '#a78bfa', marginBottom: '10px' }}>Các bước tính toán:</h4>
            {renderSteps()}
          </div>
        </div>

        <div className="control-panel">
          <h3>Phép tính Phân số</h3>
          
          <div className="control-group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Frac 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
              <input 
                type="number" 
                value={num1} 
                onChange={(e) => setNum1(parseInt(e.target.value) || 0)}
                style={{ width: '100%', textAlign: 'center', padding: '5px' }}
              />
              <div style={{ width: '100%', height: '2px', backgroundColor: '#fff', margin: '5px 0' }}></div>
              <input 
                type="number" 
                value={den1} 
                onChange={(e) => setDen1(parseInt(e.target.value) || 1)}
                style={{ width: '100%', textAlign: 'center', padding: '5px' }}
              />
            </div>

            {/* Operator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <button className={`btn-action ${operator === '+' ? '' : 'btn-muted'}`} style={{ padding: '5px 10px' }} onClick={() => setOperator('+')}>+</button>
              <button className={`btn-action ${operator === '-' ? '' : 'btn-muted'}`} style={{ padding: '5px 10px' }} onClick={() => setOperator('-')}>-</button>
              <button className={`btn-action ${operator === '*' ? '' : 'btn-muted'}`} style={{ padding: '5px 10px' }} onClick={() => setOperator('*')}>×</button>
              <button className={`btn-action ${operator === '/' ? '' : 'btn-muted'}`} style={{ padding: '5px 10px' }} onClick={() => setOperator('/')}>÷</button>
            </div>

            {/* Frac 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
              <input 
                type="number" 
                value={num2} 
                onChange={(e) => setNum2(parseInt(e.target.value) || 0)}
                style={{ width: '100%', textAlign: 'center', padding: '5px' }}
              />
              <div style={{ width: '100%', height: '2px', backgroundColor: '#fff', margin: '5px 0' }}></div>
              <input 
                type="number" 
                value={den2} 
                onChange={(e) => setDen2(parseInt(e.target.value) || 1)}
                style={{ width: '100%', textAlign: 'center', padding: '5px' }}
              />
            </div>
          </div>
          
        </div>
      </div>
    </PageLayout>
  );
}
