// =====================================================================
//  prob_sim.js – Xác suất & Thống kê Tương tác
//  Tabs: Đồng xu · Xúc xắc · Biểu đồ tần số · Thống kê mô tả
// =====================================================================

// ── Tab switching ─────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + tab).classList.add('active');
  });
});

// ─────────────────────────────────────────────────────────────────────
//  1. COIN SIMULATION
// ─────────────────────────────────────────────────────────────────────
const coinState = { total: 0, heads: 0, tails: 0, history: [] };

function getCoinCount() { return parseInt(document.getElementById('coinCount').value); }

function flipCoins() {
  const n = getCoinCount();
  let results = [];
  for (let i = 0; i < n; i++) {
    const r = Math.random() < 0.5 ? 'H' : 'T';
    results.push(r);
    if (r === 'H') coinState.heads++; else coinState.tails++;
  }
  coinState.total += n;
  coinState.history.push(...results);
  if (coinState.history.length > 50) coinState.history.splice(0, coinState.history.length - 50);

  // Animate coin displays
  animateCoin('coin1', results[0]);
  if (n === 2) animateCoin('coin2', results[1]);

  updateCoinUI();
}

function animateCoin(id, result) {
  const el = document.getElementById(id);
  el.classList.remove('coin-flip');
  void el.offsetWidth; // reflow
  el.classList.add('coin-flip');
  setTimeout(() => {
    el.classList.remove('coin-flip');
    if (result === 'H') {
      el.className = 'coin-display coin-heads';
      el.textContent = 'Số';
    } else {
      el.className = 'coin-display coin-tails';
      el.textContent = 'Chữ';
    }
  }, 350);
}

function updateCoinUI() {
  document.getElementById('coinTotal').textContent  = coinState.total;
  document.getElementById('coinHeads').textContent  = coinState.heads;
  document.getElementById('coinTails').textContent  = coinState.tails;
  const pct = t => coinState.total > 0 ? (t / coinState.total * 100).toFixed(1) + '%' : '–';
  document.getElementById('coinHeadsPct').textContent = pct(coinState.heads);
  document.getElementById('coinTailsPct').textContent = pct(coinState.tails);

  // History chips
  const hist = document.getElementById('coinHistory');
  hist.innerHTML = coinState.history.map(r =>
    `<div class="hist-chip hist-${r}">${r}</div>`
  ).join('');

  drawCoinChart();
}

function drawCoinChart() {
  const canvas = document.getElementById('coinChart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const bars = [
    { label: 'Mặt Số (H)', count: coinState.heads, color: '#d97706' },
    { label: 'Mặt Chữ (T)', count: coinState.tails, color: '#64748b' },
  ];
  const max = Math.max(...bars.map(b => b.count), 1);
  const pad = { l: 40, r: 20, t: 20, b: 40 };
  const bW = (W - pad.l - pad.r) / bars.length - 20;

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (H - pad.t - pad.b) * i / 4;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(max * (1 - i / 4)), pad.l - 5, y + 4);
  }

  bars.forEach((bar, i) => {
    const x = pad.l + i * ((W - pad.l - pad.r) / bars.length) + 20;
    const barH = (bar.count / max) * (H - pad.t - pad.b);
    const y = H - pad.b - barH;

    const grad = ctx.createLinearGradient(0, y, 0, H - pad.b);
    grad.addColorStop(0, bar.color);
    grad.addColorStop(1, bar.color + '44');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, bW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(bar.label, x + bW / 2, H - pad.b + 14);

    // Value on top
    if (bar.count > 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Inter';
      ctx.fillText(bar.count, x + bW / 2, y - 5);
    }

    // Expected line
    const expected = coinState.total / 2;
    const yExp = H - pad.b - (expected / max) * (H - pad.t - pad.b);
    ctx.strokeStyle = '#10b98166';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad.l, yExp); ctx.lineTo(W - pad.r, yExp); ctx.stroke();
    ctx.setLineDash([]);
  });
}

document.getElementById('coinFlipBtn').addEventListener('click', flipCoins);

