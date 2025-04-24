from django.contrib import admin
from .models import *


# Register your models here.
@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ("name", "org_code", "status", "is_active", "created_at")
    search_fields = ("name", "org_code", "location")
    list_filter = ("status", "is_active")

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "plant", "type", "master_name", "is_active")
    list_filter = ("type", "plant", "is_active")

    def master_name(self, obj):
        return obj.master.name if obj.master else "-"
    master_name.short_description = "Master"

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ("id", "model_sensor", "manufacturer", "expiry", "get_station")
    list_filter = ("manufacturer", "station")
    search_fields = ("model_sensor", "manufacturer")

    def get_station(self, obj):
        return obj.station.name if obj.station else "—"
    get_station.short_description = "Station"


@admin.register(Parameter)
class ParameterAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "unit", "min_value", "max_value", "has_threshold", "get_sensor", "get_station")
    list_filter = ("unit", "has_threshold", "sensor__station")
    search_fields = ("name", "unit", "sensor__model_sensor")

    def get_sensor(self, obj):
        return obj.sensor.model_sensor if obj.sensor else "—"
    get_sensor.short_description = "Sensor"

    def get_station(self, obj):
        return obj.sensor.station.name if obj.sensor and obj.sensor.station else "—"
    get_station.short_description = "Station"

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "plant",
        "station",
        "device_code",
        "temperature",
        "humidity",
        "windspeed",
        "wind_direction",
        "pm25",
        "pm10",
        "airpressure",
        "noise",
        "lux",
        "rain",
        "radiation",
        "time",
    )
    list_filter = ("plant", "station", "time")
    search_fields = ("device_code",)

    ordering = ("-time",)

    fieldsets = (
        ("General Info", {
            "fields": ("plant", "station", "device_code", "time")
        }),
        ("Environmental Readings", {
            "fields": (
                "temperature",
                "humidity",
                "windspeed",
                "wind_direction",
                "pm25",
                "pm10",
                "airpressure",
                "noise",
                "lux",
                "rain",
                "radiation",
            )
        }),
    )

