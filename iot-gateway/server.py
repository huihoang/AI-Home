import cv2
import threading
import flask
from flask import Response
from pyngrok import ngrok

app = flask.Flask(__name__)

# Mở camera
camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Mở Flask server trên cổng 5000
def run_flask():
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True, use_reloader=False)

# Chạy Flask trong luồng riêng
flask_thread = threading.Thread(target=run_flask)
flask_thread.start()

# Mở Ngrok tunnel
public_url = ngrok.connect(5000).public_url
print(f"🔗 LINK STREAM CAMERA: {public_url}/video_feed")
