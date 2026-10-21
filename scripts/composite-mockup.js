const sharp = require('sharp');
const fs = require('fs');

function getHomography(src, dst) {
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const {x: dx, y: dy} = dst[i];
    const {x: sx, y: sy} = src[i];
    A.push([dx, dy, 1, 0, 0, 0, -dx * sx, -dy * sx]);
    b.push(sx);
    A.push([0, 0, 0, dx, dy, 1, -dx * sy, -dy * sy]);
    b.push(sy);
  }

  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];

    const pivot = A[i][i];
    for (let j = i; j < n; j++) A[i][j] /= pivot;
    b[i] /= pivot;

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = i; j < n; j++) A[k][j] -= factor * A[i][j];
        b[k] -= factor * b[i];
      }
    }
  }

  return [
    b[0], b[1], b[2],
    b[3], b[4], b[5],
    b[6], b[7], 1
  ];
}

function pointInQuad(p, quad) {
  for (let i = 0; i < 4; i++) {
    const p1 = quad[i];
    const p2 = quad[(i + 1) % 4];
    const cross = (p2.x - p1.x) * (p.y - p1.y) - (p2.y - p1.y) * (p.x - p1.x);
    if (cross < -0.001) return false;
  }
  return true;
}

function distToEdge(p, p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return 0;
  return ((p2.x - p1.x) * (p.y - p1.y) - (p2.y - p1.y) * (p.x - p1.x)) / len;
}

