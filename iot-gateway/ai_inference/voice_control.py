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
    return {"action": action, "device": device}