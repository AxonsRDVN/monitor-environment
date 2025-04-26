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
from collections import defaultdict
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from datetime import date, timedelta


class PlantListAPIView(APIView):
    def get(self, request):
        plants = Plant.objects.all()
        result = []

        for plant in plants:
            latest_tx = (
                Transaction.objects.filter(plant=plant)
                .order_by("-time")
                .first()
            )

            if not latest_tx:
                result.append({
                    "id": plant.id,
                    "name": plant.name,
                    "status": "normal",  # Nếu không có transaction thì cũng coi như normal
                    "count": 0
                })
                continue

            param_keys = [
                "temperature", "humidity", "pm25", "pm10", "airpressure",
                "noise", "rain", "radiation", "lux", "windspeed", "wind_direction"
            ]

            parameters = Parameter.objects.filter(
                station=latest_tx.station,
                has_threshold=True,
                name__in=param_keys
            )

            added_params = set()
            level_count = {
                "normal": 0,
                "caution": 0,
                "danger": 0,
                "unknown": 0,
            }

            for param in parameters:
                if param.name in added_params:
                    continue

                value = getattr(latest_tx, param.name, None)
                if value is None:
                    continue

                if param.normal_min is not None and param.normal_max is not None and param.normal_min <= value <= param.normal_max:
                    level = "normal"
                elif param.caution_min is not None and param.caution_max is not None and param.caution_min <= value <= param.caution_max:
                    level = "caution"
                elif param.danger_min is not None and param.danger_max is not None and param.danger_min <= value <= param.danger_max:
                    level = "danger"
                else:
                    level = "unknown"

                level_count[level] += 1
                added_params.add(param.name)

            # ✅ Chọn mức độ cao nhất theo yêu cầu
            if level_count["danger"] > 0:
                highest_level = "danger"
                count = level_count["danger"]
            elif level_count["caution"] > 0:
                highest_level = "caution"
                count = level_count["caution"]
            else:
                highest_level = "normal"
                count = 0  # Nếu chỉ còn normal thì count = 0

            result.append({
                "id": plant.id,
                "name": plant.name,
                "status": highest_level,
                "count": count
            })

        return Response(result, status=status.HTTP_200_OK)


class StationListView(APIView):
    def get(self, request, plant_id):
        try:
            plant = Plant.objects.get(id=plant_id)
            masters = Station.objects.filter(plant_id=plant_id, type=2)

            result = []

            for master in masters:
                master_status, master_count = self.calculate_station_status(master)

                # ✅ Sửa ở đây
                child_stations = Station.objects.filter(master_id=master.id, type=1)

                station_children = []
                for child_station in child_stations:
                    child_status, child_count = self.calculate_station_status(child_station)

                    station_children.append({
                        "id": child_station.id,
                        "name": child_station.name,
                        "status": child_status,
                        "count": child_count,
                    })

                result.append({
                    "id": master.id,
                    "name": master.name,
                    "status": master_status,
                    "count": master_count,
                    "stations": station_children
                })

            # ✅ Phải có RETURN Response ở đây
            return Response({
                "plant_name": plant.name,
                "plant_id": plant.id,
                "stations": result
            }, status=status.HTTP_200_OK)

        except Plant.DoesNotExist:
            return Response(
                {"detail": "Không tìm thấy nhà máy."},
                status=status.HTTP_404_NOT_FOUND
            )

    def calculate_station_status(self, station):
        latest_tx = (
            Transaction.objects.filter(station=station)
            .order_by("-time")
            .first()
        )

        level_count = {
            "normal": 0,
            "caution": 0,
            "danger": 0,
            "unknown": 0,
        }

        if latest_tx:
            param_keys = [
                "temperature", "humidity", "pm25", "pm10", "airpressure",
                "noise", "rain", "radiation", "lux", "windspeed", "wind_direction"
            ]

            parameters = Parameter.objects.filter(
                station=station,
                has_threshold=True,
                name__in=param_keys
            )

            added_params = set()

            for param in parameters:
                if param.name in added_params:
                    continue

                value = getattr(latest_tx, param.name, None)
                if value is None:
                    continue

                if param.normal_min is not None and param.normal_max is not None and param.normal_min <= value <= param.normal_max:
                    level = "normal"
                elif param.caution_min is not None and param.caution_max is not None and param.caution_min <= value <= param.caution_max:
                    level = "caution"
                elif param.danger_min is not None and param.danger_max is not None and param.danger_min <= value <= param.danger_max:
                    level = "danger"
                else:
                    level = "unknown"

                level_count[level] += 1
                added_params.add(param.name)

        # Xác định highest level theo đúng yêu cầu
        if level_count["danger"] > 0:
            highest_level = "danger"
            count = level_count["danger"]
        elif level_count["caution"] > 0:
            highest_level = "caution"
            count = level_count["caution"]
        elif level_count["normal"] > 0:
            highest_level = "normal"
            count = 0  # Nếu chỉ còn normal thì count = 0
        else:
            highest_level = "normal"
            count = 0

        return highest_level, count


