var original = document.getElementById("originalPic")
var origCanvas = document.getElementById("original");
var origCtx = origCanvas.getContext('2d');
original.onload = function() {
  origCanvas.width = original.width;
  origCanvas.height = original.height;
  origCtx.drawImage(original, 0, 0);
  luminosity(document.getElementById("luminosity"));
  average(document.getElementById("average"));
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

function mapGray(array, method) {
  for (let i = 0; i < array.data.length; i += 4) {
    let gray = method(array.data[i], array.data[i+1], array.data[i+2]);
    array.data[i] = gray;
    array.data[i+1] = gray;
    array.data[i+2] = gray;
  }
  return array;
}
