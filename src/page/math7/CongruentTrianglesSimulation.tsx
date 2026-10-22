import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/PageLayout';
import { drawPoint, drawLine, drawPolygon, Point } from '../../utils/canvasHelper';

type Mode = 'ccc' | 'cgc' | 'gcg' | 'right' | 'quiz';
type RightTriangleType = 'hyp_leg' | 'hyp_angle' | 'two_legs';

interface QuizQuestion {
  id: number;
  question: string;
  triangle1: string;
  triangle2: string;
  given: string[];
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Cho tam giác ABC và tam giác MNP có: AB = MN, BC = NP, AC = MP. Hai tam giác này bằng nhau theo trường hợp nào?",
    triangle1: "ΔABC",
    triangle2: "ΔMNP",
    given: ["AB = MN", "BC = NP", "AC = MP"],
    options: ["Cạnh - Cạnh - Cạnh (c - c - c)", "Cạnh - Góc - Cạnh (c - g - c)", "Góc - Cạnh - Góc (g - c - g)", "Chưa đủ điều kiện"],
    correctAnswer: 0,
    explanation: "Vì ba cạnh của ΔABC lần lượt bằng ba cạnh của ΔMNP nên hai tam giác bằng nhau theo trường hợp c - c - c."
  },
  {
    id: 2,
    question: "Cho ΔABC và ΔDEF có AB = DE, AC = DF và góc B = góc E. Hai tam giác này đã đủ điều kiện để bằng nhau chưa?",
    triangle1: "ΔABC",
    triangle2: "ΔDEF",
    given: ["AB = DE", "AC = DF", "∠B = ∠E"],
    options: ["Bằng nhau theo c - g - c", "Chưa đủ điều kiện (góc B không xen giữa AB và AC)", "Bằng nhau theo g - c - g", "Bằng nhau theo c - c - c"],
    correctAnswer: 1,
    explanation: "Trường hợp c - g - c yêu cầu góc bằng nhau PHẢI LÀ GÓC XEN GIỮA hai cạnh (tức là góc A phải bằng góc D). Ở đây góc B và E không xen giữa nên CHƯA ĐỦ điều kiện."
  },
  {
    id: 3,
    question: "Cho ΔABC và ΔMNP có BC = NP, góc B = góc N, góc C = góc P. Hai tam giác này bằng nhau theo trường hợp nào?",
    triangle1: "ΔABC",
    triangle2: "ΔMNP",
    given: ["BC = NP", "∠B = ∠N", "∠C = ∠P"],
    options: ["Cạnh - Cạnh - Cạnh", "Cạnh - Góc - Cạnh", "Góc - Cạnh - Góc (g - c - g)", "Chưa đủ điều kiện"],
    correctAnswer: 2,
    explanation: "Một cạnh và hai góc kề của ΔABC bằng một cạnh và hai góc kề của ΔMNP nên hai tam giác bằng nhau theo trường hợp g - c - g."
  },
  {
    id: 4,
    question: "Cho hai tam giác vuông ΔABC (vuông tại A) và ΔDEF (vuông tại D) có cạnh huyền BC = EF và cạnh góc vuông AC = DF. Hai tam giác này bằng nhau theo:",
    triangle1: "ΔABC (∠A = 90°)",
    triangle2: "ΔDEF (∠D = 90°)",
    given: ["∠A = ∠D = 90°", "BC = EF (cạnh huyền)", "AC = DF (cạnh góc vuông)"],
    options: ["Cạnh huyền - Cạnh góc vuông", "Cạnh - Góc - Cạnh", "Cạnh huyền - Góc nhọn", "Hai cạnh góc vuông"],
    correctAnswer: 0,
    explanation: "Đây là trường hợp bằng nhau đặc biệt của tam giác vuông: Cạnh huyền - Cạnh góc vuông."
  }
];

