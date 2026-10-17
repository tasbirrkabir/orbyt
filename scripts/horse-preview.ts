/* Render the gallop keyframes to a BMP contact sheet so the
   poses can be reviewed visually before wiring the canvas.
   Run: bun run scripts/horse-preview.ts → /tmp/horse-preview.bmp */

import { HORSE_FRAMES, HORSE_BBOX, type FramePrims } from "../src/components/orbyt/horse-frames";

const SCALE = 7;
const M = 5;
const FW = Math.ceil((HORSE_BBOX.maxX - HORSE_BBOX.minX) * SCALE) + M * 2;
const FH = Math.ceil(HORSE_BBOX.maxY * SCALE) + M * 2;
const COLS = 4;
const ROWS = 2;
const W = FW * COLS + M * (COLS + 1);
const H = FH * ROWS + M * (ROWS + 1);

const img = new Uint8Array(W * H * 3);

function setPx(x: number, y: number, c: [number, number, number]) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = (y * W + x) * 3;
  img[o] = c[0];
  img[o + 1] = c[1];
  img[o + 2] = c[2];
}

function inside(wx: number, wy: number, fr: FramePrims): number {
  let best = 0;
  for (const b of fr.balls) {
    const dx = wx - b.x;
    const dy = wy - b.y;
    if (dx * dx + dy * dy < b.r * b.r) {
      const d = b.d ?? 1;
      if (d > best) best = d;
    }
  }
  for (const s of fr.strokes) {
    const ax = s.x2 - s.x1;
    const ay = s.y2 - s.y1;
    const len2 = ax * ax + ay * ay;
    let t = len2 === 0 ? 0 : ((wx - s.x1) * ax + (wy - s.y1) * ay) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const cx = s.x1 + t * ax;
    const cy = s.y1 + t * ay;
    const dx = wx - cx;
    const dy = wy - cy;
    if (dx * dx + dy * dy < s.r * s.r) {
      const d = s.d ?? 1;
      if (d > best) best = d;
    }
  }
  return best;
}

const BG: [number, number, number] = [12, 10, 9];
const GROUND: [number, number, number] = [86, 33, 8];
const NEAR: [number, number, number] = [253, 90, 1];
const HOT: [number, number, number] = [253, 90, 1];
const FAR: [number, number, number] = [150, 52, 6];

HORSE_FRAMES.forEach((fr, i) => {
  const ox = M + (i % COLS) * (FW + M);
  const oy = M + Math.floor(i / COLS) * (FH + M);
  for (let py = 0; py < FH; py++) {
    for (let pxl = 0; pxl < FW; pxl++) {
      const wx = HORSE_BBOX.minX + (pxl - M) / SCALE;
      const wy = (FH - M - py) / SCALE;
      const d = inside(wx, wy, fr);
      const onGround = Math.abs(wy) < 0.25 && ((pxl + i * 3) % 6 < 3);
      const c = d >= 1 ? (wx > 14 && wy > 15 ? HOT : NEAR) : d > 0 ? FAR : onGround ? GROUND : BG;
      setPx(ox + pxl, oy + py, c);
    }
  }
});

function writeBmp(path: string, w: number, h: number, rgb: Uint8Array) {
  const rowSize = Math.ceil((w * 3) / 4) * 4;
  const dataSize = rowSize * h;
  const buf = Buffer.alloc(54 + dataSize);
  buf.write("BM", 0, "ascii");
  buf.writeUInt32LE(54 + dataSize, 2);
  buf.writeUInt32LE(54, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(w, 18);
  buf.writeInt32LE(h, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(dataSize, 34);
  for (let y = 0; y < h; y++) {
    const src = (h - 1 - y) * w * 3;
    for (let x = 0; x < w; x++) {
      const o = 54 + y * rowSize + x * 3;
      buf[o] = rgb[src + x * 3 + 2];
      buf[o + 1] = rgb[src + x * 3 + 1];
      buf[o + 2] = rgb[src + x * 3];
    }
  }
  return Bun.write(path, buf);
}

await writeBmp("/tmp/horse-preview.bmp", W, H, img);
console.log(`frames=${HORSE_FRAMES.length} bbox=${JSON.stringify(HORSE_BBOX)} sheet=${W}x${H} → /tmp/horse-preview.bmp`);
