const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
const rawScreenshotBase64 = fs.readFileSync(path.join(publicDir, 'meta-results-raw.jpg')).toString('base64');
const orbytLogoBase64 = fs.readFileSync(path.join(publicDir, 'orbyt-logo.png')).toString('base64');

// We will build both an Editorial Dark version and an Editorial Light version,
// and render them into pixel-perfect HD PNG files!

function buildEditorialPosterHtml({ mode = 'dark' }) {
  const isDark = mode === 'dark';
  
  const theme = isDark ? {
    bg: '#0B0A09',
    cardBg: '#131210',
    cardBorder: 'rgba(255, 255, 255, 0.09)',
    cardBorderHighlight: 'rgba(253, 90, 1, 0.45)',
    textPrimary: '#FAF7F2',
    textSecondary: '#9A9893',
    textDim: '#5A5854',
    accentOrange: '#FD5A01',
    accentVolt: '#D6F345',
    gridColor: 'rgba(255, 255, 255, 0.025)',
    headerBorder: 'rgba(255, 255, 255, 0.1)',
    screenshotBg: '#0e0e0d',
    screenshotBorder: 'rgba(255, 255, 255, 0.12)',
    footerBorder: 'rgba(255, 255, 255, 0.1)'
  } : {
    bg: '#F5F4EF',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    cardBorderHighlight: '#FD5A01',
    textPrimary: '#161615',
    textSecondary: '#666560',
    textDim: '#999790',
    accentOrange: '#FD5A01',
    accentVolt: '#15803d',
    gridColor: 'rgba(0, 0, 0, 0.035)',
    headerBorder: 'rgba(0, 0, 0, 0.12)',
    screenshotBg: '#ffffff',
    screenshotBorder: 'rgba(0, 0, 0, 0.12)',
    footerBorder: 'rgba(0, 0, 0, 0.12)'
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ORBYT — Performance Proof Case Study</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: ${theme.bg};
      color: ${theme.textPrimary};
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      width: 1080px;
      height: 1350px;
      overflow: hidden;
      margin: 0;
      padding: 48px 56px 44px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    /* Subtle Architectural Background Grid */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(${theme.gridColor} 1px, transparent 1px),
        linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
      z-index: 0;
    }

    ${isDark ? `
    .bg-glow {
      position: absolute;
      top: -120px;
      right: -80px;
      width: 520px;
      height: 520px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253, 90, 1, 0.18) 0%, transparent 70%);
      filter: blur(50px);
      pointer-events: none;
      z-index: 0;
    }
    ` : ''}

    .layer-fg {
      position: relative;
      z-index: 2;
    }

    /* ── HEADER ────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px solid ${theme.headerBorder};
      padding-bottom: 20px;
    }

    .brand-identity {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    /* Official ORBYT Runner Logo Tile */
    .logo-tile {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FD5A01;
      box-shadow: 0 4px 16px rgba(253, 90, 1, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .logo-tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-titles {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .brand-wordmark-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .brand-wordmark {
      font-size: 1.6rem;
      font-weight: 900;
      letter-spacing: -0.025em;
      color: ${theme.textPrimary};
      line-height: 1;
    }

    .brand-category {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      color: ${theme.accentOrange};
      letter-spacing: 0.02em;
    }

    .brand-tagline {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: ${theme.textSecondary};
    }

    .header-status {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 6px 12px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }

    .case-stamp {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      font-weight: 700;
      color: ${theme.textSecondary};
      border: 1px solid ${theme.cardBorder};
      background: ${theme.cardBg};
      padding: 6px 12px;
      border-radius: 9999px;
    }

    /* ── HERO HEADLINE ─────────────────────────────────── */
    .hero-editorial {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 4px;
    }

    .eyebrow-track {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${theme.accentOrange};
    }

    .eyebrow-track::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: ${theme.accentOrange};
      border-radius: 1px;
    }

    .headline-main {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 3.6rem;
      font-weight: 900;
      line-height: 1.04;
      letter-spacing: -0.038em;
      color: ${theme.textPrimary};
    }

    .headline-main .highlight-orange {
      color: ${theme.accentOrange};
    }

    .hero-lede {
      font-size: 1.05rem;
      line-height: 1.5;
      color: ${theme.textSecondary};
      max-width: 860px;
      font-weight: 500;
    }

    .hero-lede strong {
      color: ${theme.textPrimary};
      font-weight: 700;
    }

    /* ── AUTHENTIC SCREENSHOT SHOWCASE (HERO PROOF) ─────── */
    .proof-hero-container {
      background: ${theme.cardBg};
      border: 1.5px solid ${theme.cardBorder};
      border-radius: 14px;
      padding: 16px 18px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: ${isDark ? '0 16px 40px rgba(0,0,0,0.6)' : '0 12px 30px rgba(0,0,0,0.06)'};
      position: relative;
    }

    .proof-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid ${theme.cardBorder};
      padding-bottom: 10px;
    }

    .proof-top-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: ${theme.textPrimary};
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .proof-top-title svg {
      color: ${theme.accentOrange};
    }

    .proof-audit-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: ${theme.textSecondary};
    }

    /* The Raw Screenshot Showcase Frame */
    .screenshot-clean-frame {
      width: 100%;
      height: 380px;
      border-radius: 8px;
      overflow: hidden;
      background: #FFFFFF;
      border: 1px solid ${theme.screenshotBorder};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
    }

    .screenshot-clean-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      display: block;
    }

    /* ── KEY METRICS BENTO ──────────────────────────────── */
    .metrics-row {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr 1fr;
      gap: 12px;
    }

    .metric-card {
      background: ${theme.cardBg};
      border: 1px solid ${theme.cardBorder};
      border-radius: 12px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .metric-card.featured-metric {
      border: 1.5px solid ${theme.cardBorderHighlight};
      ${isDark ? 'background: linear-gradient(180deg, #1A1410 0%, #110E0B 100%);' : 'background: #FFF9F5;'}
    }

    .metric-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: ${theme.textSecondary};
      margin-bottom: 6px;
    }

    .metric-card.featured-metric .metric-title {
      color: ${theme.accentOrange};
    }

    .metric-big-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.035em;
      color: ${theme.textPrimary};
      margin-bottom: 8px;
    }

    .metric-card.featured-metric .metric-big-num {
      color: ${theme.accentOrange};
    }

    .metric-note {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6rem;
      font-weight: 600;
      color: ${isDark ? '#4ade80' : '#15803d'};
      letter-spacing: 0.04em;
      margin-top: auto;
    }

    .metric-note.dim {
      color: ${theme.textSecondary};
    }

    /* ── FOOTER ────────────────────────────────────────── */
    .footer {
      border-top: 1.5px solid ${theme.footerBorder};
      padding-top: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .footer-left {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .footer-heading {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: ${theme.textPrimary};
    }

    .footer-pillars {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.64rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${theme.textSecondary};
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .url-capsule {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .url-prefix {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${theme.accentOrange};
    }

    .url-main {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: ${theme.textPrimary};
    }

    .sign-onward {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 800;
      color: ${theme.accentOrange};
      padding-left: 12px;
      border-left: 2px solid ${theme.headerBorder};
    }
  </style>
</head>
<body>

  <div class="bg-grid"></div>
  ${isDark ? '<div class="bg-glow"></div>' : ''}

  <!-- Header -->
  <header class="header layer-fg">
    <div class="brand-identity">
      <div class="logo-tile">
        <img src="data:image/png;base64,${orbytLogoBase64}" alt="ORBYT Runner">
      </div>
      <div class="brand-titles">
        <div class="brand-wordmark-row">
          <span class="brand-wordmark">ORBYT</span>
          <span class="brand-category">/GrowthSystems/</span>
        </div>
        <span class="brand-tagline">Digital systems built for growth</span>
      </div>
    </div>

    <div class="header-status">
      <div class="status-badge">
        <span class="status-dot"></span>
        Meta Ads Verified
      </div>
      <div class="case-stamp">AUDIT // 2026</div>
    </div>
  </header>

  <!-- Hero Headline -->
  <section class="hero-editorial layer-fg">
    <div class="eyebrow-track">CLIENT GROWTH CASE STUDY · PERFORMANCE BENCHMARK</div>
    <h1 class="headline-main">
      558 PURCHASES.<br>
      <span class="highlight-orange">$0.61</span> COST PER RESULT.
    </h1>
    <p class="hero-lede">
      Direct Meta Ads customer acquisition report. With only <strong>$339.13 total spend</strong>, the architecture delivered <strong>558 verified website purchases</strong> across <strong>319,343 impressions</strong> with zero budget leakage.
    </p>
  </section>

  <!-- Authentic Screenshot Centerpiece -->
  <section class="proof-hero-container layer-fg">
    <div class="proof-top-bar">
      <div class="proof-top-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Authentic Meta Ads Manager Report
      </div>
      <div class="proof-audit-tag">
        SOURCE: LIVE ADS TELEMETRY · 100% UNTOUCHED
      </div>
    </div>

    <!-- The actual raw screenshot rendered fully and sharply -->
    <div class="screenshot-clean-frame">
      <img src="data:image/jpeg;base64,${rawScreenshotBase64}" alt="Meta Ads Manager Verified Report">
    </div>
  </section>

  <!-- Metrics Bento -->
  <section class="metrics-row layer-fg">
    <div class="metric-card featured-metric">
      <span class="metric-title">Cost Per Purchase</span>
      <span class="metric-big-num">$0.61</span>
      <span class="metric-note">96% below industry average</span>
    </div>

    <div class="metric-card">
      <span class="metric-title">Website Purchases</span>
      <span class="metric-big-num">558</span>
      <span class="metric-note">Direct checkouts</span>
    </div>

    <div class="metric-card">
      <span class="metric-title">Total Ad Spend</span>
      <span class="metric-big-num">$339<span style="font-size: 1.4rem; opacity:0.75;">.13</span></span>
      <span class="metric-note dim">Total budget deployed</span>
    </div>

    <div class="metric-card">
      <span class="metric-title">Impressions &amp; Reach</span>
      <span class="metric-big-num">319.3K</span>
      <span class="metric-note dim">96,350 unique accounts</span>
    </div>
  </section>

  <!-- Editorial Footer -->
  <footer class="footer layer-fg">
    <div class="footer-left">
      <div class="footer-heading">Build the system behind your growth.</div>
      <div class="footer-pillars">Strategy · Architecture · Tracking · Scale</div>
    </div>

    <div class="footer-right">
      <div class="url-capsule">
        <span class="url-prefix">Explore Platform</span>
        <span class="url-main">www.orbytonward.tech</span>
      </div>
      <div class="sign-onward">Onward.</div>
    </div>
  </footer>

</body>
</html>`;
}

// Write the dark editorial poster HTML
fs.writeFileSync(path.join(publicDir, 'poster-editorial-dark.html'), buildEditorialPosterHtml({ mode: 'dark' }));

// Write the light editorial poster HTML
fs.writeFileSync(path.join(publicDir, 'poster-editorial-light.html'), buildEditorialPosterHtml({ mode: 'light' }));

console.log('Saved poster-editorial-dark.html and poster-editorial-light.html!');
