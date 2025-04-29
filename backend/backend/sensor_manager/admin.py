from django.contrib import admin
from .models import Sensor, Parameter

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ("id", "model_sensor", "manufacturer", "expiry", "expiry_date")
    search_fields = ("model_sensor", "manufacturer")

@admin.register(Parameter)
class ParameterAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "unit", "sensor", "has_threshold")
    search_fields = ("name",)
