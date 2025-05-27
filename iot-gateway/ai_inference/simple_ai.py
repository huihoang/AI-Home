from keras.models import load_model
import cv2  # opencv-python
import numpy as np
import base64
from datetime import datetime
from ai_inference.mongo_db.put_image_mongo import *
from datetime import datetime, timezone

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the model
model = load_model("ai_inference/model_camera/keras_Model.h5", compile=False)

# Load the labels
class_names = ["Have person", "Not have person"]

# CAMERA can be 0 or 1 based on default camera of your computer
camera = cv2.VideoCapture(0)

def image_detector(user_id: str):
    # Grab the webcamera's image.
    ret, image = camera.read()

    # Kiểm tra nếu chụp thành công
    if not ret or image is None:
        print("❌ Không thể chụp ảnh! Kiểm tra camera.")
        return None  # Dừng hàm nếu lỗi

    # Resize the raw image into (height, width) pixels
    image = cv2.resize(image, (224, 224), interpolation=cv2.INTER_AREA)

    # Show the image in a window
    cv2.imshow("Webcam Image", image)

    # Listen to the keyboard for presses. giá trị 0 thì đợi mãi, còn giá trị khác thì đợi N ms
    # keyboard_input = cv2.waitKey(1) & 0xFF # get 8 bits of the key pressed

    # 27 is the ASCII for the "esc" key on your keyboard.
    # if keyboard_input == 27:
    #     camera.release()
    #     cv2.destroyAllWindows()
    
    createdAt = datetime.now(timezone.utc).isoformat() # Lấy thời gian hiện tại

    # save the image to a folder
    # filename = f"./image/{createdAt}.jpg"
    # cv2.imwrite(filename, image)

    # Chuyển ảnh thành dạng bytes (JPEG)
    _, buffer = cv2.imencode('.jpg', image)
    # Mã hóa thành Base64
    encoded_string = base64.b64encode(buffer).decode('utf-8')

    # Make the image a numpy array and reshape it to the models input shape.
    image = np.asarray(image, dtype=np.float32).reshape(1, 224, 224, 3)
    
    # Normalize the image array
    image = (image / 127.5) - 1

    # Predicts the model
    prediction = model.predict(image)
    index = np.argmax(prediction)
    class_name = class_names[index]
    confidence_score = prediction[0][index]

    # Print prediction and confidence score
    confidence_score = str(confidence_score * 100)
    print("\n🧠 Classification AI: ", class_name, end=" - ")
    print("Confidence Score: ", confidence_score, "%")

    # upload image to MongoDB
    upload_image(encoded_string, createdAt, class_name, confidence_score, user_id)
    return f"{class_name} - {confidence_score}%"
