const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ART_DIR = 'e:/ORBYT/public/images/art';
const ESSAY_DIR = 'e:/ORBYT/public/images/essays';

async function renderSvgToPng(filePath, svg, w = 1200, h = 750) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(w, h)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(filePath);
  console.log('[OK] Rendered high-end poster:', path.basename(filePath));
}

// Design Tokens for Agency Posters
const BG = '#0e0d0c';
const CARD_BG = '#161413';
const CARD_BORDER = '#2c2723';
const ACCENT_ORANGE = '#fd5a01';
const TEXT_WHITE = '#f5f2ed';
const TEXT_MUTED = '#968e85';
const TEXT_DIM = '#5c554e';
const GREEN = '#10b981';
const BLUE = '#38bdf8';

// Reusable SVG defs
const SVG_DEFS = `
  <defs>
    <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fd5a01" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#fd5a01" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1b1816"/>
      <stop offset="100%" stop-color="#12100f"/>
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fd5a01"/>
      <stop offset="100%" stop-color="#ff7b29"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
`;

function getHeader(title, category, spec = 'PRODUCTION READY') {
  return `
    <!-- Poster Header -->
    <rect x="0" y="0" width="1200" height="70" fill="#131110" stroke="#26211d" stroke-width="1"/>
    <text x="50" y="42" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="13" font-weight="bold" letter-spacing="3">ORBYT ARCHIVE // ${category}</text>
    <text x="600" y="42" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" text-anchor="middle" letter-spacing="1.5">${title}</text>
    <text x="1150" y="42" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11" text-anchor="end" letter-spacing="2">${spec}</text>
    
    <!-- Registration Marks -->
    <path d="M 30,30 L 40,30 M 35,25 L 35,35" stroke="#443c35" stroke-width="1.5"/>
    <path d="M 1160,30 L 1170,30 M 1165,25 L 1165,35" stroke="#443c35" stroke-width="1.5"/>
  `;
}

function getFooter(note = 'DIGITAL SYSTEMS FOR COMPOUND GROWTH · VERIFIED DEPLOYMENT') {
  return `
    <!-- Poster Footer -->
    <rect x="0" y="690" width="1200" height="60" fill="#110f0e" stroke="#221e1a" stroke-width="1"/>
    <text x="50" y="726" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11" letter-spacing="2">SYS_ID: 882-ORB</text>
    <text x="600" y="726" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11" text-anchor="middle" letter-spacing="1.5">${note}</text>
    <text x="1150" y="726" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11" text-anchor="end" letter-spacing="2">* ENGINE LIVE</text>
  `;
}

