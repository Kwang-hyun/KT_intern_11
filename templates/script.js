const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");
let click_button = document.querySelector("#click-photo");
let save_button = document.querySelector("#save-photo");
let canvas = document.querySelector("#canvas");

////////////////////////////////////////////////////// WebCam
// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Enable the live webcam view and start classification.
function enableCam() {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

////////////////////////////////////////////////////// cocoSsd Model Load
// Store the resulting model in the global scope of our app.
var model = undefined;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // Show demo section now model is ready to use.
  demosSection.classList.remove("invisible");

  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will
  // define in the next step.
  if (getUserMediaSupported()) {
    enableCam();
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }
});

////////////////////////////////////////////////////// Image Save
save_button.addEventListener("click", function () {
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  canvasImageSave();
});

function getTime() {
  var today = new Date();
  var year = today.getFullYear();
  var month = ("0" + (today.getMonth() + 1)).slice(-2);
  var day = ("0" + today.getDate()).slice(-2);
  var dateString = year + month + day;

  var hours = ("0" + today.getHours()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);
  var timeString = hours + minutes + seconds;

  return dateString + "-" + timeString;
}

function canvasImageSave() {
  console.log("");
  console.log("[canvasImageSave] : [start]");
  console.log("");

  // 캔버스 아이디 지정 실시
  var canvasID = document.getElementById("canvas");

  // a 태그 생성 실시
  var a = document.createElement("a"); // a 태그 create

  // a 태그 href 속성에 캔버스 data url 지정
  a.href = canvasID.toDataURL();

  // a 태그에 download 속성 지정 실시
  //var fileName = "chartImage.png";
  var fileName = "ChangeU+" + getTime() + ".png";
  a.setAttribute("download", fileName); // a 태그에 다운로드 속성 추가
  // body 영역에 a 태그 추가 실시
  document.body.appendChild(a);

  // a 태그 강제로 클릭 이벤트 발생 및 다운 로드 수행 실시
  a.click(); // 클릭 이벤트를 발생시켜 다운로드

  // body 영역에서 a 태그 다시 삭제 실시
  document.body.removeChild(a);
}

////////////////////////////////////////////////////// prediction
var children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement("p");
        p.innerText =
          predictions[n].class +
          " - with " +
          Math.round(parseFloat(predictions[n].score) * 100) +
          "% confidence.";
        p.style =
          "margin-left: " +
          predictions[n].bbox[0] +
          "px; margin-top: " +
          (predictions[n].bbox[1] - 10) +
          "px; width: " +
          (predictions[n].bbox[2] - 10) +
          "px; top: 0; left: 0;";

        const highlighter = document.createElement("div");
        highlighter.setAttribute("class", "highlighter");
        highlighter.style =
          "left: " +
          predictions[n].bbox[0] +
          "px; top: " +
          predictions[n].bbox[1] +
          "px; width: " +
          predictions[n].bbox[2] +
          "px; height: " +
          predictions[n].bbox[3] +
          "px;";

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);

        aud_play();
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);

    // audio1();
  });
}

// function audio1() {
//   var audio1 = new Audio("1번노래.mp3");
//   audio1.loop = false; // 반복재생하지 않음
//   audio1.volume = 0.2; // 음량 설정
//   audio1.play();
// }
function aud_play() {
  var audio = document.getElementById("audio");

  // running
  if (!audio.paused) {
    if (audio.currentTime > 6) {
      audio.pause();
      console.log("stopped");
    }
    return;
  }

  if (audio.paused) {
    next_order();
    var url = String(idx) + ".mp3";
    console.log(url);

    audio.setAttribute("src", url);
    console.log("changed:" + audio.getAttribute("src"));
    audio.load();
    audio.play();
  }
}

let idx = 0;
function next_order() {
  idx = idx + 1;
  console.log("new idx:" + idx);
  if (idx > 3) idx = 1;
}
