var original = new Image();
original.src = "original.jpg";
var origCanvas = document.getElementById("original");
var origCtx = origCanvas.getContext('2d');
original.onload = function() {
  origCanvas.width = original.width;
  origCanvas.height = original.height;
  origCtx.drawImage(original, 0, 0);
  luminosity(document.getElementById("luminosity"));
  average(document.getElementById("average"));
  heatmap(document.getElementById("heatmap"));
}

function luminosity(canvas) {
  let context = canvas.getContext('2d');
  canvas.width = original.width;
  canvas.height = original.height;
  context.drawImage(original, 0, 0);
  let pixelMap = context.getImageData(0, 0, canvas.width, canvas.height);
  context.putImageData(mapGray(pixelMap, (r, g, b) => r*0.21 + g*0.72 + b*0.07), 0, 0);
}

function average(canvas) {
  let context = canvas.getContext('2d');
  canvas.width = original.width;
  canvas.height = original.height;
  context.drawImage(original, 0, 0);
  let pixelMap = context.getImageData(0, 0, canvas.width, canvas.height);
  context.putImageData(mapGray(pixelMap, (r, g, b) => (r + g + b) / 3), 0, 0);
}

function heatmap(canvas) {
  let context = canvas.getContext('2d');
  canvas.width = original.width;
  canvas.height = original.height;
  context.drawImage(original, 0, 0);
  let pixelMap = context.getImageData(0, 0, canvas.width, canvas.height);
  let lumPixelMap = document.getElementById("luminosity").getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
  let avgPixelMap = document.getElementById("average").getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
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