// ==============================================================
// 1. growth-beam.png: Acquisition Engine
// ==============================================================
function getGrowthBeamSvg() {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('ACQUISITION FUNNEL &amp; ATTRIBUTION', 'SYSTEM 01')}

  <!-- Pipeline Container -->
  <g transform="translate(60, 105)">
    <!-- Funnel Step 1: Paid Traffic Ingest -->
    <rect x="0" y="0" width="310" height="240" rx="6" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="310" height="40" rx="6" fill="#1b1816"/>
    <text x="24" y="26" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700">01 / TRAFFIC INGEST</text>
    <text x="286" y="26" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11" text-anchor="end">CAPI ACTIVE</text>
    
    <text x="24" y="70" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">CHANNELS: Meta Ads · Google PMax</text>
    <text x="24" y="92" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="18" font-weight="bold">128,450 CLICKS</text>
    
    <!-- Mini Bar Chart -->
    <rect x="24" y="125" width="262" height="60" rx="4" fill="#0f0e0d" stroke="#221e1a"/>
    <rect x="36" y="155" width="18" height="24" rx="2" fill="#3d332a"/>
    <rect x="62" y="145" width="18" height="34" rx="2" fill="#3d332a"/>
    <rect x="88" y="140" width="18" height="39" rx="2" fill="#3d332a"/>
    <rect x="114" y="135" width="18" height="44" rx="2" fill="#3d332a"/>
    <rect x="140" y="148" width="18" height="31" rx="2" fill="#3d332a"/>
    <rect x="166" y="132" width="18" height="47" rx="2" fill="${ACCENT_ORANGE}"/>
    <rect x="192" y="130" width="18" height="49" rx="2" fill="${ACCENT_ORANGE}"/>
    <rect x="218" y="138" width="18" height="41" rx="2" fill="${ACCENT_ORANGE}"/>
    <rect x="244" y="128" width="18" height="51" rx="2" fill="url(#orangeGrad)"/>
    <text x="24" y="212" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">+ ROAS: 4.82x (+42% YoY)</text>
    
    <!-- Conduit Connector Arrow 1 -->
    <path d="M 310,120 L 385,120" stroke="${ACCENT_ORANGE}" stroke-width="2" stroke-dasharray="6,4"/>
    <circle cx="385" cy="120" r="4" fill="${ACCENT_ORANGE}" filter="url(#softGlow)"/>

    <!-- Funnel Step 2: Conversion Landing Page -->
    <g transform="translate(385, 0)">
      <rect x="0" y="0" width="310" height="240" rx="6" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <rect x="0" y="0" width="310" height="40" rx="6" fill="#1b1816"/>
      <text x="24" y="26" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700">02 / LANDING PAGE UX</text>
      <text x="286" y="26" fill="${BLUE}" font-family="Consolas, monospace" font-size="11" text-anchor="end">0.38s LCP</text>
      
      <text x="24" y="70" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">SPEED ARCHITECTURE // NEXT.JS</text>
      <text x="24" y="92" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="18" font-weight="bold">6,180 QUALIFIED</text>
      
      <!-- Mockup Web Preview inside card -->
      <rect x="24" y="115" width="262" height="75" rx="4" fill="#0c0b0a" stroke="#241f1b"/>
      <rect x="36" y="128" width="120" height="10" rx="2" fill="${TEXT_WHITE}" opacity="0.9"/>
      <rect x="36" y="144" width="160" height="6" rx="2" fill="${TEXT_MUTED}" opacity="0.6"/>
      <rect x="36" y="154" width="90" height="6" rx="2" fill="${TEXT_MUTED}" opacity="0.6"/>
      <rect x="36" y="168" width="60" height="12" rx="3" fill="${ACCENT_ORANGE}"/>
      <rect x="210" y="128" width="64" height="52" rx="4" fill="#1e1a17" stroke="#332a24"/>
      
      <text x="24" y="215" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">CVR: 4.81% (BENCHMARK: 2.1%)</text>
    </g>

    <!-- Conduit Connector Arrow 2 -->
    <path d="M 695,120 L 770,120" stroke="${ACCENT_ORANGE}" stroke-width="2" stroke-dasharray="6,4"/>
    <circle cx="770" cy="120" r="4" fill="${ACCENT_ORANGE}" filter="url(#softGlow)"/>

    <!-- Funnel Step 3: Server Attribution &amp; Pipeline -->
    <g transform="translate(770, 0)">
      <rect x="0" y="0" width="310" height="240" rx="6" fill="url(#cardGrad)" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <rect x="0" y="0" width="310" height="40" rx="6" fill="#1b1816"/>
      <text x="24" y="26" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700">03 / CRM &amp; PIPELINE</text>
      <text x="286" y="26" fill="${GREEN}" font-family="Consolas, monospace" font-size="11" text-anchor="end">CLOSED LOOP</text>
      
      <text x="24" y="70" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">TELEMETRY: GA4 · Meta CAPI · CRM</text>
      <text x="24" y="92" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="18" font-weight="bold">$482,900 PIPELINE</text>
      
      <!-- Telemetry feed log -->
      <rect x="24" y="115" width="262" height="75" rx="4" fill="#0a0a09" stroke="#221e1a"/>
      <text x="32" y="134" fill="${GREEN}" font-family="Consolas, monospace" font-size="10">* 200 OK: Event Purchase id_981</text>
      <text x="32" y="152" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="10">  Match Rate: 94.2% | Deduplicated</text>
      <text x="32" y="170" fill="${BLUE}" font-family="Consolas, monospace" font-size="10">  CRM Routing -> Senior Operator</text>
      
      <text x="24" y="215" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">CAC RECOVERY: 14 DAYS</text>
    </g>

    <!-- Bottom Showcase Banner: The Connected Architecture Spec -->
    <g transform="translate(0, 275)">
      <rect x="0" y="0" width="1080" height="270" rx="8" fill="#141210" stroke="${CARD_BORDER}" stroke-width="1.5"/>
      <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1d1917"/>
      <text x="30" y="27" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12" font-weight="bold">SYSTEM ARCHITECTURE SPECIFICATION // FULL FUNNEL WIRING</text>
      
      <g transform="translate(40, 65)">
        <text x="0" y="0" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold">Zero signal loss between ad click and closed contract.</text>
        <text x="0" y="30" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="13" max-width="900">Most ad budgets burn out because attribution is fragmented. ORBYT builds the entire acquisition stack as a unified circuit.</text>
        
        <g transform="translate(0, 65)">
          <rect x="0" y="0" width="230" height="85" rx="6" fill="#1a1715" stroke="#2a2420"/>
          <text x="20" y="26" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">SERVER DEDUPLICATION</text>
          <text x="20" y="55" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="22" font-weight="bold">100.0%</text>
          <text x="20" y="74" fill="${GREEN}" font-family="Arial, Helvetica, sans-serif" font-size="10">No double counting</text>
        </g>
        
        <g transform="translate(255, 65)">
          <rect x="0" y="0" width="230" height="85" rx="6" fill="#1a1715" stroke="#2a2420"/>
          <text x="20" y="26" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">SPEED-TO-LEAD ROUTE</text>
          <text x="20" y="55" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="22" font-weight="bold">&lt; 45 SEC</text>
          <text x="20" y="74" fill="${GREEN}" font-family="Arial, Helvetica, sans-serif" font-size="10">Instant human triage</text>
        </g>

        <g transform="translate(510, 65)">
          <rect x="0" y="0" width="230" height="85" rx="6" fill="#1a1715" stroke="#2a2420"/>
          <text x="20" y="26" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">CONVERSION ACCELERATION</text>
          <text x="20" y="55" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="22" font-weight="bold">+38.4%</text>
          <text x="20" y="74" fill="${ACCENT_ORANGE}" font-family="Arial, Helvetica, sans-serif" font-size="10">Measured across cohort</text>
        </g>

        <g transform="translate(765, 65)">
          <rect x="0" y="0" width="235" height="85" rx="6" fill="#1a1715" stroke="#2a2420"/>
          <text x="20" y="26" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">UPTIME SLA</text>
          <text x="20" y="55" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="22" font-weight="bold">99.98%</text>
          <text x="20" y="74" fill="${BLUE}" font-family="Arial, Helvetica, sans-serif" font-size="10">Enterprise edge network</text>
        </g>
      </g>
    </g>
  </g>

  ${getFooter('SYSTEM 01 : ACQUISITION INFRASTRUCTURE · WIRED END-TO-END')}
