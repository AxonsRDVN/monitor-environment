from rest_framework import serializers
from collections import defaultdict
from .models import *

GROUP_MAP = {
    "Gas": ["co2", "nh3", "so2", "h2s", "ch4"],
    "Air": [
        "pm25",
        "pm10",
        "temperature",
        "humidity",
        "windspeed",
        "wind_direction",
        "airpressure",
        "rain",
        "noise",
    ],
    "Light": ["lux", "radiation"],
    "Energy": [],
    "Other": ["wiFi_signal"],
}


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = "__all__"  # hoặc liệt kê cụ thể các trường


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = "__all__"


class SubStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            "id",
            "name",
            "code",
            "location",
            "latitude",
            "longitude",
            "type",
            "is_active",
            "created_at",
            "updated_at",
            "plant",
        ]


class MasterStationSerializer(serializers.ModelSerializer):
    stations = serializers.SerializerMethodField()

    class Meta:
        model = Station
        fields = [
            "id",
            "name",
            "code",
            "location",
            "latitude",
            "longitude",
            "type",
            "is_active",
            "created_at",
            "updated_at",
            "plant",
            "stations",
        ]

    def get_stations(self, obj):
        sub_stations = obj.sub_stations.all()
        return SubStationSerializer(sub_stations, many=True).data


class TransactionSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ["id", "station", "plant", "device_code", "time", "groups"]

    def get_groups(self, obj):
        result = defaultdict(dict)

        # 🔍 Lấy danh sách Parameter có ở station
        parameters = Parameter.objects.filter(station=obj.station)
        param_map = {p.name.lower(): p for p in parameters}

        for group, field_list in GROUP_MAP.items():
            for field in field_list:
                # Kiểm tra field có tồn tại và có giá trị trong Transaction
                value = getattr(obj, field, None)
                if value is not None:
                    param = param_map.get(field)
                    if param:
                        result[group][field] = {
                            "value": value,
                            "unit": param.unit or "",
                        }

        return result


class SensorSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)  # 🛠️ Bắt buộc để trả ra URL

    class Meta:
        model = Sensor
        fields = [
            'id',
            'plant',
            'station',
            'image',          # URL của ảnh
            'model_sensor',
            'expiry',
            'expiry_date',
            'manufacturer',
            'day_clean',
            'create_at',
        ]


class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = "__all__"  # hoặc liệt kê cụ thể các trường
        

class MaintenanceSerializer(serializers.ModelSerializer):
    station_name = serializers.SerializerMethodField()
    station_id = serializers.SerializerMethodField()
    station_location = serializers.SerializerMethodField()  # ✅ thêm location
    sensor_model = serializers.SerializerMethodField()

    class Meta:
        model = Maintenance
        fields = [
            'id',
            'sensor',
            'sensor_model',
            'image_before',
            'image_after',
            'action',
            'update_at',
            'user_name',
            'status',
            'moderator',
            'role',
            'latitude',
            'longitude',
            'station_id',
            'station_name',
            'station_location',  # ✅ thêm vào fields
        ]

    def create(self, validated_data):
        validated_data['status'] = 'pending'
        return super().create(validated_data)

    def get_station_name(self, obj):
        if obj.sensor and obj.sensor.station:
            return obj.sensor.station.name
        return None

    def get_station_id(self, obj):
        if obj.sensor and obj.sensor.station:
            return obj.sensor.station.id
        return None

    def get_station_location(self, obj):
        if obj.sensor and obj.sensor.station:
            return obj.sensor.station.location
        return None

    def get_sensor_model(self, obj):
        if obj.sensor:
            return obj.sensor.model_sensor
        return None
    
class TransactionWarningDetailSerializer(serializers.Serializer):
    station_id = serializers.IntegerField()
    station_name = serializers.CharField()
    parameter_name = serializers.CharField()
    value = serializers.FloatField()
    unit = serializers.CharField()
    status = serializers.CharField()
    time = serializers.DateTimeField()