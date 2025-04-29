from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Sensor, Parameter
from .serializers import SensorSerializer, ParameterSerializer
from django.shortcuts import get_object_or_404

class SensorListAPIView(APIView):
    def get(self, request):
        sensors = Sensor.objects.all()
        serializer = SensorSerializer(sensors, many=True)
        return Response(serializer.data)

class ParameterListAPIView(APIView):
    def get(self, request):
        parameters = Parameter.objects.all()
        serializer = ParameterSerializer(parameters, many=True)
        return Response(serializer.data)

class SensorDetailAPIView(APIView):
    def get(self, request, pk):
        sensor = get_object_or_404(Sensor, pk=pk)
        serializer = SensorSerializer(sensor)
        return Response(serializer.data)
