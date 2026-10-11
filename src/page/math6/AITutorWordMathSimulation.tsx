import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

export default function AITutorWordMathSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Chào bạn! Tôi là Trợ lý AI Toán học. Hãy cùng giải bài toán sau nhé:" },
    { sender: "ai", text: "**Bài toán:** Một giỏ có 120 quả táo. Buổi sáng bán được 1/3 số táo. Buổi chiều bán được 1/4 số táo *còn lại*. Hỏi giỏ còn lại bao nhiêu quả táo?" },
    { sender: "ai", text: "Để bắt đầu, theo bạn buổi sáng bán được bao nhiêu quả táo? (Gợi ý: Lấy 120 × 1/3)" }
  ]);
  
  const [inputMsg, setInputMsg] = useState("");
  const [step, setStep] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Visualization state
  const [total, setTotal] = useState(120);
  const [soldMorning, setSoldMorning] = useState(0);
  const [soldAfternoon, setSoldAfternoon] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    
    const userText = inputMsg.trim();
    const newMsgs = [...messages, { sender: "user", text: userText }];
    setMessages(newMsgs);
    setInputMsg("");

    // Simple bot logic based on steps
    setTimeout(() => {
      let botResponse = "";
      let nextStep = step;

      const numMatch = userText.match(/\d+/);
      const userNum = numMatch ? parseInt(numMatch[0]) : null;

      if (step === 1) {
        if (userNum === 40) {
          botResponse = "Chính xác! Buổi sáng bán được 40 quả táo.\nTiếp theo, bạn hãy tính số táo **còn lại sau buổi sáng** nhé. (Gợi ý: 120 - 40)";
          setSoldMorning(40);
          nextStep = 2;
        } else {
          botResponse = "Chưa đúng rồi. Bạn lấy 120 chia cho 3 thử xem nhé!";
        }
      } else if (step === 2) {
        if (userNum === 80) {
          botResponse = "Rất tuyệt! Số táo còn lại là 80 quả.\nBây giờ, buổi chiều bán được 1/4 số táo còn lại này. Bạn hãy tính số táo bán buổi chiều nhé. (Gợi ý: 80 × 1/4)";
          nextStep = 3;
        } else {
          botResponse = "Bạn kiểm tra lại phép trừ 120 - 40 nhé!";
        }
      } else if (step === 3) {
        if (userNum === 20) {
          botResponse = "Đúng rồi! Buổi chiều bán được 20 quả táo.\nCuối cùng, giỏ còn lại bao nhiêu quả táo? (Gợi ý: Lấy 80 quả trừ đi 20 quả vừa bán)";
          setSoldAfternoon(20);
          nextStep = 4;
        } else {
          botResponse = "Buổi chiều bán 1/4 của 80 quả. Bạn lấy 80 chia cho 4 nhé!";
        }
      } else if (step === 4) {
        if (userNum === 60) {
          botResponse = "Hoàn hảo! 🎉 Cuối ngày, giỏ còn lại 60 quả táo. Bạn đã giải quyết xuất sắc bài toán này!";
          nextStep = 5;
        } else {
          botResponse = "Gần đúng rồi! Lấy 80 trừ 20 nhé bạn.";
        }
      } else {
        botResponse = "Bài toán đã được giải xong. Nhấn nút 'Làm lại' để thực hành lại nhé!";
      }

      setMessages(prev => [...prev, { sender: "ai", text: botResponse }]);
      setStep(nextStep);
    }, 600);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    
    // Draw Bar Chart Visualization
    const barWidth = 60;
    const maxBarHeight = 300;
    
    const drawBar = (x: number, val: number, color: string, label: string) => {
      const h = (val / 120) * maxBarHeight;
      const y = canvas.height - 40 - h;
      
      // Gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "#1e293b");
      
      ctx.fillStyle = grad;
      ctx.fillRect(x - barWidth/2, y, barWidth, h);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - barWidth/2, y, barWidth, h);
      
      // Label Top
      ctx.fillStyle = "white";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(val, x, y - 10);
      
      // Label Bottom
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px Arial";
      ctx.fillText(label, x, canvas.height - 20);
    };

    // Remaining apples
    const remaining = total - soldMorning - soldAfternoon;

    drawBar(cx - 100, soldMorning, "#f59e0b", "Sáng");
    drawBar(cx, soldAfternoon, "#3b82f6", "Chiều");
    drawBar(cx + 100, remaining, "#4ade80", "Còn lại");
    
    // Total reference line
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 40 - maxBarHeight);
    ctx.lineTo(canvas.width - 40, canvas.height - 40 - maxBarHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("Tổng: 120", canvas.width - 70, canvas.height - 45 - maxBarHeight);
  };

  useEffect(() => {
    draw();
  }, [soldMorning, soldAfternoon, total]);

  const reset = () => {
    setMessages([
      { sender: "ai", text: "Chào bạn! Tôi là Trợ lý AI Toán học. Hãy cùng giải bài toán sau nhé:" },
      { sender: "ai", text: "**Bài toán:** Một giỏ có 120 quả táo. Buổi sáng bán được 1/3 số táo. Buổi chiều bán được 1/4 số táo *còn lại*. Hỏi giỏ còn lại bao nhiêu quả táo?" },
      { sender: "ai", text: "Để bắt đầu, theo bạn buổi sáng bán được bao nhiêu quả táo? (Gợi ý: Lấy 120 × 1/3)" }
    ]);
    setStep(1);
    setSoldMorning(0);
    setSoldAfternoon(0);
  };

  return (
    <PageLayout>
      <div className="simulation-container">
        <div className="canvas-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0f172a' }}>
          <h3 style={{ color: '#60a5fa', marginBottom: '10px' }}>Trực quan hóa Dữ liệu</h3>
          <canvas ref={canvasRef} width="400" height="400" style={{ backgroundColor: '#1e293b', borderRadius: '8px' }} />
        </div>

        <div className="control-panel" style={{ display: 'flex', flexDirection: 'column', height: '500px', padding: 0 }}>
          <div style={{ padding: '15px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
            <h3 style={{ margin: 0, color: '#f8fafc' }}>🤖 Trợ lý AI Giải toán</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? '#3b82f6' : '#334155',
                padding: '10px 14px',
                borderRadius: '8px',
                maxWidth: '85%',
                lineHeight: '1.4'
              }}>
                <span style={{ fontSize: '0.95rem' }}>
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.includes('**') ? 
                        <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /> 
                        : line}
                      <br />
                    </React.Fragment>
                  ))}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '10px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={inputMsg} 
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu trả lời của bạn..."
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', outline: 'none' }}
            />
            <button className="btn-action" onClick={handleSend} style={{ padding: '10px 20px' }}>Gửi</button>
          </div>
          
          <button onClick={reset} style={{ margin: '10px', padding: '8px', backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>
            Làm lại từ đầu
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
