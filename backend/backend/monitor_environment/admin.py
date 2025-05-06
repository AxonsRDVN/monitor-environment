from django.contrib import admin
from .models import *


# Register your models here.
@admin.register(Function)
class FunctionAdmin(admin.ModelAdmin):
    list_display = ("function_code", "description", "id")
    search_fields = ("function_code", "description")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("role_name", "description", "id")
    search_fields = ("role_name",)
    filter_horizontal = ("functions",)  # Dễ chọn nhiều chức năng


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("full_name", "username", "email", "phone_number", "role", "is_active", "created_at")
    search_fields = ("username", "email", "full_name", "phone_number")
    list_filter = ("is_active", "gender", "role")
    readonly_fields = ("created_at", "updated_at", "access_times")

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

@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'sensor',
        'action',
        'status',
        'user_name',
        'moderator',
        'role',
        'update_at',
    )
    list_filter = ('status', 'action', 'role')
    search_fields = ('sensor__model_sensor', 'user_name', 'moderator')
    ordering = ('-update_at',)
    readonly_fields = ('update_at',)

    # Hiển thị thêm ảnh trước và sau bảo trì trong Admin
    def image_before_tag(self, obj):
        if obj.image_before:
            return mark_safe(f'<img src="{obj.image_before.url}" width="100" />')
        return "-"
    
    def image_after_tag(self, obj):
        if obj.image_after:
            return mark_safe(f'<img src="{obj.image_after.url}" width="100" />')

        return "-"

    image_before_tag.short_description = "Ảnh trước bảo trì"
    image_after_tag.short_description = "Ảnh sau bảo trì"

