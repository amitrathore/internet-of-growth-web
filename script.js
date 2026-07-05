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
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.36;
  const nodes = 7;

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (let ring = 0; ring < 4; ring += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (0.38 + ring * 0.21), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.05 + ring * 0.015})`;
    ctx.stroke();
  }

  const points = Array.from({ length: nodes }, (_, index) => {
    const drift = reducedMotion ? 0 : time * 0.00022;
    const angle = (index / nodes) * Math.PI * 2 - Math.PI / 2 + drift;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      angle,
    };
  });

  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const pulse = reducedMotion ? 0.5 : (Math.sin(time * 0.002 + index) + 1) / 2;
    const gradient = ctx.createLinearGradient(point.x, point.y, next.x, next.y);
    gradient.addColorStop(0, `rgba(23,105,255,${0.22 + pulse * 0.35})`);
    gradient.addColorStop(1, `rgba(0,168,120,${0.12 + pulse * 0.22})`);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.quadraticCurveTo(cx, cy, next.x, next.y);
    ctx.strokeStyle = gradient;
    ctx.stroke();
  });

  points.forEach((point, index) => {
    const pulse = reducedMotion ? 0.5 : (Math.sin(time * 0.003 + index * 1.7) + 1) / 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = index % 3 === 0 ? "#00a878" : index % 3 === 1 ? "#1769ff" : "#7c4dff";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  if (!reducedMotion) requestAnimationFrame(drawNetwork);
}

sizeCanvas();
drawNetwork();
window.addEventListener("resize", () => {
  sizeCanvas();
  drawNetwork();
});
