# monitor_environment/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.db.models import Avg
from django.db.models.functions import TruncMinute, TruncHour, TruncDay, TruncMonth
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from collections import defaultdict
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from datetime import date, timedelta
from rest_framework.pagination import PageNumberPagination
from rest_framework import status as http_status
import os
from django.conf import settings
import shutil
from django.core.files import File
from rest_framework_simplejwt.views import TokenObtainPairView
from django.template.loader import render_to_string
from io import BytesIO
from xhtml2pdf import pisa
from django.core.mail import EmailMessage
from rest_framework.permissions import IsAuthenticated


def get_wind_direction_label(degree):
    if degree is None:
        return "Không xác định"
    directions = [
        "north",
        "northeast",
        "east",
        "southeast",
        "south",
        "southwest",
        "west",
        "northwest",
        "north"
    ]
    idx = int((degree + 22.5) // 45)
    return directions[idx % 8]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserListAPIView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        plant_ids = request.data.pop("plants", [])  # ✅ lấy danh sách plant ID từ request

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # ✅ tạo user

            # ✅ gán quyền xem nhà máy
            for plant_id in plant_ids:
                try:
                    plant = Plant.objects.get(id=plant_id)
                    PlantAccess.objects.get_or_create(user=user, plant=plant)
                except Plant.DoesNotExist:
                    continue  # hoặc log lỗi nếu cần

            return Response(
                {"message": "User created successfully"}, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailAPIView(APIView):
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(
            {"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT
        )

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        plant_ids = request.data.pop("plants", [])

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # ✅ Cập nhật quyền
            PlantAccess.objects.filter(user=user).delete()
            for plant_id in plant_ids:
                try:
                    plant = Plant.objects.get(id=plant_id)
                    PlantAccess.objects.get_or_create(user=user, plant=plant)
                except Plant.DoesNotExist:
                    continue

            return Response({"message": "User updated"}, status=200)
        return Response(serializer.errors, status=400)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PlantListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        plants = Plant.objects.filter(plantaccess__user=request.user).distinct()
        result = []

        for plant in plants:
            # ✅ Bước 1: lấy toàn bộ station thuộc plant
            stations = Station.objects.filter(plant=plant, is_active=True)

            # ✅ Bước 2: lấy tất cả transaction mới nhất của từng station
            latest_transactions = []
            for station in stations:
                latest_tx = (
                    Transaction.objects.filter(station=station)
                    .order_by("-time")
                    .first()
                )
                if latest_tx:
                    latest_transactions.append(latest_tx)

            # Nếu không có transaction nào
            if not latest_transactions:
                result.append(
                    {"id": plant.id, "name": plant.name, "status": "normal", "count": 0}
                )
                continue

            param_keys = [
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

            level_count = {
                "normal": 0,
                "caution": 0,
                "danger": 0,
                "unknown": 0,
            }

            added_params = set()

            for tx in latest_transactions:
                parameters = Parameter.objects.filter(
                    station=tx.station, has_threshold=True, name__in=param_keys
                )

                for param in parameters:
                    key = f"{tx.station.id}-{param.name}"
                    if key in added_params:
                        continue

                    value = getattr(tx, param.name, None)
                    if value is None:
                        continue

                    if (
                        param.normal_min is not None
                        and param.normal_max is not None
                        and param.normal_min <= value <= param.normal_max
                    ):
                        level = "normal"
                    elif (
                        param.caution_min is not None
                        and param.caution_max is not None
                        and param.caution_min <= value <= param.caution_max
                    ):
                        level = "caution"
                    elif (
                        param.danger_min is not None
                        and param.danger_max is not None
                        and param.danger_min <= value <= param.danger_max
                    ):
                        level = "danger"
                    else:
                        level = "unknown"

                    level_count[level] += 1
                    added_params.add(key)

            # ✅ Bước 3: Ưu tiên mức cao nhất
            if level_count["danger"] > 0:
                highest_level = "danger"
                count = level_count["danger"]
            elif level_count["caution"] > 0:
                highest_level = "caution"
                count = level_count["caution"]
            else:
                highest_level = "normal"
                count = 0

            result.append(
                {
                    "id": plant.id,
                    "name": plant.name,
                    "status": highest_level,
                    "count": count,
                    "station_count": stations.count(),
                }
            )

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
                    child_status, child_count = self.calculate_station_status(
                        child_station
                    )

                    station_children.append(
                        {
                            "id": child_station.id,
                            "name": child_station.name,
                            "type": child_station.type,
                            "code": child_station.code,
                            "location": child_station.location,
                            "latitude": child_station.latitude,
                            "longitude": child_station.longitude,
                            "channel": child_station.channel,
                            "address": child_station.address,
                            "status": child_status,
                            "count": child_count,
                        }
                    )

                result.append(
                    {
                        "id": master.id,
                        "name": master.name,
                        "type": master.type,
                        "code": master.code,
                        "location": master.location,
                        "latitude": master.latitude,
                        "longitude": master.longitude,
                        "channel": master.channel,
                        "address": master.address,
                        "status": master_status,
                        "count": master_count,
                        "stations": station_children,
                    }
                )

            # ✅ Phải có RETURN Response ở đây
            return Response(
                {"plant_name": plant.name, "plant_id": plant.id, "stations": result},
                status=status.HTTP_200_OK,
            )

        except Plant.DoesNotExist:
            return Response(
                {"detail": "Không tìm thấy nhà máy."}, status=status.HTTP_404_NOT_FOUND
            )

    def calculate_station_status(self, station):
        latest_tx = (
            Transaction.objects.filter(station=station).order_by("-time").first()
        )

        level_count = {
            "normal": 0,
            "caution": 0,
            "danger": 0,
            "unknown": 0,
        }

        if latest_tx:
            param_keys = [
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

            parameters = Parameter.objects.filter(
                station=station, has_threshold=True, name__in=param_keys
            )

            added_params = set()

            for param in parameters:
                if param.name in added_params:
                    continue

                value = getattr(latest_tx, param.name, None)
                if value is None:
                    continue

                if (
                    param.normal_min is not None
                    and param.normal_max is not None
                    and param.normal_min <= value <= param.normal_max
                ):
                    level = "normal"
                elif (
                    param.caution_min is not None
                    and param.caution_max is not None
                    and param.caution_min <= value <= param.caution_max
                ):
                    level = "caution"
                elif (
                    param.danger_min is not None
                    and param.danger_max is not None
                    and param.danger_min <= value <= param.danger_max
                ):
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
                    if (
                        param.normal_min is not None
                        and param.normal_max is not None
                        and param.normal_min <= value <= param.normal_max
                    ):
                        status_ = "normal"
                    elif (
                        param.caution_min is not None
                        and param.caution_max is not None
                        and param.caution_min <= value <= param.caution_max
                    ):
                        status_ = "caution"
                    elif (
                        param.danger_min is not None
                        and param.danger_max is not None
                        and param.danger_min <= value <= param.danger_max
                    ):
                        status_ = "danger"
                    else:
                        status_ = "unknown"

                    value_dict = {
                        "value": value,
                        "unit": param.unit or "",
                        "status": status_,
                    }

                    # Nếu là hướng gió, thêm label
                    if norm_field == "wind_direction":
                        value_dict["label"] = get_wind_direction_label(value)

                    groups[group][field] = value_dict
                    added_names.add(norm_field)

        # === Tính status trước ===
        danger_count = 0
        caution_count = 0

        for group_fields in groups.values():
            for field_data in group_fields.values():
                status_ = field_data.get("status")
                if status_ == "danger":
                    danger_count += 1
                elif status_ == "caution":
                    caution_count += 1
                # normal hoặc unknown thì bỏ qua

        # Chọn status theo ưu tiên
        if danger_count > 0:
            overall_status = "danger"
            count = danger_count
        elif caution_count > 0:
            overall_status = "caution"
            count = caution_count
        else:
            overall_status = "normal"
            count = None  # normal thì không đếm

        status_summary = {"status": overall_status, "count": count}

        return Response(
            {
                "station": StationSerializer(station).data,
                "latest_transaction": {
                    "time": transaction.time,
                    "status_summary": status_summary,
                    "groups": groups,
                },
            },
            status=status.HTTP_200_OK,
        )


class StationDetailIndexRangeView(APIView):
    def get(self, request, plant_id, station_id):
        plant = get_object_or_404(Plant, id=plant_id)
        station = get_object_or_404(Station, id=station_id, plant=plant)

        from_date = request.GET.get("from")
        to_date = request.GET.get("to")

        if not from_date or not to_date:
            return Response(
                {"detail": "Vui lòng truyền đầy đủ from và to (yyyy-mm-dd)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from_date_obj = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"detail": "Sai định dạng ngày. Định dạng: yyyy-mm-dd"}, status=400
            )

        transactions = Transaction.objects.filter(
            plant=plant,
            station=station,
            time__date__range=(from_date_obj, to_date_obj),
        ).order_by("time")

        if not transactions.exists():
            return Response(
                {
                    "station": StationSerializer(station).data,
                    "transactions": [],
                    "message": "Không có dữ liệu giao dịch trong khoảng thời gian này",
                },
                status=status.HTTP_200_OK,
            )

        parameters = Parameter.objects.filter(station=station)
        param_map = {normalize_key(p.name): p for p in parameters}

        results = []

        for transaction in transactions:
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
                        data = {
                            "value": value,
                            "unit": param.unit or "",
                        }

                        if norm_field == "wind_direction":
                            data["label"] = get_wind_direction_label(value)

                        groups[group][field] = data
                        added_names.add(norm_field)

            results.append(
                {
                    "time": transaction.time,
                    "groups": groups,
                }
            )

        return Response(
            {
                "station": StationSerializer(station).data,
                "transactions": results,
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


from django.utils import timezone


class SensorByStationView(APIView):
    def get(self, request, station_id):
        sensors = Sensor.objects.filter(station_id=station_id)

        if not sensors.exists():
            return Response(
                {
                    "message": "Không có sensor nào thuộc trạm này.",
                    "plant": None,
                    "station": station_id,
                    "sensors": [],
                },
                status=status.HTTP_200_OK,
            )

        serializer = SensorSerializer(sensors, many=True)
        plant_id = sensors.first().plant_id

        filtered_data = []
        today = timezone.now().date()

        for i, sensor in enumerate(serializer.data):
            sensor.pop("plant", None)
            sensor.pop("station", None)

            # Tính longevity
            create_at = sensors[i].create_at
            if create_at:
                longevity_days = (today - create_at).days
            else:
                longevity_days = None

            sensor["longevity"] = longevity_days

            # ✅ Thêm ngày bảo trì gần nhất đã được duyệt
            last_maintenance = (
                Maintenance.objects
                .filter(sensor=sensors[i], status="approved")
                .order_by("-update_at")
                .only("update_at")
                .first()
            )

            sensor["last_maintenance"] = (
                last_maintenance.update_at.date() if last_maintenance else None
            )

            filtered_data.append(sensor)

        return Response(
            {
                "message": "Lấy danh sách sensor thành công.",
                "plant": plant_id,
                "station": station_id,
                "sensors": filtered_data,
            },
            status=status.HTTP_200_OK,
        )


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
                "temperature",
                "humidity",
                "pm25",
                "pm10",
                "windspeed",
                "wind_direction",
                "airpressure",
                "noise",
                "lux",
                "rain",
                "radiation",
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
                    "parameters": [],
                }

            # Lọc trùng name — chỉ giữ name đầu tiên
            existing_names = {p["name"] for p in grouped_data[sid]["parameters"]}

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
        {"message": f"Đã cập nhật {updated} sensor."}, status=status.HTTP_200_OK
    )


class UpdateThresholdsView(APIView):
    def post(self, request):
        data = request.data.get("data", [])

        for station_group in data:
            for param_data in station_group.get("parameters", []):
                try:
                    param = Parameter.objects.get(id=param_data["id"])

                    # Cập nhật các ngưỡng
                    param.normal_min = param_data.get("normal_min")
                    param.normal_max = param_data.get("normal_max")
                    param.caution_min = param_data.get("caution_min")
                    param.caution_max = param_data.get("caution_max")
                    param.danger_min = param_data.get("danger_min")
                    param.danger_max = param_data.get("danger_max")

                    param.save()
                except Parameter.DoesNotExist:
                    continue  # Nếu không tìm thấy thì bỏ qua

        return Response({"message": "Cập nhật thành công"}, status=status.HTTP_200_OK)


class SensorDetailView(APIView):
    def get(self, request, station_id, sensor_id):
        try:
            sensor = Sensor.objects.select_related("station", "station__plant").get(
                id=sensor_id, station_id=station_id
            )
        except Sensor.DoesNotExist:
            return Response(
                {"error": "Sensor không tồn tại với trạm này."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SensorSerializer(sensor)

        # Thêm thông tin plant và station
        sensor_data = serializer.data
        sensor_data["station_name"] = sensor.station.name if sensor.station else None
        sensor_data["plant_name"] = (
            sensor.station.plant.name
            if sensor.station and sensor.station.plant
            else None
        )

        return Response(sensor_data, status=status.HTTP_200_OK)


class MaintenanceListCreateAPIView(APIView):
    """
    GET: Lấy danh sách maintenance (filter theo status nếu có)
    POST: Tạo mới 1 yêu cầu maintenance
    """

    def get(self, request):
        status_filter = request.GET.get("status", None)
        queryset = Maintenance.objects.all().order_by("-update_at")

        if status_filter:
            # Nếu nhiều status, tách ra theo dấu phẩy
            statuses = status_filter.split(",")
            queryset = queryset.filter(status__in=statuses)

        serializer = MaintenanceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        sensor_id = request.data.get("sensor")

        if not sensor_id:
            return Response(
                {"error": "Thiếu sensor_id"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Tìm bản pending hiện tại
        existing = Maintenance.objects.filter(
            sensor_id=sensor_id, status="pending"
        ).first()

        if existing:
            # Nếu có pending thì update bản cũ
            serializer = MaintenanceSerializer(
                existing, data=request.data, partial=True
            )
        else:
            # Nếu không có thì tạo bản mới
            serializer = MaintenanceSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(status="pending")  # Luôn để pending khi save
            return Response(
                serializer.data,
                status=status.HTTP_200_OK if existing else status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MaintenanceUpdateStatusAPIView(APIView):
    """
    PATCH: Cập nhật status của một maintenance
    """

    def patch(self, request, pk):
        try:
            maintenance = Maintenance.objects.get(pk=pk)
        except Maintenance.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy maintenance."},
                status=status.HTTP_404_NOT_FOUND,
            )

        status_update = request.data.get("status")
        if status_update not in ["approved", "rejected"]:
            return Response(
                {"error": "Status không hợp lệ."}, status=status.HTTP_400_BAD_REQUEST
            )

        maintenance.status = status_update
        maintenance.save()

        return Response({"message": "Cập nhật thành công!"}, status=status.HTTP_200_OK)


class MaintenanceBySensorAPIView(APIView):
    """
    GET: Lấy tất cả lần bảo trì theo sensor_id
    """

    def get(self, request, sensor_id):
        maintenances = Maintenance.objects.filter(sensor_id=sensor_id).order_by(
            "-update_at"
        )
        serializer = MaintenanceSerializer(maintenances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MaintenanceByPlantAPIView(APIView):
    """
    GET: Lấy tất cả maintenance theo plant_id
         + Có thể filter thêm theo status (pending, approved, rejected)
    """

    def get(self, request, plant_id):
        status_filter = request.GET.get("status", None)
        queryset = Maintenance.objects.filter(sensor__plant_id=plant_id)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        queryset = queryset.order_by("-update_at")
        serializer = MaintenanceSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MaintenanceDetailAPIView(APIView):
    """
    API lấy chi tiết maintenance theo id
    """

    def get(self, request, pk):
        try:
            maintenance = Maintenance.objects.get(pk=pk)
        except Maintenance.DoesNotExist:
            return Response(
                {"error": "Maintenance không tồn tại"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = MaintenanceSerializer(maintenance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PlantParameterWarningView(APIView):
    """
    API lấy tổng số lần warning và danger cho toàn bộ stations của 1 plant
    """

    def get(self, request, plant_id):
        from_date_str = request.GET.get("from_date")
        to_date_str = request.GET.get("to_date")

        # Nếu không truyền thì mặc định = hôm nay
        today_str = date.today().strftime("%Y-%m-%d")

        if not from_date_str:
            from_date_str = today_str

        if not to_date_str:
            to_date_str = today_str

        try:
            from_date = datetime.strptime(from_date_str, "%Y-%m-%d")
            to_date = datetime.strptime(to_date_str, "%Y-%m-%d")
        except ValueError:
            return Response(
                {"error": "Sai định dạng ngày. Định dạng đúng: YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Lấy Plant
        try:
            plant = Plant.objects.get(id=plant_id)
        except Plant.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy plant."}, status=status.HTTP_404_NOT_FOUND
            )

        # Lấy stations thuộc plant
        stations = Station.objects.filter(plant_id=plant_id)

        if not stations.exists():
            return Response(
                {"error": "Plant này không có station nào."},
                status=status.HTTP_404_NOT_FOUND,
            )

        final_result = {"plant_id": plant.id, "plant_name": plant.name, "stations": []}

        # Duyệt từng station
        for station in stations:
            parameters = Parameter.objects.filter(
                station_id=station.id, has_threshold=True
            )

            if not parameters.exists():
                continue

            parameter_thresholds = {}
            for param in parameters:
                parameter_thresholds[param.name] = {
                    "caution_min": param.caution_min,
                    "caution_max": param.caution_max,
                    "danger_min": param.danger_min,
                    "danger_max": param.danger_max,
                }

            # Lấy tất cả transaction theo khoảng thời gian
            transactions = Transaction.objects.filter(
                station_id=station.id,
                time__date__gte=from_date,
                time__date__lte=to_date,
            )

            if not transactions.exists():
                continue

            # Bộ đếm ban đầu
            station_warning_raw = {}
            for param_name in parameter_thresholds.keys():
                station_warning_raw[param_name] = {
                    "warning_count": 0,
                    "danger_count": 0,
                }

            # Duyệt transactions
            for tx in transactions:
                for param_name, thresholds in parameter_thresholds.items():
                    value = getattr(tx, param_name, None)

                    if value is None:
                        continue

                    if (
                        thresholds["caution_min"] is not None
                        and thresholds["caution_max"] is not None
                    ):
                        if (
                            thresholds["caution_min"]
                            <= value
                            <= thresholds["caution_max"]
                        ):
                            station_warning_raw[param_name]["warning_count"] += 1

                    if (
                        thresholds["danger_min"] is not None
                        and thresholds["danger_max"] is not None
                    ):
                        if (
                            thresholds["danger_min"]
                            <= value
                            <= thresholds["danger_max"]
                        ):
                            station_warning_raw[param_name]["danger_count"] += 1

            # Lọc chỉ lấy những param có warning hoặc danger > 0
            station_warning_filtered = {
                param_name: counts
                for param_name, counts in station_warning_raw.items()
                if counts["warning_count"] > 0 or counts["danger_count"] > 0
            }

            if station_warning_filtered:
                final_result["stations"].append(
                    {
                        "id": station.id,
                        "name": station.name,
                        "warning": station_warning_filtered,
                    }
                )

        return Response(final_result, status=status.HTTP_200_OK)


class WarningDetailPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


class WarningDetailByPlantView(APIView):
    """
    API lấy chi tiết các lần cảnh báo và nguy hiểm theo Plant
    """

    def get(self, request, plant_id):
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")

        today = timezone.now().date()

        try:
            if from_date:
                from_datetime = datetime.strptime(from_date, "%Y-%m-%d")
            else:
                from_datetime = datetime.combine(today, datetime.min.time())

            if to_date:
                to_datetime = (
                    datetime.strptime(to_date, "%Y-%m-%d")
                    + timedelta(days=1)
                    - timedelta(seconds=1)
                )
            else:
                to_datetime = datetime.combine(today, datetime.max.time())

        except ValueError:
            return Response(
                {"error": "Định dạng ngày không hợp lệ (YYYY-MM-DD)."},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        # Lấy danh sách trạm thuộc Plant
        stations = Station.objects.filter(plant_id=plant_id)
        station_ids = stations.values_list("id", flat=True)

        if not station_ids:
            return Response(
                {"error": "Plant này không có trạm nào."},
                status=http_status.HTTP_404_NOT_FOUND,
            )

        # Lấy Parameter và map theo station_id và parameter name
        parameters = Parameter.objects.filter(
            station_id__in=station_ids, has_threshold=True
        )
        parameter_map = {}
        for param in parameters:
            if param.station_id not in parameter_map:
                parameter_map[param.station_id] = {}
            parameter_map[param.station_id][param.name] = param

        # Lấy các Transaction trong khoảng thời gian
        transactions = Transaction.objects.filter(
            station_id__in=station_ids, time__range=[from_datetime, to_datetime]
        ).order_by("-time")

        results = []

        # Duyệt từng transaction
        for tx in transactions:
            param_keys = [
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
                "co2",
            ]
            for key in param_keys:
                value = getattr(tx, key, None)
                if value is not None:
                    param_obj = parameter_map.get(tx.station_id, {}).get(key)
                    if not param_obj:
                        continue

                    # So sánh ngưỡng để xác định trạng thái
                    status_ = None
                    if (
                        param_obj.danger_min is not None
                        and value < param_obj.danger_min
                    ):
                        status_ = "danger"
                    elif (
                        param_obj.danger_max is not None
                        and value > param_obj.danger_max
                    ):
                        status_ = "danger"
                    elif (
                        param_obj.caution_min is not None
                        and value < param_obj.caution_min
                    ):
                        status_ = "warning"
                    elif (
                        param_obj.caution_max is not None
                        and value > param_obj.caution_max
                    ):
                        status_ = "warning"

                    if status_:
                        results.append(
                            {
                                "station_id": tx.station_id,
                                "station_name": tx.station.name,
                                "parameter_name": key,
                                "value": value,
                                "unit": param_obj.unit or "",
                                "status": status_,
                                "time": tx.time,
                            }
                        )

        # Phân trang kết quả
        paginator = WarningDetailPagination()
        paginated_results = paginator.paginate_queryset(results, request)

        serializer = TransactionWarningDetailSerializer(paginated_results, many=True)
        return paginator.get_paginated_response(serializer.data)


class MaintenanceReminderAPIView(APIView):
    """
    API lấy danh sách maintenance reminder theo plant
    """

    def get(self, request, plant_id):
        today = timezone.now().date()

        # Chỉ lấy những sensor thuộc plant_id
        sensors = Sensor.objects.filter(plant_id=plant_id)

        result = []

        for sensor in sensors:
            # Tìm bản ghi maintenance gần nhất (chỉ tính những cái đã duyệt)
            maintenance = (
                Maintenance.objects.filter(sensor=sensor, status="approved")
                .order_by("-update_at")
                .first()
            )

            if not maintenance:
                continue

            last_maintenance_date = maintenance.update_at.date()

            # Tính số ngày còn lại
            if sensor.day_clean:
                days_until_action = (
                    last_maintenance_date
                    + timedelta(days=(sensor.day_clean - today).days)
                ) - today
                remaining_days = days_until_action.days
            else:
                remaining_days = None

            result.append(
                {
                    "station_id": sensor.station.id if sensor.station else None,
                    "station_name": sensor.station.name if sensor.station else None,
                    "model_sensor": sensor.model_sensor or "",
                    "action": maintenance.action,
                    "last_maintenance_date": last_maintenance_date,
                    "action_due_date": (
                        (
                            last_maintenance_date
                            + timedelta(days=(sensor.day_clean - today).days)
                        )
                        if sensor.day_clean
                        else None
                    ),
                    "remaining_days": remaining_days,
                }
            )

        return Response(result, status=status.HTTP_200_OK)


class Plant24hOverallStatusView(APIView):
    """
    API lấy trạng thái cao nhất mỗi giờ (danger > warning > normal) cho toàn nhà máy trong hôm nay
    (chỉ lấy từ đầu ngày đến giờ hiện tại)
    """

    def get(self, request, plant_id):
        # Lấy thời gian hiện tại và giờ hiện tại
        now = timezone.now()
        today = now.date()
        current_hour = now.hour

        try:
            plant = Plant.objects.get(id=plant_id)
        except Plant.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy nhà máy"}, status=status.HTTP_404_NOT_FOUND
            )

        # Lấy toàn bộ station thuộc plant
        stations = Station.objects.filter(plant_id=plant.id)
        station_ids = stations.values_list("id", flat=True)

        if not station_ids:
            return Response(
                {"error": "Nhà máy này không có trạm nào."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Lấy threshold cho các station
        parameters = Parameter.objects.filter(
            station_id__in=station_ids, has_threshold=True
        )
        threshold_map = {}
        for param in parameters:
            if param.station_id not in threshold_map:
                threshold_map[param.station_id] = {}
            threshold_map[param.station_id][param.name] = {
                "caution_min": param.caution_min,
                "caution_max": param.caution_max,
                "danger_min": param.danger_min,
                "danger_max": param.danger_max,
            }

        # Lấy tất cả transaction hôm nay
        transactions = Transaction.objects.filter(
            station_id__in=station_ids,
            time__date=today,
        )

        if not transactions.exists():
            return Response(
                {"message": "Không có dữ liệu giao dịch hôm nay."},
                status=status.HTTP_200_OK,
            )

        # Kết quả cuối cùng
        hourly_status = {}

        # Chỉ xử lý từ giờ 0 đến giờ hiện tại
        for hour in range(current_hour + 1):
            # Tạo giờ bắt đầu và kết thúc của mỗi giờ
            hour_start = timezone.datetime.combine(
                today, datetime.min.time()
            ) + timedelta(hours=hour)
            hour_end = hour_start + timedelta(hours=1)

            hour_transactions = transactions.filter(
                time__gte=hour_start, time__lt=hour_end
            )

            danger_found = False
            warning_found = False

            for tx in hour_transactions:
                # Check toàn bộ chỉ số cần kiểm tra
                param_keys = [
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
                    "co2",
                ]

                for key in param_keys:
                    value = getattr(tx, key, None)
                    if value is None:
                        continue

                    param_threshold = threshold_map.get(tx.station_id, {}).get(key)
                    if not param_threshold:
                        continue

                    if (
                        param_threshold["danger_min"] is not None
                        and value < param_threshold["danger_min"]
                    ):
                        danger_found = True
                    if (
                        param_threshold["danger_max"] is not None
                        and value > param_threshold["danger_max"]
                    ):
                        danger_found = True

                    if (
                        param_threshold["caution_min"] is not None
                        and value < param_threshold["caution_min"]
                    ):
                        warning_found = True
                    if (
                        param_threshold["caution_max"] is not None
                        and value > param_threshold["caution_max"]
                    ):
                        warning_found = True

            # Xác định mức cao nhất
            if danger_found:
                hourly_status[hour] = "danger"
            elif warning_found:
                hourly_status[hour] = "warning"
            else:
                hourly_status[hour] = "normal"

        return Response(hourly_status, status=status.HTTP_200_OK)
    
    
class StationCRUDAPIView(APIView):
    def delete(self, request, station_id):
        try:
            station = Station.objects.get(id=station_id)
            station.delete()
            return Response(
                {"message": "Xóa trạm thành công!"}, status=status.HTTP_204_NO_CONTENT
            )
        except Station.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy trạm."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, station_id):
        try:
            station = Station.objects.get(id=station_id)
            serializer = StationSerializer(station, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Station.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy trạm."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StationCreateAPIView(APIView):
    def post(self, request):
        serializer = StationCreateSerializer(data=request.data)
        if serializer.is_valid():
            station = serializer.save()
            return Response(
                {
                    "message": "Tạo trạm thành công!",
                    "data": StationCreateSerializer(station).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SensorCreateAPIView(APIView):
    def post(self, request):
        serializer = SensorSerializer(data=request.data)
        if serializer.is_valid():
            sensor = serializer.save()
            return Response({"id": sensor.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ParameterCreateAPIView(APIView):
    def post(self, request):
        serializer = ParameterSerializer(data=request.data)
        if serializer.is_valid():
            parameter = serializer.save()
            return Response({"id": parameter.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CloneSensorAPIView(APIView):
    def post(self, request, sensor_id):
        try:
            original_sensor = Sensor.objects.get(id=sensor_id)
        except Sensor.DoesNotExist:
            return Response(
                {"error": "Sensor không tồn tại."}, status=status.HTTP_404_NOT_FOUND
            )

        station_id = request.data.get("station_id")
        plant_id = request.data.get("plant_id")

        if not station_id or not plant_id:
            return Response(
                {"error": "Thiếu station_id hoặc plant_id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        clone_sensor = Sensor(
            model_sensor=original_sensor.model_sensor,
            manufacturer=original_sensor.manufacturer,
            expiry=original_sensor.expiry,
            expiry_date=original_sensor.expiry_date,
            station_id=station_id,
            plant_id=plant_id,
            day_clean=original_sensor.day_clean,
        )

        # Clone ảnh (nếu có)
        if original_sensor.image:
            original_path = original_sensor.image.path
            if os.path.exists(original_path):
                filename = os.path.basename(original_path)
                new_filename = "clone_" + filename
                new_path = os.path.join(
                    settings.MEDIA_ROOT, "sensor_images", new_filename
                )

                shutil.copy(original_path, new_path)
                with open(new_path, "rb") as f:
                    clone_sensor.image.save(new_filename, File(f), save=False)

        clone_sensor.save()

        # Clone các parameters (gán sensor_id và station_id mới)
        original_parameters = Parameter.objects.filter(sensor=original_sensor)
        for param in original_parameters:
            Parameter.objects.create(
                sensor=clone_sensor,
                station_id=station_id,
                name=param.name,
                unit=param.unit,
                min_value=param.min_value,
                max_value=param.max_value,
                has_threshold=param.has_threshold,
                caution_min=param.caution_min,
                caution_max=param.caution_max,
                danger_min=param.danger_min,
                danger_max=param.danger_max,
                normal_min=param.normal_min,
                normal_max=param.normal_max,
            )

        return Response(
            {"message": "Clone sensor thành công!", "new_sensor_id": clone_sensor.id},
            status=status.HTTP_201_CREATED,
        )


class ExportPdfEmailAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        plant_id = request.data.get("plantId")
        station_id = request.data.get("stationId")
        from_date = request.data.get("fromDate")
        to_date = request.data.get("toDate")

        if not all([email, plant_id, station_id, from_date, to_date]):
            return Response(
                {"error": "Thiếu thông tin đầu vào"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from_date_obj = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Sai định dạng ngày. Đúng: YYYY-MM-DD"}, status=400
            )

        try:
            plant = Plant.objects.get(id=plant_id)
            station = Station.objects.get(id=station_id, plant=plant)
        except (Plant.DoesNotExist, Station.DoesNotExist):
            return Response({"error": "Không tìm thấy nhà máy hoặc trạm"}, status=404)

        transactions = Transaction.objects.filter(
            plant=plant,
            station=station,
            time__date__range=(from_date_obj, to_date_obj),
        ).order_by("time")

        parameters = Parameter.objects.filter(station=station)
        param_map = {normalize_key(p.name): p for p in parameters}

        results = []

        for transaction in transactions:
            flat_values = {}

            for group, field_list in GROUP_MAP.items():
                for field in field_list:
                    norm_field = normalize_key(field)
                    value = getattr(transaction, field, None)
                    param = param_map.get(norm_field)
                    if value is not None and param:
                        value_dict = {
                            "value": value,
                            "unit": (param.unit or "").strip(),
                        }

                        if norm_field == "wind_direction":
                            value_dict["label"] = get_wind_direction_label(value)

                        flat_values[field] = value_dict

            results.append(
                {
                    "time": transaction.time,
                    "values": flat_values,
                }
            )

        # Render HTML to PDF
        html = render_to_string(
            "export_pdf_template.html",
            {
                "station": StationSerializer(station).data,
                "transactions": results,
                "from_date": from_date,
                "to_date": to_date,
            },
        )

        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html, dest=pdf_buffer)
        if pisa_status.err:
            return Response({"error": "Không thể tạo PDF"}, status=500)
        pdf_buffer.seek(0)

        # Send email
        message = EmailMessage(
            subject=f"[Báo cáo] {station.name} từ {from_date} đến {to_date}",
            body="Vui lòng xem file PDF đính kèm.",
            from_email=settings.DEFAULT_FROM_EMAIL,  # 👈 Lấy từ cấu hình
            to=[email],
        )
        message.attach(
            f"[Báo cáo] {station.name} từ {from_date} đến {to_date}.pdf",
            pdf_buffer.read(),
            "application/pdf",
        )
        message.send()

        return Response({"message": "Đã gửi thành công!"}, status=200)
