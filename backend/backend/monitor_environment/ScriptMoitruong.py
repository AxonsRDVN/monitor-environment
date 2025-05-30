import paho.mqtt.client as mqtt
import pyodbc
import json
import datetime
import time
# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')


# Cấu hình MQTT và SQL Server
broker_address = "14.224.150.7"
broker_port = 1883
username_mqtt = "mqtt"
password_mqtt = "thanhcong"

server = '14.224.150.7,1433'
database = 'Monitoring_Environment'
username_sql = 'minh'
password_sql = 'Baconloncon@2025'

# Biến cache cột
cached_columns = []
last_column_update = 0
column_refresh_interval = 30  # giây

# Lấy danh sách cột có cache
def get_cached_columns():
    global cached_columns, last_column_update
    now = time.time()
    if now - last_column_update > column_refresh_interval or not cached_columns:
        try:
            conn_str = f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username_sql};PWD={password_sql}"
            with pyodbc.connect(conn_str) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'monitor_environment_transaction'")
                cached_columns = [row[0].lower() for row in cursor.fetchall()]
                last_column_update = now
        except Exception as e:
            print(f"Lỗi truy vấn cột bảng: {e}")
            cached_columns = []
    return cached_columns

# Lấy thông tin station theo MAC
def get_station_info(mac_address):
    try:
        conn_str = f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username_sql};PWD={password_sql}"
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, plant_id FROM dbo.monitor_environment_station WHERE code = ?", mac_address)
            result = cursor.fetchone()
            return result if result else (None, None)
    except Exception as e:
        print(f"Lỗi truy vấn station: {e}")
        return None, None

# Chèn dữ liệu vào bảng nếu trùng cột
def insert_transaction(data, station_id, plant_id, mac_address, valid_columns):
    try:
        now = datetime.datetime.now()
        base_data = {
            "plant_id": plant_id,
            "station_id": station_id,
            "device_code": mac_address,
            "time": now,
        }

        filtered_data = {k.lower(): v for k, v in data.items() if k.lower() in valid_columns}
        full_data = {**filtered_data, **base_data}

        columns = ", ".join(full_data.keys())
        placeholders = ", ".join("?" for _ in full_data)
        values = list(full_data.values())

        conn_str = f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username_sql};PWD={password_sql}"
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(f"INSERT INTO dbo.monitor_environment_transaction ({columns}) VALUES ({placeholders})", values)
            conn.commit()
            print(f"Dữ liệu đã thêm lúc {now.strftime('%Y-%m-%d %H:%M:%S')} cho MAC {mac_address}")
    except Exception as e:
        print(f"Lỗi khi chèn dữ liệu: {e}")

# Callback khi kết nối MQTT thành công
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Kết nối MQTT thành công")
        client.subscribe("ENVIRONMENT")
    else:
        print("Kết nối MQTT thất bại, mã lỗi:", rc)

# Callback khi nhận dữ liệu MQTT
def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        print(f"Nhận MQTT: {payload}")

        data = json.loads(payload)
        mac_address = data.get("MAC")
        if not mac_address:
            print("Không có trường MAC.")
            return

        station_id, plant_id = get_station_info(mac_address)
        if station_id and plant_id:
            valid_columns = get_cached_columns()
            insert_transaction(data, station_id, plant_id, mac_address, valid_columns)
        else:
            print(f"Không tìm thấy station với MAC = {mac_address}")
    except Exception as e:
        print(f"Lỗi xử lý message: {e}")

# Khởi tạo MQTT client
client = mqtt.Client()
client.username_pw_set(username_mqtt, password_mqtt)
client.on_connect = on_connect
client.on_message = on_message

# Kết nối và chạy
client.connect(broker_address, broker_port)
client.loop_forever()
