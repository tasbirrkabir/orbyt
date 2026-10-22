const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function composite() {
  const mockupPath = 'C:/Users/WALTON/.gemini/antigravity/brain/3eb4c3a7-0685-41c7-8e6d-534c033d5623/.user_uploaded/media_1792606576525_c25d0fd9.png';
  const screenshotSource = 'C:/Users/WALTON/.gemini/antigravity/brain/3eb4c3a7-0685-41c7-8e6d-534c033d5623/.system_generated/steps/776/media_0.png';
  
  console.log('1. Loading base mockup and upscaling 2x for Retina sharpness...');
  const scale = 2;
  const W = 1024 * scale; // 2048
  const H = 768 * scale;  // 1536

  const baseBuffer = await sharp(mockupPath)
    .resize(W, H, { kernel: 'lanczos3' })
    .toBuffer();

  console.log('2. Preparing screenshot for monitor display area with mathematical precision...');
  // Exact measured bounds of the inner monitor display (in 1x):
  // left: 179, top: 198, width: 682, height: 373
  // Scaled 2x:
  const screenX = 179 * scale; // 358
  const screenY = 198 * scale; // 396
  const screenW = 682 * scale; // 1364
  const screenH = 373 * scale; // 746

  // Resize the live home screenshot of Sadia's IELTS to the exact screen dimensions
  const screenResized = await sharp(screenshotSource)
    .resize(screenW, screenH, { fit: 'cover', position: 'top', kernel: 'lanczos3' })
    .toBuffer();

  // Corner mask matching the subtle monitor bezel curvature (rx=6, ry=6)
  const maskSvg = `
  <svg width="${screenW}" height="${screenH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${screenW}" height="${screenH}" rx="6" ry="6" fill="#ffffff"/>
  </svg>
  `;

  // Realistic display glass sheen and bezel inset shadow
  const glassSvg = `
  <svg width="${screenW}" height="${screenH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="30%" stop-color="#ffffff" stop-opacity="0.01"/>
        <stop offset="70%" stop-color="#000000" stop-opacity="0.0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
      </linearGradient>
    </defs>
    <!-- Glass reflection -->
    <rect width="${screenW}" height="${screenH}" rx="6" ry="6" fill="url(#glass)"/>
    <!-- Subtle 1px bezel seam -->
    <rect width="${screenW}" height="${screenH}" rx="6" ry="6" fill="none" stroke="#000000" stroke-width="2" opacity="0.5"/>
  </svg>
  `;

  const screenMasked = await sharp(screenResized)
    .composite([
      { input: Buffer.from(maskSvg), blend: 'dest-in' }
    ])
    .png()
    .toBuffer();

  const screenComposite = await sharp(screenMasked)
    .composite([
      { input: Buffer.from(glassSvg), blend: 'over' }
    ])
    .png()
    .toBuffer();

  // ORBYT Agency Studio Case Study Branding Overlays
  const brandingSvg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <!-- Top-left ORBYT Agency Case Study Tag -->
    <g transform="translate(60, 48)">
      <rect x="0" y="0" width="12" height="12" fill="#fd5a01"/>
      <text x="24" y="11" fill="#fd5a01" font-family="Consolas, monospace" font-size="15" font-weight="bold" letter-spacing="2">ORBYT // VERIFIED CLIENT CASE STUDY</text>
      <text x="0" y="44" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">Sadia's IELTS Academy</text>
      <text x="0" y="74" fill="#a8a096" font-family="Consolas, monospace" font-size="14" letter-spacing="1">https://sadiasielts.com/ · FULL ARCHITECTURE &amp; DEPLOYMENT</text>
    </g>

    <!-- Top-right Performance Telemetry -->
    <g transform="translate(${W - 60}, 48)">
      <text x="0" y="11" fill="#10b981" font-family="Consolas, monospace" font-size="14" font-weight="bold" text-anchor="end" letter-spacing="2">● LIVE IN PRODUCTION</text>
      <text x="0" y="44" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" text-anchor="end">High-Converting EdTech Platform</text>
      <text x="0" y="74" fill="#a8a096" font-family="Consolas, monospace" font-size="13" text-anchor="end" letter-spacing="1">LATENCY: 0.38s · SCORE: 98/100 · BUILT BY ORBYT</text>
    </g>

    <!-- Bottom Metadata Bar -->
    <g transform="translate(60, ${H - 42})">
      <text x="0" y="0" fill="#78716c" font-family="Consolas, monospace" font-size="13" letter-spacing="1.5">CLIENT: SADIA'S IELTS · SYSTEM: FULL WEB PLATFORM &amp; ENROLLMENT PIPELINE</text>
      <text x="${W - 120}" y="0" fill="#fd5a01" font-family="Consolas, monospace" font-size="13" font-weight="bold" text-anchor="end" letter-spacing="2">2026 // CASE STUDY 01</text>
    </g>
  </svg>
  `;
  const brandingBuffer = Buffer.from(brandingSvg);

  console.log('3. Compositing screen and branding onto mockup...');
  const finalImage = await sharp(baseBuffer)
    .composite([
      { input: screenComposite, left: screenX, top: screenY },
      { input: brandingBuffer, blend: 'over' }
    ])
    .png({ quality: 95, compressionLevel: 7 })
    .toBuffer();

  await sharp(finalImage).toFile('public/images/art/sadias-ielts-showcase.png');
  // Also save a WebP version for maximum speed and compatibility
  await sharp(finalImage).webp({ quality: 92 }).toFile('public/images/art/sadias-ielts-showcase.webp');

  console.log('✓ Successfully created public/images/art/sadias-ielts-showcase.png & .webp');
}

composite().catch(console.error);
