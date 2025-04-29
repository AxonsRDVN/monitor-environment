# monitor_environment/urls.py

from django.urls import path
from .views import *

urlpatterns = [
    # ví dụ:
    path("plants/", PlantListAPIView.as_view(), name="plant-list"),
    path("plant/<int:plant_id>/stations", StationListView.as_view(), name="station-list-by-master"),
    path("plant/<int:plant_id>/station/<int:station_id>/detail-index-lastest", StationDetailIndexLastestView.as_view(), name="detail-index-by-station"),
    path("plant/<int:plant_id>/station/<int:station_id>/filter-index/<str:param_key>/", ParameterTrendView.as_view(), name="parameter-trend"),
    path("sensors/<int:station_id>", SensorByStationView.as_view(), name="sensors-by-station"),
    path("parameters/grouped/", ParameterGroupedByStationView.as_view(), name="parameter-grouped-by-station"),
    path("sensors/update-day-clean", update_sensor_day_clean, name="update-sensor-day-clean"),
    path("parameters/update-thresholds/", UpdateThresholdsView.as_view(), name="parameter-grouped-by-station"),
    path("sensors/<int:station_id>/sensor/<int:sensor_id>/", SensorDetailView.as_view(), name="sensor-detail"),
    path("maintenance/", MaintenanceListCreateAPIView.as_view(), name="maintenance-list-create"),
    path("maintenance/<int:pk>/", MaintenanceUpdateStatusAPIView.as_view(), name="maintenance-update-status"),
    path("history/<int:sensor_id>/detail/", MaintenanceBySensorAPIView.as_view(), name="maintenance-detail"),
    path("maintenance/by-plant/<int:plant_id>/", MaintenanceByPlantAPIView.as_view(), name="maintenance-by-plant"),
    path("maintenance/<int:pk>/detail/", MaintenanceDetailAPIView.as_view(), name="maintenance-detail"),
    path(
        "plant/<int:plant_id>/warnings/",
        PlantParameterWarningView.as_view(),
        name="plant-warning-stats"
    ),
    path("plant/<int:plant_id>/warning-detail/", WarningDetailByPlantView.as_view(), name="plant-warning-detail"),
    path("plant/<int:plant_id>/maintenance-reminders/", MaintenanceReminderAPIView.as_view(), name="maintenance-reminders-by-plant"),
    path("plant/<int:plant_id>/24h-average/", Plant24hOverallStatusView.as_view(), name="24h-status-by-plant"),
    path('station/<int:station_id>/', StationCRUDAPIView.as_view(), name='delete_station'),
    path('stations/', StationCreateAPIView.as_view(), name='station-create'),
    path('sensors/', SensorCreateAPIView.as_view(), name='create-sensor'),
    path('parameters/', ParameterCreateAPIView.as_view(), name='create-parameter'),
    path('clone-sensor/<int:sensor_id>/', CloneSensorAPIView.as_view(), name='clone-sensor'),
]
