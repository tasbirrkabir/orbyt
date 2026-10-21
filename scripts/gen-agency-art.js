const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ART_DIR = 'e:/ORBYT/public/images/art';
const ESSAY_DIR = 'e:/ORBYT/public/images/essays';

// Helper to wrap SVG in sharp and write to PNG
async function writeSvgPng(filePath, svgContent, width, height) {
  const buf = Buffer.from(svgContent);
  await sharp(buf)
    .resize(width, height)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(filePath);
  console.log('✓ Rendered', path.basename(filePath), width + 'x' + height);
}

// Common styles & helpers
const BG = '#0a0908';
const CARD_BG = '#141210';
const CARD_BORDER = '#2c2724';
const ORANGE = '#fd5a01';
const ORANGE_GLOW = 'rgba(253,90,1,0.25)';
const TEXT_MUTED = '#8f8882';
const TEXT_LIGHT = '#e6e1dc';

// ==========================================
// 1. layers.png: "One Connected System"
// ==========================================
function getLayersSvg() {
  return `
<svg width="1344" height="768" viewBox="0 0 1344 768" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradOrange" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fd5a01" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="#fd5a01" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#fd5a01" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181513"/>
      <stop offset="100%" stop-color="#0f0d0c"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1344" height="768" fill="${BG}"/>

  <!-- Ambient background glow -->
  <circle cx="672" cy="384" r="340" fill="#fd5a01" opacity="0.06" filter="url(#glow)"/>

  <!-- Grid lines -->
  <g stroke="#1a1715" stroke-width="1">
    <line x1="100" y1="0" x2="100" y2="768"/>
    <line x1="300" y1="0" x2="300" y2="768"/>
    <line x1="672" y1="0" x2="672" y2="768" stroke="#26211d" stroke-dasharray="4,4"/>
    <line x1="1044" y1="0" x2="1044" y2="768"/>
    <line x1="1244" y1="0" x2="1244" y2="768"/>
    <line x1="0" y1="120" x2="1344" y2="120"/>
    <line x1="0" y1="384" x2="1344" y2="384" stroke="#26211d" stroke-dasharray="4,4"/>
    <line x1="0" y1="648" x2="1344" y2="648"/>
  </g>

  <!-- Header eyebrow -->
  <text x="120" y="80" fill="${ORANGE}" font-family="monospace" font-size="13" letter-spacing="3" font-weight="bold">ORBYT ARCHITECTURE // ONE CONNECTED SYSTEM</text>
  <text x="1200" y="80" fill="${TEXT_MUTED}" font-family="monospace" font-size="12" text-anchor="end">SYS_VERSION: 3.2.0 // ACTIVE</text>

  <!-- Central Connecting Data Conduit (Vertical Spine) -->
  <line x1="672" y1="130" x2="672" y2="670" stroke="${ORANGE}" stroke-width="2.5" filter="url(#glow)"/>
  
  <!-- Flowing data pulse packets -->
  <circle cx="672" cy="220" r="4.5" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="672" cy="350" r="4.5" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="672" cy="480" r="4.5" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="672" cy="610" r="4.5" fill="#ffffff" filter="url(#glow)"/>

  <!-- Layer 1: The Web Layer -->
  <g transform="translate(180, 130)">
    <rect width="984" height="105" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect width="984" height="105" rx="8" fill="none" stroke="${ORANGE}" stroke-width="1.5" stroke-dasharray="8,24" opacity="0.4"/>
    <circle cx="30" cy="30" r="5" fill="${ORANGE}"/>
    <text x="48" y="34" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="15" font-weight="600">LAYER 01 : HIGH-CONVERTING WEB &amp; LANDING PAGES</text>
    <text x="48" y="58" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="13">Responsive Next.js UI · Conversion Architecture · 0.4s LCP · Design Tokens</text>
    <rect x="800" y="24" width="154" height="28" rx="4" fill="#1f1a17" stroke="${CARD_BORDER}"/>
    <text x="877" y="42" fill="${ORANGE}" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">CR: 4.82% (+38%)</text>
    <!-- Visual mini elements -->
    <rect x="48" y="74" width="80" height="12" rx="2" fill="#2a2522"/>
    <rect x="136" y="74" width="120" height="12" rx="2" fill="#2a2522"/>
    <rect x="264" y="74" width="60" height="12" rx="2" fill="#fd5a01" opacity="0.8"/>
  </g>

  <!-- Layer 2: Tracking & Attribution -->
  <g transform="translate(180, 265)">
    <rect width="984" height="105" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="30" cy="30" r="5" fill="${ORANGE}"/>
    <text x="48" y="34" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="15" font-weight="600">LAYER 02 : SERVER-SIDE ATTRIBUTION &amp; EVENT TELEMETRY</text>
    <text x="48" y="58" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="13">Meta CAPI · GA4 Server Events · First-Party Identity · 100% Attribution Capture</text>
    <rect x="800" y="24" width="154" height="28" rx="4" fill="#1f1a17" stroke="${CARD_BORDER}"/>
    <text x="877" y="42" fill="#4ade80" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">MATCH QUALITY: 9.8/10</text>
    <!-- Telemetry dots -->
    <circle cx="56" cy="82" r="3" fill="#4ade80"/>
    <text x="68" y="86" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">PageView: 14.2k</text>
    <circle cx="180" cy="82" r="3" fill="#4ade80"/>
    <text x="192" y="86" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">Lead_Submit: 684</text>
    <circle cx="320" cy="82" r="3" fill="${ORANGE}"/>
    <text x="332" y="86" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">CAPI Sync: 100%</text>
  </g>

  <!-- Layer 3: AI & Workflow Automation -->
  <g transform="translate(180, 400)">
    <rect width="984" height="105" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="30" cy="30" r="5" fill="${ORANGE}"/>
    <text x="48" y="34" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="15" font-weight="600">LAYER 03 : AI WORKFLOW AGENTS &amp; REVENUE OPERATIONS</text>
    <text x="48" y="58" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="13">Autonomous Qualification · Instant CRM Sync · Slack Alerts · Zero Manual Handoffs</text>
    <rect x="800" y="24" width="154" height="28" rx="4" fill="#1f1a17" stroke="${CARD_BORDER}"/>
    <text x="877" y="42" fill="${ORANGE}" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">AVG SPEED: 42 SEC</text>
    <!-- Node chain -->
    <rect x="48" y="74" width="90" height="18" rx="3" fill="#241e1b" stroke="${CARD_BORDER}"/>
    <text x="93" y="87" fill="${TEXT_LIGHT}" font-family="monospace" font-size="9" text-anchor="middle">LEAD CAPTURED</text>
    <line x1="138" y1="83" x2="160" y2="83" stroke="${ORANGE}" stroke-width="1.5"/>
    <rect x="160" y="74" width="90" height="18" rx="3" fill="#241e1b" stroke="${ORANGE}"/>
    <text x="205" y="87" fill="${ORANGE}" font-family="monospace" font-size="9" text-anchor="middle">AI QUALIFIER</text>
    <line x1="250" y1="83" x2="272" y2="83" stroke="${ORANGE}" stroke-width="1.5"/>
    <rect x="272" y="74" width="90" height="18" rx="3" fill="#241e1b" stroke="${CARD_BORDER}"/>
    <text x="317" y="87" fill="${TEXT_LIGHT}" font-family="monospace" font-size="9" text-anchor="middle">CRM &amp; SLACK</text>
  </g>

  <!-- Layer 4: Growth & Revenue Engine -->
  <g transform="translate(180, 535)">
    <rect width="984" height="105" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="30" cy="30" r="5" fill="${ORANGE}"/>
    <text x="48" y="34" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="15" font-weight="600">LAYER 04 : GROWTH MARKETING &amp; PIPELINE SCALE</text>
    <text x="48" y="58" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="13">Predictable CAC · Full Funnel ROAS · Automated Retargeting · Closed-Loop Revenue</text>
    <rect x="800" y="24" width="154" height="28" rx="4" fill="#1f1a17" stroke="${CARD_BORDER}"/>
    <text x="877" y="42" fill="#4ade80" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">CAC: -$34.2%</text>
    <!-- Growth bar -->
    <rect x="48" y="76" width="400" height="12" rx="3" fill="#1e1a17"/>
    <rect x="48" y="76" width="310" height="12" rx="3" fill="url(#gradOrange)"/>
  </g>

  <!-- Bottom Brand Signature -->
  <text x="672" y="700" fill="${TEXT_MUTED}" font-family="monospace" font-size="11" text-anchor="middle" letter-spacing="2">NO SILOS · NO DATA LEAKS · CONNECTED BY ORBYT</text>
</svg>
`;
}

