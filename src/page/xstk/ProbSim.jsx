import React, { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/PageLayout";

const DICE_DOTS = {
  1: ["d"],
  2: ["a", "g"],
  3: ["a", "d", "g"],
  4: ["a", "b", "f", "g"],
  5: ["a", "b", "d", "f", "g"],
  6: ["a", "b", "c", "e", "f", "g"],
};
const DICE_AREAS = ["a", "b", "c", "d", "e", "f", "g"];

const FREQ_DATASETS = {
  scores: () =>
    Array.from({ length: 30 }, () => Math.floor(Math.random() * 5 + 5)),
  heights: () =>
    Array.from(
      { length: 35 },
      () => Math.round((Math.random() * 30 + 145) * 10) / 10,
    ),
  custom: null,
};

const DESC_DATASETS = {
  scores: () =>
    Array.from({ length: 30 }, () => +(Math.random() * 4 + 6).toFixed(1)),
  heights: () =>
    Array.from({ length: 35 }, () => +(Math.random() * 30 + 145).toFixed(1)),
  wages: () =>
    Array.from({ length: 25 }, () => +(Math.random() * 15 + 5).toFixed(2)),
  custom: null,
};

function parseCustomInput(value) {
  return value
    .split(/[\s,;]+/)
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
}

function computeFreq(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const nBins = Math.max(4, Math.ceil(Math.sqrt(data.length)));
  const binSize = max - min === 0 ? 1 : (max - min) / nBins;
  const bins = Array.from({ length: nBins }, (_, i) => ({
    label: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
    count: 0,
  }));

  data.forEach((value) => {
    const idx = Math.min(Math.floor((value - min) / binSize), nBins - 1);
    bins[idx].count++;
  });

  return {
    bins,
    min,
    max,
    n: data.length,
    nBins,
  };
}

function calcStats(data) {
  const n = data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((sum, value) => sum + value, 0) / n;
  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
  const variance =
    data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  return {
    n,
    mean,
    median,
    variance,
    stdDev,
    min: sorted[0],
    max: sorted[n - 1],
    sorted,
  };
}

function drawCoinChart(canvas, coinState) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const bars = [
    { label: "Mặt số (N)", count: coinState.heads, color: "#d97706" },
    { label: "M?t Chữ (S)", count: coinState.tails, color: "#64748b" },
  ];
  const max = Math.max(1, ...bars.map((bar) => bar.count));
  const pad = { l: 40, r: 20, t: 20, b: 40 };
  const bW = (W - pad.l - pad.r) / bars.length - 20;

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.t + ((H - pad.t - pad.b) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = "10px Inter";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(max * (1 - i / 4)), pad.l - 5, y + 4);
  }

  bars.forEach((bar, i) => {
    const x = pad.l + i * ((W - pad.l - pad.r) / bars.length) + 20;
    const barH = (bar.count / max) * (H - pad.t - pad.b);
    const y = H - pad.b - barH;
    const grad = ctx.createLinearGradient(0, y, 0, H - pad.b);
    grad.addColorStop(0, bar.color);
    grad.addColorStop(1, `${bar.color}44`);
    ctx.fillStyle = grad;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, bW, barH, [4, 4, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, bW, barH);
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Inter";
    ctx.textAlign = "center";
    ctx.fillText(bar.label, x + bW / 2, H - pad.b + 14);

    if (bar.count > 0) {
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px Inter";
      ctx.fillText(bar.count, x + bW / 2, y - 5);
    }

    const expected = coinState.total / 2;
    const yExp = H - pad.b - (expected / max) * (H - pad.t - pad.b);
    ctx.strokeStyle = "#10b98166";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, yExp);
    ctx.lineTo(W - pad.r, yExp);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function drawDiceChart(canvas, diceState) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const max = Math.max(1, ...diceState.freq);
  const pad = { l: 40, r: 20, t: 20, b: 40 };
  const gap = 10;
  const bW = (W - pad.l - pad.r - gap * 5) / 6;
  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#14b8a6",
  ];

  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.t + ((H - pad.t - pad.b) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = "10px Inter";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(max * (1 - i / 4)), pad.l - 5, y + 4);
  }

  if (diceState.total > 0) {
    const expected = diceState.total / 6;
    const yExp = H - pad.b - (expected / max) * (H - pad.t - pad.b);
    ctx.strokeStyle = "#10b98166";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.l, yExp);
    ctx.lineTo(W - pad.r, yExp);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#10b981aa";
    ctx.font = "10px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Lý thuyết", W - pad.r - 50, yExp - 4);
  }

  diceState.freq.forEach((cnt, i) => {
    const x = pad.l + i * (bW + gap);
    const barH = (cnt / max) * (H - pad.t - pad.b);
    const y = H - pad.b - barH;
    const grad = ctx.createLinearGradient(0, y, 0, H - pad.b);
    grad.addColorStop(0, COLORS[i]);
    grad.addColorStop(1, `${COLORS[i]}44`);
    ctx.fillStyle = grad;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, bW, barH, [4, 4, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, bW, barH);
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Inter";
    ctx.textAlign = "center";
    ctx.fillText(i + 1, x + bW / 2, H - pad.b + 14);
    if (cnt > 0) {
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 10px Inter";
      ctx.fillText(cnt, x + bW / 2, y - 5);
    }
  });
}

