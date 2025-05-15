import sys
from Adafruit_IO import MQTTClient
from ai_inference.simple_ai import image_detector
from ai_inference.voice_control import predict
import os
from dotenv import load_dotenv
import serial.tools.list_ports

#================================================================================================
# Nhận tham số là 1 user_Id
if len(sys.argv) < 2:
    print("❌ Thiếu tham số!")
    sys.exit(1)
user_Id = sys.argv[1]
print(f"🔄 Khởi động IotGateway của user có id là: {user_Id}")

#================================================================================================
# Thông tin kết nối với Adafruit IO
load_dotenv()
AIO_FEED_IDS = ["SENSOR_CAMERA", "SENSOR_MOTION", "LOG_VOICE", "BUTTON_DOOR", "BUTTON_LED", "BUTTON_FAN"]
ADAFRUIT_USERNAME = os.getenv('ADAFRUIT_USERNAME')
AIO_KEY = os.getenv('AIO_KEY')

#================================================================================================
# Các hàm callback
def connected(client):
    print("✅ Ket noi server thanh cong...")
    for topic in AIO_FEED_IDS:
        client.subscribe(topic)
 
def subscribe(client , userdata , mid , granted_qos):
    print("✅ Subscribe feed thanh cong...")

def disconnected(client):
    print("❌ Ngat ket noi server...")
    sys.exit (1)
 
def message(client , feed_id , payload):
    print("\n🗯️ Nhan du lieu tu feed " + feed_id + ": " + payload)
    # ser.write((str(payload) + "#").encode())

    #! detect person enter home
    if feed_id == "SENSOR_MOTION":
        if payload == "True":
            print("⚠️ Motion detected!")
            class_name = image_detector(user_Id)
            client.publish("sensor-camera", class_name)

    #! handle voice control
    if feed_id == "LOG_VOICE":
        print("🗣️ Voice command detected!")
        command = predict(payload)
        client.publish(command['device'], command['action'])

#================================================================================================
# Kết nối với Adafruit IO
client = MQTTClient(ADAFRUIT_USERNAME , AIO_KEY)
client.on_connect = connected
client.on_disconnect = disconnected
client.on_message = message
client.on_subscribe = subscribe
client.connect()
client.loop_background()

#================================================================================================
# Kết nối với mạch bằng cổng COM

# def getPort():
#     ports = serial.tools.list_ports.comports()
#     N = len(ports)
#     commPort = "None"
#     for i in range(0, N):
#         port = ports[i]
#         strPort = str(port)
#         if "USB-SERIAL CH340" in strPort:
#             splitPort = strPort.split(" ")
#             commPort = (splitPort[0])
#     return commPort

# ser = serial.Serial(port=getPort(), baudrate=115200)

# mess = ""
# def processData(data):
#     data = data.replace("!", "")
#     data = data.replace("#", "")
#     splitData = data.split(":") 
#     print(splitData)
    # if splitData[1] == "TEMP":
    #    client.publish("bbc-temp", splitData[2])
    # elif splitData[1] == "LED":
    #     client.publish("bbc-led", splitData[2])

# mess = ""
# def readSerial():
#     bytesToRead = ser.inWaiting()
#     if (bytesToRead > 0):
#         global mess
#         mess = mess + ser.read(bytesToRead).decode("UTF-8")
#         while ("#" in mess) and ("!" in mess):
#             start = mess.find("!")
#             end = mess.find("#")
#             processData(mess[start:end + 1])
#             if (end == len(mess)):
#                 mess = ""
#             else:
#                 mess = mess[end+1:]

while True:
    #! nhận dữ liệu từ server - đã hiện thực ở trên hàm message
    
    #! nạp dữ liệu vào feed từ iot gateway
    # value = input("Nhap gia tri: ")
    # client.publish("log-voice", value)

    #! nhận diện hình ảnh từ camera
    # class_name = image_detector()
    # client.publish("bbc-camera", class_name)

    #! nhận dữ liệu từ mạch Yolo:bit
    # readSerial()
    # time.sleep(5)
    pass