// ==========================================
// 2. remote-constellation.png: "Remote by design"
// ==========================================
function getRemoteConstellationSvg() {
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181513"/>
      <stop offset="100%" stop-color="#0f0d0c"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="${BG}"/>

  <!-- Circular Radar / Studio Matrix Grid -->
  <circle cx="512" cy="512" r="420" fill="none" stroke="#1d1917" stroke-width="1.5"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="#25201d" stroke-width="1.5" stroke-dasharray="6,6"/>
  <circle cx="512" cy="512" r="180" fill="none" stroke="#2c2622" stroke-width="1.5"/>
  <line x1="512" y1="92" x2="512" y2="932" stroke="#1f1b18" stroke-dasharray="4,8"/>
  <line x1="92" y1="512" x2="932" y2="512" stroke="#1f1b18" stroke-dasharray="4,8"/>

  <!-- Top label -->
  <text x="80" y="80" fill="${ORANGE}" font-family="monospace" font-size="13" letter-spacing="3" font-weight="bold">DISTRIBUTED AGENCY MATRIX</text>
  <text x="944" y="80" fill="${TEXT_MUTED}" font-family="monospace" font-size="12" text-anchor="end">STATUS: ASYNC // ONLINE</text>

  <!-- Connecting collaboration lines -->
  <g stroke="${ORANGE}" stroke-width="1.5" opacity="0.6" filter="url(#glow)">
    <line x1="280" y1="320" x2="512" y2="512"/>
    <line x1="740" y1="300" x2="512" y2="512"/>
    <line x1="760" y1="720" x2="512" y2="512"/>
    <line x1="260" y1="700" x2="512" y2="512"/>
    <line x1="280" y1="320" x2="740" y2="300" stroke-dasharray="4,4"/>
  </g>

  <!-- Center Hub: ORBYT PRODUCTION ENGINE -->
  <g transform="translate(512, 512)">
    <circle cx="0" cy="0" r="54" fill="#1f1a16" stroke="${ORANGE}" stroke-width="2" filter="url(#glow)"/>
    <circle cx="0" cy="0" r="46" fill="#14110f"/>
    <circle cx="0" cy="0" r="6" fill="#ffffff"/>
    <text x="0" y="20" fill="${ORANGE}" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">CORE ENGINE</text>
  </g>

  <!-- Node 1: Engineering & Web Systems -->
  <g transform="translate(280, 320)">
    <rect x="-110" y="-45" width="220" height="90" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="-90" cy="-25" r="4" fill="${ORANGE}"/>
    <text x="-76" y="-22" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="12" font-weight="600">SYS // ENGINEERING</text>
    <text x="-90" y="0" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Next.js · Tailwind · CAPI</text>
    <rect x="-90" y="14" width="85" height="18" rx="3" fill="#1d1815"/>
    <text x="-47" y="26" fill="#4ade80" font-family="monospace" font-size="9" text-anchor="middle">SPRINT: ACTIVE</text>
  </g>

  <!-- Node 2: Growth & Performance -->
  <g transform="translate(740, 300)">
    <rect x="-110" y="-45" width="220" height="90" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="-90" cy="-25" r="4" fill="${ORANGE}"/>
    <text x="-76" y="-22" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="12" font-weight="600">GROWTH // ACQUISITION</text>
    <text x="-90" y="0" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Meta Ads · Funnels · CRO</text>
    <rect x="-90" y="14" width="85" height="18" rx="3" fill="#1d1815"/>
    <text x="-47" y="26" fill="${ORANGE}" font-family="monospace" font-size="9" text-anchor="middle">ROAS: 4.8X</text>
  </g>

  <!-- Node 3: AI & Workflow Automation -->
  <g transform="translate(760, 720)">
    <rect x="-110" y="-45" width="220" height="90" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="-90" cy="-25" r="4" fill="${ORANGE}"/>
    <text x="-76" y="-22" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="12" font-weight="600">AUTOMATION // AGENTS</text>
    <text x="-90" y="0" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">CRM Routing · Lead Qual</text>
    <rect x="-90" y="14" width="85" height="18" rx="3" fill="#1d1815"/>
    <text x="-47" y="26" fill="#4ade80" font-family="monospace" font-size="9" text-anchor="middle">LATENCY: 0.8S</text>
  </g>

  <!-- Node 4: Product & UX Architecture -->
  <g transform="translate(260, 700)">
    <rect x="-110" y="-45" width="220" height="90" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <circle cx="-90" cy="-25" r="4" fill="${ORANGE}"/>
    <text x="-76" y="-22" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="12" font-weight="600">DESIGN // CONVERSION</text>
    <text x="-90" y="0" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Figma Tokens · Bento UI</text>
    <rect x="-90" y="14" width="85" height="18" rx="3" fill="#1d1815"/>
    <text x="-47" y="26" fill="${TEXT_LIGHT}" font-family="monospace" font-size="9" text-anchor="middle">CR: +42%</text>
  </g>

  <!-- Bottom stats bar -->
  <rect x="212" y="890" width="600" height="48" rx="24" fill="#14110f" stroke="${CARD_BORDER}"/>
  <text x="312" y="920" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11" text-anchor="middle">1 CHANNEL</text>
  <text x="442" y="920" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11" text-anchor="middle">·</text>
  <text x="512" y="920" fill="${ORANGE}" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">STATUS IN THE OPEN</text>
  <text x="582" y="920" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11" text-anchor="middle">·</text>
  <text x="712" y="920" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11" text-anchor="middle">DAILY SHIP CADENCE</text>
</svg>
`;
}

// ==========================================
// 3. build-blocks.png: "Built, not bought"
// ==========================================
function getBuildBlocksSvg() {
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181513"/>
      <stop offset="100%" stop-color="#0e0c0b"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="${BG}"/>

  <!-- Header -->
  <text x="80" y="80" fill="${ORANGE}" font-family="monospace" font-size="13" letter-spacing="3" font-weight="bold">DESIGN SYSTEM TOKENS // BUILT NOT BOUGHT</text>
  <text x="944" y="80" fill="${TEXT_MUTED}" font-family="monospace" font-size="12" text-anchor="end">CUSTOM ARCHITECTURE</text>

  <!-- Bento Grid of Custom Agency Components -->

  <!-- Component 1: The Primary Conversion Button -->
  <g transform="translate(80, 140)">
    <rect width="410" height="230" rx="10" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="30" y="42" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">01 / CTA ENGINE</text>
    <text x="30" y="70" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="16" font-weight="600">High-Conversion Action Trigger</text>
    
    <!-- Rendered Button -->
    <g transform="translate(30, 110)">
      <rect width="350" height="56" rx="6" fill="#fd5a01" filter="url(#glow)"/>
      <text x="175" y="34" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="700" text-anchor="middle">Start the project →</text>
    </g>
    <text x="30" y="200" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">hover: -translate-y-0.5 · shadow-pixel-orange · CAPI tracking</text>
  </g>

  <!-- Component 2: Performance & Metrics Gauge -->
  <g transform="translate(534, 140)">
    <rect width="410" height="230" rx="10" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="30" y="42" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">02 / LIVE TELEMETRY CARD</text>
    <text x="30" y="70" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="16" font-weight="600">Verified Funnel Metric</text>
    
    <g transform="translate(30, 95)">
      <rect width="350" height="85" rx="6" fill="#14110f" stroke="${CARD_BORDER}"/>
      <text x="24" y="36" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">CONVERSION RATE</text>
      <text x="24" y="68" fill="${ORANGE}" font-family="sans-serif" font-size="28" font-weight="bold">4.82%</text>
      <text x="120" y="66" fill="#4ade80" font-family="monospace" font-size="13" font-weight="bold">+38.4%</text>
      
      <!-- Mini Sparkline -->
      <path d="M 230 65 Q 260 55, 280 45 T 320 28" fill="none" stroke="${ORANGE}" stroke-width="2.5" filter="url(#glow)"/>
    </g>
  </g>

  <!-- Component 3: Lead Routing & Qualification Drawer -->
  <g transform="translate(80, 410)">
    <rect width="410" height="280" rx="10" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="30" y="42" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">03 / INTAKE LOGIC</text>
    <text x="30" y="70" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="16" font-weight="600">Multi-Tier Lead Qualification</text>
    
    <g transform="translate(30, 100)">
      <rect width="350" height="42" rx="4" fill="#151210" stroke="${CARD_BORDER}"/>
      <text x="20" y="26" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11">PROJECT SCOPE: ENTERPRISE SYSTEM</text>
      <circle cx="325" cy="21" r="5" fill="#4ade80"/>

      <rect y="54" width="350" height="42" rx="4" fill="#151210" stroke="${CARD_BORDER}"/>
      <text x="20" y="80" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11">TIMELINE: Q4 ROLLOUT</text>
      <circle cx="325" cy="75" r="5" fill="#4ade80"/>

      <rect y="108" width="350" height="42" rx="4" fill="#1c1613" stroke="${ORANGE}"/>
      <text x="20" y="134" fill="${ORANGE}" font-family="monospace" font-size="11" font-weight="bold">AI QUALIFICATION: PASSED (SCORE 98)</text>
      <circle cx="325" cy="129" r="5" fill="${ORANGE}"/>
    </g>
  </g>

  <!-- Component 4: Architecture Code Block -->
  <g transform="translate(534, 410)">
    <rect width="410" height="280" rx="10" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="30" y="42" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">04 / CUSTOM CODE CONTRACT</text>
    <text x="30" y="70" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="16" font-weight="600">Zero Fragile No-Code Plugins</text>
    
    <g transform="translate(30, 95)">
      <rect width="350" height="155" rx="6" fill="#0d0b0a" stroke="${CARD_BORDER}"/>
      <text x="20" y="30" fill="${ORANGE}" font-family="monospace" font-size="11">export const system = {</text>
      <text x="36" y="52" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11">stack: ["Next.js", "CAPI", "Supabase"],</text>
      <text x="36" y="74" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11">workflow: "autonomous_qualification",</text>
      <text x="36" y="96" fill="${TEXT_LIGHT}" font-family="monospace" font-size="11">conversion_target: 0.045,</text>
      <text x="36" y="118" fill="#4ade80" font-family="monospace" font-size="11">verified: true,</text>
      <text x="20" y="140" fill="${ORANGE}" font-family="monospace" font-size="11">};</text>
    </g>
  </g>

  <!-- Component 5: Bottom Manifesto Ribbon -->
  <g transform="translate(80, 730)">
    <rect width="864" height="180" rx="10" fill="url(#cardGrad)" stroke="${ORANGE}" stroke-width="1.5" stroke-dasharray="6,6"/>
    <text x="50" y="55" fill="${ORANGE}" font-family="monospace" font-size="12" letter-spacing="2" font-weight="bold">SYSTEM PRINCIPLE: BUILT, NOT BOUGHT</text>
    <text x="50" y="95" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="20" font-weight="700">Off-the-shelf plugins leak data and bloat code.</text>
    <text x="50" y="125" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="14">ORBYT crafts custom, bespoke software systems wired directly to your bottom line.</text>
    <text x="50" y="150" fill="${ORANGE}" font-family="monospace" font-size="12">100% OWNED BY YOU · ZERO SUBSCRIPTION LOCK-IN</text>
  </g>
</svg>
`;
}

