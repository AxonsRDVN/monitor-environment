# monitor_environment/views.py

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *


class PlantListAPIView(APIView):
    def get(self, request):
        plants = Plant.objects.all()
        serializer = PlantSerializer(plants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StationListView(APIView):
    def get(self, request, plant_id):
        try:
            plant = Plant.objects.get(id=plant_id)
            masters = Station.objects.filter(plant_id=plant_id, type=2)
            serializer = MasterStationSerializer(masters, many=True)

            return Response({
                "plant_name": plant.name,
                "plant_id": plant.id,
                "stations": serializer.data
            }, status=status.HTTP_200_OK)

        except Plant.DoesNotExist:
            return Response(
                {"detail": "Không tìm thấy nhà máy."},
                status=status.HTTP_404_NOT_FOUND
            )