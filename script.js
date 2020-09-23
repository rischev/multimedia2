var original = new Image();
original.src = "original.jpg";
var origCanvas = document.getElementById("original");
var origCtx = origCanvas.getContext('2d');
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
  let context = canvas.getContext('2d');
  canvas.width = original.width; canvas.height = original.height;
  context.drawImage(original, 0, 0);
  let pixelMap = context.getImageData(0, 0, canvas.width, canvas.height);
  context.putImageData(mapGray(pixelMap, lambda), 0, 0);
  return pixelMap;
}

function heatmap(canvas) {
  let context = canvas.getContext('2d');
  canvas.width = original.width; canvas.height = original.height;
  context.drawImage(original, 0, 0);
  let pixelMap = context.getImageData(0, 0, canvas.width, canvas.height);
  let lumPixelMap = luminosityC.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  let avgPixelMap = averageC.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  context.putImageData(heatmapCreator(pixelMap, lumPixelMap, avgPixelMap), 0, 0);
}

function heatmapCreator(array, lumPM, avgPM) {
  for (let i = 0; i < array.data.length; i += 4) {
    let diff = Math.abs(lumPM.data[i] - avgPM.data[i]);
    array.data[i] = inbound(diff * 10);
    array.data[i+1] = inbound(255 - diff * 5);
    array.data[i+2] = 0;
  }
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
  let context = canvas.getContext('2d');
  canvas.width = 512; canvas.height = chartHeight;
  for (elem of valMap.keys()) context.fillRect(elem, chartHeight - valMap.get(elem), 2, valMap.get(elem));
}