GROUP_MAP = {
    "Gas": ["co2", "nh3", "so2", "h2s", "ch4"],
    "Air": [
        "pm25",
        "pm10",
        "temperature",
        "humidity",
        "windspeed",
        "wind_direction",
        "airpressure",
        "rain",
        "noise",
    ],
    "Light": ["lux", "radiation"],
    "Energy": [],
    "Other": ["wiFi_signal"],
}


def normalize_key(k):
    return (
        k.strip()
        .lower()
        .replace(" ", "")
        .replace(".", "")
        .replace("-", "")
        .replace("_", "")
    )


class StationDetailIndexLastestView(APIView):
    def get(self, request, plant_id, station_id):
        plant = get_object_or_404(Plant, id=plant_id)
        station = get_object_or_404(Station, id=station_id, plant=plant)

        transaction = (
            Transaction.objects.filter(plant=plant, station=station)
            .order_by("-time")
            .first()
        )

        if not transaction:
            return Response(
                {
                    "station": StationSerializer(station).data,
                    "latest_transaction": None,
                    "message": "No transaction found for this station",
                },
                status=status.HTTP_200_OK,
            )

        parameters = Parameter.objects.filter(station=station)
        param_map = {normalize_key(p.name): p for p in parameters}

        groups = defaultdict(dict)
        added_names = set()

        for group, field_list in GROUP_MAP.items():
            for field in field_list:
                norm_field = normalize_key(field)
                if norm_field in added_names:
                    continue

                value = getattr(transaction, field, None)
                param = param_map.get(norm_field)

                if value is not None and param:
                    # Tính status
                    if param.normal_min is not None and param.normal_max is not None and param.normal_min <= value <= param.normal_max:
                        status_ = "normal"
                    elif param.caution_min is not None and param.caution_max is not None and param.caution_min <= value <= param.caution_max:
                        status_ = "caution"
                    elif param.danger_min is not None and param.danger_max is not None and param.danger_min <= value <= param.danger_max:
                        status_ = "danger"
                    else:
                        status_ = "unknown"

                    groups[group][field] = {
                        "value": value,
                        "unit": param.unit or "",
                        "status": status_
                    }
                    added_names.add(norm_field)

        return Response(
            {
                "station": StationSerializer(station).data,
                "latest_transaction": {"time": transaction.time, "groups": groups},
            },
            status=status.HTTP_200_OK,
        )