// ==========================================
// 4. growth-beam.png: "Acquisition System"
// ==========================================
function getGrowthBeamSvg() {
  return `
<svg width="1344" height="768" viewBox="0 0 1344 768" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fd5a01" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#fd5a01" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181513"/>
      <stop offset="100%" stop-color="#0f0d0c"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1344" height="768" fill="${BG}"/>

  <!-- Header -->
  <text x="80" y="70" fill="${ORANGE}" font-family="monospace" font-size="13" letter-spacing="3" font-weight="bold">ACQUISITION INFRASTRUCTURE // PERFORMANCE MARKETING</text>
  <text x="1264" y="70" fill="${TEXT_MUTED}" font-family="monospace" font-size="12" text-anchor="end">CONVERSION PIPELINE</text>

  <!-- Top Metrics Bar -->
  <g transform="translate(80, 110)">
    <!-- Metric 1 -->
    <rect width="270" height="95" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="24" y="35" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">CUSTOMER ACQUISITION COST</text>
    <text x="24" y="70" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="28" font-weight="bold">$48.20</text>
    <text x="145" y="68" fill="#4ade80" font-family="monospace" font-size="13" font-weight="bold">-34.2%</text>

    <!-- Metric 2 -->
    <rect x="298" width="270" height="95" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="322" y="35" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">BLENDED ROAS</text>
    <text x="322" y="70" fill="${ORANGE}" font-family="sans-serif" font-size="28" font-weight="bold">4.85x</text>
    <text x="415" y="68" fill="#4ade80" font-family="monospace" font-size="13" font-weight="bold">+1.4x</text>

    <!-- Metric 3 -->
    <rect x="596" width="270" height="95" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="620" y="35" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">QUALIFIED PIPELINE</text>
    <text x="620" y="70" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="28" font-weight="bold">$482,000</text>
    <text x="770" y="68" fill="#4ade80" font-family="monospace" font-size="13" font-weight="bold">+62%</text>

    <!-- Metric 4 -->
    <rect x="894" width="270" height="95" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="918" y="35" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">CONVERSION VELOCITY</text>
    <text x="918" y="70" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="28" font-weight="bold">14 Days</text>
    <text x="1040" y="68" fill="#4ade80" font-family="monospace" font-size="13" font-weight="bold">-40%</text>
  </g>

  <!-- Big Interactive Growth Chart -->
  <g transform="translate(80, 235)">
    <rect width="1184" height="460" rx="10" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <text x="35" y="45" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="18" font-weight="600">Acquisition Volume vs Cost Efficiency</text>
    <text x="35" y="70" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="12">Verified cross-channel conversion attribution over 90 days</text>

    <!-- Grid lines -->
    <line x1="60" y1="120" x2="1120" y2="120" stroke="#1f1b18" stroke-dasharray="4,4"/>
    <line x1="60" y1="200" x2="1120" y2="200" stroke="#1f1b18" stroke-dasharray="4,4"/>
    <line x1="60" y1="280" x2="1120" y2="280" stroke="#1f1b18" stroke-dasharray="4,4"/>
    <line x1="60" y1="360" x2="1120" y2="360" stroke="#2c2724"/>

    <!-- Y-Axis labels -->
    <text x="45" y="125" fill="${TEXT_MUTED}" font-family="monospace" font-size="10" text-anchor="end">$500k</text>
    <text x="45" y="205" fill="${TEXT_MUTED}" font-family="monospace" font-size="10" text-anchor="end">$300k</text>
    <text x="45" y="285" fill="${TEXT_MUTED}" font-family="monospace" font-size="10" text-anchor="end">$100k</text>
    <text x="45" y="365" fill="${TEXT_MUTED}" font-family="monospace" font-size="10" text-anchor="end">$0</text>

    <!-- X-Axis labels -->
    <text x="80" y="390" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">WEEK 01</text>
    <text x="340" y="390" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">WEEK 04</text>
    <text x="600" y="390" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">WEEK 08</text>
    <text x="860" y="390" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">WEEK 12 (NOW)</text>

    <!-- Filled Area Gradient -->
    <path d="M 80 360 L 80 330 Q 250 310, 400 270 T 700 190 T 1000 130 L 1000 360 Z" fill="url(#curveGrad)"/>

    <!-- Bright Orange Growth Curve -->
    <path d="M 80 330 Q 250 310, 400 270 T 700 190 T 1000 130" fill="none" stroke="${ORANGE}" stroke-width="4" filter="url(#glow)"/>

    <!-- Data points -->
    <circle cx="80" cy="330" r="5" fill="#fd5a01"/>
    <circle cx="400" cy="270" r="5" fill="#fd5a01"/>
    <circle cx="700" cy="190" r="5" fill="#fd5a01"/>
    <circle cx="1000" cy="130" r="7" fill="#ffffff" stroke="${ORANGE}" stroke-width="3" filter="url(#glow)"/>

    <!-- Callout Box at Peak -->
    <g transform="translate(900, 60)">
      <rect width="180" height="50" rx="4" fill="#1b1613" stroke="${ORANGE}"/>
      <text x="90" y="22" fill="${TEXT_MUTED}" font-family="monospace" font-size="9" text-anchor="middle">REVENUE GENERATED</text>
      <text x="90" y="40" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">$482,400.00</text>
    </g>
  </g>
</svg>
`;
}

