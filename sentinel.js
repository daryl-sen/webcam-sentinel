const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const CAPTURE_INTERVAL = 100;
const DIFF_THRESHOLD = 3000000;
const ALPHA_VALUE = 255;
const ELAPSED_CYCLES_THRESHOLD = 20;
const INDICATOR_LIFESPAN = 10;

const video = document.getElementById("video");
const outputContainer = document.getElementById("output");

const canvas = document.createElement("canvas");
canvas.width = VIDEO_WIDTH;
canvas.height = VIDEO_HEIGHT;
const context = canvas.getContext("2d");

const motionMap = document.getElementById("motionMap");
motionMap.width = VIDEO_WIDTH;
motionMap.height = VIDEO_HEIGHT;
const motionMapCtx = motionMap.getContext("2d");

let previousImageData;
let isTriggered = false;
let indicatorRemainingLifespan = INDICATOR_LIFESPAN;
let elapsedCycles = 0;

const constraints = {
  audio: false,
  video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
};

navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);

function success(stream) {
  const video = document.getElementById("video");
  video.srcObject = stream;
}

function error(error) {
  console.log(error);
}

setInterval(capture, CAPTURE_INTERVAL);

function capture() {
  refreshIndicator();
  context.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  if (!previousImageData) {
    previousImageData = context.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    const currentImageData = context.getImageData(
      0,
      0,
      VIDEO_WIDTH,
      VIDEO_HEIGHT
    );

    getImageDiff(DIFF_THRESHOLD, currentImageData, previousImageData);
    previousImageData = currentImageData;
  }
}

// function createImage(imageUrl) {
//   document.getElementById("output").innerHTML = `<img src="${imageUrl}" />`;
// }

function refreshIndicator() {
  const indicatorContainer = document.getElementById("motion-indicator");

  if (isTriggered && indicatorRemainingLifespan > 0) {
    if (elapsedCycles > ELAPSED_CYCLES_THRESHOLD) {
      indicatorContainer.style.backgroundColor = "red";
    } else {
      indicatorContainer.style.backgroundColor = "yellow";
    }

    indicatorRemainingLifespan--;
    elapsedCycles++;
  }

  if (indicatorRemainingLifespan < 1) {
    indicatorContainer.style.backgroundColor = "green";
    elapsedCycles = 0;
    isTriggered = false;
    indicatorRemainingLifespan = INDICATOR_LIFESPAN;
  }
}

function getImageDiff(imageScoreThreshold, imageData, previousImageData) {
  var imageScore = 0;
  const motionMapData = [];

  for (var i = 0; i < imageData.data.length; i += 4) {
    const rDiff = Math.abs(imageData.data[i] - previousImageData.data[i]);
    const gDiff = Math.abs(
      imageData.data[i + 1] - previousImageData.data[i + 1]
    );
    const bDiff = Math.abs(
      imageData.data[i + 2] - previousImageData.data[i + 2]
    );

    motionMapData.push(...[rDiff, gDiff, bDiff, ALPHA_VALUE]);

    var pixelScore = rDiff + gDiff + bDiff;

    imageScore += pixelScore;
  }

  if (imageScore >= imageScoreThreshold) {
    console.log(imageScore);
    isTriggered = true;
    indicatorRemainingLifespan = INDICATOR_LIFESPAN;

    const constructedImageData = motionMapCtx.createImageData(
      VIDEO_WIDTH,
      VIDEO_HEIGHT
    );
    constructedImageData.data = motionMapData;
    motionMapCtx.putImageData(constructedImageData, 0, 0);
  }
}