function drawFreqChart(canvas, data, setStats) {
  if (!canvas || data.length === 0) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { bins, min, max, n, nBins } = computeFreq(data);
  const maxCount = Math.max(...bins.map((bin) => bin.count), 1);
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pad = { l: 45, r: 20, t: 20, b: 55 };
  const gap = 4;
  const bW = (W - pad.l - pad.r - gap * (nBins - 1)) / nBins;

  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.t + ((H - pad.t - pad.b) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(W - pad.r, y);
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(maxCount * (1 - i / 4)), pad.l - 5, y + 4);
  }

  const linePoints = [];
  bins.forEach((bin, i) => {
    const x = pad.l + i * (bW + gap);
    const barH = (bin.count / maxCount) * (H - pad.t - pad.b);
    const y = H - pad.b - barH;
    const grad = ctx.createLinearGradient(0, y, 0, H - pad.b);
    grad.addColorStop(0, "#3b82f6");
    grad.addColorStop(1, "#3b82f644");
    ctx.fillStyle = grad;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, bW, barH, [4, 4, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, bW, barH);
    }

    ctx.fillStyle = "#64748b";
    ctx.font = "9px Inter";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(x + bW / 2, H - pad.b + 8);
    ctx.rotate(-0.5);
    ctx.fillText(bin.label, 0, 0);
    ctx.restore();

    if (bin.count > 0) {
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 11px Inter";
      ctx.textAlign = "center";
      ctx.fillText(bin.count, x + bW / 2, y - 5);
    }

    linePoints.push({
      x: x + bW / 2,
      y: H - pad.b - (bin.count / n) * (((H - pad.t - pad.b) * nBins) / 2),
    });
  });

  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  ctx.beginPath();
  linePoints.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  linePoints.forEach((point) => {
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const modeIndex = bins.reduce(
    (best, bin, idx) => (bin.count > bins[best].count ? idx : best),
    0,
  );
  setStats({
    n,
    max: max.toFixed(1),
    min: min.toFixed(1),
    bins: nBins,
    insight: `Tần số cao nhất: <strong>${bins[modeIndex].label}</strong> với <strong>${bins[modeIndex].count}</strong> quan sát (${((bins[modeIndex].count / n) * 100).toFixed(1)}%).`,
  });
}

function drawDescChart(canvas, data, setStats) {
  if (!canvas || data.length === 0) return;
  const st = calcStats(data);
  setStats({
    mean: st.mean.toFixed(2),
    median: st.median.toFixed(2),
    variance: st.variance.toFixed(2),
    stdDev: st.stdDev.toFixed(2),
    min: st.min,
    max: st.max,
    insight: `Trung bình <strong>${st.mean.toFixed(2)}</strong>, trung vị <strong>${st.median.toFixed(2)}</strong>. Khoảng biến thiên: <strong>${(st.max - st.min).toFixed(2)}</strong>. Dữ liệu phân bố với s = <strong>${st.stdDev.toFixed(2)}</strong>.`,
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pad = { l: 50, r: 20, t: 20, b: 40 };
  const range = st.max - st.min || 1;

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t);
  ctx.lineTo(pad.l, H - pad.b);
  ctx.lineTo(W - pad.r, H - pad.b);
  ctx.stroke();

  for (let i = 0; i <= 5; i += 1) {
    const value = st.min + (range * i) / 5;
    const x = pad.l + ((value - st.min) / range) * (W - pad.l - pad.r);
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter";
    ctx.textAlign = "center";
    ctx.fillText(value.toFixed(1), x, H - pad.b + 14);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.moveTo(x, pad.t);
    ctx.lineTo(x, H - pad.b);
    ctx.stroke();
  }

  data.forEach((value, index) => {
    const x = pad.l + ((value - st.min) / range) * (W - pad.l - pad.r);
    const y = pad.t + 15 + (index % 12) * 15;
    ctx.fillStyle = "rgba(59,130,246,0.6)";
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const xMean = pad.l + ((st.mean - st.min) / range) * (W - pad.l - pad.r);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.moveTo(xMean, pad.t);
  ctx.lineTo(xMean, H - pad.b);
  ctx.stroke();
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 10px Inter";
  ctx.textAlign = "center";
  ctx.fillText(`x̄=${st.mean.toFixed(1)}`, xMean, pad.t - 5);

  const xMed = pad.l + ((st.median - st.min) / range) * (W - pad.l - pad.r);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(xMed, pad.t);
  ctx.lineTo(xMed, H - pad.b);
  ctx.stroke();
  ctx.fillStyle = "#10b981";
  ctx.fillText(`Me=${st.median.toFixed(1)}`, xMed, pad.t + 12);
  ctx.setLineDash([]);

  const x1 =
    pad.l + ((st.mean - st.stdDev - st.min) / range) * (W - pad.l - pad.r);
  const x2 =
    pad.l + ((st.mean + st.stdDev - st.min) / range) * (W - pad.l - pad.r);
  ctx.fillStyle = "rgba(245,158,11,0.06)";
  ctx.fillRect(
    Math.max(x1, pad.l),
    pad.t,
    Math.min(x2, W - pad.r) - Math.max(x1, pad.l),
    H - pad.t - pad.b,
  );
}

export default function ProbSim() {
  const [tab, setTab] = useState("coin");
  const [coinCount, setCoinCount] = useState(1);
  const [coinRepeat, setCoinRepeat] = useState(50);
  const [coinState, setCoinState] = useState({
    total: 0,
    heads: 0,
    tails: 0,
    history: [],
  });
  const [coinFaces, setCoinFaces] = useState({ one: "N", two: "N" });
  const [coinAnimating, setCoinAnimating] = useState(false);

  const [diceCount, setDiceCount] = useState(1);
  const [diceRepeat, setDiceRepeat] = useState(100);
  const [diceState, setDiceState] = useState({
    total: 0,
    freq: [0, 0, 0, 0, 0, 0],
    history: [],
  });
  const [diceFaces, setDiceFaces] = useState({ one: 1, two: 1 });
  const [diceRolling, setDiceRolling] = useState(false);

  const [freqDataset, setFreqDataset] = useState("scores");
  const [freqCustomData, setFreqCustomData] = useState("");
  const [freqStats, setFreqStats] = useState({
    n: 0,
    max: "",
    min: "",
    bins: "",
    insight:
      "Chuẩn bị dữ liệu với nhiều biểu đồ tần số khác nhau để xem các đặc điểm thống kê.",
  });
  const [freqData, setFreqData] = useState(FREQ_DATASETS.scores());

  const [descDataset, setDescDataset] = useState("scores");
  const [descCustomData, setDescCustomData] = useState("");
  const [descStats, setDescStats] = useState({
    mean: "",
    median: "",
    variance: "",
    stdDev: "",
    min: "",
    max: "",
    insight: "Chuẩn bị dữ liệu với nhiều thống kê mô tả khác nhau để xem các đặc điểm thống kê.",
  });
  const [descData, setDescData] = useState(DESC_DATASETS.scores());

  const coinChartRef = useRef(null);
  const diceChartRef = useRef(null);
  const freqChartRef = useRef(null);
  const descChartRef = useRef(null);

  useEffect(() => {
    drawCoinChart(coinChartRef.current, coinState);
  }, [coinState]);

  useEffect(() => {
    drawDiceChart(diceChartRef.current, diceState);
  }, [diceState]);

  useEffect(() => {
    drawFreqChart(freqChartRef.current, freqData, setFreqStats);
  }, [freqData]);

  useEffect(() => {
    drawDescChart(descChartRef.current, descData, setDescStats);
  }, [descData]);

  const updateCoinResults = (results, animate = false) => {
    const heads = results.filter((r) => r === "N").length;
    const tails = results.length - heads;
    setCoinState((prev) => ({
      total: prev.total + results.length,
      heads: prev.heads + heads,
      tails: prev.tails + tails,
      history: [...prev.history, ...results].slice(-50),
    }));
    setCoinFaces({
      one: results[0] ?? coinFaces.one,
      two: results[1] ?? coinFaces.two,
    });

    if (animate) {
      setCoinAnimating(true);
      window.setTimeout(() => setCoinAnimating(false), 450);
    }
  };

  const flipCoins = () => {
    const results = Array.from({ length: coinCount }, () =>
      Math.random() < 0.5 ? "N" : "S",
    );
    updateCoinResults(results, true);
  };

  const flipCoinsMany = () => {
    const allResults = [];
    for (let i = 0; i < coinRepeat; i += 1) {
      for (let j = 0; j < coinCount; j += 1) {
        allResults.push(Math.random() < 0.5 ? "N" : "S");
      }
    }
    updateCoinResults(allResults, false);
  };

  const resetCoins = () => {
    setCoinAnimating(false);
    setCoinFaces({ one: "N", two: "N" });
    setCoinState({ total: 0, heads: 0, tails: 0, history: [] });
  };

  const updateDiceResults = (results, animate = false) => {
    setDiceState((prev) => {
      const freq = [...prev.freq];
      results.forEach((value) => {
        freq[value - 1] += 1;
      });
      return {
        total: prev.total + results.length,
        freq,
        history: [...prev.history, ...results].slice(-60),
      };
    });
    setDiceFaces({
      one: results[0] ?? diceFaces.one,
      two: results[1] ?? diceFaces.two,
    });

    if (animate) {
      setDiceRolling(true);
      window.setTimeout(() => setDiceRolling(false), 450);
    }
  };

  const rollDice = () => {
    const results = Array.from(
      { length: diceCount },
      () => Math.floor(Math.random() * 6) + 1,
    );
    updateDiceResults(results, true);
  };

  const rollDiceMany = () => {
    const allResults = [];
    for (let i = 0; i < diceRepeat; i += 1) {
      for (let j = 0; j < diceCount; j += 1) {
        allResults.push(Math.floor(Math.random() * 6) + 1);
      }
    }
    updateDiceResults(allResults, false);
  };

  const resetDice = () => {
    setDiceRolling(false);
    setDiceFaces({ one: 1, two: 1 });
    setDiceState({ total: 0, freq: [0, 0, 0, 0, 0, 0], history: [] });
  };

  const handleFreqDatasetChange = (value) => {
    setFreqDataset(value);
    if (value !== "custom") {
      setFreqCustomData("");
      setFreqData(FREQ_DATASETS[value]());
    }
  };

  const generateFreqData = () => {
    if (freqDataset === "custom") {
      const parsed = parseCustomInput(freqCustomData);
      if (parsed.length < 3) {
        alert("Cập nhập 3 giá trị dữ liệu");
        return;
      }
      setFreqData(parsed);
      return;
    }
    setFreqData(FREQ_DATASETS[freqDataset]());
  };

  const drawFreq = () => {
    if (freqDataset === "custom") {
      const parsed = parseCustomInput(freqCustomData);
      if (parsed.length < 3) {
        alert("Cập nhập 3 giá trị dữ liệu");
        return;
      }
      setFreqData(parsed);
      return;
    }
    setFreqData(FREQ_DATASETS[freqDataset]());
  };

  const handleDescDatasetChange = (value) => {
    setDescDataset(value);
    if (value !== "custom") {
      setDescCustomData("");
      setDescData(DESC_DATASETS[value]());
    }
  };

  const generateDescData = () => {
    if (descDataset === "custom") {
      const parsed = parseCustomInput(descCustomData);
      if (parsed.length < 3) {
        alert("Cập nhập 3 giá trị dữ liệu");
        return;
      }
      setDescData(parsed);
      return;
    }
    setDescData(DESC_DATASETS[descDataset]());
  };

  const calculateDesc = () => {
    if (descDataset === "custom") {
      const parsed = parseCustomInput(descCustomData);
      if (parsed.length < 3) {
        alert("Cập nhập 3 giá trị dữ liệu");
        return;
      }
      setDescData(parsed);
      return;
    }
    setDescData(DESC_DATASETS[descDataset]());
  };

  const renderDiceFace = (value) => (
    <div className={`dice-display ${diceRolling ? "rolling" : ""}`}>
      {DICE_AREAS.map((area) => (
        <div
          key={area}
          className="dot"
          style={{
            gridArea: area,
            display: DICE_DOTS[value].includes(area) ? "block" : "none",
          }}
        />
      ))}
    </div>
  );

  return (
    <PageLayout>
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "coin" ? "active" : ""}`} data-tab="coin" onClick={() => setTab("coin")}>
          🪙 Đồng xu
        </button>
        <button className={`tab-btn ${tab === "dice" ? "active" : ""}`}  data-tab="dice" onClick={() => setTab("dice")}>
          🎲 Xúc xắc
        </button>
        <button className={`tab-btn ${tab === "freq" ? "active" : ""}`} data-tab="freq" onClick={() => setTab("freq")}>
          📊 Biểu đồ tần số
        </button>
        <button className={`tab-btn ${tab === "desc" ? "active" : ""}`} data-tab="desc" onClick={() => setTab("desc")}>
          📐 Thống kê mô tả
        </button>
      </div>

      {tab === "coin" && (
        <div id="panel-coin" className="tab-panel active">
          <div className="simulation-container">
            <div className="canvas-panel">
              <h3 style={{ fontSize: "1.1rem", alignSelf: "flex-start" }}>
                🪙 Mô phỏng đồng xu
              </h3>

              <div className="coin-row">
                <div style={{ textAlign: "center" }}>
                  <div
                    id="coin1"
                    className={`coin-display ${coinFaces.one === "N" ? "coin-heads" : "coin-tails"} ${coinAnimating ? "coin-flip" : ""}`}
                  >
                    {coinFaces.one === "S" ? "S" : "N"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      marginTop: "0.4rem",
                    }}
                  >
                    Đồng xu 1
                  </div>
                </div>

                {coinCount === 2 && (
                  <div style={{ textAlign: "center" }} id="coin2wrap">
                    <div
                      id="coin2"
                      className={`coin-display ${coinFaces.two === "S" ? "coin-heads" : "coin-tails"} ${coinAnimating ? "coin-flip" : ""}`}
                    >
                      {coinFaces.two === "S" ? "Số" : "Chữ"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginTop: "0.4rem",
                      }}
                    >
                      Đồng xu 2
                    </div>
                  </div>
                )}
              </div>

              <div className="run-row">
                <button
                  className="btn-action btn-primary"
                  type="button"
                  id="coinFlipBtn"
                  onClick={flipCoins}
                >
                 🪙 Tung 1 lần
                </button>
                <input
                  type="number"
                  className="num-input btn-open"
                  id="coinRepeat"
                  value={coinRepeat}
                  min={1}
                  max={1000}
                  title="Số lần tung"
                  onChange={(e) => setCoinRepeat(Number(e.target.value) || 1)}
                />
                <button
                  className="btn-secondary"
                  type="button"
                  id="coinMultiBtn"
                  onClick={flipCoinsMany}
                >
                  Tung nhiều lần
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  id="coinResetBtn"
                  onClick={resetCoins}
                >
                 ↺ Đặt lại
                </button>
              </div>

              <div style={{ width: "100%" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Lịch sử gần nhất (50 lần)
                </div>
                <div className="history-bar" id="coinHistory">
                  {coinState.history.map((value, index) => (
                    <div key={index} className={`hist-chip hist-${value}`}>
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              <canvas
                ref={coinChartRef}
                id="coinChart"
                width={440}
                height={180}
              />
            </div>

            <div className="control-panel">
              <div>
                <span className="grade-badge">Lớp 6-9</span>
                <h3
                  style={{
                    fontSize: "1rem",
                    marginTop: "0.6rem",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Thống kê
                </h3>
              </div>

              <div className="stat-grid">
                <div className="stat-box">
                  <div className="label">Số lần tung</div>
                  <div className="value" id="coinTotal">
                    {coinState.total}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Mặt ngửa (N)</div>
                  <div
                    className="value"
                    id="coinHeads"
                    style={{ color: "#fbbf24" }}
                  >
                    {coinState.heads}
                  </div>
                  <div className="sub" id="coinHeadsPct">
                    {coinState.total > 0
                      ? `${((coinState.heads / coinState.total) * 100).toFixed(1)}%`
                      : "�"}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Mặt sấp (S)</div>
                  <div
                    className="value"
                    id="coinTails"
                    style={{ color: "#94a3b8" }}
                  >
                    {coinState.tails}
                  </div>
                  <div className="sub" id="coinTailsPct">
                    {coinState.total > 0
                      ? `${((coinState.tails / coinState.total) * 100).toFixed(1)}%`
                      : "�"}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Số đồng xu</div>
                  <select
                    id="coinCount"
                    value={coinCount}
                    onChange={(e) => setCoinCount(Number(e.target.value))}
                 className="select-control" style={{padding:"0.25rem 0.5rem", backgroundColor: "var(--bg-color)"}}
                  >
                    <option value={1}>1 xu</option>
                    <option value={2}>2 xu</option>
                  </select>
                </div>
              </div>

              <div className="formula-box">
                <div className="fl">Công thức xác suất</div>
                P(sự kiện) = <strong>số kết quả thuận lợi</strong> / <strong>tổng số kết quả</strong>

                <br/> P(S) = P(N) = 1/2 = <strong>0.5</strong>
              </div>
              <div className="info-box">
                <strong>Quy luật số lớn:</strong> Khi số lần tung tăng, tần suất xuất hiện mặt Số và mặt Chữ sẽ tiệm cận về <strong>50%</strong> — đây là nền tảng của xác suất thực nghiệm.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "dice" && (
        <div id="panel-dice" className="tab-panel active">
          <div className="simulation-container">
            <div className="canvas-panel">
              <h3 style={{ fontSize: "1.1rem", alignSelf: "flex-start" }}>
              🎲 Mô phỏng xúc xắc
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    id="dice1"
                    className={`dice-display ${diceRolling ? "rolling" : ""}`}
                  >
                    {DICE_AREAS.map((area) => (
                      <div
                        key={`d1-${area}`}
                        className="dot"
                        style={{
                          gridArea: area,
                          display: DICE_DOTS[diceFaces.one].includes(area)
                            ? "block"
                            : "none",
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      marginTop: "0.4rem",
                    }}
                  >
                    Xúc xắc 1
                  </div>
                </div>

                {diceCount === 2 && (
                  <div style={{ textAlign: "center" }} id="dice2wrap">
                    <div
                      id="dice2"
                      className={`dice-display ${diceRolling ? "rolling" : ""}`}
                    >
                      {DICE_AREAS.map((area) => (
                        <div
                          key={`d2-${area}`}
                          className="dot"
                          style={{
                            gridArea: area,
                            display: DICE_DOTS[diceFaces.two].includes(area)
                              ? "block"
                              : "none",
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginTop: "0.4rem",
                      }}
                    >
                      Xúc xắc 2
                    </div>
                  </div>
                )}
              </div>

              <div className="run-row">
                <button
                  className="btn-primary btn-action"
                  type="button"
                  id="diceRollBtn"
                  onClick={rollDice}
                >
                 🎲  Gieo 1 lần
                </button>
                <input
                  type="number"
                  className="num-input"
                  id="diceRepeat"
                  value={diceRepeat}
                  min={1}
                  max={5000}
                  title="Số lần gieo"
                  onChange={(e) => setDiceRepeat(Number(e.target.value) || 1)}
                />
                <button
                  className="btn-secondary"
                  type="button"
                  id="diceMultiBtn"
                  onClick={rollDiceMany}
                >
                  Gieo nhiều lần
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  id="diceResetBtn"
                  onClick={resetDice}
                >
                  Đặt lại
                </button>
              </div>

              <div style={{ width: "100%" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Lịch sử gần nhất
                </div>
                <div className="history-bar" id="diceHistory">
                  {diceState.history.map((value, index) => (
                    <div key={index} className="hist-chip hist-d">
                      {value}
                    </div>
                  ))}
                </div>
              </div>

              <canvas
                ref={diceChartRef}
                id="diceChart"
                width={440}
                height={200}
              />
            </div>

            <div className="control-panel">
              <div>
                <span className="grade-badge">Lớp 6-9</span>
                <h3
                  style={{
                    fontSize: "1rem",
                    marginTop: "0.6rem",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Thống kê
                </h3>
              </div>

              <div className="stat-grid">
                <div className="stat-box">
                  <div className="label">Số lần gieo</div>
                  <div className="value" id="diceTotal">
                    {diceState.total}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Số xúc xắc</div>
                  <select
                    id="diceCount"
                    value={diceCount}
                    onChange={(e) => setDiceCount(Number(e.target.value))}
                    className="select-control"
                    style={{
                      background: "transparent",
                      
                    }}
                  >
                    <option value={1}>1 xúc xắc</option>
                    <option value={2}>2 xúc xắc</option>
                  </select>
                </div>
              </div>

              <div
                id="diceFreqStats"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {diceState.freq.map((count, index) => {
                  const pct =
                    diceState.total > 0
                      ? ((count / diceState.total) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      <span style={{ width: "12px", color: "#94a3b8" }}>
                  
                      </span>
                      <span
                        style={{
                          width: "16px",
                          textAlign: "center",
                          color: "#f8fafc",
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "8px",
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background:
                              "linear-gradient(90deg,#3b82f6,#8b5cf6)",
                            borderRadius: "4px",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          width: "50px",
                          textAlign: "right",
                          color: "#94a3b8",
                        }}
                      >
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="formula-box">
                <div className="fl">Xác suất lý thuyết</div>
                P(mặt k) = 1/6 = <strong>16.67%</strong>
                <br />
                P(tổng = n) tùy theo số xúc xắc
              </div>
              <div className="info-box">
                <strong>Thí nghiệm:</strong> Khi bạn gieo 600 lần, mỗi mặt số
                xuất hiện khoảng <strong>100 lần</strong>. Biểu đồ tần số tiệm
                cận phân phối đều sẽ minh họa rõ ràng xác suất có thể xảy ra.
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "freq" && (
        <div id="panel-freq" className="tab-panel active">
          <div className="simulation-container">
            <div className="canvas-panel">
              <h3 style={{ fontSize: "1.1rem", alignSelf: "flex-start" }}>
              📊  Biểu đồ tần số và tần suất
              </h3>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    id="freqDataset"
                    className="num-input select-control"
                    style={{ width: "auto" }}
                    value={freqDataset}
                    onChange={(e) => handleFreqDatasetChange(e.target.value)}
                  >
                    <option value="scores">Điểm kiểm tra (30 HS)</option>
                    <option value="heights">Chiều cao học sinh (cm)</option>
                    <option value="custom">Nhập tùy chỉnh</option>
                  </select>
                  <button
                    className="btn-secondary"
                    type="button"
                    id="freqGenBtn"
                    onClick={generateFreqData}
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <textarea
                  id="freqCustomData"
                  rows={2}
                  style={{
                    display: freqDataset === "custom" ? "block" : "none",
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.4rem",
                    color: "var(--text-primary)",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.85rem",
                    resize: "vertical",
                  }}
                  placeholder="Nhập dữ liệu cách nhau bằng dấu phẩy: 5, 7, 8, 6, 9, ..."
                  value={freqCustomData}
                  onChange={(e) => setFreqCustomData(e.target.value)}
                />
                <button
                  className="btn-primary btn-open btn-action"
                  type="button"
                  id="freqDrawBtn"
                  onClick={drawFreq}
                  style={{ alignSelf: "flex-start" }}
                >
                📊  Vẽ biểu đồ
                </button>
              </div>

              <canvas
                ref={freqChartRef}
                id="freqChart"
                width={500}
                height={280}
              />

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>
                  <span style={{ color: "#3b82f6" }}>■</span> Tần số
                </span>
                <span>
                  <span style={{ color: "#10b981" }}>●</span> Tần suất (%)
                </span>
              </div>
            </div>

            <div className="control-panel">
              <div>
                <span className="grade-badge">Lớp 6-9</span>
                <h3
                  style={{
                    fontSize: "1rem",
                    marginTop: "0.6rem",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  Tổng kết
                </h3>
              </div>
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="label">Số quan sát</div>
                  <div className="value" id="freqN">
                    {freqStats.n}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Giá trị lớn nhất</div>
                  <div className="value" id="freqMax">
                    {freqStats.max}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Giá trị nhỏ nhất</div>
                  <div className="value" id="freqMin">
                    {freqStats.min}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Số lớp (bins)</div>
                  <div className="value" id="freqBins">
                    {freqStats.bins}
                  </div>
                </div>
              </div>

              <div className="formula-box">
                <div className="fl">Tần suất = Tần số / n</div>f<sub>i</sub> = n
                <sub>i</sub> / n 100%
              </div>

              <div
                className="info-box"
                id="freqInsight"
                dangerouslySetInnerHTML={{ __html: freqStats.insight }}
              />
            </div>
          </div>
        </div>
      )}

      {tab === "desc" && (
        <div id="panel-desc" className="tab-panel active">
          <div className="simulation-container">
            <div className="canvas-panel">
              <h3 style={{ fontSize: "1.1rem", alignSelf: "flex-start" }}>
               📐  Thống kê mô tả
              </h3>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    id="descDataset"
                    className="num-input select-control"
                    style={{ width: "auto" }}
                    value={descDataset}
                    onChange={(e) => handleDescDatasetChange(e.target.value)}
                  >
                    <option value="scores">Điểm kiểm tra (30 HS)</option>
                    <option value="heights">Chiều cao học sinh</option>
                    <option value="wages">Lương nhân viên (triệu)</option>
                    <option value="custom">Nhập tùy chỉnh</option>
                  </select>
                  <button
                    className="btn-secondary"
                    type="button"
                    id="descGenBtn"
                    onClick={generateDescData}
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <textarea
                  id="descCustomData"
                  rows={2}
                  style={{
                    display: descDataset === "custom" ? "block" : "none",
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.4rem",
                    color: "var(--text-primary)",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.85rem",
                    resize: "vertical",
                  }}
                  placeholder="Nh?p d? li?u c�ch nhau b?ng d?u ph?y"
                  value={descCustomData}
                  onChange={(e) => setDescCustomData(e.target.value)}
                />
                <button
                  className="btn-primary btn-action btn-open"
                  type="button"
                  id="descCalcBtn"
                  onClick={calculateDesc}
                  style={{ alignSelf: "flex-start" }}
                >
                  📐 Tính toán
                </button>
              </div>

              <canvas
                ref={descChartRef}
                id="descChart"
                width={500}
                height={320}
              />

              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
               Biểu đồ phân tán điểm dữ liệu · Đường đỏ = Trung bình · Đường xanh = Trung vị
              </div>
            </div>

            <div className="control-panel">
              <div>
                <span className="grade-badge">Lớp 8-12</span>
                <h3
                  style={{
                    fontSize: "1rem",
                    marginTop: "0.6rem",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  📊 Kết quả
                </h3>
              </div>
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="label">Trung bình (x̄)</div>
                  <div className="value" id="dsMean">
                    {descStats.mean}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Trung vị (Me)</div>
                  <div className="value" id="dsMedian">
                    {descStats.median}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Phương sai (s²)</div>
                  <div className="value" id="dsVariance">
                    {descStats.variance}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Độ lệch chuẩn (s)</div>
                  <div className="value" id="dsStdDev">
                    {descStats.stdDev}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Min</div>
                  <div className="value" id="dsMin">
                    {descStats.min}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Max</div>
                  <div className="value" id="dsMax">
                    {descStats.max}
                  </div>
                </div>
              </div>

              <div className="formula-box">
                <div className="fl">Công thức</div>
                x̄ = Σxi / n
                <br />
                s² = Σ(xi - x̄)² / n
                <br />s = √s²
              </div>

              <div
                className="info-box"
                id="descInsight"
                dangerouslySetInnerHTML={{ __html: descStats.insight }}
              />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