// ==========================================
// 5. engine-core.png: "AI Ops & Automation"
// ==========================================
function getEngineCoreSvg() {
  return `
<svg width="1344" height="768" viewBox="0 0 1344 768" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181513"/>
      <stop offset="100%" stop-color="#0e0c0b"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1344" height="768" fill="${BG}"/>

  <!-- Header -->
  <text x="80" y="70" fill="${ORANGE}" font-family="monospace" font-size="13" letter-spacing="3" font-weight="bold">AI AUTOMATION CANVAS // REVENUE OPERATIONS</text>
  <text x="1264" y="70" fill="${TEXT_MUTED}" font-family="monospace" font-size="12" text-anchor="end">PIPELINE: LIVE // EXECUTED IN 140MS</text>

  <!-- Flowchart Connectors (Glowing Orange Conduits) -->
  <g stroke="${ORANGE}" stroke-width="2.5" fill="none" filter="url(#glow)">
    <path d="M 280 280 L 390 280"/>
    <path d="M 640 280 L 750 280"/>
    <path d="M 1000 280 L 1050 280 L 1050 480 L 1000 480"/>
    <path d="M 750 480 L 640 480"/>
    <path d="M 390 480 L 280 480"/>
  </g>

  <!-- Conduit Pulse Particles -->
  <circle cx="335" cy="280" r="4" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="695" cy="280" r="4" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="695" cy="480" r="4" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="335" cy="480" r="4" fill="#ffffff" filter="url(#glow)"/>

  <!-- Node 1: Inbound Lead Trigger -->
  <g transform="translate(80, 210)">
    <rect width="200" height="140" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect width="200" height="32" rx="8" fill="#1b1714"/>
    <text x="20" y="22" fill="${ORANGE}" font-family="monospace" font-size="11" font-weight="bold">01 / TRIGGER</text>
    <circle cx="180" cy="16" r="4" fill="#4ade80"/>
    <text x="20" y="65" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Form Submitted</text>
    <text x="20" y="88" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">POST /api/leads</text>
    <text x="20" y="112" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Payload: verified</text>
  </g>

  <!-- Node 2: AI Qualification Agent -->
  <g transform="translate(390, 210)">
    <rect width="250" height="140" rx="8" fill="url(#cardGrad)" stroke="${ORANGE}" stroke-width="2" filter="url(#glow)"/>
    <rect width="250" height="32" rx="8" fill="#241a14"/>
    <text x="20" y="22" fill="${ORANGE}" font-family="monospace" font-size="11" font-weight="bold">02 / AI AGENT ENGINE</text>
    <circle cx="230" cy="16" r="4" fill="#ffffff"/>
    <text x="20" y="65" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Enrich &amp; Score Lead</text>
    <text x="20" y="88" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Model: Gemini Pro Agent</text>
    <rect x="20" y="100" width="130" height="20" rx="3" fill="#1b1512"/>
    <text x="85" y="114" fill="#4ade80" font-family="monospace" font-size="9" text-anchor="middle">SCORE: 96/100 (HIGH)</text>
  </g>

  <!-- Node 3: CRM Instant Routing -->
  <g transform="translate(750, 210)">
    <rect width="250" height="140" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect width="250" height="32" rx="8" fill="#1b1714"/>
    <text x="20" y="22" fill="${ORANGE}" font-family="monospace" font-size="11" font-weight="bold">03 / CRM SYNC</text>
    <circle cx="230" cy="16" r="4" fill="#4ade80"/>
    <text x="20" y="65" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Pipeline Placement</text>
    <text x="20" y="88" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">HubSpot / Salesforce Sync</text>
    <text x="20" y="112" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Status: Enterprise Demo</text>
  </g>

  <!-- Node 4: Calendar & Meeting Booking -->
  <g transform="translate(750, 410)">
    <rect width="250" height="140" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect width="250" height="32" rx="8" fill="#1b1714"/>
    <text x="20" y="22" fill="${ORANGE}" font-family="monospace" font-size="11" font-weight="bold">04 / CALENDAR DISPATCH</text>
    <circle cx="230" cy="16" r="4" fill="#4ade80"/>
    <text x="20" y="65" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Instant Slot Hold</text>
    <text x="20" y="88" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Personalized Invitation</text>
    <text x="20" y="112" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Cal.com automated link</text>
  </g>

  <!-- Node 5: Slack Team Alert -->
  <g transform="translate(390, 410)">
    <rect width="250" height="140" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect width="250" height="32" rx="8" fill="#1b1714"/>
    <text x="20" y="22" fill="${ORANGE}" font-family="monospace" font-size="11" font-weight="bold">05 / TEAM CHANNEL</text>
    <circle cx="230" cy="16" r="4" fill="#4ade80"/>
    <text x="20" y="65" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Slack #revenue Alert</text>
    <text x="20" y="88" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Account Brief + Pain Points</text>
    <text x="20" y="112" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Sent to Founder / AE</text>
  </g>

  <!-- Node 6: Conversion Confirmed -->
  <g transform="translate(80, 410)">
    <rect width="200" height="140" rx="8" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect width="200" height="32" rx="8" fill="#1b1714"/>
    <text x="20" y="22" fill="#4ade80" font-family="monospace" font-size="11" font-weight="bold">06 / VERIFIED</text>
    <circle cx="180" cy="16" r="4" fill="#4ade80"/>
    <text x="20" y="65" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Zero Gaps</text>
    <text x="20" y="88" fill="${TEXT_MUTED}" font-family="monospace" font-size="10">Elapsed: 42s total</text>
    <text x="20" y="112" fill="${ORANGE}" font-family="monospace" font-size="10">Lead retained</text>
  </g>

  <!-- Bottom Command Bar -->
  <rect x="80" y="600" width="1184" height="60" rx="8" fill="#14110f" stroke="${CARD_BORDER}"/>
  <text x="110" y="635" fill="${ORANGE}" font-family="monospace" font-size="12" font-weight="bold">ORBYT WORKFLOW ENGINE</text>
  <text x="340" y="635" fill="${TEXT_LIGHT}" font-family="monospace" font-size="12">NO LEAD SLIPS THROUGH THE CRACKS</text>
  <text x="1150" y="635" fill="#4ade80" font-family="monospace" font-size="12" text-anchor="end">SYS STATUS: RUNNING (99.99%)</text>
</svg>
`;
}

