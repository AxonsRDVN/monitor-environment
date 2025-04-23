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