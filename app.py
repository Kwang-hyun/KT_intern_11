import cv2, torch
from flask import Flask, render_template, Response

app = Flask(__name__)

camera = cv2.VideoCapture(0)
sticker = cv2.imread('./static/filter/ryan_transparent.png', cv2.IMREAD_UNCHANGED)

model = torch.hub.load('ultralytics/yolov5', 'custom',
                       path='C:/Users/bbnsa/Downloads/yolov5-20220103T002147Z-001/yolov5/runs/train/yolov5_coco8/weights/best.pt',
                       force_reload=True)

model.conf = 0.2
model.iou = 0.45


def putSticker(img):
    results = model(img, size=416)
    # print(len(results.xyxy[0]))
    if len(results.xyxy[0]) != 0:
        for result in results.xyxy[0]:
            top_left_x = int(result[0])
            top_left_y = int(result[1])
            bottom_right_x = int(result[2])
            bottom_right_y = int(result[3])

            # cv2.rectangle(img, pt1=(top_left_x, top_left_y), pt2=(bottom_right_x, bottom_right_y), color=(0, 255, 0),
            #               thickness=2)

            overlay_img = sticker.copy()
            overlay_img = cv2.resize(overlay_img, dsize=(bottom_right_x - top_left_x, bottom_right_y - top_left_y))

            overlay_alpha = overlay_img[:, :, 3:4] / 255.0
            background_alpha = 1.0 - overlay_alpha

            img[top_left_y:bottom_right_y, top_left_x:bottom_right_x] = overlay_alpha * overlay_img[:, :,
                                                                                        :3] + background_alpha * img[
                                                                                                                 top_left_y:bottom_right_y,
                                                                                                                 top_left_x:bottom_right_x]


def captureFrames():
    while True:
        success, frame = camera.read()
        frame = cv2.flip(frame, 1)
        if not success:
            break
        else:
            putSticker(frame)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video')
def video():
    return Response(captureFrames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True)