document.getElementById('coinMultiBtn').addEventListener('click', () => {
  const n = parseInt(document.getElementById('coinRepeat').value) || 50;
  const count = getCoinCount();
  for (let i = 0; i < n; i++) {
    const results = [];
    for (let j = 0; j < count; j++) {
      const r = Math.random() < 0.5 ? 'H' : 'T';
      results.push(r);
      if (r === 'H') coinState.heads++; else coinState.tails++;
    }
    coinState.total += count;
    coinState.history.push(...results);
  }
  if (coinState.history.length > 50) coinState.history.splice(0, coinState.history.length - 50);
  updateCoinUI();
});

document.getElementById('coinResetBtn').addEventListener('click', () => {
  Object.assign(coinState, { total: 0, heads: 0, tails: 0, history: [] });
  document.getElementById('coin1').className = 'coin-display coin-heads';
  document.getElementById('coin1').textContent = 'Số';
  document.getElementById('coin2').className = 'coin-display coin-heads';
  document.getElementById('coin2').textContent = 'Số';
  updateCoinUI();
});

document.getElementById('coinCount').addEventListener('change', () => {
  const show = getCoinCount() === 2;
  document.getElementById('coin2wrap').style.display = show ? 'block' : 'none';
});

// ─────────────────────────────────────────────────────────────────────
//  2. DICE SIMULATION
// ─────────────────────────────────────────────────────────────────────
const diceState = { total: 0, freq: [0,0,0,0,0,0], history: [] };

// Dot patterns for each face [1..6]: array of grid-area names to show
const DICE_DOTS = {
  1: ['d'],
  2: ['a', 'g'],
  3: ['a', 'd', 'g'],
  4: ['a', 'b', 'f', 'g'],
  5: ['a', 'b', 'd', 'f', 'g'],
  6: ['a', 'b', 'c', 'e', 'f', 'g'],
};
const ALL_AREAS = ['a','b','c','d','e','f','g'];

function getDiceCount() { return parseInt(document.getElementById('diceCount').value); }

function showDiceFace(prefix, val) {
  const on = new Set(DICE_DOTS[val].map(area => `${prefix}${area}`));
  ALL_AREAS.forEach(area => {
    const el = document.getElementById(`${prefix}${area}`);
    if (el) el.style.display = on.has(`${prefix}${area}`) ? 'block' : 'none';
  });
}

function rollDice() {
  const n = getDiceCount();
  const dice = document.getElementById('dice1');
  dice.classList.remove('rolling'); void dice.offsetWidth; dice.classList.add('rolling');

  const results = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(Math.random() * 6) + 1;
    results.push(r);
    diceState.freq[r - 1]++;
  }
  diceState.total += n;
  diceState.history.push(...results);
  if (diceState.history.length > 60) diceState.history.splice(0, diceState.history.length - 60);

  setTimeout(() => {
    dice.classList.remove('rolling');
    showDiceFace('d1', results[0]);
    if (n === 2) showDiceFace('d2', results[1]);
  }, 350);

  updateDiceUI();
}

function updateDiceUI() {
  document.getElementById('diceTotal').textContent = diceState.total;

  const hist = document.getElementById('diceHistory');
  hist.innerHTML = diceState.history.slice(-60).map(r =>
    `<div class="hist-chip hist-d">${r}</div>`
  ).join('');

  // Freq stats
  const container = document.getElementById('diceFreqStats');
  container.innerHTML = diceState.freq.map((cnt, i) => {
    const pct = diceState.total > 0 ? (cnt / diceState.total * 100).toFixed(1) : '0.0';
    const barW = diceState.total > 0 ? (cnt / diceState.total * 100) : 0;
    return `<div style="display:flex;align-items:center;gap:0.5rem;font-size:0.78rem;">
      <span style="width:12px;color:#94a3b8;">⚀⚁⚂⚃⚄⚅`[i]`</span>
      <span style="width:16px;text-align:center;color:#f8fafc;font-weight:700;">${i+1}</span>
      <div style="flex:1;height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">
        <div style="width:${barW}%;height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:4px;transition:width 0.3s;"></div>
      </div>
      <span style="color:#94a3b8;width:50px;text-align:right;">${cnt} (${pct}%)</span>
    </div>`;
  }).join('');

  drawDiceChart();
}

