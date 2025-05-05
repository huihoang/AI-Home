from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

# Bước 1: Dữ liệu
data = [
    # -------- FAN --------
    ("bật quạt", ("ON", "button-fan")),
    ("tắt quạt", ("OFF", "button-fan")),
    ("mở quạt", ("ON", "button-fan")),
    ("đóng quạt", ("OFF", "button-fan")),
    ("trời nóng quá, bật quạt lên", ("ON", "button-fan")),
    ("trời lạnh quá, bật quạt lên", ("OFF", "button-fan")),
    ("cho quạt chạy đi", ("ON", "button-fan")),
    ("làm ơn bật quạt", ("ON", "button-fan")),
    ("quạt lên!", ("ON", "button-fan")),
    ("ngừng quạt", ("OFF", "button-fan")),
    ("tắt cái quạt đó đi", ("OFF", "button-fan")),
    ("cho quạt ngừng chạy", ("OFF", "button-fan")),
    ("quạt off", ("OFF", "button-fan")),
    ("quạt on", ("ON", "button-fan")),
    ("rút điện quạt", ("OFF", "button-fan")),
    ("cắm điện quạt", ("ON", "button-fan")),
    ("điều khiển cho quạt chạy", ("ON", "button-fan")),
    ("điều khiển cho quạt tắt", ("OFF", "button-fan")),

    ("turn on the fan", ("ON", "button-fan")),
    ("switch the fan on", ("ON", "button-fan")),
    ("please turn on the fan", ("ON", "button-fan")),
    ("turn off the fan", ("OFF", "button-fan")),
    ("switch off fan", ("OFF", "button-fan")),

    # -------- LIGHT / LED --------
    ("bật đèn", ("ON", "button-led")),
    ("tắt đèn", ("OFF", "button-led")),
    ("bật bóng điện", ("ON", "button-led")),
    ("tắt bóng điện", ("OFF", "button-led")),
    ("bật điện lên", ("ON", "button-led")),
    ("tắt điện đi", ("OFF", "button-led")),
    ("mở đèn", ("ON", "button-led")),
    ("đóng đèn", ("OFF", "button-led")),
    ("ngắt đèn", ("OFF", "button-led")),
    ("bật cái đèn kia", ("ON", "button-led")),
    ("tối quá, bật đèn đi", ("ON", "button-led")),
    ("cho đèn sáng lên", ("ON", "button-led")),
    ("sáng lên!", ("ON", "button-led")),
    ("tắt cái đèn đó", ("OFF", "button-led")),
    ("đèn tắt đi", ("OFF", "button-led")),

    ("Lumos", ("ON", "button-led")),
    ("Nox", ("ON", "button-led")),
    ("turn on the light", ("ON", "button-led")),
    ("switch on light", ("ON", "button-led")),
    ("turn off the light", ("OFF", "button-led")),
    ("switch the light off", ("OFF", "button-led")),

    # -------- CAMERA --------
    # ("bật camera", ("ON", "camera")),
    # ("mở camera", ("ON", "camera")),
    # ("camera on", ("ON", "camera")),
    # ("tắt camera", ("OFF", "camera")),
    # ("camera off", ("OFF", "camera")),
    # ("ngắt camera", ("OFF", "camera")),

    # ("turn on the camera", ("ON", "camera")),
    # ("turn off the camera", ("OFF", "camera")),

    # -------- DOOR --------
    ("mở cửa", ("ON", "button-door")),
    ("đóng cửa", ("OFF", "button-door")),
    ("bật cửa", ("ON", "button-door")),
    ("tắt cửa", ("OFF", "button-door")),
    ("open the door", ("ON", "button-door")),
    ("close the door", ("OFF", "button-door")),
    ("tiễn khách", ("OFF", "button-door")),
]

texts = [text for text, _ in data]
actions = [label[0] for _, label in data]
devices = [label[1] for _, label in data]

# Bước 2: Train 2 mô hình
action_model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', LogisticRegression())
])
action_model.fit(texts, actions)
joblib.dump(action_model, './action_model.joblib')

device_model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', LogisticRegression())
])
device_model.fit(texts, devices)
joblib.dump(device_model, './device_model.joblib')