class ParameterTrendView(APIView):
    def get(self, request, plant_id, station_id, param_key):
        interval = request.GET.get("interval", "hour")
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")

        allowed_params = [
            "temperature",
            "humidity",
            "pm25",
            "pm10",
            "airpressure",
            "noise",
            "rain",
            "radiation",
            "lux",
            "windspeed",
            "wind_direction",
        ]
        if param_key not in allowed_params:
            return Response(
                {"error": "Tham số không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST
            )

        trunc_map = {
            "minute": TruncMinute,
            "hour": TruncHour,
            "day": TruncDay,
            "month": TruncMonth,
        }

        if interval not in trunc_map:
            return Response(
                {"error": "interval không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST
            )

        trunc_func = trunc_map[interval]
        base_qs = Transaction.objects.filter(plant_id=plant_id, station_id=station_id)

        if from_date and to_date:
            try:
                from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                to_dt = datetime.strptime(to_date, "%Y-%m-%d")
                base_qs = base_qs.filter(time__date__range=[from_dt, to_dt])
            except ValueError:
                return Response(
                    {"error": "Ngày không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST
                )

        try:
            # Dữ liệu theo thời gian
            grouped_qs = (
                base_qs.annotate(grouped_time=trunc_func("time"))
                .values("grouped_time")
                .annotate(avg_value=Avg(param_key))
                .order_by("-grouped_time")
            )

            limit_map = {"minute": 30, "hour": 24, "day": 30, "month": 30}
            limit = limit_map.get(interval, 30)
            data = list(grouped_qs[:limit])[
                ::-1
            ]  # Đảo ngược lại theo thời gian tăng dần

            # Làm tròn từng giá trị avg_value
            for entry in data:
                if entry["avg_value"] is not None:
                    entry["avg_value"] = round(entry["avg_value"], 2)

            # Tính lại min, max, avg từ danh sách data
            values = [
                entry["avg_value"] for entry in data if entry["avg_value"] is not None
            ]
            if values:
                summary = {
                    "avg": round(sum(values) / len(values), 2),
                    "max": max(values),
                    "min": min(values),
                }
            else:
                summary = {
                    "avg": None,
                    "max": None,
                    "min": None,
                }

            return Response(
                {
                    "summary": summary,
                    "param": param_key,
                    "interval": interval,
                    "data": data,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SensorByStationView(APIView):
    def get(self, request, station_id):
        sensors = Sensor.objects.filter(station_id=station_id)

        if not sensors.exists():
            return Response({
                "message": "Không có sensor nào thuộc trạm này.",
                "plant": None,
                "station": station_id,
                "sensors": []
            }, status=status.HTTP_200_OK)

        serializer = SensorSerializer(sensors, many=True)
        plant_id = sensors.first().plant_id

        # Loại bỏ 'plant' và 'station' trong từng sensor
        filtered_data = []
        for sensor in serializer.data:
            sensor.pop("plant", None)
            sensor.pop("station", None)
            filtered_data.append(sensor)

        return Response({
            "message": "Lấy danh sách sensor thành công.",
            "plant": plant_id,
            "station": station_id,
            "sensors": filtered_data
        }, status=status.HTTP_200_OK)

class ParameterGroupedByStationView(APIView):
    def get(self, request):
        station_id = request.GET.get("station_id")
        sensor_id = request.GET.get("sensor_id")
        plant_id = request.GET.get("plant_id")

        parameters = Parameter.objects.filter(has_threshold=True)

        if plant_id:
            parameters = parameters.filter(station__plant_id=plant_id)
        if station_id:
            parameters = parameters.filter(station_id=station_id)
        if sensor_id:
            parameters = parameters.filter(sensor_id=sensor_id)

        # ✅ Nếu có station_id → lọc theo các field thật sự có trong bảng Transaction
        if station_id:
            tracked_fields = [
                "temperature", "humidity", "pm25", "pm10", "windspeed", "wind_direction",
                "airpressure", "noise", "lux", "rain", "radiation"
            ]

            transactions = Transaction.objects.filter(station_id=station_id)

            existing_fields = set()
            for tx in transactions:
                for field in tracked_fields:
                    if getattr(tx, field, None) is not None:
                        existing_fields.add(field)

            parameters = parameters.filter(name__in=existing_fields)

        # ✅ Group theo station, và loại bỏ trùng name
        grouped_data = {}

        for param in parameters:
            sid = param.station.id
            if sid not in grouped_data:
                grouped_data[sid] = {
                    "plant_id": param.station.plant_id,
                    "station_id": sid,
                    "station_name": param.station.name,
                    "parameters": []
                }

            # Lọc trùng name — chỉ giữ name đầu tiên
            existing_names = {
                p["name"] for p in grouped_data[sid]["parameters"]
            }

            if param.name not in existing_names:
                grouped_data[sid]["parameters"].append(ParameterSerializer(param).data)

        return Response(list(grouped_data.values()), status=status.HTTP_200_OK)

@api_view(["POST"])
def update_sensor_day_clean(request):
    sensors = request.data.get("sensors", [])

    updated = 0
    for s in sensors:
        sensor_id = s.get("sensor_id")
        days = s.get("days")  # số ngày do frontend gửi

        if sensor_id is not None and days is not None:
            try:
                sensor = Sensor.objects.get(id=sensor_id)
                sensor.day_clean = date.today() + timedelta(days=int(days))
                sensor.save()
                updated += 1
            except Sensor.DoesNotExist:
                continue

    return Response(
        {"message": f"Đã cập nhật {updated} sensor."},
        status=status.HTTP_200_OK
    )