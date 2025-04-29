from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("monitor-environment/", include("monitor_environment.urls")),
    path("sensor-manager/", include("sensor_manager.urls")),
]

# Add media URL serving
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)