export default function CongruentTrianglesSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tab chế độ
  const [mode, setMode] = useState<Mode>('ccc');

  // Các tham số hình học
  // c-c-c: 3 cạnh
  const [sideA, setSideA] = useState(6.5); // BC
  const [sideB, setSideB] = useState(5.5); // AC
  const [sideC, setSideC] = useState(7.0); // AB

  // c-g-c: 2 cạnh và góc xen giữa B
  const [cgcC, setCgcC] = useState(6.0); // BA
  const [cgcA, setCgcA] = useState(7.0); // BC
  const [angleB, setAngleB] = useState(55); // Góc B xen giữa

  // g-c-g: 1 cạnh BC và 2 góc kề B, C
  const [gcgSide, setGcgSide] = useState(7.0); // BC
  const [gcgAngleB, setGcgAngleB] = useState(60); // Góc B
  const [gcgAngleC, setGcgAngleC] = useState(45); // Góc C

  // Tam giác vuông
  const [rightType, setRightType] = useState<RightTriangleType>('hyp_leg');
  const [rightLeg1, setRightLeg1] = useState(5.0); // AC
  const [rightHyp, setRightHyp] = useState(7.5);  // BC (cạnh huyền)
  const [rightAngle, setRightAngle] = useState(35); // góc nhọn B

  // Tùy biến tam giác 2 (A'B'C')
  const [rotationAngle, setRotationAngle] = useState(45); // góc xoay ban đầu
  const [overlapProgress, setOverlapProgress] = useState(0); // 0 (tách rời) -> 1 (chồng khít)
  const [isAnimating, setIsAnimating] = useState(false);

  // Hiển thị
  const [showLabels, setShowLabels] = useState(true);
  const [showMeasures, setShowMeasures] = useState(true);
  const [showTicks, setShowTicks] = useState(true);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Animation chồng khít
  const animFrameRef = useRef<number | null>(null);

  const triggerOverlap = (target: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsAnimating(true);

    const startVal = overlapProgress;
    const duration = 900; // ms
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(1, elapsed / duration);
      // easeInOutCubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const current = startVal + (target - startVal) * ease;
      setOverlapProgress(current);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setOverlapProgress(target);
        setIsAnimating(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  // Tính toán tọa độ tam giác chuẩn ABC căn giữa
  const calculateBaseTriangle = (): { A: Point; B: Point; C: Point; valid: boolean; message?: string } => {
    const scale = 28;

    if (mode === 'ccc') {
      const a = sideA;
      const b = sideB;
      const c = sideC;

      // Kiểm tra bất đẳng thức tam giác
      if (a + b <= c || a + c <= b || b + c <= a) {
        return { A: { x: 0, y: 0 }, B: { x: 0, y: 0 }, C: { x: 0, y: 0 }, valid: false, message: "Ba cạnh không thỏa mãn bất đẳng thức tam giác!" };
      }

      // BC đặt nằm ngang, B ở (0,0), C ở (a*scale, 0)
      const cosB = (c * c + a * a - b * b) / (2 * c * a);
      const sinB = Math.sqrt(Math.max(0, 1 - cosB * cosB));

      const B = { x: 0, y: 0 };
      const C = { x: a * scale, y: 0 };
      const A = { x: c * scale * cosB, y: -c * scale * sinB };

      return { A, B, C, valid: true };
    } 
    
    if (mode === 'cgc') {
      const c = cgcC;
      const a = cgcA;
      const radB = (angleB * Math.PI) / 180;

      const B = { x: 0, y: 0 };
      const C = { x: a * scale, y: 0 };
      const A = { x: c * scale * Math.cos(radB), y: -c * scale * Math.sin(radB) };

      return { A, B, C, valid: true };
    } 
    
    if (mode === 'gcg') {
      if (gcgAngleB + gcgAngleC >= 180) {
        return { A: { x: 0, y: 0 }, B: { x: 0, y: 0 }, C: { x: 0, y: 0 }, valid: false, message: "Tổng 2 góc phải nhỏ hơn 180°!" };
      }

      const a = gcgSide;
      const radB = (gcgAngleB * Math.PI) / 180;
      const radC = (gcgAngleC * Math.PI) / 180;
      const radA = Math.PI - radB - radC;

      // Định lý sin: c / sinC = a / sinA => c = a * sinC / sinA
      const c = (a * Math.sin(radC)) / Math.sin(radA);

      const B = { x: 0, y: 0 };
      const C = { x: a * scale, y: 0 };
      const A = { x: c * scale * Math.cos(radB), y: -c * scale * Math.sin(radB) };

      return { A, B, C, valid: true };
    }

    if (mode === 'right') {
      const B = { x: 0, y: 0 }; // Đỉnh vuông ở A, hoặc ở B
      // Hãy để A là đỉnh vuông
      if (rightType === 'hyp_leg') {
        const hyp = Math.max(rightLeg1 + 0.5, rightHyp);
        const leg1 = rightLeg1; // AC
        const leg2 = Math.sqrt(Math.max(1, hyp * hyp - leg1 * leg1)); // AB

        // A ở gốc (0,0), AB nằm ngang, AC thẳng đứng
        const A = { x: 0, y: 0 };
        const B = { x: leg2 * scale, y: 0 };
        const C = { x: 0, y: -leg1 * scale };
        return { A, B, C, valid: true };
      } else if (rightType === 'hyp_angle') {
        const hyp = rightHyp;
        const rad = (rightAngle * Math.PI) / 180;
        const leg2 = hyp * Math.cos(rad); // AB
        const leg1 = hyp * Math.sin(rad); // AC

        const A = { x: 0, y: 0 };
        const B = { x: leg2 * scale, y: 0 };
        const C = { x: 0, y: -leg1 * scale };
        return { A, B, C, valid: true };
      } else {
        // Hai cạnh góc vuông
        const leg1 = rightLeg1;
        const leg2 = 5.5;

        const A = { x: 0, y: 0 };
        const B = { x: leg2 * scale, y: 0 };
        const C = { x: 0, y: -leg1 * scale };
        return { A, B, C, valid: true };
      }
    }

    // Default fallback
    return {
      A: { x: 80, y: -120 },
      B: { x: 0, y: 0 },
      C: { x: 180, y: 0 },
      valid: true
    };
  };

  // Helper vẽ ký hiệu vạch trên đoạn thẳng (1, 2 hoặc 3 vạch)
  const drawTickMarks = (
    ctx: CanvasRenderingContext2D,
    p1: Point,
    p2: Point,
    count: number,
    color: string
  ) => {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    // Vector pháp tuyến
    const nx = -dy / len;
    const ny = dx / len;
    const tickLen = 6;
    const spacing = 4;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    const startOffset = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const offset = startOffset + i * spacing;
      // dịch chuyển dọc theo cạnh
      const cx = midX + (dx / len) * offset;
      const cy = midY + (dy / len) * offset;

      ctx.beginPath();
      ctx.moveTo(cx - nx * tickLen, cy - ny * tickLen);
      ctx.lineTo(cx + nx * tickLen, cy + ny * tickLen);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Helper vẽ góc và ký hiệu góc
  const drawAngleMark = (
    ctx: CanvasRenderingContext2D,
    center: Point,
    p1: Point,
    p2: Point,
    radius: number,
    color: string,
    isRight: boolean = false,
    text?: string
  ) => {
    const a1 = Math.atan2(p1.y - center.y, p1.x - center.x);
    const a2 = Math.atan2(p2.y - center.y, p2.x - center.x);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    if (isRight) {
      // Ký hiệu góc vuông
      const size = 16;
      const v1 = { x: (p1.x - center.x) / Math.hypot(p1.x - center.x, p1.y - center.y), y: (p1.y - center.y) / Math.hypot(p1.x - center.x, p1.y - center.y) };
      const v2 = { x: (p2.x - center.x) / Math.hypot(p2.x - center.x, p2.y - center.y), y: (p2.y - center.y) / Math.hypot(p2.x - center.x, p2.y - center.y) };

      const c1 = { x: center.x + v1.x * size, y: center.y + v1.y * size };
      const c2 = { x: center.x + (v1.x + v2.x) * size, y: center.y + (v1.y + v2.y) * size };
      const c3 = { x: center.x + v2.x * size, y: center.y + v2.y * size };

      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Góc nhọn / tù: vẽ cung tròn
    let diff = a2 - a1;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, a1, a1 + diff, diff < 0);
    ctx.stroke();

    // Điền nhẹ màu góc
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, a1, a1 + diff, diff < 0);
    ctx.closePath();
    ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
    ctx.fill();

    if (text) {
      const midAngle = a1 + diff / 2;
      const textX = center.x + Math.cos(midAngle) * (radius + 14);
      const textY = center.y + Math.sin(midAngle) * (radius + 14);
      ctx.fillStyle = color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, textX, textY);
    }

    ctx.restore();
  };

  // Vẽ Canvas chính
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Lưới nền mờ
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const base = calculateBaseTriangle();
    if (!base.valid) {
      ctx.fillStyle = '#f87171';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(base.message || 'Không thể tạo tam giác', W / 2, H / 2);
      return;
    }

    // Trọng tâm cơ sở để định vị
    const gBase = {
      x: (base.A.x + base.B.x + base.C.x) / 3,
      y: (base.A.y + base.B.y + base.C.y) / 3,
    };

    // Toạ độ offset tương đối so với trọng tâm
    const offsetA = { x: base.A.x - gBase.x, y: base.A.y - gBase.y };
    const offsetB = { x: base.B.x - gBase.x, y: base.B.y - gBase.y };
    const offsetC = { x: base.C.x - gBase.x, y: base.C.y - gBase.y };

    // Vị trí trọng tâm 2 tam giác
    // Tam giác 1 (ABC) đặt tại nửa bên trái
    const G1: Point = { x: W * 0.28, y: H * 0.52 };
    // Tam giác 2 (A'B'C') đặt tại nửa bên phải khi overlapProgress = 0
    const G2_initial: Point = { x: W * 0.72, y: H * 0.52 };

    // Tiến trình ghép chồng khít t: 0 -> 1
    const t = overlapProgress;

    // Trọng tâm tam giác 2 di chuyển từ G2_initial về G1
    const G2: Point = {
      x: G2_initial.x * (1 - t) + G1.x * t,
      y: G2_initial.y * (1 - t) + G1.y * t,
    };

    // Góc xoay của tam giác 2 cũng nội suy về 0 khi t -> 1
    const currentRotRad = ((rotationAngle * (1 - t)) * Math.PI) / 180;

    // Hàm xoay điểm quanh gốc
    const rotatePoint = (p: Point, rad: number): Point => ({
      x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
      y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
    });

    // Toạ độ thực tế tam giác 1 (ABC)
    const tri1A: Point = { x: G1.x + offsetA.x, y: G1.y + offsetA.y };
    const tri1B: Point = { x: G1.x + offsetB.x, y: G1.y + offsetB.y };
    const tri1C: Point = { x: G1.x + offsetC.x, y: G1.y + offsetC.y };

    // Toạ độ thực tế tam giác 2 (A'B'C')
    const rotA = rotatePoint(offsetA, currentRotRad);
    const rotB = rotatePoint(offsetB, currentRotRad);
    const rotC = rotatePoint(offsetC, currentRotRad);

    const tri2A: Point = { x: G2.x + rotA.x, y: G2.y + rotA.y };
    const tri2B: Point = { x: G2.x + rotB.x, y: G2.y + rotB.y };
    const tri2C: Point = { x: G2.x + rotC.x, y: G2.y + rotC.y };

    // 1. Vẽ Tam giác 1 (ABC - Xanh dương neon)
    const isMatched = t > 0.95;
    const color1 = isMatched ? '#10b981' : '#3b82f6';
    const bg1 = isMatched ? 'rgba(16, 185, 129, 0.18)' : 'rgba(59, 130, 246, 0.12)';

    drawPolygon(ctx, [tri1A, tri1B, tri1C], {
      color: color1,
      fillColor: bg1,
      lineWidth: 3,
    });

    // 2. Vẽ Tam giác 2 (A'B'C' - Tím / Hồng neon)
    const color2 = isMatched ? '#10b981' : '#ec4899';
    const bg2 = isMatched ? 'rgba(16, 185, 129, 0.18)' : 'rgba(236, 72, 153, 0.12)';

    drawPolygon(ctx, [tri2A, tri2B, tri2C], {
      color: color2,
      fillColor: bg2,
      lineWidth: 3,
      lineDash: isMatched ? [] : [6, 4],
    });

    // 3. Ký hiệu góc và độ dài cạnh theo từng trường hợp
    if (showTicks) {
      if (mode === 'ccc') {
        // Cả 3 cặp cạnh bằng nhau
        drawTickMarks(ctx, tri1B, tri1C, 1, '#60a5fa');
        drawTickMarks(ctx, tri2B, tri2C, 1, '#f472b6');

        drawTickMarks(ctx, tri1A, tri1B, 2, '#60a5fa');
        drawTickMarks(ctx, tri2A, tri2B, 2, '#f472b6');

        drawTickMarks(ctx, tri1A, tri1C, 3, '#60a5fa');
        drawTickMarks(ctx, tri2A, tri2C, 3, '#f472b6');
      } else if (mode === 'cgc') {
        // 2 cạnh và góc xen giữa B
        drawTickMarks(ctx, tri1B, tri1A, 1, '#60a5fa');
        drawTickMarks(ctx, tri2B, tri2A, 1, '#f472b6');

        drawTickMarks(ctx, tri1B, tri1C, 2, '#60a5fa');
        drawTickMarks(ctx, tri2B, tri2C, 2, '#f472b6');

        // Góc B
        drawAngleMark(ctx, tri1B, tri1A, tri1C, 24, '#fbbf24', false, showMeasures ? `${angleB}°` : undefined);
        drawAngleMark(ctx, tri2B, tri2A, tri2C, 24, '#fbbf24', false, showMeasures ? `${angleB}°` : undefined);
      } else if (mode === 'gcg') {
        // Cạnh BC và 2 góc kề B, C
        drawTickMarks(ctx, tri1B, tri1C, 1, '#60a5fa');
        drawTickMarks(ctx, tri2B, tri2C, 1, '#f472b6');

        drawAngleMark(ctx, tri1B, tri1A, tri1C, 24, '#38bdf8', false, showMeasures ? `${gcgAngleB}°` : undefined);
        drawAngleMark(ctx, tri2B, tri2A, tri2C, 24, '#38bdf8', false, showMeasures ? `${gcgAngleB}°` : undefined);

        drawAngleMark(ctx, tri1C, tri1A, tri1B, 24, '#a78bfa', false, showMeasures ? `${gcgAngleC}°` : undefined);
        drawAngleMark(ctx, tri2C, tri2A, tri2B, 24, '#a78bfa', false, showMeasures ? `${gcgAngleC}°` : undefined);
      } else if (mode === 'right') {
        // Góc vuông tại A
        drawAngleMark(ctx, tri1A, tri1B, tri1C, 16, '#f87171', true);
        drawAngleMark(ctx, tri2A, tri2B, tri2C, 16, '#f87171', true);

        if (rightType === 'hyp_leg') {
          // Cạnh huyền BC, cạnh góc vuông AC
          drawTickMarks(ctx, tri1B, tri1C, 3, '#f59e0b');
          drawTickMarks(ctx, tri2B, tri2C, 3, '#f59e0b');

          drawTickMarks(ctx, tri1A, tri1C, 1, '#60a5fa');
          drawTickMarks(ctx, tri2A, tri2C, 1, '#f472b6');
        } else if (rightType === 'hyp_angle') {
          // Cạnh huyền BC, góc nhọn B
          drawTickMarks(ctx, tri1B, tri1C, 3, '#f59e0b');
          drawTickMarks(ctx, tri2B, tri2C, 3, '#f59e0b');

          drawAngleMark(ctx, tri1B, tri1A, tri1C, 22, '#38bdf8', false, showMeasures ? `${rightAngle}°` : undefined);
          drawAngleMark(ctx, tri2B, tri2A, tri2C, 22, '#38bdf8', false, showMeasures ? `${rightAngle}°` : undefined);
        } else {
          // Hai cạnh góc vuông AB, AC
          drawTickMarks(ctx, tri1A, tri1B, 1, '#60a5fa');
          drawTickMarks(ctx, tri2A, tri2B, 1, '#f472b6');

          drawTickMarks(ctx, tri1A, tri1C, 2, '#60a5fa');
          drawTickMarks(ctx, tri2A, tri2C, 2, '#f472b6');
        }
      }
    }

    // 4. Nhãn đỉnh A, B, C và A', B', C'
    if (showLabels) {
      const drawLabel = (p: Point, text: string, color: string, offsetY = -10) => {
        drawPoint(ctx, p, { radius: 5, color: '#ffffff', fillColor: color });
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(text, p.x, p.y + offsetY);
      };

      drawLabel(tri1A, isMatched ? 'A ≡ A\'' : 'A', '#3b82f6', -12);
      drawLabel(tri1B, isMatched ? 'B ≡ B\'' : 'B', '#3b82f6', 22);
      drawLabel(tri1C, isMatched ? 'C ≡ C\'' : 'C', '#3b82f6', 22);

      if (!isMatched) {
        drawLabel(tri2A, "A'", '#ec4899', -12);
        drawLabel(tri2B, "B'", '#ec4899', 22);
        drawLabel(tri2C, "C'", '#ec4899', 22);
      }
    }

    // 5. Thông báo khi ghép trùng khít hoàn hảo
    if (isMatched) {
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ HAI TAM GIÁC TRÙNG KHÍT HOÀN TOÀN (ΔABC = ΔA\'B\'C\') ✨', W / 2, 35);
      ctx.restore();
    }
  }, [
    mode, sideA, sideB, sideC, cgcC, cgcA, angleB, gcgSide, gcgAngleB, gcgAngleC,
    rightType, rightLeg1, rightHyp, rightAngle, rotationAngle, overlapProgress,
    showLabels, showMeasures, showTicks
  ]);

  // Quiz handler
  const handleQuizAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);
    setAnsweredCount(prev => prev + 1);
    if (optionIndex === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuiz = () => {
    setSelectedAnswer(null);
    setCurrentQuizIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  return (
    <PageLayout>
      <div className="simulation-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => { setMode('ccc'); setOverlapProgress(0); }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'ccc' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'ccc' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            1. Cạnh - Cạnh - Cạnh (c - c - c)
          </button>

          <button
            onClick={() => { setMode('cgc'); setOverlapProgress(0); }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'cgc' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'cgc' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            2. Cạnh - Góc - Cạnh (c - g - c)
          </button>

          <button
            onClick={() => { setMode('gcg'); setOverlapProgress(0); }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'gcg' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'gcg' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            3. Góc - Cạnh - Góc (g - c - g)
          </button>

          <button
            onClick={() => { setMode('right'); setOverlapProgress(0); }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'right' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'right' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            4. Tam giác vuông (Đặc biệt)
          </button>

          <button
            onClick={() => { setMode('quiz'); setOverlapProgress(0); }}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'quiz' ? '#10b981' : 'transparent',
              color: mode === 'quiz' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🎯 Thử thách nhận biết
          </button>
        </div>

        {/* Khu vực mô phỏng chính */}
        {mode !== 'quiz' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) 360px',
            gap: '1.5rem',
            alignItems: 'start'
          }}>
            {/* Cột Canvas */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Header Canvas Controls */}
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: 600 }}>
                    ΔABC (Xanh)
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>và</span>
                  <span style={{ fontSize: '0.9rem', color: '#f472b6', fontWeight: 600 }}>
                    ΔA'B'C' (Hồng)
                  </span>
                </div>

                {/* Switch hiển thị */}
                <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showTicks}
                      onChange={(e) => setShowTicks(e.target.checked)}
                    />
                    Ký hiệu bằng nhau
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showMeasures}
                      onChange={(e) => setShowMeasures(e.target.checked)}
                    />
                    Số đo
                  </label>
                </div>
              </div>

              {/* Canvas */}
              <canvas
                ref={canvasRef}
                width={620}
                height={400}
                style={{
                  width: '100%',
                  maxWidth: '620px',
                  height: 'auto',
                  backgroundColor: '#0b1120',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />

              {/* Bảng điều khiển chuyển động ghép chồng khít */}
              <div style={{
                width: '100%',
                marginTop: '1.25rem',
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                    Chuyển động kiểm tra: Ghép chồng khít
                  </span>
                  <span style={{ fontSize: '0.85rem', color: overlapProgress > 0.95 ? '#10b981' : '#cbd5e1' }}>
                    {Math.round(overlapProgress * 100)}%
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => triggerOverlap(1)}
                    disabled={isAnimating || overlapProgress === 1}
                    style={{
                      flex: 1,
                      padding: '0.6rem 1rem',
                      background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: isAnimating || overlapProgress === 1 ? 'not-allowed' : 'pointer',
                      opacity: isAnimating || overlapProgress === 1 ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    🚀 Ghép chồng khít
                  </button>

                  <button
                    onClick={() => triggerOverlap(0)}
                    disabled={isAnimating || overlapProgress === 0}
                    style={{
                      flex: 1,
                      padding: '0.6rem 1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: isAnimating || overlapProgress === 0 ? 'not-allowed' : 'pointer',
                      opacity: isAnimating || overlapProgress === 0 ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    ↩️ Tách rời tam giác
                  </button>
                </div>

                {/* Slider xoay góc tam giác thứ hai */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Xoay góc tam giác ΔA'B'C' trước khi ghép:</span>
                    <span>{rotationAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    disabled={overlapProgress > 0}
                    style={{ width: '100%', accentColor: '#ec4899' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    * Giúp học sinh nhận biết: Hai tam giác bằng nhau dù chúng bị xoay nghiêng hay đổi vị trí.
                  </span>
                </div>
              </div>
            </div>

            {/* Cột Tùy chỉnh tham số & Thuyết minh sư phạm */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Box Thuyết minh trường hợp */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
                  {mode === 'ccc' && 'Trường hợp 1: Cạnh - Cạnh - Cạnh (c - c - c)'}
                  {mode === 'cgc' && 'Trường hợp 2: Cạnh - Góc - Cạnh (c - g - c)'}
                  {mode === 'gcg' && 'Trường hợp 3: Góc - Cạnh - Góc (g - c - g)'}
                  {mode === 'right' && 'Các trường hợp bằng nhau của Tam giác vuông'}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {mode === 'ccc' && 'Nếu ba cạnh của tam giác này bằng ba cạnh của tam giác kia thì hai tam giác đó bằng nhau.'}
                  {mode === 'cgc' && 'Nếu hai cạnh và góc xen giữa của tam giác này bằng hai cạnh và góc xen giữa của tam giác kia thì hai tam giác đó bằng nhau.'}
                  {mode === 'gcg' && 'Nếu một cạnh và hai góc kề của tam giác này bằng một cạnh và hai góc kề của tam giác kia thì hai tam giác đó bằng nhau.'}
                  {mode === 'right' && 'Tam giác vuông đã có sẵn 1 góc vuông 90°, do đó chỉ cần thêm 2 yếu tố thích hợp (cạnh huyền - góc nhọn, cạnh huyền - cạnh góc vuông...).'}
                </p>

                {/* Kết luận hình học */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.88rem',
                  color: '#34d399'
                }}>
                  <strong>Kết luận:</strong>
                  <div style={{ marginTop: '0.3rem', fontFamily: 'monospace' }}>
                    ΔABC = ΔA'B'C' ({mode.toUpperCase()})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: '0.4rem' }}>
                    Suy ra các cạnh và góc tương ứng bằng nhau:
                    <br />• AB = A'B', BC = B'C', AC = A'C'
                    <br />• ∠A = ∠A', ∠B = ∠B', ∠C = ∠C'
                  </div>
                </div>
              </div>

              {/* Box Điều chỉnh kích thước */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1rem' }}>
                  Tùy chỉnh thông số hình học
                </h4>

                {/* Sliders cho c-c-c */}
                {mode === 'ccc' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Cạnh đáy BC = B'C' (1 vạch)</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{sideA} cm</span>
                      </div>
                      <input
                        type="range" min="4" max="9" step="0.5"
                        value={sideA} onChange={(e) => setSideA(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Cạnh AB = A'B' (2 vạch)</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{sideC} cm</span>
                      </div>
                      <input
                        type="range" min="4" max="9" step="0.5"
                        value={sideC} onChange={(e) => setSideC(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Cạnh AC = A'C' (3 vạch)</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{sideB} cm</span>
                      </div>
                      <input
                        type="range" min="3.5" max="8.5" step="0.5"
                        value={sideB} onChange={(e) => setSideB(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}

                {/* Sliders cho c-g-c */}
                {mode === 'cgc' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Cạnh BA = B'A' (1 vạch)</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{cgcC} cm</span>
                      </div>
                      <input
                        type="range" min="4" max="8" step="0.5"
                        value={cgcC} onChange={(e) => setCgcC(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Góc xen giữa ∠B = ∠B'</span>
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>{angleB}°</span>
                      </div>
                      <input
                        type="range" min="30" max="120" step="5"
                        value={angleB} onChange={(e) => setAngleB(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#fbbf24' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Cạnh BC = B'C' (2 vạch)</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{cgcA} cm</span>
                      </div>
                      <input
                        type="range" min="4" max="9" step="0.5"
                        value={cgcA} onChange={(e) => setCgcA(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontSize: '0.8rem',
                      color: '#f59e0b'
                    }}>
                      ⚠️ <strong>Lưu ý quan trọng:</strong> Góc bằng nhau BẮT BUỘC phải là <em>góc xen giữa</em> hai cạnh đã cho.
                    </div>
                  </div>
                )}

                {/* Sliders cho g-c-g */}
                {mode === 'gcg' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Cạnh kề BC = B'C'</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{gcgSide} cm</span>
                      </div>
                      <input
                        type="range" min="4" max="9" step="0.5"
                        value={gcgSide} onChange={(e) => setGcgSide(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Góc kề ∠B = ∠B'</span>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{gcgAngleB}°</span>
                      </div>
                      <input
                        type="range" min="25" max="85" step="5"
                        value={gcgAngleB} onChange={(e) => setGcgAngleB(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#38bdf8' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Góc kề ∠C = ∠C'</span>
                        <span style={{ color: '#a78bfa', fontWeight: 600 }}>{gcgAngleC}°</span>
                      </div>
                      <input
                        type="range" min="25" max="85" step="5"
                        value={gcgAngleC} onChange={(e) => setGcgAngleC(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#a78bfa' }}
                      />
                    </div>
                  </div>
                )}

                {/* Chế độ Tam giác vuông */}
                {mode === 'right' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chọn trường hợp:</span>
                      <select
                        value={rightType}
                        onChange={(e) => setRightType(e.target.value as RightTriangleType)}
                        style={{
                          padding: '0.5rem',
                          background: '#1e293b',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="hyp_leg">Cạnh huyền - Cạnh góc vuông</option>
                        <option value="hyp_angle">Cạnh huyền - Góc nhọn</option>
                        <option value="two_legs">Hai cạnh góc vuông</option>
                      </select>
                    </div>

                    {rightType === 'hyp_leg' && (
                      <>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>Cạnh huyền BC = B'C'</span>
                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{rightHyp} cm</span>
                          </div>
                          <input
                            type="range" min="6" max="9.5" step="0.5"
                            value={rightHyp} onChange={(e) => setRightHyp(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#f59e0b' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>Cạnh góc vuông AC = A'C'</span>
                            <span style={{ color: '#60a5fa', fontWeight: 600 }}>{rightLeg1} cm</span>
                          </div>
                          <input
                            type="range" min="3" max="5.5" step="0.5"
                            value={rightLeg1} onChange={(e) => setRightLeg1(Number(e.target.value))}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </>
                    )}

                    {rightType === 'hyp_angle' && (
                      <>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>Cạnh huyền BC = B'C'</span>
                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{rightHyp} cm</span>
                          </div>
                          <input
                            type="range" min="6" max="9.5" step="0.5"
                            value={rightHyp} onChange={(e) => setRightHyp(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#f59e0b' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>Góc nhọn ∠B = ∠B'</span>
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{rightAngle}°</span>
                          </div>
                          <input
                            type="range" min="20" max="70" step="5"
                            value={rightAngle} onChange={(e) => setRightAngle(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38bdf8' }}
                          />
                        </div>
                      </>
                    )}

                    {rightType === 'two_legs' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span>Cạnh góc vuông AC = A'C'</span>
                          <span style={{ color: '#60a5fa', fontWeight: 600 }}>{rightLeg1} cm</span>
                        </div>
                        <input
                          type="range" min="3" max="6.5" step="0.5"
                          value={rightLeg1} onChange={(e) => setRightLeg1(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Chế độ Thử thách / Quiz */
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            maxWidth: '780px',
            margin: '0 auto',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                Câu hỏi {currentQuizIndex + 1} / {QUIZ_QUESTIONS.length}
              </span>

              <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem' }}>
                Điểm số: {quizScore} / {answeredCount}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {QUIZ_QUESTIONS[currentQuizIndex].question}
            </h3>

            {/* Dữ kiện đề bài */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Dữ kiện:</span>
              {QUIZ_QUESTIONS[currentQuizIndex].given.map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    color: '#f8fafc'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Các lựa chọn trả lời */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer;
                let btnBg = 'rgba(30, 41, 59, 0.8)';
                let btnBorder = 'rgba(255, 255, 255, 0.1)';

                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    btnBg = 'rgba(16, 185, 129, 0.25)';
                    btnBorder = '#10b981';
                  } else if (isSelected) {
                    btnBg = 'rgba(239, 68, 68, 0.25)';
                    btnBorder = '#ef4444';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    style={{
                      textAlign: 'left',
                      padding: '1rem 1.25rem',
                      borderRadius: '10px',
                      background: btnBg,
                      border: `1.5px solid ${btnBorder}`,
                      color: '#f8fafc',
                      fontSize: '0.95rem',
                      cursor: selectedAnswer === null ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      fontWeight: isSelected || (selectedAnswer !== null && isCorrect) ? 600 : 400
                    }}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                );
              })}
            </div>

            {/* Giải thích sau khi trả lời */}
            {selectedAnswer !== null && (
              <div style={{
                background: selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer ? '#10b981' : '#ef4444'}`,
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  fontWeight: 700,
                  color: selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer ? '#34d399' : '#f87171',
                  marginBottom: '0.4rem'
                }}>
                  {selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {QUIZ_QUESTIONS[currentQuizIndex].explanation}
                </p>
              </div>
            )}

            {/* Nút câu tiếp theo */}
            {selectedAnswer !== null && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={nextQuiz}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Câu tiếp theo ➔
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </PageLayout>
  );
}