</svg>
`;
}

// ==============================================================
// 2. engine-core.png: AI Operations Layer
// ==============================================================
function getEngineCoreSvg() {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('AI PIPELINE &amp; WORKFLOW AUTOMATION', 'SYSTEM 02')}

  <g transform="translate(60, 105)">
    <!-- Main Node Graph Area -->
    <rect x="0" y="0" width="1080" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    
    <!-- Top Toolbar -->
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1a1816"/>
    <circle cx="25" cy="21" r="5" fill="#e05244"/>
    <circle cx="42" cy="21" r="5" fill="#e5a93c"/>
    <circle cx="59" cy="21" r="5" fill="#44b85c"/>
    <text x="90" y="26" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">ORBYT AI ENGINE // PIPELINE_GRAPH.WORKFLOW</text>
    <text x="1050" y="26" fill="${GREEN}" font-family="Consolas, monospace" font-size="11" text-anchor="end">* 14 LIVE WORKFLOWS</text>

    <!-- Node 1: Inbound Webhook -->
    <g transform="translate(50, 80)">
      <rect width="260" height="140" rx="6" fill="#1c1917" stroke="#332d27" stroke-width="1.5"/>
      <rect width="260" height="34" rx="6" fill="#24201d"/>
      <text x="16" y="22" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700">TRIGGER: INBOUND EVENT</text>
      <text x="244" y="22" fill="${BLUE}" font-family="Consolas, monospace" font-size="10" text-anchor="end">WEBHOOK</text>
      
      <text x="16" y="62" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">source: /api/v1/lead</text>
      <text x="16" y="82" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">payload: { email, budget, intent }</text>
      <rect x="16" y="100" width="90" height="20" rx="3" fill="#12100e"/>
      <text x="24" y="114" fill="${GREEN}" font-family="Consolas, monospace" font-size="10">200 OK · 18ms</text>
    </g>

    <!-- Connection Line 1 -> 2 -->
    <path d="M 310,150 C 360,150 360,150 410,150" stroke="${ACCENT_ORANGE}" stroke-width="2.5" fill="none"/>
    <circle cx="360" cy="150" r="4" fill="#fff" filter="url(#softGlow)"/>

    <!-- Node 2: AI Qualification &amp; Extraction -->
    <g transform="translate(410, 80)">
      <rect width="280" height="140" rx="6" fill="#1c1917" stroke="${ACCENT_ORANGE}" stroke-width="1.5"/>
      <rect width="280" height="34" rx="6" fill="#292019"/>
      <text x="16" y="22" fill="${ACCENT_ORANGE}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700">AI AGENT: TRIAGE &amp; ENRICH</text>
      <text x="264" y="22" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="10" text-anchor="end">MODEL 3.1</text>
      
      <text x="16" y="62" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">intent_score: 0.94 (HIGH)</text>
      <text x="16" y="82" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">enrichment: Apollo + Clearbit</text>
      <rect x="16" y="100" width="130" height="20" rx="3" fill="#3a2012"/>
      <text x="24" y="114" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="10">DRAFT GENERATED</text>
    </g>

    <!-- Connection Line 2 -> 3 -->
    <path d="M 690,150 C 740,150 740,150 790,150" stroke="${ACCENT_ORANGE}" stroke-width="2.5" fill="none"/>
    <circle cx="740" cy="150" r="4" fill="#fff" filter="url(#softGlow)"/>

    <!-- Node 3: Human Review &amp; Escalation -->
    <g transform="translate(790, 80)">
      <rect width="240" height="140" rx="6" fill="#1c1917" stroke="#332d27" stroke-width="1.5"/>
      <rect width="240" height="34" rx="6" fill="#24201d"/>
      <text x="16" y="22" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700">HUMAN ESCALATION</text>
      <text x="224" y="22" fill="${GREEN}" font-family="Consolas, monospace" font-size="10" text-anchor="end">SLACK #OPS</text>
      
      <text x="16" y="62" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">Assigned: Senior Lead</text>
      <text x="16" y="82" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">1-Click Approve or Edit</text>
      <rect x="16" y="100" width="100" height="20" rx="3" fill="#14241a"/>
      <text x="24" y="114" fill="${GREEN}" font-family="Consolas, monospace" font-size="10">APPROVED</text>
    </g>

    <!-- Downward Connectors to Destination Tools -->
    <path d="M 910,220 C 910,260 200,240 200,280" stroke="#3d332a" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>
    <path d="M 910,220 C 910,260 550,240 550,280" stroke="#3d332a" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>
    <path d="M 910,220 C 910,260 900,240 900,280" stroke="#3d332a" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>

    <!-- Integrated Tool Nodes -->
    <g transform="translate(50, 280)">
      <rect width="300" height="110" rx="6" fill="#171513" stroke="#2c2723"/>
      <text x="20" y="28" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">HUBSPOT / POSTGRES CRM</text>
      <text x="20" y="52" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">Synced contact &amp; deal record</text>
      <text x="20" y="80" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">[OK] Record #9941 Updated</text>
    </g>

    <g transform="translate(390, 280)">
      <rect width="320" height="110" rx="6" fill="#171513" stroke="#2c2723"/>
      <text x="20" y="28" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">AUTOMATED DISPATCH (RESEND)</text>
      <text x="20" y="52" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">Tailored brief sent from partner inbox</text>
      <text x="20" y="80" fill="${BLUE}" font-family="Consolas, monospace" font-size="11">[OK] Delivered in 42 seconds</text>
    </g>

    <g transform="translate(750, 280)">
      <rect width="280" height="110" rx="6" fill="#171513" stroke="#2c2723"/>
      <text x="20" y="28" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">CALENDAR / DISCOVERY CALL</text>
      <text x="20" y="52" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">Cal.com VIP direct booking link</text>
      <text x="20" y="80" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11">[OK] 68% Call Booking Rate</text>
    </g>

    <!-- Bottom Code Terminal Block -->
    <g transform="translate(50, 420)">
      <rect width="980" height="100" rx="6" fill="#0d0c0b" stroke="#221e1a"/>
      <text x="20" y="26" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">// orbyt-ai-pipeline.ts -- Production Workflow Engine</text>
      <text x="20" y="50" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12"><tspan fill="${ACCENT_ORANGE}">export async function</tspan> handleLeadInbound(lead: <tspan fill="${BLUE}">LeadPayload</tspan>): Promise&lt;<tspan fill="${GREEN}">TriageResult</tspan>&gt; {</text>
      <text x="20" y="74" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="12">  const qualified = <tspan fill="${ACCENT_ORANGE}">await</tspan> orbytEngine.evaluateIntent(lead); <tspan fill="${GREEN}">// &lt;40ms execution</tspan></text>
    </g>
  </g>

  ${getFooter('SYSTEM 02 : AI WORKFLOW ORCHESTRATION · ZERO MANUAL BUSYWORK')}
</svg>
`;
}

