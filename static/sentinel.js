const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const CAPTURE_INTERVAL = 100;
const DIFF_THRESHOLD = 5000000;
const ALPHA_VALUE = 255;
const ELAPSED_CYCLES_THRESHOLD = 20;
const INDICATOR_LIFESPAN = 10;
const RESPONSE_COOLDOWN = 50;

const video = document.getElementById("video");
const outputContainer = document.getElementById("output");
const outputText = document.getElementById("motionScoreData");

// virtual canvas to run image diff on
const canvas = document.createElement("canvas");
canvas.width = VIDEO_WIDTH;
canvas.height = VIDEO_HEIGHT;
const context = canvas.getContext("2d");

// motion map that's shown to the user
const motionMap = document.getElementById("motionMap");
motionMap.width = VIDEO_WIDTH;
motionMap.height = VIDEO_HEIGHT;
const motionMapCtx = motionMap.getContext("2d");

let previousImageData;
let isTriggered = false;
let indicatorRemainingLifespan = INDICATOR_LIFESPAN;
let elapsedCycles = 0;
let responseCooldown = 0;
let hasRecentlySentAlert = false;

const constraints = {
  audio: false,
  video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
};

navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);

setInterval(capture, CAPTURE_INTERVAL);

function success(stream) {
  const video = document.getElementById("video");
  video.srcObject = stream;
}

function error(error) {
  console.log(error);
}

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

function refreshIndicator() {
  const indicatorContainer = document.getElementById("motion-indicator");

  if (isTriggered && indicatorRemainingLifespan > 0) {
    if (elapsedCycles > ELAPSED_CYCLES_THRESHOLD) {
      indicatorContainer.style.backgroundColor = "red";
      if (responseCooldown > 0) {
        responseCooldown--;
      } else {
        responseCooldown = RESPONSE_COOLDOWN;
        createAlert();
      }
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
  let imageScore = 0;
  const constructedImageData = motionMapCtx.createImageData(
    VIDEO_WIDTH,
    VIDEO_HEIGHT
  );

  for (let i = 0; i < imageData.data.length; i += 4) {
    const rDiff = Math.abs(imageData.data[i] - previousImageData.data[i]);
    const gDiff = Math.abs(
      imageData.data[i + 1] - previousImageData.data[i + 1]
    );
    const bDiff = Math.abs(
      imageData.data[i + 2] - previousImageData.data[i + 2]
    );

    constructedImageData.data[i] = rDiff;
    constructedImageData.data[i + 1] = gDiff;
    constructedImageData.data[i + 2] = bDiff;
    constructedImageData.data[i + 3] = ALPHA_VALUE;

    imageScore += rDiff + gDiff + bDiff;
  }

  if (imageScore >= imageScoreThreshold) {
    isTriggered = true;
    indicatorRemainingLifespan = INDICATOR_LIFESPAN;
    motionMapCtx.putImageData(constructedImageData, 0, 0);
  } else {
    motionMapCtx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  }

  let outputMessage;

  if (isTriggered && elapsedCycles > ELAPSED_CYCLES_THRESHOLD) {
    outputMessage = "PROLONGED MOTION DETECTED";
  } else if (isTriggered && elapsedCycles <= ELAPSED_CYCLES_THRESHOLD) {
    outputMessage = "MOTION DETECTED";
  } else {
    outputMessage = "NO MOTION DETECTED";
  }

  outputText.innerHTML = `${outputMessage}<br />Diff Score: ${imageScore}, sustained for ${elapsedCycles} cycles of ${CAPTURE_INTERVAL} ms each`;
}

function createAlert() {
  fetch("/api/alert").then((response) => {
    console.log("Alert Sent!");
  });
}
