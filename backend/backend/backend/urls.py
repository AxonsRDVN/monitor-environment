from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("monitor-environment/", include("monitor_environment.urls")),
    # path("sensor-manager/", include("sensor_manager.urls")),
]