// ==============================================================
// 3. web-portal.png: The Connected Website
// ==============================================================
function getWebPortalSvg() {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('DIGITAL EXPERIENCE &amp; WEB INFRASTRUCTURE', 'SYSTEM 03')}

  <g transform="translate(60, 105)">
    <!-- Desktop Browser Mockup Window -->
    <rect x="0" y="0" width="750" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="750" height="42" rx="8" fill="#1a1816"/>
    <!-- Browser Dots -->
    <circle cx="22" cy="21" r="5" fill="#e05244"/>
    <circle cx="38" cy="21" r="5" fill="#e5a93c"/>
    <circle cx="54" cy="21" r="5" fill="#44b85c"/>
    <!-- Address Bar -->
    <rect x="80" y="8" width="460" height="26" rx="4" fill="#0f0e0d" stroke="#26211d"/>
    <text x="100" y="25" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">https://orbyt.systems/experience</text>
    <text x="730" y="26" fill="${GREEN}" font-family="Consolas, monospace" font-size="11" text-anchor="end">100/100 SPEED</text>

    <!-- Web Page Canvas inside Mockup -->
    <g transform="translate(30, 65)">
      <text x="0" y="24" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11" letter-spacing="2">SYSTEMS ARCHITECTURE</text>
      <text x="0" y="60" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">Build the system behind your growth.</text>
      <text x="0" y="90" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="13">High-speed Next.js digital experience engineered for conversion.</text>

      <!-- Live Feature Grid -->
      <g transform="translate(0, 120)">
        <rect x="0" y="0" width="215" height="160" rx="6" fill="#1b1816" stroke="#2c2723"/>
        <text x="16" y="30" fill="${ACCENT_ORANGE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">CONVERSION UX</text>
        <text x="16" y="55" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="11">Clean single-column mobile flow</text>
        <rect x="16" y="80" width="183" height="35" rx="4" fill="#100e0d"/>
        <text x="26" y="102" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12">+48% CHECKOUT</text>
      </g>

      <g transform="translate(235, 120)">
        <rect x="0" y="0" width="215" height="160" rx="6" fill="#1b1816" stroke="#2c2723"/>
        <text x="16" y="30" fill="${BLUE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">SUB-SECOND LCP</text>
        <text x="16" y="55" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="11">Edge cached via Vercel / Cloudflare</text>
        <rect x="16" y="80" width="183" height="35" rx="4" fill="#100e0d"/>
        <text x="26" y="102" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12">0.38s LOAD TIME</text>
      </g>

      <g transform="translate(470, 120)">
        <rect x="0" y="0" width="220" height="160" rx="6" fill="#1b1816" stroke="#2c2723"/>
        <text x="16" y="30" fill="${GREEN}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">CAPI ATTACHED</text>
        <text x="16" y="55" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="11">Server-side conversion pipeline</text>
        <rect x="16" y="80" width="188" height="35" rx="4" fill="#100e0d"/>
        <text x="26" y="102" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12">NO AD SIGNAL LOSS</text>
      </g>

      <!-- Bottom Interactive Console preview -->
      <g transform="translate(0, 305)">
        <rect x="0" y="0" width="690" height="140" rx="6" fill="#0f0e0d" stroke="#241f1b"/>
        <text x="20" y="28" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">COMPONENT TOKENS &amp; DESIGN SYSTEM</text>
        <rect x="20" y="45" width="90" height="30" rx="4" fill="${ACCENT_ORANGE}"/>
        <text x="65" y="65" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PRIMARY</text>
        
        <rect x="125" y="45" width="90" height="30" rx="4" fill="#24201d" stroke="#3d352e"/>
        <text x="170" y="65" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">OUTLINE</text>

        <rect x="230" y="45" width="220" height="30" rx="4" fill="#171513" stroke="#2c2621"/>
        <text x="245" y="65" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">input: client@domain.com</text>

        <text x="20" y="110" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">TOKENS: Typography (Display Sans, Mono Code) · Fluid 8pt Spacing · Semantic Themes</text>
      </g>
    </g>

    <!-- Side Mobile Mockup Frame -->
    <g transform="translate(780, 0)">
      <rect x="0" y="0" width="300" height="550" rx="28" fill="#161412" stroke="#332c25" stroke-width="2"/>
      <!-- Speaker &amp; Dynamic Island -->
      <rect x="100" y="14" width="100" height="18" rx="9" fill="#0c0b0a"/>
      
      <!-- Mobile Screen Content -->
      <g transform="translate(20, 50)">
        <text x="10" y="24" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="9" letter-spacing="2">MOBILE FIRST</text>
        <text x="10" y="50" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="bold">Conversion Architecture</text>
        <text x="10" y="70" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="11">Optimized for mobile touch targets</text>

        <rect x="10" y="95" width="240" height="120" rx="8" fill="#100e0d" stroke="#241f1b"/>
        <text x="24" y="125" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">ONE-CLICK LEAD</text>
        <text x="24" y="145" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="10">Zero friction onboarding flow</text>
        <rect x="24" y="165" width="212" height="34" rx="6" fill="${ACCENT_ORANGE}"/>
        <text x="130" y="186" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">START PROJECT →</text>

        <!-- Metric Tile -->
        <rect x="10" y="235" width="240" height="90" rx="8" fill="#1b1816" stroke="#2c2723"/>
        <text x="24" y="260" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="10">TOUCH LATENCY</text>
        <text x="24" y="290" fill="${GREEN}" font-family="Consolas, monospace" font-size="22" font-weight="bold">8.2 MS</text>
        <text x="24" y="310" fill="${TEXT_DIM}" font-family="Arial, Helvetica, sans-serif" font-size="10">Instant haptic feedback</text>

        <rect x="10" y="345" width="240" height="120" rx="8" fill="#100e0d" stroke="#241f1b"/>
        <text x="24" y="375" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="10">LIGHTHOUSE METRICS</text>
        <text x="24" y="405" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="13">PERFORMANCE: 100</text>
        <text x="24" y="425" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="13">ACCESSIBILITY: 100</text>
        <text x="24" y="445" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="13">BEST PRACTICES: 100</text>
      </g>
    </g>
  </g>

  ${getFooter('SYSTEM 03 : HIGH-PERFORMANCE WEB INFRASTRUCTURE · ZERO BLOAT')}
