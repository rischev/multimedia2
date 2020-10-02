var original = new Image();
original.src = "original.jpg";
var origCanvas = document.getElementById("original");
var origCtx = origCanvas.getContext("2d");
var luminosityC, averageC, chartHeight = 460;

original.onload = function() {
  luminosityC = document.getElementById("luminosity");
  averageC = document.getElementById("average");
  origCanvas.width = original.width; origCanvas.height = original.height;
  origCtx.drawImage(original, 0, 0);
  let luminosityData = filter(luminosityC, (r, g, b) => r*0.21 + g*0.72 + b*0.07);
  filter(averageC, (r, g, b) => (r + g + b) / 3);
  heatmap(document.getElementById("heatmap"));
  histogram(document.getElementById("histogram"), normalizedPixelCount(luminosityData));
}

function filter(canvas, lambda) {
  let context = canvas.getContext("2d");
  canvas.width = original.width; canvas.height = original.height;
  context.drawImage(original, 0, 0);
  let pixelMap = context.getImageData(0, 0, canvas.width, canvas.height);
  context.putImageData(mapGray(pixelMap, lambda), 0, 0);
  return pixelMap;
}

function heatmap(canvas) {
  let context = canvas.getContext("2d");
  canvas.width = original.width; canvas.height = original.height;
  context.drawImage(original, 0, 0);
  let pixelMap = context.getImageData(0, 0, canvas.width, canvas.height);
  let lumPixelMap = luminosityC.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  let avgPixelMap = averageC.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
  context.putImageData(heatmapCreator(pixelMap, lumPixelMap, avgPixelMap), 0, 0);
}

function heatmapCreator(array, lumPM, avgPM) {
  let canvas = document.getElementById("desc");
  let ctx = canvas.getContext("2d");
  let maxred = 0;
  let green = 0;
  let mingreen = 255;
  let red = 0;
  for (let i = 0; i < array.data.length; i += 4) {
    let diff = Math.abs(lumPM.data[i] - avgPM.data[i]);
    array.data[i] = inbound(diff * 5);
    array.data[i+1] = inbound(255 - diff * 3);
    array.data[i+2] = 0;
    if (diff > maxred) {
      maxred = Math.max(maxred, diff);
      green = inbound(255 - diff * 3);
    }
    if (diff < mingreen) {
      mingreen = Math.min(mingreen, diff);
      red = inbound(diff * 5);
    }
  }
  let max = Math.floor(array.data.reduce((acc, cur) => Math.max(acc, cur)) * 0.75);
  let grd = ctx.createLinearGradient(0, 0, 200, 0);
  document.getElementById("left").innerHTML = "0";
  document.getElementById("right").innerHTML = maxred.toString();
  grd.addColorStop(0, "#00ff00");
  grd.addColorStop(1, rgbToHex(inbound(maxred * 5), green, 0), 0);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 200, 20);
  return array;
}

function mapGray(array, method) {
  for (let i = 0; i < array.data.length; i += 4) {
    let gray = method(array.data[i], array.data[i+1], array.data[i+2]);
    array.data[i] = gray;
    array.data[i+1] = gray;
    array.data[i+2] = gray;
  }
  return array;
}

function inbound(val) {
  if (val > 255) return 255;
  if (val < 0) return 0;
  return val;
}

function normalizedPixelCount(array) {
  let hist = new Map();
  for (let i = 0; i < 256; i++) hist.set(i, 0);
  for (let i = 0; i < array.data.length; i += 4) hist.set(array.data[i], hist.get(array.data[i]) + 1);
  let maximum = Array.from(hist.values()).reduce((acc, cur) => Math.max(acc, cur));
  for (let i = 0; i < 256; i += 1) hist.set(i, Math.round(hist.get(i) / maximum * chartHeight));
  return hist;
}

function histogram(canvas, valMap) {
  let context = canvas.getContext("2d");
  canvas.width = 512; canvas.height = chartHeight;
  for (elem of valMap.keys()) context.fillRect(elem, chartHeight - valMap.get(elem), 2, valMap.get(elem));
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
