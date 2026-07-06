const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function sizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawNetwork(time = 0) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const cx = width * 0.5;
  const cy = height * 0.5;
  const unit = Math.min(width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  const points = {
    leftTop: [width * 0.16, height * 0.38],
    leftMid: [width * 0.16, height * 0.5],
    leftLow: [width * 0.16, height * 0.62],
    coreLeft: [width * 0.38, height * 0.5],
    coreRight: [width * 0.62, height * 0.5],
    rightTop: [width * 0.84, height * 0.38],
    rightMid: [width * 0.84, height * 0.5],
    rightLow: [width * 0.84, height * 0.62],
    topAgent: [width * 0.5, height * 0.13],
    priceAgent: [width * 0.78, height * 0.24],
    inventoryAgent: [width * 0.22, height * 0.74],
    retentionAgent: [width * 0.72, height * 0.78],
    bottomLoop: [width * 0.5, height * 0.85],
  };

  const flows = [
    ["leftTop", "coreLeft", "#00d4ff"],
    ["leftMid", "coreLeft", "#156cff"],
    ["leftLow", "coreLeft", "#8b5cff"],
    ["coreRight", "rightTop", "#00b985"],
    ["coreRight", "rightMid", "#00d4ff"],
    ["coreRight", "rightLow", "#f8d84a"],
    ["topAgent", "coreLeft", "#00d4ff"],
    ["priceAgent", "coreRight", "#8b5cff"],
    ["inventoryAgent", "coreLeft", "#00b985"],
    ["retentionAgent", "coreRight", "#ff4fd8"],
  ];

  function curve(from, to, color, index) {
    const [x1, y1] = points[from];
    const [x2, y2] = points[to];
    const bend = (index % 2 === 0 ? 1 : -1) * unit * 0.055;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 + bend;
    const pulse = reducedMotion ? 0.45 : (Math.sin(time * 0.0022 + index * 0.74) + 1) / 2;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, "rgba(255,255,255,0.08)");
    gradient.addColorStop(0.52, color.replace(")", `,${0.34 + pulse * 0.28})`).replace("rgb", "rgba"));
    gradient.addColorStop(1, "rgba(255,255,255,0.08)");

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    const t = reducedMotion ? 0.6 : (time * 0.00018 + index * 0.13) % 1;
    const particleX = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
    const particleY = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
    ctx.beginPath();
    ctx.arc(particleX, particleY, 2.4 + pulse * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.beginPath();
  ctx.ellipse(cx, cy, unit * 0.39, unit * 0.31, -0.18, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(points.rightLow[0], points.rightLow[1]);
  ctx.bezierCurveTo(width * 0.88, height * 0.86, width * 0.2, height * 0.94, points.leftLow[0], points.leftLow[1]);
  ctx.strokeStyle = "rgba(0,212,255,0.24)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  flows.forEach(([from, to, color], index) => {
    curve(from, to, color, index);
  });

  if (!reducedMotion) requestAnimationFrame(drawNetwork);
}

sizeCanvas();
drawNetwork();
window.addEventListener("resize", () => {
  sizeCanvas();
  drawNetwork();
});
