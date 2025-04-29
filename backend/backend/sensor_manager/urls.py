from django.urls import path
from .views import SensorListAPIView, SensorDetailAPIView, ParameterListAPIView

urlpatterns = [
    path('sensors/', SensorListAPIView.as_view(), name='sensor-list'),
    path('sensors/<int:pk>/', SensorDetailAPIView.as_view(), name='sensor-detail'),
    path('parameters/', ParameterListAPIView.as_view(), name='parameter-list'),
]