function drawDiceChart() {
  const canvas = document.getElementById('diceChart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const max = Math.max(...diceState.freq, 1);
  const pad = { l: 40, r: 20, t: 20, b: 40 };
  const nBars = 6;
  const gap = 10;
  const bW = (W - pad.l - pad.r - gap * (nBars - 1)) / nBars;
  const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#14b8a6'];

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (H - pad.t - pad.b) * i / 4;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(max * (1 - i / 4)), pad.l - 5, y + 4);
  }

  // Expected line
  if (diceState.total > 0) {
    const expected = diceState.total / 6;
    const yExp = H - pad.b - (expected / max) * (H - pad.t - pad.b);
    ctx.strokeStyle = '#10b98166';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad.l, yExp); ctx.lineTo(W - pad.r, yExp); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#10b981aa';
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Lý thuyết', W - pad.r - 50, yExp - 4);
  }

  diceState.freq.forEach((cnt, i) => {
    const x = pad.l + i * (bW + gap);
    const barH = (cnt / max) * (H - pad.t - pad.b);
    const y = H - pad.b - barH;

    const grad = ctx.createLinearGradient(0, y, 0, H - pad.b);
    grad.addColorStop(0, COLORS[i]);
    grad.addColorStop(1, COLORS[i] + '44');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, bW, barH, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(i + 1, x + bW / 2, H - pad.b + 14);
    if (cnt > 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px Inter';
      ctx.fillText(cnt, x + bW / 2, y - 5);
    }
  });
}

document.getElementById('diceRollBtn').addEventListener('click', rollDice);

document.getElementById('diceMultiBtn').addEventListener('click', () => {
  const n = parseInt(document.getElementById('diceRepeat').value) || 100;
  const count = getDiceCount();
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < count; j++) {
      const r = Math.floor(Math.random() * 6) + 1;
      diceState.freq[r - 1]++;
      diceState.history.push(r);
    }
    diceState.total += count;
  }
  if (diceState.history.length > 60) diceState.history.splice(0, diceState.history.length - 60);
  showDiceFace('d1', Math.floor(Math.random() * 6) + 1);
  updateDiceUI();
});

document.getElementById('diceResetBtn').addEventListener('click', () => {
  Object.assign(diceState, { total: 0, freq: [0,0,0,0,0,0], history: [] });
  showDiceFace('d1', 1);
  showDiceFace('d2', 1);
  updateDiceUI();
});

document.getElementById('diceCount').addEventListener('change', () => {
  const show = getDiceCount() === 2;
  document.getElementById('dice2wrap').style.display = show ? 'block' : 'none';
});

// Init dice display
showDiceFace('d1', 1);
showDiceFace('d2', 1);

// ─────────────────────────────────────────────────────────────────────
//  3. FREQUENCY CHART
// ─────────────────────────────────────────────────────────────────────
const DATASETS = {
  scores: () => Array.from({length:30}, () => Math.floor(Math.random()*5+5)),   // 5-10
  heights: () => Array.from({length:35}, () => Math.round((Math.random()*30+145)*10)/10), // 145-175
  custom: null,
};

let freqData = DATASETS.scores();

function parseCustom(id) {
  return document.getElementById(id).value
    .split(/[\s,;]+/)
    .map(Number)
    .filter(n => !isNaN(n) && n !== '');
}

function computeFreq(data) {
  const min = Math.min(...data), max = Math.max(...data);
  const nBins = Math.max(4, Math.ceil(Math.sqrt(data.length)));
  const binSize = (max - min) / nBins || 1;
  const bins = Array.from({length: nBins}, (_, i) => ({
    label: `${(min + i * binSize).toFixed(1)}–${(min + (i+1) * binSize).toFixed(1)}`,
    count: 0,
  }));
  data.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binSize), nBins - 1);
    bins[idx].count++;
  });
  return { bins, min, max, n: data.length, nBins };
}

