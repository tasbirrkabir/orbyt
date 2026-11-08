const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
const rawJpg = fs.readFileSync(path.join(publicDir, 'meta-results-raw.jpg')).toString('base64');
const runnerPng = fs.readFileSync(path.join(publicDir, 'runner.png')).toString('base64');

// 1. Clean 1080x1350 Portrait HTML
function getHtml({ width, height, isSquare }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ORBYT — Growth Case Study</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg: #080807;
      --card-bg: rgba(20, 20, 19, 0.94);
      --primary: #FD5A01;
      --primary-hover: #ff6d18;
      --primary-glow: rgba(253, 90, 1, 0.35);
      --lime: #d6f345;
      --text-main: #FAF7F2;
      --text-muted: #8E8D8A;
    }

    body {
      background-color: #080807;
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: ${isSquare ? '48px 56px 42px' : '56px 60px 48px'};
      position: relative;
      -webkit-font-smoothing: antialiased;
    }

    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
    }

    .bg-glow-top {
      position: absolute;
      top: -140px;
      right: -80px;
      width: 620px;
      height: 620px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253, 90, 1, 0.22) 0%, rgba(253, 90, 1, 0.04) 50%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
    }

    .bg-glow-bottom {
      position: absolute;
      bottom: -160px;
      left: -100px;
      width: 580px;
      height: 580px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253, 90, 1, 0.18) 0%, transparent 65%);
      filter: blur(50px);
      pointer-events: none;
    }

    .layer-fg {
      position: relative;
      z-index: 5;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: ${isSquare ? '18px' : '22px'};
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-icon-box {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #1f1f1d, #111110);
      border: 1px solid rgba(253, 90, 1, 0.45);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(253, 90, 1, 0.25);
    }

    .brand-icon-box svg {
      width: 28px;
      height: 28px;
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-logo-title {
      font-size: 1.55rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #ffffff;
      line-height: 1;
    }

    .brand-logo-title span {
      color: var(--primary);
      font-size: 0.75rem;
      vertical-align: super;
      margin-left: 2px;
    }

    .brand-logo-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.24em;
      color: var(--primary);
      text-transform: uppercase;
      margin-top: 4px;
    }

    .header-pills {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pill-verified {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      font-weight: 700;
      color: #4ade80;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(74, 222, 128, 0.35);
      padding: 6px 14px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 7px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .dot-live {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }

    .pill-bench {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.09);
      padding: 6px 12px;
      border-radius: 9999px;
      letter-spacing: 0.06em;
    }

    /* Main Hook / Headline */
    .hero-block {
      display: flex;
      flex-direction: column;
      gap: ${isSquare ? '8px' : '12px'};
      margin-top: 6px;
    }

    .tag-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--primary);
      background: rgba(253, 90, 1, 0.12);
      border: 1px solid rgba(253, 90, 1, 0.3);
      padding: 5px 14px;
      border-radius: 9999px;
      width: fit-content;
    }

    .hero-title {
      font-size: ${isSquare ? '3.1rem' : '3.6rem'};
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.035em;
      color: #ffffff;
    }

    .hero-title .glow-orange {
      color: var(--primary);
      text-shadow: 0 0 40px rgba(253, 90, 1, 0.4);
    }

    .hero-summary {
      font-size: ${isSquare ? '1.02rem' : '1.12rem'};
      line-height: 1.5;
      color: #c7c5bf;
      max-width: 900px;
      font-weight: 500;
    }

    .hero-summary strong {
      color: #ffffff;
      font-weight: 700;
    }

    /* Big Bento Stats */
    .bento-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.95fr 0.95fr 0.95fr;
      gap: 14px;
    }

    .bento-card {
      background: linear-gradient(180deg, rgba(24, 24, 23, 0.9) 0%, rgba(14, 14, 13, 0.95) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: ${isSquare ? '16px 14px' : '20px 18px'};
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .bento-card.hero-card {
      border: 1px solid rgba(253, 90, 1, 0.55);
      background: linear-gradient(180deg, rgba(38, 22, 14, 0.95) 0%, rgba(18, 13, 10, 0.98) 100%);
      box-shadow: 0 12px 30px rgba(253, 90, 1, 0.18);
    }

    .bento-card.hero-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #FD5A01, #ff944d);
    }

    .bento-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .bento-card.hero-card .bento-label {
      color: #ff9d66;
    }

    .bento-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: ${isSquare ? '2.5rem' : '2.85rem'};
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin-bottom: 10px;
    }

    .bento-card.hero-card .bento-val {
      color: var(--primary);
    }

    .bento-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      font-weight: 700;
      color: #d6f345;
      background: rgba(214, 243, 69, 0.12);
      border: 1px solid rgba(214, 243, 69, 0.25);
      padding: 3px 8px;
      border-radius: 6px;
      width: fit-content;
      margin-top: auto;
      letter-spacing: 0.04em;
    }

    .bento-badge.muted {
      color: #aaa;
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.09);
    }

    /* Live Data Breakdown & Screenshot Proof */
    .proof-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 16px;
      background: #10100f;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: ${isSquare ? '18px' : '22px'};
    }

    .table-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .table-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .table-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .table-title svg {
      color: var(--primary);
    }

    .meta-tag {
      font-size: 0.68rem;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .live-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.74rem;
      background: #090908;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .live-table th {
      background: #141413;
      color: #777;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 7px 10px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .live-table td {
      padding: 6px 10px;
      color: #ccc;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-family: 'Space Grotesk', sans-serif;
    }

    .live-table tr.winner-row {
      background: rgba(253, 90, 1, 0.07);
    }

    .live-table tr.winner-row td {
      color: #fff;
      font-weight: 700;
    }

    .cost-badge {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .cost-badge.win {
      color: #d6f345;
      background: rgba(214, 243, 69, 0.12);
    }

    .cost-badge.sub1 {
      color: #ff9d66;
      background: rgba(253, 90, 1, 0.12);
    }

    .live-table tfoot tr {
      background: #181817;
      border-top: 2px solid var(--primary);
    }

    .live-table tfoot td {
      color: #ffffff;
      font-weight: 800;
      padding: 9px 10px;
      font-size: 0.8rem;
    }

    /* Screenshot proof box */
    .screenshot-box {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .screenshot-wrap {
      background: #000;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    .screenshot-header {
      height: 24px;
      background: #181816;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .dots {
      display: flex;
      gap: 4px;
    }
    .dot-item {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .dot-item.red { background: #ff5f56; }
    .dot-item.yellow { background: #ffbd2e; }
    .dot-item.green { background: #27c93f; }

    .screenshot-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.58rem;
      color: #888;
    }

    .screenshot-frame {
      width: 100%;
      height: ${isSquare ? '145px' : '175px'};
      overflow: hidden;
      background: #ffffff;
    }

    .screenshot-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: bottom right;
    }

    .proof-caption {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      color: #777;
      line-height: 1.4;
    }

    .proof-caption strong {
      color: #4ade80;
    }

    /* Pillars */
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .pillar-item {
      background: rgba(18, 18, 17, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: ${isSquare ? '12px 14px' : '15px 16px'};
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .pillar-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.62rem;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 0.08em;
    }

    .pillar-heading {
      font-size: 0.9rem;
      font-weight: 700;
      color: #fff;
    }

    .pillar-text {
      font-size: 0.74rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Footer */
    .poster-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: ${isSquare ? '16px' : '20px'};
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cta-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cta-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .cta-main {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
    }

    .cta-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .agency-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #141413;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px 16px;
      border-radius: 12px;
    }

    .runner-icon-wrap {
      width: 34px;
      height: 34px;
      background: var(--primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .runner-icon-wrap img {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }

    .agency-info {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .agency-info-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.58rem;
      color: #777;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .agency-info-url {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="bg-glow-top"></div>
  <div class="bg-glow-bottom"></div>

  <!-- Header -->
  <header class="header layer-fg">
    <div class="brand-wrap">
      <div class="brand-icon-box">
        <svg viewBox="0 0 64 64" fill="none">
          <defs>
            <radialGradient id="planetGlow" cx="36%" cy="30%" r="85%">
              <stop offset="0%" stop-color="#FFD9A8"/>
              <stop offset="38%" stop-color="#FFB25C"/>
              <stop offset="72%" stop-color="#FD5A01"/>
              <stop offset="100%" stop-color="#B34200"/>
            </radialGradient>
          </defs>
          <g transform="rotate(-18 32 32)">
            <ellipse cx="32" cy="32" rx="30" ry="12" stroke="#FAF7F2" stroke-opacity="0.45" stroke-width="2.5"/>
            <circle cx="59.2" cy="26.9" r="3" fill="#FD5A01"/>
          </g>
          <circle cx="32" cy="32" r="13" fill="url(#planetGlow)"/>
          <ellipse cx="27.5" cy="26.5" rx="4.6" ry="2.6" transform="rotate(-28 27.5 26.5)" fill="#FFF6E8" opacity="0.6"/>
          <g transform="rotate(-18 32 32)">
            <path d="M 2 32 A 30 12 0 0 1 62 32" stroke="#FAF7F2" stroke-width="2.5" stroke-linecap="round"/>
          </g>
        </svg>
      </div>
      <div class="brand-meta">
        <div class="brand-logo-title">ORBYT<span>®</span></div>
        <div class="brand-logo-sub">Performance Architecture</div>
      </div>
    </div>

    <div class="header-pills">
      <div class="pill-verified">
        <span class="dot-live"></span>
        Meta Ads Verified
      </div>
      <div class="pill-bench">CASE // 2026</div>
    </div>
  </header>

  <!-- Headline -->
  <section class="hero-block layer-fg">
    <div class="tag-eyebrow">
      <span>⚡</span> High-Velocity Acquisition
    </div>
    <h1 class="hero-title">
      558 PURCHASES.<br>
      <span class="glow-orange">$0.61</span> COST PER RESULT.
    </h1>
    <p class="hero-summary">
      How Orbyt engineered hyper-profitable customer acquisition on Meta Ads.
      With only <strong>$339 total spend</strong>, the growth engine generated <strong>558 direct website purchases</strong> across <strong>319,343 impressions</strong> with zero wasted ad budget.
    </p>
  </section>

  <!-- Bento Stats Grid -->
  <section class="bento-grid layer-fg">
    <div class="bento-card hero-card">
      <span class="bento-label">Cost Per Purchase</span>
      <span class="bento-val">$0.61</span>
      <span class="bento-badge">Industry Avg: $18+ · 96% Cheaper</span>
    </div>

    <div class="bento-card">
      <span class="bento-label">Verified Purchases</span>
      <span class="bento-val">558</span>
      <span class="bento-badge">High-Intent Orders</span>
    </div>

    <div class="bento-card">
      <span class="bento-label">Total Ad Spend</span>
      <span class="bento-val">$339<span style="font-size:1.4rem; opacity:0.7;">.13</span></span>
      <span class="bento-badge muted">Efficiency Ratio: 100%</span>
    </div>

    <div class="bento-card">
      <span class="bento-label">Total Impressions</span>
      <span class="bento-val">319.3K</span>
      <span class="bento-badge muted">96,350 Reach</span>
    </div>
  </section>

  <!-- Proof Breakdown & Screenshot -->
  <section class="proof-grid layer-fg">
    <div class="table-container">
      <div class="table-top">
        <div class="table-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Live Ad Set Breakdown
        </div>
        <span class="meta-tag">Meta Ads Manager</span>
      </div>

      <table class="live-table">
        <thead>
          <tr>
            <th>Ad Set / Angle</th>
            <th>Orders</th>
            <th>Reach</th>
            <th>CPA</th>
            <th>Spent</th>
          </tr>
        </thead>
        <tbody>
          <tr class="winner-row">
            <td>⚡ Top Scale Set A</td>
            <td>99 purchases</td>
            <td>21,604</td>
            <td><span class="cost-badge win">$0.43</span></td>
            <td>$42.58</td>
          </tr>
          <tr class="winner-row">
            <td>⚡ Angle Retargeting B</td>
            <td>83 purchases</td>
            <td>12,158</td>
            <td><span class="cost-badge win">$0.55</span></td>
            <td>$45.42</td>
          </tr>
          <tr>
            <td>Offer Testing C</td>
            <td>55 purchases</td>
            <td>9,959</td>
            <td><span class="cost-badge sub1">$0.59</span></td>
            <td>$32.62</td>
          </tr>
          <tr>
            <td>Broad Hook D</td>
            <td>54 purchases</td>
            <td>24,322</td>
            <td><span class="cost-badge sub1">$0.60</span></td>
            <td>$32.31</td>
          </tr>
          <tr>
            <td>UGC Demonstration E</td>
            <td>33 purchases</td>
            <td>19,303</td>
            <td><span class="cost-badge sub1">$0.84</span></td>
            <td>$27.63</td>
          </tr>
          <tr>
            <td>Urgency Surge F</td>
            <td>20 purchases</td>
            <td>10,509</td>
            <td><span class="cost-badge sub1">$0.68</span></td>
            <td>$13.69</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>TOTAL ACQUISITION</td>
            <td>558</td>
            <td>96,350</td>
            <td><span class="cost-badge win" style="font-size:0.85rem;">$0.61</span></td>
            <td>$339.13</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="screenshot-box">
      <div class="screenshot-wrap">
        <div class="screenshot-header">
          <div class="dots">
            <span class="dot-item red"></span>
            <span class="dot-item yellow"></span>
            <span class="dot-item green"></span>
          </div>
          <span class="screenshot-tag">VERIFIED ADS DASHBOARD</span>
        </div>
        <div class="screenshot-frame">
          <img src="data:image/jpeg;base64,${rawJpg}" alt="Meta Ads Manager Live Result">
        </div>
      </div>

      <div class="proof-caption">
        <strong>✔ CAPI & FIRST-PARTY ATTRIBUTION</strong><br>
        Real e-commerce purchases tracked with zero signal loss.
      </div>
    </div>
  </section>

  <!-- Pillars -->
  <section class="pillars-grid layer-fg">
    <div class="pillar-item">
      <span class="pillar-num">01 // CREATIVE SYSTEM</span>
      <h3 class="pillar-heading">Dynamic Hook Velocity</h3>
      <p class="pillar-text">
        Modular UGC & visual angles tested rapidly to capture organic platform affinity and drive high-intent CTR.
      </p>
    </div>

    <div class="pillar-item">
      <span class="pillar-num">02 // TELEMETRY & ATTRIBUTION</span>
      <h3 class="pillar-heading">Full Funnel Tracking</h3>
      <p class="pillar-text">
        Conversions API (CAPI) server-side data pipeline feeding clean purchase signals directly into Meta's delivery algorithm.
      </p>
    </div>

    <div class="pillar-item">
      <span class="pillar-num">03 // LIQUIDITY SCALING</span>
      <h3 class="pillar-heading">Cost-Capped Allocation</h3>
      <p class="pillar-text">
        Systematic budget shifting funneling ad capital exclusively into sub-$0.70 high-converting ad variations.
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="poster-footer layer-fg">
    <div class="cta-left">
      <span class="cta-sub">Ready to scale your store?</span>
      <div class="cta-main">Let's build your brand's growth system.</div>
    </div>

    <div class="cta-right">
      <div class="agency-badge">
        <div class="runner-icon-wrap">
          <img src="data:image/png;base64,${runnerPng}" alt="Orbyt Runner">
        </div>
        <div class="agency-info">
          <span class="agency-info-label">Orbyt Agency</span>
          <span class="agency-info-url">orbyt-henna.vercel.app</span>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// Generate portrait HTML
fs.writeFileSync(path.join(publicDir, 'poster-portrait.html'), getHtml({ width: 1080, height: 1350, isSquare: false }));
// Generate square HTML
fs.writeFileSync(path.join(publicDir, 'poster-square.html'), getHtml({ width: 1200, height: 1200, isSquare: true }));

console.log('Saved poster-portrait.html and poster-square.html!');
