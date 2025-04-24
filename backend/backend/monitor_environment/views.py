# monitor_environment/views.py

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.db.models import Avg, Max, Min
from django.db.models.functions import TruncMinute, TruncHour, TruncDay, TruncMonth
from datetime import datetime, timedelta
from django.utils.timezone import make_aware

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

class StationDetailIndexLastestView(APIView):
    def get(self, request, plant_id, station_id):
        try:
            plant = Plant.objects.get(id=plant_id)
        except Plant.DoesNotExist:
            return Response({"error": "Plant not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            station = Station.objects.get(id=station_id, plant=plant)
        except Station.DoesNotExist:
            return Response({"error": "Station not found in this plant"}, status=status.HTTP_404_NOT_FOUND)

        # 🔍 Lấy transaction mới nhất
        transaction = Transaction.objects.filter(
            plant=plant, station=station
        ).order_by("-time").first()

        if not transaction:
            return Response({
                "station": StationSerializer(station).data,
                "latest_transaction": None,
                "message": "No transaction found for this station"
            }, status=status.HTTP_200_OK)

        # ✅ Trả về cả station và giao dịch mới nhất với group data
        return Response({
            "station": StationSerializer(station).data,
            "latest_transaction": TransactionSerializer(transaction).data
        })
        
class ParameterTrendView(APIView):
    def get(self, request, plant_id, station_id, param_key):
        interval = request.GET.get("interval", "hour")
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")

        allowed_params = [
            "temperature", "humidity", "pm25", "pm10",
            "airpressure", "noise", "rain", "radiation",
            "lux", "windspeed", "wind_direction"
        ]
        if param_key not in allowed_params:
            return Response({"error": "Tham số không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        trunc_map = {
            "minute": TruncMinute,
            "hour": TruncHour,
            "day": TruncDay,
            "month": TruncMonth,
        }

        if interval not in trunc_map:
            return Response({"error": "interval không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        trunc_func = trunc_map[interval]
        base_qs = Transaction.objects.filter(plant_id=plant_id, station_id=station_id)

        if from_date and to_date:
            try:
                from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                to_dt = datetime.strptime(to_date, "%Y-%m-%d")
                base_qs = base_qs.filter(time__date__range=[from_dt, to_dt])
            except ValueError:
                return Response({"error": "Ngày không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Tổng thể
            overall_stats = base_qs.aggregate(
                avg_all=Avg(param_key),
                max_all=Max(param_key),
                min_all=Min(param_key)
            )

            # Dữ liệu theo thời gian
            grouped_qs = (
                base_qs.annotate(grouped_time=trunc_func("time"))
                .values("grouped_time")
                .annotate(avg_value=Avg(param_key))
                .order_by("-grouped_time")
            )

            limit_map = {
                "minute": 30,
                "hour": 24,
                "day": 30,
                "month": 30
            }
            limit = limit_map.get(interval, 30)
            data = list(grouped_qs[:limit])[::-1]

            return Response({
                "summary": {
                    "avg": round(overall_stats["avg_all"], 2) if overall_stats["avg_all"] is not None else None,
                    "max": overall_stats["max_all"],
                    "min": overall_stats["min_all"]
                },
                "param": param_key,
                "interval": interval,
                "data": data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