</svg>
`;
}

// ==============================================================
// 4. ai-synapse.png: Service 01 - AI &amp; Automation
// ==============================================================
function getAiSynapseSvg() {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('AI &amp; AUTOMATION DISCIPLINE', 'SERVICE 01')}

  <g transform="translate(60, 105)">
    <rect x="0" y="0" width="1080" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1a1816"/>
    <text x="30" y="26" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12" font-weight="bold">AI OPERATIONAL AGENTS // INTEGRATED INTELLIGENCE</text>
    
    <g transform="translate(40, 65)">
      <text x="0" y="30" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold">Practical AI placed inside real workflows.</text>
      <text x="0" y="60" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="14">We don't sell speculative AI chatbots. We automate repetitive tasks and connect your operational tools.</text>

      <!-- 3 Pillars Grid -->
      <g transform="translate(0, 100)">
        <rect x="0" y="0" width="315" height="320" rx="6" fill="#1a1816" stroke="#2c2723"/>
        <rect x="24" y="24" width="40" height="40" rx="6" fill="#291a10"/>
        <text x="44" y="48" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="16" font-weight="bold" text-anchor="middle">01</text>
        <text x="24" y="95" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold">FIRST RESPONSES</text>
        <text x="24" y="125" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12" line-height="1.5">A draft reply to every inbound lead within 60 seconds. Senior human approves before sending.</text>
        <rect x="24" y="180" width="267" height="100" rx="4" fill="#100e0d"/>
        <text x="36" y="210" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">* Lead Ingest: 0.8s</text>
        <text x="36" y="235" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">* Draft Context Match: 98%</text>
        <text x="36" y="260" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11">* Speed-to-lead: &lt; 1 min</text>
      </g>

      <g transform="translate(345, 100)">
        <rect x="0" y="0" width="315" height="320" rx="6" fill="#1a1816" stroke="#2c2723"/>
        <rect x="24" y="24" width="40" height="40" rx="6" fill="#102029"/>
        <text x="44" y="48" fill="${BLUE}" font-family="Consolas, monospace" font-size="16" font-weight="bold" text-anchor="middle">02</text>
        <text x="24" y="95" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold">DATA EXTRACTION</text>
        <text x="24" y="125" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">Automatic triage, enrichment, and sync across HubSpot, Airtable, Notion, and PostgreSQL.</text>
        <rect x="24" y="180" width="267" height="100" rx="4" fill="#100e0d"/>
        <text x="36" y="210" fill="${BLUE}" font-family="Consolas, monospace" font-size="11">* Zero Manual Copy-Paste</text>
        <text x="36" y="235" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">* 14 Hours Returned / Wk</text>
        <text x="36" y="260" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">* Error Rate: 0.00%</text>
      </g>

      <g transform="translate(690, 100)">
        <rect x="0" y="0" width="310" height="320" rx="6" fill="#1a1816" stroke="#2c2723"/>
        <rect x="24" y="24" width="40" height="40" rx="6" fill="#142916"/>
        <text x="44" y="48" fill="${GREEN}" font-family="Consolas, monospace" font-size="16" font-weight="bold" text-anchor="middle">03</text>
        <text x="24" y="95" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold">INTERNAL KNOWLEDGE</text>
        <text x="24" y="125" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">Instant answers for your team derived from verified company documentation and guidelines.</text>
        <rect x="24" y="180" width="262" height="100" rx="4" fill="#100e0d"/>
        <text x="36" y="210" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">* Grounded in Primary Docs</text>
        <text x="36" y="235" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">* Zero Hallucinations</text>
        <text x="36" y="260" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">* Slack &amp; Teams Integrated</text>
      </g>
    </g>
  </g>

  ${getFooter('SERVICE 01 : PRACTICAL AI INSIDE REAL WORKFLOWS')}
</svg>
`;
}

// ==============================================================
// 5. design-grid.png: Service 02 - Web &amp; Digital
// ==============================================================
function getDesignGridSvg() {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('WEB &amp; DIGITAL EXPERIENCES', 'SERVICE 02')}

  <g transform="translate(60, 105)">
    <rect x="0" y="0" width="1080" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1a1816"/>
    <text x="30" y="26" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12" font-weight="bold">DESIGN SYSTEM TOKENS // CONVERSION LAYOUT MATRIX</text>
    
    <g transform="translate(40, 65)">
      <!-- Left Column: Typography &amp; Color Scale -->
      <g transform="translate(0, 0)">
        <rect width="480" height="430" rx="6" fill="#171513" stroke="#2a2520"/>
        <text x="24" y="35" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold">TYPOGRAPHY HIERARCHY</text>
        
        <text x="24" y="75" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900">Display 900 · 48px</text>
        <text x="24" y="115" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">Headline 700 · 32px</text>
        <text x="24" y="150" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="15">Body Text 400 · 16px Leading 1.6</text>
        <text x="24" y="180" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="13">MONO TELEMETRY // 12PX TRACKING 0.18EM</text>

        <!-- Color Palette Swatches -->
        <text x="24" y="240" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold">COLOR SPECTRUM (CALIBRATED ACCESSIBILITY)</text>
        <g transform="translate(24, 260)">
          <rect x="0" y="0" width="80" height="60" rx="4" fill="#fd5a01"/>
          <text x="10" y="50" fill="#fff" font-family="Consolas, monospace" font-size="10">#FD5A01</text>
          
          <rect x="90" y="0" width="80" height="60" rx="4" fill="#0e0d0c" stroke="#332c25"/>
          <text x="100" y="50" fill="#fff" font-family="Consolas, monospace" font-size="10">#0E0D0C</text>

          <rect x="180" y="0" width="80" height="60" rx="4" fill="#1c1917"/>
          <text x="190" y="50" fill="#fff" font-family="Consolas, monospace" font-size="10">#1C1917</text>

          <rect x="270" y="0" width="80" height="60" rx="4" fill="#f5f2ed"/>
          <text x="280" y="50" fill="#000" font-family="Consolas, monospace" font-size="10">#F5F2ED</text>

          <rect x="360" y="0" width="70" height="60" rx="4" fill="#10b981"/>
          <text x="365" y="50" fill="#fff" font-family="Consolas, monospace" font-size="10">#10B981</text>
        </g>
        <text x="24" y="360" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">WCAG AAA COMPLIANT CONTRAST RATIOS (7:1+ ON ALL INTERACTIVE SURFACES)</text>
      </g>

      <!-- Right Column: Interactive UI Components -->
      <g transform="translate(520, 0)">
        <rect width="480" height="430" rx="6" fill="#171513" stroke="#2a2520"/>
        <text x="24" y="35" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold">COMPONENT SYSTEM</text>

        <!-- Interactive Button States -->
        <g transform="translate(24, 60)">
          <rect x="0" y="0" width="130" height="40" rx="4" fill="${ACCENT_ORANGE}"/>
          <text x="65" y="25" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">PRIMARY CTA</text>

          <rect x="145" y="0" width="130" height="40" rx="4" fill="#24201d" stroke="#3a332c"/>
          <text x="210" y="25" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SECONDARY</text>

          <rect x="290" y="0" width="130" height="40" rx="4" fill="#13110f" stroke="${ACCENT_ORANGE}"/>
          <text x="355" y="25" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11" text-anchor="middle">HOVER STATE</text>
        </g>

        <!-- Metric Card Component -->
        <g transform="translate(24, 125)">
          <rect x="0" y="0" width="432" height="110" rx="6" fill="#100e0d" stroke="#26211d"/>
          <text x="20" y="30" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">METRIC COMPONENT // ELEVATED</text>
          <text x="20" y="65" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="bold">+42.8% CONVERSION RATE</text>
          <text x="20" y="90" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">+ Lift verified over 90-day testing window</text>
        </g>

        <!-- Responsive Breakpoints Table -->
        <g transform="translate(24, 255)">
          <rect x="0" y="0" width="432" height="145" rx="6" fill="#100e0d" stroke="#26211d"/>
          <text x="20" y="25" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">RESPONSIVE BREAKPOINTS</text>
          <text x="20" y="55" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">sm: 640px  |  Single column fluid stack</text>
          <text x="20" y="80" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">md: 768px  |  Balanced 2-column editorial grid</text>
          <text x="20" y="105" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">lg: 1024px |  Full 12-column systems layout</text>
          <text x="20" y="130" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11">xl: 1280px |  High-density studio console</text>
        </g>
      </g>
    </g>
  </g>

  ${getFooter('SERVICE 02 : WEBSITES BUILT TO CONVERT · NOT JUST TO EXIST')}
