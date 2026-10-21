const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function composite() {
  const mockupPath = 'C:/Users/WALTON/.gemini/antigravity/brain/3eb4c3a7-0685-41c7-8e6d-534c033d5623/.user_uploaded/media_1792606576525_c25d0fd9.png';
  const screenshotSource = 'C:/Users/WALTON/.gemini/antigravity/brain/3eb4c3a7-0685-41c7-8e6d-534c033d5623/.system_generated/steps/574/media_0.png';
  
  console.log('1. Loading base mockup and upscaling 2x for Retina sharpness...');
  const scale = 2;
  const W = 1024 * scale; // 2048
  const H = 768 * scale;  // 1536

  const baseBuffer = await sharp(mockupPath)
    .resize(W, H, { kernel: 'lanczos3' })
    .toBuffer();

  console.log('2. Preparing screenshot for monitor display area...');
  const screenX = 153 * scale;
  const screenY = 175 * scale;
  const screenW = 718 * scale; // 1436
  const screenH = 430 * scale; // 860

  // Resize screenshot to exact screen dimensions
  const screenResized = await sharp(screenshotSource)
    .resize(screenW, screenH, { fit: 'cover', position: 'top', kernel: 'lanczos3' })
    .toBuffer();

  // Create subtle inner shadow, corner mask & glass reflection overlay
  const maskSvg = `
  <svg width="${screenW}" height="${screenH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${screenW}" height="${screenH}" rx="12" ry="12" fill="#ffffff"/>
  </svg>
  `;

  const glassSvg = `
  <svg width="${screenW}" height="${screenH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
        <stop offset="35%" stop-color="#ffffff" stop-opacity="0.02"/>
        <stop offset="65%" stop-color="#000000" stop-opacity="0.0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.16"/>
      </linearGradient>
    </defs>
    <!-- Inner border / bezel shadow -->
    <rect width="${screenW}" height="${screenH}" rx="12" ry="12" fill="url(#glass)"/>
    <rect width="${screenW}" height="${screenH}" rx="12" ry="12" fill="none" stroke="#000000" stroke-width="4" opacity="0.65"/>
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

  // Create ORBYT Agency Branding Overlays for the poster
  const brandingSvg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <!-- Top-left ORBYT Agency Case Study Tag -->
    <g transform="translate(60, 50)">
      <rect x="0" y="0" width="12" height="12" fill="#fd5a01"/>
      <text x="24" y="11" fill="#fd5a01" font-family="Consolas, monospace" font-size="16" font-weight="bold" letter-spacing="2">ORBYT // CLIENT CASE STUDY</text>
      <text x="0" y="44" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">Sadia's IELTS Academy</text>
      <text x="0" y="74" fill="#968e85" font-family="Consolas, monospace" font-size="14" letter-spacing="1">https://sadiasielts.com/ · VERIFIED CLIENT DEPLOYMENT</text>
    </g>

    <!-- Top-right Performance Telemetry -->
    <g transform="translate(${W - 60}, 50)">
      <text x="0" y="11" fill="#10b981" font-family="Consolas, monospace" font-size="15" font-weight="bold" text-anchor="end" letter-spacing="2">* PRODUCTION LAUNCH VERIFIED</text>
      <text x="0" y="44" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="end">High-Converting EdTech Platform</text>
      <text x="0" y="74" fill="#968e85" font-family="Consolas, monospace" font-size="14" text-anchor="end">CONVERSION ARCHITECTURE · SPEED: 0.38s</text>
    </g>

    <!-- Bottom Metadata Bar -->
    <g transform="translate(60, ${H - 50})">
      <text x="0" y="0" fill="#665e56" font-family="Consolas, monospace" font-size="14" letter-spacing="1.5">CLIENT: SADIA'S IELTS · SYSTEM: FULL WEB STACK &amp; ENROLLMENT PIPELINE · BUILT BY ORBYT</text>
      <text x="${W - 120}" y="0" fill="#fd5a01" font-family="Consolas, monospace" font-size="14" text-anchor="end" letter-spacing="2">2026 // CASE STUDY 01</text>
    </g>
  </svg>
  `;
  const brandingBuffer = Buffer.from(brandingSvg);

  console.log('3. Compositing screen and branding onto mockup...');
  await sharp(baseBuffer)
    .composite([
      { input: screenComposite, left: screenX, top: screenY },
      { input: brandingBuffer, blend: 'over' }
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('public/images/art/sadias-ielts-showcase.png');

  console.log('✓ Successfully created public/images/art/sadias-ielts-showcase.png');
}

composite().catch(console.error);
