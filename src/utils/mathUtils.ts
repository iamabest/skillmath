import { Point } from './canvasHelper';

/**
 * Tìm Ước chung lớn nhất (GCD)
 */
export function getGCD(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b === 0) return a;
  return getGCD(b, a % b);
}

/**
 * Tìm Bội chung nhỏ nhất (LCM)
 */
export function getLCM(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / getGCD(a, b));
}

/**
 * Tính khoảng cách giữa 2 điểm
 */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Tìm trung điểm của 2 điểm
 */
export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

/**
 * Tính góc (radian) của vector đi từ p1 đến p2
 */
export function getAngle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Phân tích một số nguyên thành các thừa số nguyên tố
 * Trả về mảng các thừa số, ví dụ: 12 -> [2, 2, 3]
 */
export function getPrimeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  while (n > 1) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
    d++;
    if (d * d > n) {
      if (n > 1) factors.push(n);
      break;
    }
  }
  return factors;
}