</svg>
`;
}

// ==============================================================
// 6. data-pulse2.png: Service 04 - Data &amp; Tracking
// ==============================================================
function getDataPulseSvg() {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('DATA &amp; TRACKING INFRASTRUCTURE', 'SERVICE 04')}

  <g transform="translate(60, 105)">
    <rect x="0" y="0" width="1080" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1a1816"/>
    <text x="30" y="26" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12" font-weight="bold">SERVER-SIDE CONVERSIONS API // EVENT TELEMETRY ENGINE</text>
    
    <!-- Real-time Event Stream Table -->
    <g transform="translate(40, 65)">
      <rect width="1000" height="230" rx="6" fill="#171513" stroke="#2a2520"/>
      <rect width="1000" height="34" rx="6" fill="#201c19"/>
      <text x="20" y="22" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">TIMESTAMP</text>
      <text x="160" y="22" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">EVENT NAME</text>
      <text x="340" y="22" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">PAYLOAD HASH</text>
      <text x="540" y="22" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">CHANNELS ROUTED</text>
      <text x="760" y="22" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">STATUS</text>
      <text x="920" y="22" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">LATENCY</text>

      <g transform="translate(20, 55)">
        <text x="0" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">18:42:01.120</text>
        <text x="140" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">Lead_Submit</text>
        <text x="320" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">sha256:4a81e9...</text>
        <text x="520" y="0" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11">Meta CAPI + GA4 + CRM</text>
        <text x="740" y="0" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">* 200 VERIFIED</text>
        <text x="900" y="0" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">14ms</text>
      </g>

      <g transform="translate(20, 95)">
        <text x="0" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">18:42:03.480</text>
        <text x="140" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">Initiate_Checkout</text>
        <text x="320" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">sha256:7c11f0...</text>
        <text x="520" y="0" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11">Meta CAPI + Google Ads</text>
        <text x="740" y="0" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">* 200 VERIFIED</text>
        <text x="900" y="0" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">18ms</text>
      </g>

      <g transform="translate(20, 135)">
        <text x="0" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">18:42:07.892</text>
        <text x="140" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">Contract_Signed</text>
        <text x="320" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">sha256:91b2c4...</text>
        <text x="520" y="0" fill="${BLUE}" font-family="Consolas, monospace" font-size="11">Full Attributed Pipeline</text>
        <text x="740" y="0" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">* 200 MATCH 99%</text>
        <text x="900" y="0" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">22ms</text>
      </g>

      <g transform="translate(20, 175)">
        <text x="0" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">18:42:12.304</text>
        <text x="140" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="11">Page_Engagement</text>
        <text x="320" y="0" fill="${TEXT_DIM}" font-family="Consolas, monospace" font-size="11">sha256:2d09a1...</text>
        <text x="520" y="0" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">GA4 Event Bus</text>
        <text x="740" y="0" fill="${GREEN}" font-family="Consolas, monospace" font-size="11">* 200 OK</text>
        <text x="900" y="0" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">11ms</text>
      </g>
    </g>

    <!-- Bottom Attribution Cards -->
    <g transform="translate(40, 320)">
      <g transform="translate(0, 0)">
        <rect width="315" height="180" rx="6" fill="#171513" stroke="#2a2520"/>
        <text x="24" y="30" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">SIGNAL HEALTH</text>
        <text x="24" y="65" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="28" font-weight="bold">9.8 / 10</text>
        <text x="24" y="90" fill="${GREEN}" font-family="Arial, Helvetica, sans-serif" font-size="12">Meta Event Quality Score</text>
        <text x="24" y="120" fill="${TEXT_DIM}" font-family="Arial, Helvetica, sans-serif" font-size="11">Customer information match rate exceeds 94% using fbc, fbp, IP, and user hash.</text>
      </g>

      <g transform="translate(345, 0)">
        <rect width="315" height="180" rx="6" fill="#171513" stroke="#2a2520"/>
        <text x="24" y="30" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">DEDUPLICATION</text>
        <text x="24" y="65" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="28" font-weight="bold">100% CLEAN</text>
        <text x="24" y="90" fill="${BLUE}" font-family="Arial, Helvetica, sans-serif" font-size="12">Browser + Server Reconciled</text>
        <text x="24" y="120" fill="${TEXT_DIM}" font-family="Arial, Helvetica, sans-serif" font-size="11">Zero duplicate conversion counting across both client pixel and server webhooks.</text>
      </g>

      <g transform="translate(685, 0)">
        <rect width="315" height="180" rx="6" fill="#171513" stroke="#2a2520"/>
        <text x="24" y="30" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">ATTRIBUTION MODEL</text>
        <text x="24" y="65" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="28" font-weight="bold">MULTI-TOUCH</text>
        <text x="24" y="90" fill="${ACCENT_ORANGE}" font-family="Arial, Helvetica, sans-serif" font-size="12">First-Touch to Closed Deal</text>
        <text x="24" y="120" fill="${TEXT_DIM}" font-family="Arial, Helvetica, sans-serif" font-size="11">Know exactly which ad creative originated the lead that became your largest contract.</text>
      </g>
    </g>
  </g>

  ${getFooter('SERVICE 04 : DATA YOU CAN DEFEND IN ANY EXECUTIVE BOARDROOM')}
</svg>
`;
}

