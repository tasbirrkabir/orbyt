const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const rawScreenshotBase64 = fs.readFileSync(path.join(publicDir, 'meta-results-raw.jpg')).toString('base64');
const orbytLogoBase64 = fs.readFileSync(path.join(publicDir, 'orbyt-logo.png')).toString('base64');

function makePoster({ isDark }) {
  const bg = isDark ? '#0c0c0b' : '#faf9f5';
  const text = isDark ? '#faf7f2' : '#141413';
  const textMuted = isDark ? '#8e8d8a' : '#6b6964';
  const textDim = isDark ? '#5a5955' : '#999790';
  const border = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const outerBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const shadow = isDark ? '0 24px 60px rgba(0, 0, 0, 0.6)' : '0 16px 40px rgba(0, 0, 0, 0.08)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ORBYT — 558 Purchases at $0.61</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: ${bg};
      color: ${text};
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      width: 1080px;
      height: 1350px;
      overflow: hidden;
      margin: 0;
      padding: 64px 68px 56px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    .poster-border {
      position: absolute;
      inset: 20px;
      border: 1px solid ${outerBorder};
      border-radius: 16px;
      pointer-events: none;
    }

    /* ── HEADER ────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 24px;
      border-bottom: 1px solid ${border};
    }

    .brand-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .runner-tile {
      width: 40px;
      height: 40px;
      border-radius: 9px;
      overflow: hidden;
      background: #FD5A01;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .runner-tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.55rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: ${text};
      line-height: 1;
    }

    .brand-right {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      font-weight: 500;
      color: ${textMuted};
      letter-spacing: 0.04em;
    }

    .brand-right span {
      color: #FD5A01;
    }

    /* ── HEADLINE ──────────────────────────────────────── */
    .headline-wrap {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 10px;
    }

    .headline {
      font-size: 3.8rem;
      font-weight: 900;
      line-height: 1.04;
      letter-spacing: -0.04em;
      color: ${text};
    }

    .headline span.orange {
      color: #FD5A01;
    }

    .subline {
      font-size: 1.15rem;
      line-height: 1.5;
      color: ${textMuted};
      font-weight: 400;
      max-width: 780px;
    }

    /* ── SCREENSHOT ────────────────────────────────────── */
    .screenshot-card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 
        ${shadow},
        0 0 0 1px ${border};
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
    }

    .screenshot-card img {
      width: 100%;
      height: auto;
      max-height: 520px;
      object-fit: contain;
      display: block;
      border-radius: 8px;
    }

    /* ── STATS ROW ─────────────────────────────────────── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      border-top: 1px solid ${border};
      border-bottom: 1px solid ${border};
      padding: 22px 0;
    }

    .stat-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-col.highlight .stat-val {
      color: #FD5A01;
    }

    .stat-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: ${textDim};
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 500;
    }

    .stat-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: ${text};
      line-height: 1;
    }

    /* ── FOOTER ────────────────────────────────────────── */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
    }

    .footer-text {
      font-size: 0.95rem;
      color: ${textMuted};
      font-weight: 500;
    }

    .footer-onward {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: ${text};
    }

    .footer-onward span {
      color: #FD5A01;
    }
  </style>
</head>
<body>

  <div class="poster-border"></div>

  <header class="header">
    <div class="brand-left">
      <div class="runner-tile">
        <img src="data:image/png;base64,${orbytLogoBase64}" alt="ORBYT">
      </div>
      <span class="brand-name">ORBYT</span>
    </div>
    <div class="brand-right">
      <span>orbytonward</span>.tech
    </div>
  </header>

  <section class="headline-wrap">
    <h1 class="headline">
      558 purchases.<br>
      <span class="orange">$0.61</span> each.
    </h1>
    <p class="subline">
      $339.13 total spend across 319,343 impressions on Meta.
    </p>
  </section>

  <div class="screenshot-card">
    <img src="data:image/jpeg;base64,${rawScreenshotBase64}" alt="Meta Ads Results">
  </div>

  <section class="stats-row">
    <div class="stat-col highlight">
      <span class="stat-label">Cost / Purchase</span>
      <span class="stat-val">$0.61</span>
    </div>
    <div class="stat-col">
      <span class="stat-label">Purchases</span>
      <span class="stat-val">558</span>
    </div>
    <div class="stat-col">
      <span class="stat-label">Amount Spent</span>
      <span class="stat-val">$339.13</span>
    </div>
    <div class="stat-col">
      <span class="stat-label">Impressions</span>
      <span class="stat-val">319,343</span>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-text">Digital systems built for growth.</div>
    <div class="footer-onward">Onward<span>.</span></div>
  </footer>

</body>
</html>`;
}

fs.writeFileSync(path.join(publicDir, 'poster-clean.html'), makePoster({ isDark: true }));
fs.writeFileSync(path.join(publicDir, 'poster-clean-light.html'), makePoster({ isDark: false }));
console.log('Saved both clean dark and clean light poster HTMLs.');
