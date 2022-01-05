// 실행화면에서 프레임 이미지를 클릭했을 때 발생하는 함수.
// 순차적으로 실행되지 않는 javascript 특성 때문에 callback 코드를 사용하여,\
// callback 인자로 들어온 sendData()함수부터 먼저 처리하고
// showPopup() 함수를 처리한다.
function InOrderCall(callback){
    console.log("get into a InOrderCall(callback)");
    showPopup();
    callback();
}

// 1. app.py 플라스크 서버에 프론트에서 클릭 이벤트가 발생했음을 알리기 위한 코드
// 2. 서버의 '/checkClicked' 루트로 들어가 click 변수를 true로 바꿔줍니다.
/////////// 2번이 끝나고 app.py 서버에서는 클릭이벤트를 인식한 순간의 프레임을 가지고 나이를 판별
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

// sendData()가 완료되고 난 뒤 호출되는 함수
// 서버에서 age 판별이 완료된 후 나이에 맞는 필터를 선택하는 창으로 이동
function showPopup() {
    console.log("front of the showPopup()");
    location.href = "age.html";
}