function drawFreqChart(data) {
  const {bins, min, max, n, nBins} = computeFreq(data);
  document.getElementById('freqN').textContent    = n;
  document.getElementById('freqMax').textContent  = max.toFixed(1);
  document.getElementById('freqMin').textContent  = min.toFixed(1);
  document.getElementById('freqBins').textContent = nBins;

  const maxCount = Math.max(...bins.map(b => b.count), 1);
  const canvas = document.getElementById('freqChart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pad = { l: 45, r: 20, t: 20, b: 55 };
  const gap = 4;
  const bW = (W - pad.l - pad.r - gap * (nBins - 1)) / nBins;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (H - pad.t - pad.b) * i / 4;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxCount * (1 - i / 4)), pad.l - 5, y + 4);
  }

  // Bars + frequency line points
  const linePoints = [];
  bins.forEach((bin, i) => {
    const x = pad.l + i * (bW + gap);
    const barH = (bin.count / maxCount) * (H - pad.t - pad.b);
    const y = H - pad.b - barH;

    const grad = ctx.createLinearGradient(0, y, 0, H - pad.b);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#3b82f644');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, bW, barH, [4,4,0,0]);
    ctx.fill();

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px Inter';
    ctx.textAlign = 'center';
    ctx.save(); ctx.translate(x + bW/2, H - pad.b + 8); ctx.rotate(-0.5);
    ctx.fillText(bin.label, 0, 0); ctx.restore();

    // Count on top
    if (bin.count > 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(bin.count, x + bW/2, y - 5);
    }

    linePoints.push({ x: x + bW/2, y: H - pad.b - (bin.count / n * (H - pad.t - pad.b) * nBins / 2) });
  });

  // Frequency rate line
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  linePoints.forEach((pt, i) => { i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); });
  ctx.stroke();
  linePoints.forEach(pt => {
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI*2); ctx.fill();
  });

  // Insight
  const modeIdx = bins.reduce((best, b, i) => b.count > bins[best].count ? i : best, 0);
  document.getElementById('freqInsight').innerHTML =
    `Lớp có tần số cao nhất: <strong>${bins[modeIdx].label}</strong> với <strong>${bins[modeIdx].count}</strong> quan sát (${(bins[modeIdx].count/n*100).toFixed(1)}%).`;
}

document.getElementById('freqDataset').addEventListener('change', function () {
  const customArea = document.getElementById('freqCustomData');
  customArea.style.display = this.value === 'custom' ? 'block' : 'none';
});

document.getElementById('freqGenBtn').addEventListener('click', () => {
  const key = document.getElementById('freqDataset').value;
  if (key !== 'custom') { freqData = DATASETS[key](); drawFreqChart(freqData); }
});

document.getElementById('freqDrawBtn').addEventListener('click', () => {
  const key = document.getElementById('freqDataset').value;
  if (key === 'custom') {
    freqData = parseCustom('freqCustomData');
    if (freqData.length < 3) { alert('Cần ít nhất 3 giá trị dữ liệu.'); return; }
  } else {
    freqData = DATASETS[key]();
  }
  drawFreqChart(freqData);
});

// ─────────────────────────────────────────────────────────────────────
//  4. DESCRIPTIVE STATISTICS
// ─────────────────────────────────────────────────────────────────────
const DESC_DATASETS = {
  scores:  () => Array.from({length:30}, () => +(Math.random()*4+6).toFixed(1)),
  heights: () => Array.from({length:35}, () => +(Math.random()*30+145).toFixed(1)),
  wages:   () => Array.from({length:25}, () => +(Math.random()*15+5).toFixed(2)),
  custom:  null,
};

let descData = DESC_DATASETS.scores();

function calcStats(data) {
  const n = data.length;
  const sorted = [...data].sort((a,b) => a-b);
  const mean = data.reduce((s,v)=>s+v,0)/n;
  const median = n%2===0 ? (sorted[n/2-1]+sorted[n/2])/2 : sorted[Math.floor(n/2)];
  const variance = data.reduce((s,v)=>s+(v-mean)**2,0)/n;
  const stdDev = Math.sqrt(variance);
  return { n, mean, median, variance, stdDev, min: sorted[0], max: sorted[n-1], sorted };
}

