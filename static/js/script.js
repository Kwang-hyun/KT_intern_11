//import gigagenie from "https://svcapi.gigagenie.ai/sdk/v1.0/js/gigagenie.js";

const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");
let click_button = document.querySelector("#click-photo");
let save_button = document.querySelector("#save-photo");
let canvas = document.querySelector("#canvas");
let title;
let flag = true;


window.onload = function(){
//    document.onclick = function(){
//        InOrderCall(sendData());
//    }
//    init();
};

function InOrderCall(callback){
    showPopup();
    callback();
}

function sendData(){
        console.log("front of the sendData()");
// send click event to server
        let myData = {
            "click": "true"
        };

        const init = {
            method: "POST",
            body: JSON.stringify(myData),
            headers: {
              "Content-Type": "application/json"
            },
            credentials : "same-origin"
        }
        fetch('/checkClicked', init)
            .then(response => {
                // 첫번째 then
                if(response.status === 200){
                  return response.json()
                } else {
                  console.log(response.statusText);
                }
            })
            .then(jsonData => {
                alert(jsonData['msg']);
            })

        console.log("end of the sendData()");
}


function showPopup() {
    console.log("front of the showPopup()");
//    var newWindow = window.open("age.html", "Age", "width=400, height=300, left=100, top=50");
    location.href = "age.html";
}

function sendEmail(){
    let emailAddress = prompt("이메일을 입력해주세요");
    alert("메일을 보냈습니다!");
}

///////////////////////////////////////////////////// GIGA JENNI

//var apistatus=0;
//var options={};
//var ws;
//var status='NI';
//var appid;
//var containerid;
//var wsstate=0;
//var initstate=0;
//var authcode;
//
//function init(){
//	options={};
//	options.apikey="RTUwMDQzOTF8R0JPWERFVk18MTY0MTI2MjA4NDExNA=="; // api key given from developer portal
//	options.keytype="GBOXDEVM"; // 개발자모드를 설정하고 사용하세요.
//        //options.keytype="GBOXCOMM"; // 개발자센터에서 승인이 되어야 사용하실 수 있습니다.
//
//	gigagenie.init(options,function(result_cd,result_msg,extra){
//		if(result_cd===200){
//			status='IS';
//			console.log('Initialize Success');
//			startNineNine();
//		};
//	});
//
//}
//
//gigagenie.voice.onRequestClose=function(){
//	options={};
//	gigagenie.voice.svcFinished(options,function(result_cd,result_msg,extra){
//
//	});
//};
//
//function startNineNine(){
//	var options={};
//	var numbers=getNumber();
//	options.voicemsg='안녕하세요 체인지유';
//	var solution='사진 찍어줘';
//
//	gigagenie.voice.getVoiceText(options,function(result_cd,result_msg,extra){
//		if(result_cd===200){
//			console.log(extra.voicetext+':'+solution);
//			if(extra.voicetext===solution){
//				alert("네 알겠습니다.");
//                InOrderCall(sendData());
//			} else {
//				alert("틀렸습니다.");
//			}
//		} else {
//			alert("다시해보세요");
//		}
//		// startNineNine();
//	});
//};
//










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
//save_button.addEventListener("click", function () {
//  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
//  canvasImageSave();
//});

function saveCanvas(){

    if(!flag) return;
    else{
        flag = false;
    }

    console.log("");
    console.log("[canvasImageSave] : [start]");
    console.log("");

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    // 캔버스 아이디 지정 실시
    var canvasID = document.getElementById("canvas");

    // a 태그 생성 실시
    var a = document.createElement("a"); // a 태그 create
    // a 태그 href 속성에 캔버스 data url 지정
        a.href = canvasID.toDataURL();

    var dataURL = canvasID.toDataURL();

    // a 태그에 download 속성 지정 실시
    //var fileName = "chartImage.png";
    var fileName = "ChangeU+" + getTime() + ".png";
    title = fileName;

   // a 태그에 다운로드 속성 추가
    a.setAttribute("download", fileName);
    // body 영역에 a 태그 추가 실시
    document.body.appendChild(a);

    // a 태그 강제로 클릭 이벤트 발생 및 다운 로드 수행 실시
    a.click(); // 클릭 이벤트를 발생시켜 다운로드

    // body 영역에서 a 태그 다시 삭제 실시
    document.body.removeChild(a);

    flag=true;
}


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

  });
}


////////////////////////////////////////////////////// audio

//function aud_play() {
//
//    var audioURL = {{ audio|tojson }};
//    console.log(audioURL);
//    var audio = document.getElementById("audio");
//    var url = "../static/filter/"+audioURL;
//    console.log(url);
//
//    audio.setAttribute("src", url);
//    console.log("changed:" + audio.getAttribute("src"));
//
//    audio.load();
//    audio.play();
//}