// ==============================================================
// 7. ops-assembly.png: Service 05 - Digital Systems
// ==============================================================
function getOpsAssemblySvg() {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('INTEGRATED DIGITAL SYSTEMS', 'SERVICE 05')}

  <g transform="translate(60, 105)">
    <rect x="0" y="0" width="1080" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1a1816"/>
    <text x="30" y="26" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12" font-weight="bold">AGENCY COMMAND COCKPIT // CENTRAL OPERATIONAL LAYER</text>

    <!-- Cockpit Top Stats Bar -->
    <g transform="translate(40, 65)">
      <g transform="translate(0, 0)">
        <rect width="230" height="90" rx="6" fill="#171513" stroke="#2b2621"/>
        <text x="20" y="28" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="10">ACTIVE ENGAGEMENTS</text>
        <text x="20" y="58" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold">12 SYSTEMS</text>
        <text x="20" y="78" fill="${GREEN}" font-family="Consolas, monospace" font-size="10">* All on schedule</text>
      </g>
      
      <g transform="translate(255, 0)">
        <rect width="230" height="90" rx="6" fill="#171513" stroke="#2b2621"/>
        <text x="20" y="28" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="10">AVERAGE RESPONSE TIME</text>
        <text x="20" y="58" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold">42 SEC</text>
        <text x="20" y="78" fill="${GREEN}" font-family="Consolas, monospace" font-size="10">Automated triage</text>
      </g>

      <g transform="translate(510, 0)">
        <rect width="230" height="90" rx="6" fill="#171513" stroke="#2b2621"/>
        <text x="20" y="28" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="10">MILESTONE APPROVALS</text>
        <text x="20" y="58" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold">100.0%</text>
        <text x="20" y="78" fill="${BLUE}" font-family="Consolas, monospace" font-size="10">Client portal active</text>
      </g>

      <g transform="translate(765, 0)">
        <rect width="235" height="90" rx="6" fill="#171513" stroke="#2b2621"/>
        <text x="20" y="28" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="10">SYSTEM RELIABILITY</text>
        <text x="20" y="58" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold">99.98%</text>
        <text x="20" y="78" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="10">Zero pipeline halts</text>
      </g>
    </g>

    <!-- Project Systems Board -->
    <g transform="translate(40, 180)">
      <rect width="1000" height="320" rx="6" fill="#171513" stroke="#2a2520"/>
      <rect width="1000" height="36" rx="6" fill="#201c19"/>
      <text x="24" y="23" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">SYSTEM ID</text>
      <text x="180" y="23" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">CAPABILITY MODULE</text>
      <text x="440" y="23" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">OPERATOR IN CHARGE</text>
      <text x="680" y="23" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">CURRENT STAGE</text>
      <text x="880" y="23" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11">PROGRESS</text>

      <!-- Row 1 -->
      <g transform="translate(24, 65)">
        <text x="0" y="0" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12">SYS_01-ACQ</text>
        <text x="156" y="0" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">Acquisition Funnel &amp; CAPI Stack</text>
        <text x="416" y="0" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">Senior Growth Strategist</text>
        <rect x="656" y="-12" width="120" height="22" rx="3" fill="#102e1c"/>
        <text x="716" y="3" fill="${GREEN}" font-family="Consolas, monospace" font-size="10" text-anchor="middle">LIVE &amp; SCALING</text>
        <text x="856" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12">100%</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(24, 120)">
        <text x="0" y="0" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12">SYS_02-OPS</text>
        <text x="156" y="0" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">AI Support &amp; Lead Triage Layer</text>
        <text x="416" y="0" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">Senior Automation Engineer</text>
        <rect x="656" y="-12" width="120" height="22" rx="3" fill="#301f12"/>
        <text x="716" y="3" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="10" text-anchor="middle">SPRINT 2 ACTIVE</text>
        <text x="856" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12">78%</text>
      </g>

      <!-- Row 3 -->
      <g transform="translate(24, 175)">
        <text x="0" y="0" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12">SYS_03-WEB</text>
        <text x="156" y="0" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">Conversion Landing Page System</text>
        <text x="416" y="0" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">Lead Design Engineer</text>
        <rect x="656" y="-12" width="120" height="22" rx="3" fill="#10202e"/>
        <text x="716" y="3" fill="${BLUE}" font-family="Consolas, monospace" font-size="10" text-anchor="middle">QA &amp; BENCHMARK</text>
        <text x="856" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12">92%</text>
      </g>

      <!-- Row 4 -->
      <g transform="translate(24, 230)">
        <text x="0" y="0" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12">SYS_04-CRM</text>
        <text x="156" y="0" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold">Client Portal &amp; Invoice Gateway</text>
        <text x="416" y="0" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="12">Systems Architect</text>
        <rect x="656" y="-12" width="120" height="22" rx="3" fill="#102e1c"/>
        <text x="716" y="3" fill="${GREEN}" font-family="Consolas, monospace" font-size="10" text-anchor="middle">VERIFIED READY</text>
        <text x="856" y="0" fill="${TEXT_WHITE}" font-family="Consolas, monospace" font-size="12">100%</text>
      </g>
    </g>
  </g>

  ${getFooter('SERVICE 05 : THE CONNECTIVE LAYER THAT RUNS YOUR BUSINESS')}
</svg>
`;
}

// ==============================================================
// 8. Studio Band Process Posters: discover, build, connect, grow
// ==============================================================
function getProcessStepSvg(stepNum, stepName, stepDesc, metricLabel, metricVal) {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader(stepName, 'ORBYT METHODOLOGY')}

  <g transform="translate(60, 105)">
    <rect x="0" y="0" width="1080" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1a1816"/>
    <text x="30" y="26" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12" font-weight="bold">METHODOLOGY STEP // 0${stepNum} · ${stepName}</text>
    
    <g transform="translate(60, 80)">
      <text x="0" y="40" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="18" font-weight="bold">PHASE 0${stepNum}</text>
      <text x="0" y="90" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" letter-spacing="-0.5">${stepName}</text>
      <text x="0" y="130" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="16" max-width="800">${stepDesc}</text>

      <g transform="translate(0, 180)">
        <rect width="450" height="180" rx="6" fill="#181513" stroke="#2b2621"/>
        <text x="30" y="40" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="12">${metricLabel.toUpperCase()}</text>
        <text x="30" y="90" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold">${metricVal}</text>
        <text x="30" y="130" fill="${GREEN}" font-family="Consolas, monospace" font-size="12">* VERIFIED STAGE CHECKPOINT</text>
      </g>

      <g transform="translate(480, 180)">
        <rect width="480" height="180" rx="6" fill="#181513" stroke="#2b2621"/>
        <text x="30" y="40" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="12">SENIOR COMMITMENT</text>
        <text x="30" y="80" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold">No juniors. No handoff to vendors.</text>
        <text x="30" y="115" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="13">The operator who maps this phase is the same senior engineer who writes the production code.</text>
      </g>
    </g>
  </g>

  ${getFooter(`PHASE 0${stepNum} : ${stepName} · EXECUTED BY SENIOR OPERATORS`)}
</svg>
`;
}