async function run() {
  const mockupPath = 'C:/Users/WALTON/.gemini/antigravity/brain/23f9a479-fdd2-4cef-b48c-9a709c96dbb8/.user_uploaded/media_1792575708293_46c4d859.jpg';
  const screenshotPath = 'E:/ORBYT/orbyt-home-screen.png';
  const outputPath = 'E:/ORBYT/orbyt_mockup_poster.png';
  const runnerPath = 'E:/ORBYT/runner_black_transparent.png';

  const scale = 2;
  console.log('1. Loading base mockup and upscaling 2x...');
  const baseBuffer = await sharp(mockupPath)
    .resize(736 * scale, 552 * scale, { kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: baseData, info: baseInfo } = baseBuffer;
  const W = baseInfo.width;
  const H = baseInfo.height;

  function getBasePixel(x, y) {
    const idx = (y * W + x) * baseInfo.channels;
    return [baseData[idx], baseData[idx+1], baseData[idx+2]];
  }
  function setBasePixel(x, y, [r,g,b]) {
    const idx = (y * W + x) * baseInfo.channels;
    baseData[idx] = r; baseData[idx+1] = g; baseData[idx+2] = b;
  }

  console.log('2. Erasing top-left Studio and Web Dev text completely...');
  const wallColor = [228, 228, 228];
  const topClearX0 = Math.round(18 * scale);
  const topClearX1 = Math.round(260 * scale);
  const topClearY0 = Math.round(14 * scale);
  const topClearY1 = Math.round(42 * scale);

  for (let y = topClearY0; y <= topClearY1; y++) {
    for (let x = topClearX0; x <= topClearX1; x++) {
      setBasePixel(x, y, wallColor);
    }
  }

  console.log('3. Erasing bottom-left text (CLIENT, ORBYT, DigitalSystems) with seamless slats...');
  // Slat period is ~46px at 2x scale
  const patternW = Math.round(46 * scale);
  const patternStartX = Math.round(265 * scale);
  const slatX0 = 0;
  const slatX1 = Math.round(270 * scale);
  const slatY0 = Math.round(495 * scale);
  const slatY1 = H - 1;

  for (let y = slatY0; y <= slatY1; y++) {
    for (let x = slatX0; x <= slatX1; x++) {
      const offset = (x % patternW + patternW) % patternW;
      const srcX = patternStartX + offset;
      setBasePixel(x, y, getBasePixel(srcX, y));
    }
  }

  console.log('4. Projecting ORBYT homepage screenshot onto monitor...');
  const screenBuffer = await sharp(screenshotPath)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data: screenData, info: screenInfo } = screenBuffer;
  const sW = screenInfo.width;
  const sH = screenInfo.height;

  // Exact monitor screen quad (2x scale)
  const quad = [
    { x: Math.round(105.5 * scale), y: Math.round(87.5 * scale) },   // Top-Left
    { x: Math.round(552.0 * scale), y: Math.round(48.0 * scale) },   // Top-Right
    { x: Math.round(552.0 * scale), y: Math.round(373.0 * scale) },  // Bottom-Right
    { x: Math.round(105.5 * scale), y: Math.round(402.0 * scale) }   // Bottom-Left
  ];

  const srcQuad = [
    { x: 0, y: 0 },
    { x: sW, y: 0 },
    { x: sW, y: sH },
    { x: 0, y: sH }
  ];

  const invH = getHomography(srcQuad, quad);

  const minX = Math.floor(Math.min(...quad.map(p => p.x)));
  const maxX = Math.ceil(Math.max(...quad.map(p => p.x)));
  const minY = Math.floor(Math.min(...quad.map(p => p.y)));
  const maxY = Math.ceil(Math.max(...quad.map(p => p.y)));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (x < 0 || x >= W || y < 0 || y >= H) continue;

      if (!pointInQuad({ x, y }, quad)) continue;

      // Distance to edge for smooth 1px anti-aliasing
      let minDist = 999;
      for (let i = 0; i < 4; i++) {
        const d = distToEdge({ x, y }, quad[i], quad[(i + 1) % 4]);
        if (d < minDist) minDist = d;
      }
      const alpha = Math.min(1, Math.max(0, minDist / 1.0));

      const w = invH[6] * x + invH[7] * y + invH[8];
      const u = (invH[0] * x + invH[1] * y + invH[2]) / w;
      const v = (invH[3] * x + invH[4] * y + invH[5]) / w;

      if (u < 0 || u >= sW - 1 || v < 0 || v >= sH - 1) continue;

      const u0 = Math.floor(u);
      const u1 = u0 + 1;
      const v0 = Math.floor(v);
      const v1 = v0 + 1;
      const fu = u - u0;
      const fv = v - v0;

      const idx00 = (v0 * sW + u0) * screenInfo.channels;
      const idx10 = (v0 * sW + u1) * screenInfo.channels;
      const idx01 = (v1 * sW + u0) * screenInfo.channels;
      const idx11 = (v1 * sW + u1) * screenInfo.channels;

      const baseIdx = (y * W + x) * baseInfo.channels;

      for (let c = 0; c < 3; c++) {
        const top = screenData[idx00 + c] * (1 - fu) + screenData[idx10 + c] * fu;
        const bot = screenData[idx01 + c] * (1 - fu) + screenData[idx11 + c] * fu;
        const color = top * (1 - fv) + bot * fv;

        baseData[baseIdx + c] = Math.round(baseData[baseIdx + c] * (1 - alpha) + color * alpha);
      }
    }
  }

  console.log('5. Adding Black & White ORBYT logo at top-left...');
  // Resize black runner to 36px height (matching the Studio logo height)
  const runnerTargetH = Math.round(20 * scale);
  const runnerBuffer = await sharp(runnerPath)
    .resize({ height: runnerTargetH })
    .toBuffer({ resolveWithObject: true });

  const runnerLeft = Math.round(26 * scale);
  const runnerTop = Math.round(18 * scale);

  // SVG text for "ORBYT" wordmark
  const textLeft = runnerLeft + runnerBuffer.info.width + Math.round(8 * scale);
  const textBaselineY = runnerTop + Math.round(16 * scale);

  const wordmarkSvg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .brand-text {
          font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: ${Math.round(17 * scale)}px;
          font-weight: 800;
          fill: #1B1B1A;
          letter-spacing: -0.01em;
        }
      </style>
      <text x="${textLeft}" y="${textBaselineY}" class="brand-text">ORBYT</text>
    </svg>
  `;

  let img = sharp(baseData, {
    raw: {
      width: W,
      height: H,
      channels: baseInfo.channels
    }
  });

  await img
    .composite([
      {
        input: runnerBuffer.data,
        top: runnerTop,
        left: runnerLeft
      },
      {
        input: Buffer.from(wordmarkSvg),
        top: 0,
        left: 0
      }
    ])
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);

  console.log('SUCCESS! Saved PNG poster to:', outputPath);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
