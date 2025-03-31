import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import urllib.parse
import base64

# Load biến môi trường từ file .env
load_dotenv()

# Lấy thông tin từ .env
username = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
host = os.getenv("MONGO_HOST")  # Chính là cluster address từ Atlas
database = os.getenv("MONGO_DB")

# MÃ HÓA username & password
username_encoded = urllib.parse.quote_plus(username)
password_encoded = urllib.parse.quote_plus(password)

# Tạo MongoDB URI
mongo_uri = f"mongodb+srv://{username_encoded}:{password_encoded}@{host}/{database}?retryWrites=true&w=majority&appName=Cluster0"

# Kết nối đến MongoDB Atlas (sử dụng Server API Version 1)
client = MongoClient(mongo_uri, server_api=ServerApi('1'))

# Kiểm tra kết nối bằng lệnh ping
try:
    client.admin.command('ping')
    print("Đa ket noi thanh cong toi MongoDB Atlas!")
except Exception as e:
    print("Loi ket noi MongoDB:", e)
    exit(1)

# Chọn database 
db = client["Aihome"]
collection = db["images"]

def upload_image(image, timestamp, class_name):
    """Upload ảnh lên MongoDB"""
    try:
        image_id = collection.insert_one({
            "image": image,
            "timestamp": timestamp,
            "classification": class_name
        }).inserted_id
        print(f"Uploaded image to Mongo with ID: {image_id}")
        return image_id
    except Exception as e:
        print("Error upload image:", e)

#download
# Giải mã Base64 và lưu lại thành file ảnh
# data = collection.find_one({"timestamp": "20250331_010132"})
# with open("decoded_image.jpg", "wb") as img_file:
#     img_file.write(base64.b64decode(data["image"]))
# print("✅ Ảnh đã được giải mã và lưu lại!")