// ==============================================================
// 9. Essay Editorial Posters
// ==============================================================
function getEssaySvg(title, dek, readingTime = '4 MIN READ') {
  return `
<svg width="1200" height="750" viewBox="0 0 1200 750" xmlns="http://www.w3.org/2000/svg">
  ${SVG_DEFS}
  <rect width="1200" height="750" fill="${BG}"/>
  <circle cx="600" cy="380" r="380" fill="url(#glowGrad)"/>
  ${getHeader('OPERATOR ESSAYS &amp; POSITIONS', 'INSIGHTS')}

  <g transform="translate(60, 105)">
    <rect x="0" y="0" width="1080" height="550" rx="8" fill="#131110" stroke="${CARD_BORDER}" stroke-width="1.5"/>
    <rect x="0" y="0" width="1080" height="42" rx="8" fill="#1a1816"/>
    <text x="30" y="26" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="12" font-weight="bold">ORBYT POSITION // OPERATOR TO OPERATOR</text>
    <text x="1050" y="26" fill="${TEXT_MUTED}" font-family="Consolas, monospace" font-size="11" text-anchor="end">${readingTime}</text>

    <g transform="translate(60, 80)">
      <rect x="0" y="0" width="110" height="26" rx="4" fill="#241912"/>
      <text x="14" y="17" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11" font-weight="bold">ESSAY SPEC</text>
      
      <text x="0" y="80" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" letter-spacing="-0.5">${title}</text>
      <text x="0" y="130" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="16" max-width="850">${dek}</text>

      <!-- Editorial Quote Box -->
      <g transform="translate(0, 180)">
        <rect width="960" height="180" rx="6" fill="#181513" stroke="${ACCENT_ORANGE}" stroke-width="1.5"/>
        <text x="35" y="45" fill="${ACCENT_ORANGE}" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="bold">"</text>
        <text x="60" y="65" fill="${TEXT_WHITE}" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="600" font-style="italic">The goal was never to buy software. The goal is a business that runs cleanly without human glue.</text>
        <text x="60" y="115" fill="${TEXT_MUTED}" font-family="Arial, Helvetica, sans-serif" font-size="13">When systems talk directly to one another, hours are returned, decisions get sharper, and growth stops leaking through the cracks.</text>
        <text x="60" y="150" fill="${ACCENT_ORANGE}" font-family="Consolas, monospace" font-size="11">-- ORBYT ENGINEERING DISCIPLINE</text>
      </g>
    </g>
  </g>

  ${getFooter('ORBYT FIELD NOTES · TESTED IN PRODUCTION')}
</svg>
`;
}

async function run() {
  console.log('Rendering all high-end agency posters...');

  // 1. Systems &amp; Service Posters
  await renderSvgToPng(path.join(ART_DIR, 'growth-beam.png'), getGrowthBeamSvg());
  await renderSvgToPng(path.join(ART_DIR, 'engine-core.png'), getEngineCoreSvg());
  await renderSvgToPng(path.join(ART_DIR, 'web-portal.png'), getWebPortalSvg());
  await renderSvgToPng(path.join(ART_DIR, 'ai-synapse.png'), getAiSynapseSvg());
  await renderSvgToPng(path.join(ART_DIR, 'design-grid.png'), getDesignGridSvg());
  await renderSvgToPng(path.join(ART_DIR, 'data-pulse2.png'), getDataPulseSvg());
  await renderSvgToPng(path.join(ART_DIR, 'ops-assembly.png'), getOpsAssemblySvg());

  // 2. Process Posters (Studio band)
  await renderSvgToPng(path.join(ART_DIR, 'discover-contour.png'), getProcessStepSvg(1, 'DISCOVER', 'Mapping where growth leaks before touching any tool.', 'Bottleneck Discovery', '100% Uncovered'));
  await renderSvgToPng(path.join(ART_DIR, 'build-blocks.png'), getProcessStepSvg(2, 'BUILD', 'Modular infrastructure shipped in small, tested layers.', 'Production Code', '0.38s LCP Edge'));
  await renderSvgToPng(path.join(ART_DIR, 'connect-corridor.png'), getProcessStepSvg(3, 'CONNECT', 'Bi-directional telemetry linking website, ads, and CRM.', 'Signal Fidelity', 'Zero Lead Loss'));
  await renderSvgToPng(path.join(ART_DIR, 'grow-terrace.png'), getProcessStepSvg(4, 'GROW', 'Continuous measurement and compounding performance.', 'Cohort Lift', '+38.4% CVR'));

  // 3. Remote Constellation (About page)
  await renderSvgToPng(path.join(ART_DIR, 'remote-constellation.png'), getProcessStepSvg(5, 'REMOTE BY DESIGN', 'Senior operators distributed globally. Focused, uninterrupted sprints.', 'Timezone Overlap', 'Global 24/7 Ops'));

  // 4. Essays
  await renderSvgToPng(
    path.join(ESSAY_DIR, 'ai-strategies-are-workflow-problems.png'),
    getEssaySvg('Most AI strategies are workflow problems', 'Before asking what AI can do for your business, know what your business actually does.')
  );
  await renderSvgToPng(
    path.join(ESSAY_DIR, 'tracking-is-lying-to-you.png'),
    getEssaySvg('Your tracking is probably lying to you', 'Duplicate events, missing server conversions. Most ad accounts optimize against fiction.')
  );
  await renderSvgToPng(
    path.join(ESSAY_DIR, 'landing-page-is-a-system.png'),
    getEssaySvg('A landing page is a system, not a page', 'It inherits your ads, your tracking, and your follow-up. Treat it alone and it fails alone.')
  );
  await renderSvgToPng(
    path.join(ESSAY_DIR, 'disconnected-tools-silent-tax.png'),
    getEssaySvg('Disconnected tools are a silent tax', 'Nobody budgets the hours lost moving data between tools that should already be connected.')
  );

  console.log('[OK] All 15 high-end agency posters generated successfully!');
}

run().catch(console.error);
