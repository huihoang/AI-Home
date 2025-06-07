import re
import joblib

# Load mô hình đã lưu
action_model = joblib.load('ai_inference/model_voice/action_model.joblib')
device_model = joblib.load('ai_inference/model_voice/device_model.joblib')

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text.strip()

def predict(text):
    text = preprocess(text)
    action = action_model.predict([text])[0]
    device = device_model.predict([text])[0]

    # Kiểm tra xem action và device có hợp lệ không
    if device in ['button-door', 'button-light']:
        if action not in ['ON', 'OFF']:
            action = 'OFF'
    elif device in ['button-fan']:
        if action not in ['0', '1', '2', '3', '4']:
            action = '0'
    else:
        pass

    return {"action": action, "device": device}