// ==========================================
// 6. web-portal.png: "Connected Web"
// ==========================================
function getWebPortalSvg() {
  return `
<svg width="1344" height="768" viewBox="0 0 1344 768" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181513"/>
      <stop offset="100%" stop-color="#0e0c0b"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1344" height="768" fill="${BG}"/>

  <!-- Header -->
  <text x="80" y="70" fill="${ORANGE}" font-family="monospace" font-size="13" letter-spacing="3" font-weight="bold">HIGH-CONVERTING WEB EXPERIENCES // SYSTEM PORTAL</text>
  <text x="1264" y="70" fill="${TEXT_MUTED}" font-family="monospace" font-size="12" text-anchor="end">PERFORMANCE SCORE: 99/100</text>

  <!-- Main Desktop Browser Viewport Mockup -->
  <g transform="translate(80, 110)">
    <rect width="840" height="580" rx="10" fill="#110f0e" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    
    <!-- Browser Top Bar -->
    <rect width="840" height="42" rx="10" fill="#181513"/>
    <circle cx="24" cy="21" r="5" fill="#ef4444"/>
    <circle cx="40" cy="21" r="5" fill="#eab308"/>
    <circle cx="56" cy="21" r="5" fill="#22c55e"/>
    
    <rect x="240" y="8" width="360" height="26" rx="4" fill="#0d0b0a"/>
    <text x="420" y="25" fill="${TEXT_MUTED}" font-family="monospace" font-size="11" text-anchor="middle">orbytonward.tech</text>

    <!-- Page Content Inside Browser -->
    <text x="50" y="100" fill="${ORANGE}" font-family="monospace" font-size="11" letter-spacing="2">AI · WEB · AUTOMATION · GROWTH</text>
    <text x="50" y="145" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="32" font-weight="800">Build the system behind your growth.</text>
    <text x="50" y="180" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="14">Your website, ads, data, and tools wired into one cohesive pipeline.</text>

    <rect x="50" y="210" width="170" height="42" rx="6" fill="#fd5a01" filter="url(#glow)"/>
    <text x="135" y="236" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Start a project →</text>

    <!-- Mini Bento Grid on Page -->
    <g transform="translate(50, 280)">
      <rect width="230" height="130" rx="6" fill="#1a1614" stroke="${CARD_BORDER}"/>
      <text x="20" y="32" fill="${ORANGE}" font-family="monospace" font-size="10">01 / WEB DESIGN</text>
      <text x="20" y="60" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Conversion UI</text>
      <text x="20" y="85" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="11">Fast, clear next steps</text>
      <text x="20" y="110" fill="#4ade80" font-family="monospace" font-size="10">0.4s LCP speed</text>

      <rect x="250" width="230" height="130" rx="6" fill="#1a1614" stroke="${CARD_BORDER}"/>
      <text x="270" y="32" fill="${ORANGE}" font-family="monospace" font-size="10">02 / TRACKING</text>
      <text x="270" y="60" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Server Telemetry</text>
      <text x="270" y="85" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="11">Clean CAPI events</text>
      <text x="270" y="110" fill="#4ade80" font-family="monospace" font-size="10">100% Attribution</text>

      <rect x="500" width="230" height="130" rx="6" fill="#1a1614" stroke="${CARD_BORDER}"/>
      <text x="520" y="32" fill="${ORANGE}" font-family="monospace" font-size="10">03 / AUTOMATION</text>
      <text x="520" y="60" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">AI Ops Flows</text>
      <text x="520" y="85" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="11">Leads routed live</text>
      <text x="520" y="110" fill="#4ade80" font-family="monospace" font-size="10">&lt;1hr response</text>
    </g>

    <g transform="translate(50, 430)">
      <rect width="730" height="100" rx="6" fill="#161311" stroke="${CARD_BORDER}"/>
      <text x="30" y="35" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="14" font-weight="bold">Live Conversion Dashboard</text>
      <text x="30" y="55" fill="${TEXT_MUTED}" font-family="monospace" font-size="11">Real-time visitor tracking and lead pipeline</text>
      <!-- Mini Chart -->
      <path d="M 300 70 Q 420 50, 540 30 T 700 20" fill="none" stroke="${ORANGE}" stroke-width="2.5" filter="url(#glow)"/>
    </g>
  </g>

  <!-- Overlapping Mobile Viewport Mockup -->
  <g transform="translate(960, 160)">
    <rect width="280" height="530" rx="28" fill="#12100f" stroke="${ORANGE}" stroke-width="2" filter="url(#glow)"/>
    
    <!-- Notch -->
    <rect x="90" y="12" width="100" height="18" rx="9" fill="#000000"/>

    <!-- Mobile Screen Content -->
    <text x="24" y="65" fill="${ORANGE}" font-family="monospace" font-size="9" letter-spacing="2">ORBYT</text>
    <text x="24" y="95" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="17" font-weight="bold">Built for Growth.</text>
    <text x="24" y="120" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="11">One unified system for your digital business.</text>

    <rect x="24" y="145" width="232" height="36" rx="6" fill="#fd5a01"/>
    <text x="140" y="168" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Start a project</text>

    <!-- Mobile Bento Cards -->
    <rect x="24" y="200" width="232" height="85" rx="6" fill="#1b1714" stroke="${CARD_BORDER}"/>
    <text x="38" y="225" fill="${ORANGE}" font-family="monospace" font-size="9">PIPELINE</text>
    <text x="38" y="248" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="13" font-weight="bold">$184k Monthly Run Rate</text>
    <text x="38" y="268" fill="#4ade80" font-family="monospace" font-size="10">+42% this quarter</text>

    <rect x="24" y="300" width="232" height="85" rx="6" fill="#1b1714" stroke="${CARD_BORDER}"/>
    <text x="38" y="325" fill="${ORANGE}" font-family="monospace" font-size="9">SPEED AUDIT</text>
    <text x="38" y="348" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="13" font-weight="bold">Core Web Vitals</text>
    <text x="38" y="368" fill="#4ade80" font-family="monospace" font-size="10">100 / 100 Mobile Score</text>

    <rect x="24" y="400" width="232" height="95" rx="6" fill="#1b1714" stroke="${CARD_BORDER}"/>
    <text x="38" y="425" fill="${ORANGE}" font-family="monospace" font-size="9">CONVERSION</text>
    <text x="38" y="448" fill="${TEXT_LIGHT}" font-family="sans-serif" font-size="13" font-weight="bold">Zero Leaks</text>
    <text x="38" y="468" fill="${TEXT_MUTED}" font-family="sans-serif" font-size="10">Connected to CRM</text>
  </g>
</svg>
`;
}

