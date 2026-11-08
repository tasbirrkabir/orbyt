const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(__dirname, '..', 'public');
const rawJpg = fs.readFileSync(path.join(publicDir, 'meta-results-raw.jpg')).toString('base64');
const runnerPng = fs.readFileSync(path.join(publicDir, 'runner.png')).toString('base64');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ORBYT — Meta Ads Performance Case Study ($0.61 CPA)</title>
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
      --card-bg: rgba(20, 20, 19, 0.92);
      --card-border: rgba(255, 255, 255, 0.08);
      --primary: #FD5A01;
      --primary-hover: #ff6d18;
      --primary-glow: rgba(253, 90, 1, 0.35);
      --lime: #d6f345;
      --lime-glow: rgba(214, 243, 69, 0.25);
      --text-main: #FAF7F2;
      --text-muted: #8E8D8A;
    }

    body {
      background-color: #040404;
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem 4rem;
      -webkit-font-smoothing: antialiased;
    }

    /* Action bar */
    .action-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 2rem;
      background: #141413;
      padding: 8px 16px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 50;
    }

    .btn {
      background: var(--primary);
      color: #080807;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 0.82rem;
      border: none;
      padding: 8px 18px;
      border-radius: 9999px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #fff;
      box-shadow: none;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    /* THE POSTER (Exact 1080 x 1350 for 4:5 Portrait Feed / LinkedIn / IG) */
    .poster-canvas {
      width: 1080px;
      height: 1350px;
      background: #080807;
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      box-shadow: 
        0 30px 90px -10px rgba(0,0,0,0.95),
        0 0 0 1px rgba(255, 255, 255, 0.09),
        0 0 100px rgba(253, 90, 1, 0.15);
      padding: 56px 60px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      user-select: none;
    }

    /* Ambient Background Effects */
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
      top: -150px;
      right: -100px;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253, 90, 1, 0.22) 0%, rgba(253, 90, 1, 0.05) 50%, transparent 70%);
      filter: blur(40px);
      pointer-events: none;
    }

    .bg-glow-bottom {
      position: absolute;
      bottom: -180px;
      left: -120px;
      width: 550px;
      height: 550px;
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
      padding-bottom: 22px;
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
      gap: 12px;
      margin-top: 10px;
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
      font-size: 3.5rem;
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
      font-size: 1.08rem;
      line-height: 1.55;
      color: #c7c5bf;
      max-width: 860px;
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
      padding: 20px 18px;
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
      margin-bottom: 10px;
    }

    .bento-card.hero-card .bento-label {
      color: #ff9d66;
    }

    .bento-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin-bottom: 12px;
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
      padding: 22px;
    }

    .table-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      font-size: 0.75rem;
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
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .live-table td {
      padding: 7px 12px;
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
      padding: 10px 12px;
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
      height: 26px;
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
      width: 7px;
      height: 7px;
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
      height: 180px;
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
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pillar-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: 0.08em;
    }

    .pillar-heading {
      font-size: 0.92rem;
      font-weight: 700;
      color: #fff;
    }

    .pillar-text {
      font-size: 0.76rem;
      color: var(--text-muted);
      line-height: 1.45;
    }

    /* Footer */
    .poster-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .cta-left {
      display: flex;
      flex-direction: column;
      gap: 3px;
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

    @media print {
      body {
        padding: 0;
        background: #080807;
      }
      .action-bar {
        display: none !important;
      }
      .poster-canvas {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>

  <div class="action-bar">
    <button class="btn" onclick="window.print()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Print / Export PDF
    </button>
    <a href="/orbyt_growth_poster_hd.png" download="ORBYT-Growth-Poster.png" class="btn btn-secondary">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Download HD Image
    </a>
    <a href="/" class="btn btn-secondary">
      ORBYT Website
    </a>
  </div>

  <div class="poster-canvas">
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
              <td><span class="cost-badge win" style="font-size:0.9rem;">$0.61</span></td>
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

  </div>

</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'case-study-poster.html'), htmlContent);
console.log('case-study-poster.html successfully generated with embedded base64 assets!');
