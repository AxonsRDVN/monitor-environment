from rest_framework import serializers
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

UNIT_MAP = {
    "temperature": "°C",
    "humidity": "%",
    "windspeed": "m/s",
    "wind_direction": "°",
    "airpressure": "hPa",
    "rain": "mm",
    "noise": "dB",
    "radiation": "W/m²",
    "lux": "lux",
    "co2": "ppm",
    "nh3": "ppm",
    "so2": "ppm",
    "h2s": "ppm",
    "ch4": "ppm",
    "pm10": "µg/m³",
    "pm25": "µg/m³",
    "wiFi_signal": "dBm",
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
        result = {group: {} for group in GROUP_MAP}

        for group, fields in GROUP_MAP.items():
            for field in fields:
                if hasattr(obj, field):
                    value = getattr(obj, field)
                    if value is not None:
                        result[group][field] = {
                            "value": value,
                            "unit": UNIT_MAP.get(field, ""),
                        }

        return result


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = "__all__"  # hoặc liệt kê cụ thể các trường


class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = "__all__"  # hoặc liệt kê cụ thể các trường
