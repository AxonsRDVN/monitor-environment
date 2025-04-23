# monitor_environment/urls.py

from django.urls import path
from .views import *

urlpatterns = [
    # ví dụ:
    path("plants/", PlantListAPIView.as_view(), name="plant-list"),
    path("plants/<int:plant_id>/stations", StationListView.as_view(), name="station-list-by-master"),
]
