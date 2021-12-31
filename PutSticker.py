import cv2, dlib, sys

# video = cv2.VideoCapture('/content/drive/MyDrive/girl.mp4')
video = cv2.VideoCapture(0)
sticker = cv2.imread('./spider_man.png', cv2.IMREAD_UNCHANGED)

detector = dlib.get_frontal_face_detector()

def putSticker(img):
    results = detector(img)
    if (len(results) != 0):
        for result in results:
            top_left_x = result.left()
            top_left_y = result.top()
            bottom_right_x = result.right()
            bottom_right_y = result.bottom()

            cv2.rectangle(img, pt1=(top_left_x, top_left_y), pt2=(bottom_right_x, bottom_right_y), color=(0,255,0), thickness=2)

            overlay_img = sticker.copy()
            overlay_img = cv2.resize(overlay_img, dsize=(bottom_right_x - top_left_x, bottom_right_y - top_left_y))

            overlay_alpha = overlay_img[:, :, 3:4] / 255.0
            background_alpha = 1.0 - overlay_alpha

            img[top_left_y:bottom_right_y, top_left_x:bottom_right_x] = overlay_alpha * overlay_img[:, :, :3] + background_alpha * img[top_left_y:bottom_right_y, top_left_x:bottom_right_x]

while True:
    ret, img = video.read()
    if ret == False:
        break
    # img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.flip(img, 1)
    putSticker(img)
    cv2.imshow("result", img)
    if cv2.waitKey(1) == ord('q'):
        break