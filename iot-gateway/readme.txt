# nếu mn lỡ tải nhiều version python nên sẽ cần env chạy python ver 3.8 cùng các library ở dưới 
# lên web teachable machine -> train -> tải file model -> download thu viện

# đầu tiên python phải là 3.8
pip install scikit-learn joblib
pip install keras==2.4.0 tensorflow==2.4.0
pip install adafruit-io
pip install pyserial
pip install numpy==1.19.5
pip install opencv-python==4.5.5.62
pip install python-dotenv
pip install pymongo

cd .\iot-gateway
env\Scripts\activate    # chạy bước này nếu py3.8 trong env
python main.py <user_id>

#thoát env (nếu cần)
deactivate