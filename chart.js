/**
 * Canvas-based charting for the prey-predator simulator.
 * Draws time-series and phase-space plots.
 */

var PREY_COLOR = '#2e86de';
var PREDATOR_COLOR = '#e74c3c';
var PHASE_COLOR = '#6c5ce7';
var GRID_COLOR = '#ecf0f1';
var AXIS_COLOR = '#b2bec3';
var LABEL_COLOR = '#636e72';

/**
 * Set up a canvas for high-DPI rendering.
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D}
 */
function setupCanvas(canvas) {
  var rect = canvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

/**
 * Compute nice axis bounds and tick spacing.
 * @param {number} maxVal
 * @returns {{ max: number, step: number }}
 */
function niceScale(maxVal) {
  if (maxVal <= 0) return { max: 10, step: 2 };
  var magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  var residual = maxVal / magnitude;
  var niceMax, step;
  if (residual <= 1.5) {
    niceMax = 1.5 * magnitude;
    step = 0.25 * magnitude;
  } else if (residual <= 3) {
    niceMax = 3 * magnitude;
    step = 0.5 * magnitude;
  } else if (residual <= 5) {
    niceMax = 5 * magnitude;
    step = 1 * magnitude;
  } else if (residual <= 7) {
    niceMax = 7.5 * magnitude;
    step = 1.5 * magnitude;
  } else {
    niceMax = 10 * magnitude;
    step = 2 * magnitude;
  }
  return { max: niceMax, step: step };
}

/**
 * Draw the time-series chart (prey & predator vs time).
 * @param {HTMLCanvasElement} canvas
 * @param {{ t: number[], x: number[], y: number[] }} data
 */
function drawTimeChart(canvas, data) {
  var ctx = setupCanvas(canvas);
  var rect = canvas.getBoundingClientRect();
  var W = rect.width;
  var H = rect.height;

  var pad = { top: 15, right: 20, bottom: 40, left: 55 };
  var plotW = W - pad.left - pad.right;
  var plotH = H - pad.top - pad.bottom;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Data bounds
  var tMax = data.t[data.t.length - 1];
  var maxPop = 0;
  for (var i = 0; i < data.x.length; i++) {
    if (data.x[i] > maxPop) maxPop = data.x[i];
    if (data.y[i] > maxPop) maxPop = data.y[i];
  }
  var yScale = niceScale(maxPop);
  var tScale = niceScale(tMax);

  // Mapping functions
  function mapX(t) { return pad.left + (t / tScale.max) * plotW; }
  function mapY(v) { return pad.top + plotH - (v / yScale.max) * plotH; }

  // Grid
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  for (var v = 0; v <= yScale.max; v += yScale.step) {
    var yy = mapY(v);
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(pad.left + plotW, yy);
    ctx.stroke();
  }
  for (var t = 0; t <= tScale.max; t += tScale.step) {
    var xx = mapX(t);
    ctx.beginPath();
    ctx.moveTo(xx, pad.top);
    ctx.lineTo(xx, pad.top + plotH);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = AXIS_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Tick labels
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (var t = 0; t <= tScale.max; t += tScale.step) {
    ctx.fillText(formatNum(t), mapX(t), pad.top + plotH + 16);
  }
  ctx.textAlign = 'right';
  for (var v = 0; v <= yScale.max; v += yScale.step) {
    ctx.fillText(formatNum(v), pad.left - 6, mapY(v) + 4);
  }

  // Axis labels
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Temps', pad.left + plotW / 2, H - 4);
  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Població', 0, 0);
  ctx.restore();

  // Downsample for performance
  var step = Math.max(1, Math.floor(data.t.length / 2000));

  // Draw prey line
  drawLine(ctx, data.t, data.x, mapX, mapY, PREY_COLOR, step);
  // Draw predator line
  drawLine(ctx, data.t, data.y, mapX, mapY, PREDATOR_COLOR, step);

  // Legend
  drawLegend(ctx, W, pad, [
    { label: 'Presa (x)', color: PREY_COLOR },
    { label: 'Depredador (y)', color: PREDATOR_COLOR }
  ]);
}

/**
 * Draw the phase-space chart (y vs x).
 * @param {HTMLCanvasElement} canvas
 * @param {{ t: number[], x: number[], y: number[] }} data
 */
function drawPhaseChart(canvas, data) {
  var ctx = setupCanvas(canvas);
  var rect = canvas.getBoundingClientRect();
  var W = rect.width;
  var H = rect.height;

  var pad = { top: 15, right: 20, bottom: 40, left: 55 };
  var plotW = W - pad.left - pad.right;
  var plotH = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  var maxX = 0, maxY = 0;
  for (var i = 0; i < data.x.length; i++) {
    if (data.x[i] > maxX) maxX = data.x[i];
    if (data.y[i] > maxY) maxY = data.y[i];
  }
  var xScale = niceScale(maxX);
  var yScaleP = niceScale(maxY);

  function mapX(v) { return pad.left + (v / xScale.max) * plotW; }
  function mapY(v) { return pad.top + plotH - (v / yScaleP.max) * plotH; }

  // Grid
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  for (var v = 0; v <= yScaleP.max; v += yScaleP.step) {
    var yy = mapY(v);
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(pad.left + plotW, yy);
    ctx.stroke();
  }
  for (var v = 0; v <= xScale.max; v += xScale.step) {
    var xx = mapX(v);
    ctx.beginPath();
    ctx.moveTo(xx, pad.top);
    ctx.lineTo(xx, pad.top + plotH);
    ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = AXIS_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Tick labels
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (var v = 0; v <= xScale.max; v += xScale.step) {
    ctx.fillText(formatNum(v), mapX(v), pad.top + plotH + 16);
  }
  ctx.textAlign = 'right';
  for (var v = 0; v <= yScaleP.max; v += yScaleP.step) {
    ctx.fillText(formatNum(v), pad.left - 6, mapY(v) + 4);
  }

  // Axis labels
  ctx.fillStyle = LABEL_COLOR;
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Presa (x)', pad.left + plotW / 2, H - 4);
  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Depredador (y)', 0, 0);
  ctx.restore();

  // Draw trajectory
  var step = Math.max(1, Math.floor(data.x.length / 2000));
  ctx.strokeStyle = PHASE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mapX(data.x[0]), mapY(data.y[0]));
  for (var i = step; i < data.x.length; i += step) {
    ctx.lineTo(mapX(data.x[i]), mapY(data.y[i]));
  }
  ctx.stroke();

  // Start point
  ctx.fillStyle = '#00b894';
  ctx.beginPath();
  ctx.arc(mapX(data.x[0]), mapY(data.y[0]), 5, 0, 2 * Math.PI);
  ctx.fill();

  // End point
  ctx.fillStyle = '#d63031';
  ctx.beginPath();
  var lastI = data.x.length - 1;
  ctx.arc(mapX(data.x[lastI]), mapY(data.y[lastI]), 5, 0, 2 * Math.PI);
  ctx.fill();

  // Legend
  drawLegend(ctx, W, pad, [
    { label: 'Inici', color: '#00b894' },
    { label: 'Final', color: '#d63031' }
  ]);
}

/* ---- Helpers ---- */

function drawLine(ctx, tArr, vArr, mapX, mapY, color, step) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mapX(tArr[0]), mapY(vArr[0]));
  for (var i = step; i < tArr.length; i += step) {
    ctx.lineTo(mapX(tArr[i]), mapY(vArr[i]));
  }
  ctx.stroke();
}

function drawLegend(ctx, W, pad, items) {
  var x = pad.left + 8;
  var y = pad.top + 4;
  ctx.font = '11px system-ui, sans-serif';
  for (var i = 0; i < items.length; i++) {
    ctx.fillStyle = items[i].color;
    ctx.fillRect(x, y + i * 18, 12, 12);
    ctx.fillStyle = LABEL_COLOR;
    ctx.textAlign = 'left';
    ctx.fillText(items[i].label, x + 16, y + i * 18 + 10);
  }
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  if (n === Math.floor(n)) return n.toString();
  if (n < 1) return n.toFixed(2);
  return n.toFixed(1);
}
