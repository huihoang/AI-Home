import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import urllib.parse
from bson import ObjectId 
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Load biến môi trường từ file .env
load_dotenv()

# Lấy thông tin từ .env
username = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
host = os.getenv("MONGO_HOST")
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
    print("✅ Ket noi thanh cong MongoDB Atlas!", flush=True)
except Exception as e:
    print("❌ Loi ket noi MongoDB:", e, flush=True)
    exit(1)

# Chọn database 
db = client["Aihome"]
collection = db["images"]

def upload_image(image, createdAt, class_name, user_id):
    """Upload ảnh lên MongoDB"""
    try:
        image_id = collection.insert_one({
            "user_id": ObjectId(user_id),
            "image": image,
            "createdAt": createdAt,
            "classification": class_name
        }).inserted_id
        print(f"\n🚀 Uploaded image to Mongo with ID: {image_id}", flush=True)
        return image_id
    except Exception as e:
        print("❌ Error upload image:", e, flush=True)