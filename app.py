#pragma warning (disable:4819)
#pragma warning (disable:4996)
import cv2, torch
from flask import Flask, render_template, Response, request
import requests
import time
from flask_mail import *


filterResult = ""

app = Flask(__name__)

app.config["MAIL_SERVER"] = 'smtp.gmail.com'
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = 'jaejunkim12345@gmail.com'
app.config['MAIL_PASSWORD'] = 'vljcscobzfowqfpr'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

mail = Mail(app)


camera = cv2.VideoCapture(1)

model = torch.hub.load('ultralytics/yolov5', 'custom',
                       path='C:/Users/bbnsa/Downloads/yolov5-20220103T002147Z-001/yolov5/runs/train/yolov5_coco8/weights/best.pt',
                       force_reload=True)

model.conf = 0.2
model.iou = 0.45

click = "false"
ifFilter = "false"
age = 0
currentFrame = None
fileName = None



def getAge(img):
    global age
    print("call getAge() function")
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    filename = './static/image/' + timestamp + '.png'
    cv2.imwrite(filename, img)

    client_id = "SwM8GO3q8iK8EhSEibM2"
    client_secret = "veZ4VX97Lb"

    url = "https://openapi.naver.com/v1/vision/face"
    headers = {'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret}

    files = {'image': open(filename, 'rb')}

    response = requests.post(url, headers=headers, files=files)
    result = response.json()

    age = result['faces'][0]['age']['value']
    first_age = int(age[:age.find('~')])
    second_age = int(age[age.find('~')+1:])
    average_age = int((first_age + second_age) / 2)

    print("getAge function called:"+str(average_age))
    age = average_age
    return average_age


def saveImage():
    global currentFrame
    global fileName

    timestamp = time.strftime("%Y%m%d-%H%M%S")
    filename = './static/image/' + timestamp + '.png'
    fileName = timestamp + '.png'
    cv2.imwrite(filename, currentFrame)
    print("here: saveImage()")



def captureFrames():
    global click
    global age
    global filterResult
    global currentFrame

    while True:
        success, frame = camera.read()
        frame = cv2.flip(frame, 1)


        if not success:
            break

        if click == "true":
            age = getAge(frame)
            click = "false"

        if ifFilter == "true":
            putMask(frame)

        ret, buffer = cv2.imencode('.jpg', frame)
        currentFrame = frame
        frame = buffer.tobytes()


        yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


def putMask(img):
    global filterResult
    sticker = cv2.imread('./static/filter/' + filterResult, cv2.IMREAD_UNCHANGED)
    results = model(img, size=416)

    if len(results.xyxy[0]) != 0:
        for result in results.xyxy[0]:
            top_left_x = int(result[0])
            top_left_y = int(result[1])

            bottom_right_x = int(result[2])
            bottom_right_y = int(result[3])

            overlay_img = sticker.copy()
            overlay_img = cv2.resize(overlay_img, dsize=(bottom_right_x - top_left_x, bottom_right_y - top_left_y))

            overlay_alpha = overlay_img[:, :, 3:4] / 255.0
            background_alpha = 1.0 - overlay_alpha

            img[top_left_y:bottom_right_y, top_left_x:bottom_right_x] = overlay_alpha * overlay_img[:, :,
                                                                                        :3] + background_alpha * img[
                                                                                                                 top_left_y:bottom_right_y,
                                                                                                                 top_left_x:bottom_right_x]



@app.route('/video')
def video():
    return Response(captureFrames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/audio')
def audio():
    global filterResult
    audio = "/filter/" + filterResult[:-4] + ".mp3"
    print("audio:"+audio)
    return render_template('index.html', audio=audio)

@app.route('/checkClicked', methods=['POST'])
def checkClicked():
    global click
    print("checkClicked")
    click = request.get_json()['click']
    print(click)
    return 'Success', 200

@app.route('/sendFilter', methods=['POST'])
def sendFilter():
    global ifFilter
    global filterResult
    ifFilter = "true"
    print("sendFilter")
    filterName = request.get_json()['filter']

    filterResult = filterName
    print("filterName:"+filterName)
    print("filterResult:" + filterResult)
    return 'Sucesss', 200


@app.route('/age.html')
def age():
    time.sleep(1)
    global age
    print(age)
    print("age function called:"+str(age))
    return render_template('age.html', age=age)

@app.route("/applyphoto")
def applyphoto():
    global click
    global fileName
    global ifFilter

    saveImage()
    emailaddr = request.args.get('emailaddr')

    msg = Message(subject="11조 십시일반: ChangeU 사진도착", body="이용해주셔서 감사합니다", sender="jaejunkim12345@gmail.com", recipients=[emailaddr])
    print("sending FileName:"+fileName)
    with app.open_resource('./static/image/'+fileName) as fp:
        msg.attach(fileName, "image/png", fp.read())
        mail.send(msg)
        ifFilter = "false"
    return render_template('index.html', audio="None")


@app.route("/returnOrigin")
def returnOrigin():
    global ifFilter
    ifFilter = "false"
    return render_template('index.html', audio="None")


if __name__ == "__main__":
    # app.run(host="172.30.1.2", port=5000, debug=True)
    app.run(debug=True)

