export interface Point {
  x: number;
  y: number;
}

export interface DrawOptions {
  color?: string;
  lineWidth?: number;
  lineDash?: number[];
  fillColor?: string;
}

export interface TextOptions {
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  offsetX?: number;
  offsetY?: number;
}

/**
 * Vẽ một điểm (chấm tròn nhỏ) trên Canvas
 */
export function drawPoint(
  ctx: CanvasRenderingContext2D,
  p: Point,
  options?: DrawOptions & { radius?: number }
) {
  const r = options?.radius || 4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = options?.fillColor || options?.color || '#3b82f6';
  ctx.fill();
  if (options?.lineWidth) {
    ctx.lineWidth = options.lineWidth;
    ctx.strokeStyle = options?.color || '#1e3a8a';
    ctx.stroke();
  }
}

/**
 * Vẽ một đoạn thẳng giữa 2 điểm
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  options?: DrawOptions
) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  
  if (options?.lineDash) {
    ctx.setLineDash(options.lineDash);
  } else {
    ctx.setLineDash([]);
  }
  
  ctx.lineWidth = options?.lineWidth || 2;
  ctx.strokeStyle = options?.color || '#cbd5e1';
  ctx.stroke();
  ctx.setLineDash([]); // Reset
}

/**
 * Vẽ đa giác (Ví dụ: Tam giác) từ mảng các điểm
 */
export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  options?: DrawOptions
) {
  if (points.length < 3) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  
  if (options?.fillColor) {
    ctx.fillStyle = options.fillColor;
    ctx.fill();
  }
  
  ctx.lineWidth = options?.lineWidth || 2;
  ctx.strokeStyle = options?.color || '#cbd5e1';
  ctx.stroke();
}

/**
 * Vẽ cung tròn (góc)
 */
export function drawArc(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  options?: DrawOptions
) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, startAngle, endAngle);
  
  if (options?.fillColor) {
    ctx.lineTo(center.x, center.y); // Vẽ phần tư hình tròn nếu có fill
    ctx.closePath();
    ctx.fillStyle = options.fillColor;
    ctx.fill();
  }
  
  ctx.lineWidth = options?.lineWidth || 2;
  ctx.strokeStyle = options?.color || '#cbd5e1';
  ctx.stroke();
}

/**
 * Vẽ đoạn text tại một điểm
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  p: Point,
  options?: TextOptions
) {
  ctx.font = options?.font || '14px Arial';
  ctx.fillStyle = options?.color || '#f8fafc';
  ctx.textAlign = options?.align || 'center';
  ctx.textBaseline = options?.baseline || 'middle';
  
  const x = p.x + (options?.offsetX || 0);
  const y = p.y + (options?.offsetY || 0);
  
  ctx.fillText(text, x, y);
}

/**
 * Khởi tạo lưới tọa độ Oxy
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number = 50,
  origin: Point = { x: width / 2, y: height / 2 },
  color: string = 'rgba(255, 255, 255, 0.1)'
) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;

  // Lưới dọc
  for (let x = origin.x % step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Lưới ngang
  for (let y = origin.y % step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Trục Ox, Oy
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  
  // Ox
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(width, origin.y);
  ctx.stroke();
  
  // Oy
  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, height);
  ctx.stroke();
}