function drawDescChart(data) {
  const st = calcStats(data);

  // Update stat boxes
  document.getElementById('dsMean').textContent     = st.mean.toFixed(2);
  document.getElementById('dsMedian').textContent   = st.median.toFixed(2);
  document.getElementById('dsVariance').textContent = st.variance.toFixed(2);
  document.getElementById('dsStdDev').textContent   = st.stdDev.toFixed(2);
  document.getElementById('dsMin').textContent      = st.min;
  document.getElementById('dsMax').textContent      = st.max;

  const canvas = document.getElementById('descChart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pad = { l: 50, r: 20, t: 20, b: 40 };
  const range = st.max - st.min || 1;

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();

  // X axis labels
  for (let i = 0; i <= 5; i++) {
    const v = st.min + range * i / 5;
    const x = pad.l + (v - st.min) / range * (W - pad.l - pad.r);
    ctx.fillStyle = '#64748b'; ctx.font = '10px Inter'; ctx.textAlign = 'center';
    ctx.fillText(v.toFixed(1), x, H - pad.b + 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, H-pad.b); ctx.stroke();
  }

  // Scatter dots jittered by index
  data.forEach((v, i) => {
    const x = pad.l + (v - st.min) / range * (W - pad.l - pad.r);
    const y = pad.t + 15 + (i % 12) * 15;
    ctx.fillStyle = '#3b82f699';
    ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI*2); ctx.fill();
  });

  // Mean line (red)
  const xMean = pad.l + (st.mean - st.min) / range * (W - pad.l - pad.r);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([6,3]);
  ctx.beginPath(); ctx.moveTo(xMean, pad.t); ctx.lineTo(xMean, H-pad.b); ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 10px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`x̄=${st.mean.toFixed(1)}`, xMean, pad.t - 5);

  // Median line (green)
  const xMed = pad.l + (st.median - st.min) / range * (W - pad.l - pad.r);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(xMed, pad.t); ctx.lineTo(xMed, H-pad.b); ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Me=${st.median.toFixed(1)}`, xMed, pad.t + 12);
  ctx.setLineDash([]);

  // Std dev band
  const x1 = pad.l + (st.mean - st.stdDev - st.min) / range * (W - pad.l - pad.r);
  const x2 = pad.l + (st.mean + st.stdDev - st.min) / range * (W - pad.l - pad.r);
  ctx.fillStyle = 'rgba(245,158,11,0.06)';
  ctx.fillRect(Math.max(x1, pad.l), pad.t, Math.min(x2, W-pad.r) - Math.max(x1, pad.l), H - pad.t - pad.b);

  document.getElementById('descInsight').innerHTML =
    `Trung bình <strong>${st.mean.toFixed(2)}</strong>, 
     trung vị <strong>${st.median.toFixed(2)}</strong>. 
     Khoảng biến thiên: <strong>${(st.max-st.min).toFixed(2)}</strong>. 
     Dữ liệu phân tán với σ = <strong>${st.stdDev.toFixed(2)}</strong>.`;
}

document.getElementById('descDataset').addEventListener('change', function() {
  document.getElementById('descCustomData').style.display = this.value === 'custom' ? 'block' : 'none';
});

document.getElementById('descGenBtn').addEventListener('click', () => {
  const key = document.getElementById('descDataset').value;
  if (key !== 'custom') { descData = DESC_DATASETS[key](); drawDescChart(descData); }
});

document.getElementById('descCalcBtn').addEventListener('click', () => {
  const key = document.getElementById('descDataset').value;
  if (key === 'custom') {
    descData = parseCustom('descCustomData');
    if (descData.length < 3) { alert('Cần ít nhất 3 giá trị.'); return; }
  } else {
    descData = DESC_DATASETS[key]();
  }
  drawDescChart(descData);
});

// ── Init on load ──────────────────────────────────────────────────────
updateCoinUI();
updateDiceUI();
drawFreqChart(freqData);
drawDescChart(descData);
