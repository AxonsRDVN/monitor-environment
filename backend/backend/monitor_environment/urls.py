# monitor_environment/urls.py

from django.urls import path
from .views import *

urlpatterns = [
    # ví dụ:
    path("plants/", PlantListAPIView.as_view(), name="plant-list"),
    path("plant/<int:plant_id>/stations", StationListView.as_view(), name="station-list-by-master"),
    path("plant/<int:plant_id>/station/<int:station_id>/detail-index-lastest", StationDetailIndexLastestView.as_view(), name="detail-index-by-station"),
    path("plant/<int:plant_id>/station/<int:station_id>/filter-index/<str:param_key>/", ParameterTrendView.as_view(), name="parameter-trend"),
    path('sensors/<int:station_id>', SensorByStationView.as_view(), name='sensors-by-station'),
    path("parameters/grouped/", ParameterGroupedByStationView.as_view(), name="parameter-grouped-by-station"),
    path("sensors/update-day-clean", update_sensor_day_clean, name="update-sensor-day-clean"),
]