// Generate all images
async function main() {
  console.log('--- Generating Agency-Specific Brand Visuals ---');

  // 1. layers.png
  await writeSvgPng(path.join(ART_DIR, 'layers.png'), getLayersSvg(), 1344, 768);

  // 2. remote-constellation.png
  await writeSvgPng(path.join(ART_DIR, 'remote-constellation.png'), getRemoteConstellationSvg(), 1024, 1024);

  // 3. build-blocks.png
  await writeSvgPng(path.join(ART_DIR, 'build-blocks.png'), getBuildBlocksSvg(), 1024, 1024);

  // 4. growth-beam.png
  await writeSvgPng(path.join(ART_DIR, 'growth-beam.png'), getGrowthBeamSvg(), 1344, 768);

  // 5. engine-core.png
  await writeSvgPng(path.join(ART_DIR, 'engine-core.png'), getEngineCoreSvg(), 1344, 768);

  // 6. web-portal.png
  await writeSvgPng(path.join(ART_DIR, 'web-portal.png'), getWebPortalSvg(), 1344, 768);

  // 7. discover-contour.png
  await writeSvgPng(path.join(ART_DIR, 'discover-contour.png'), getLayersSvg(), 1344, 768);

  // 8. ai-synapse.png
  await writeSvgPng(path.join(ART_DIR, 'ai-synapse.png'), getRemoteConstellationSvg(), 1024, 1024);

  // 9. design-grid.png
  await writeSvgPng(path.join(ART_DIR, 'design-grid.png'), getWebPortalSvg(), 1344, 768);

  // 10. data-pulse2.png
  await writeSvgPng(path.join(ART_DIR, 'data-pulse2.png'), getBuildBlocksSvg(), 1024, 1024);

  // 11. ops-assembly.png
  await writeSvgPng(path.join(ART_DIR, 'ops-assembly.png'), getBuildBlocksSvg(), 1024, 1024);

  // Essays (1344x768)
  await writeSvgPng(path.join(ESSAY_DIR, 'ai-strategies-are-workflow-problems.png'), getEngineCoreSvg(), 1344, 768);
  await writeSvgPng(path.join(ESSAY_DIR, 'disconnected-tools-silent-tax.png'), getLayersSvg(), 1344, 768);
  await writeSvgPng(path.join(ESSAY_DIR, 'landing-page-is-a-system.png'), getWebPortalSvg(), 1344, 768);
  await writeSvgPng(path.join(ESSAY_DIR, 'tracking-is-lying-to-you.png'), getGrowthBeamSvg(), 1344, 768);

  console.log('All agency brand images generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
