from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)


class Plant(models.Model):
    name = models.CharField(max_length=100)
    org_code = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    contact_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Nhà máy: {self.name} - Mã tổ chức: {self.org_code}"


class Function(models.Model):
    function_code = models.CharField(
        max_length=100, blank=True, null=True
    )  # Field name made lowercase.
    description = models.TextField(blank=True, null=True)  # Field name made lowercase.

    def __str__(self):
        return self.function_code + " " + str(self.id)


class Role(models.Model):
    role_name = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    functions = models.ManyToManyField("Function", blank=True)

    def __str__(self):
        return f"{self.role_name} (ID: {self.id})"


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("Username is required")
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = [("male", "Male"), ("female", "Female")]

    full_name = models.CharField(max_length=100, blank=True, null=True)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    avatar_img = models.ImageField(blank=True, null=True, upload_to="avatars/")
    gender = models.CharField(
        max_length=20, choices=GENDER_CHOICES, blank=True, null=True
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # cần nếu dùng admin
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    access_times = models.IntegerField(default=0)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.username} (ID: {self.id})"


class Station(models.Model):
    STATION_TYPE_CHOICES = [
        (1, "Station"),  # Trạm con
        (2, "Master"),  # Trạm chính
    ]

    plant = models.ForeignKey(
        "Plant", on_delete=models.CASCADE, related_name="stations"
    )

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.CharField(max_length=255, blank=True, null=True)
    longitude = models.CharField(max_length=255, blank=True, null=True)
    channel = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    type = models.IntegerField(choices=STATION_TYPE_CHOICES, default=1)

    # Liên kết đến Master (nếu đây là Station)
    master = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sub_stations",
        limit_choices_to={"type": 2},
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.type == 1 and self.master is None:
            raise ValidationError("Station phải được gán cho một Master.")
        if self.type == 2 and self.master is not None:
            raise ValidationError("Master không được gán cho Master khác.")

    def __str__(self):
        return f"{self.name} ({self.get_type_display()}) - {self.code}"


class Transaction(models.Model):
    plant = models.ForeignKey(
        Plant, on_delete=models.CASCADE, related_name="transactions"
    )
    station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="transactions"
    )
    device_code = models.CharField(
        max_length=50, blank=True, null=True
    )  # 🆕 Thêm dòng này
    windspeed = models.FloatField(blank=True, null=True)
    wind_direction = models.IntegerField(blank=True, null=True)
    pm25 = models.IntegerField(blank=True, null=True)
    pm10 = models.IntegerField(blank=True, null=True)
    airpressure = models.FloatField(blank=True, null=True)
    temperature = models.FloatField(blank=True, null=True)
    humidity = models.FloatField(blank=True, null=True)
    noise = models.FloatField(blank=True, null=True)
    lux = models.FloatField(blank=True, null=True)
    rain = models.FloatField(blank=True, null=True)
    radiation = models.FloatField(blank=True, null=True)
    time = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.station:
            self.device_code = self.station.code  # 🧠 gán code từ station
        super().save(*args, **kwargs)


class Threshold(models.Model):
    plant = models.ForeignKey(
        Plant, on_delete=models.CASCADE, related_name="thresholds"
    )
    station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="thresholds"
    )
    device_code = models.CharField(
        max_length=50, blank=True, null=True
    )  # 🆕 Thêm dòng này
    name = models.CharField(max_length=100, blank=True, null=True)
    normal_min = models.FloatField(blank=True, null=True)
    normal_max = models.FloatField(blank=True, null=True)
    caution_min = models.FloatField(blank=True, null=True)
    caution_max = models.FloatField(blank=True, null=True)
    danger_min = models.FloatField(blank=True, null=True)
    danger_max = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# Create your models here.
class Sensor(models.Model):
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name="sensors")
    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name="sensors",
        null=True,
        blank=True,
    )
    image = models.ImageField(upload_to="sensor_images/", null=True, blank=True)
    model_sensor = models.CharField(max_length=100, null=True)
    expiry = models.IntegerField(blank=True, null=True)
    expiry_date = models.DateTimeField(blank=True, null=True)
    manufacturer = models.CharField(max_length=100, null=True)
    day_clean = models.DateField(blank=True, null=True)
    create_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_sensor}"


class Parameter(models.Model):
    sensor = models.ForeignKey(
        Sensor, on_delete=models.CASCADE, related_name="parameters"
    )
    station = models.ForeignKey(
        Station, on_delete=models.CASCADE, related_name="parameters"
    )
    name = models.CharField(max_length=100, null=True)
    unit = models.CharField(max_length=50, null=True)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    has_threshold = models.BooleanField(default=False)
    normal_min = models.FloatField(blank=True, null=True)
    normal_max = models.FloatField(blank=True, null=True)
    caution_min = models.FloatField(blank=True, null=True)
    caution_max = models.FloatField(blank=True, null=True)
    danger_min = models.FloatField(blank=True, null=True)
    danger_max = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.sensor})"


from django.db import models


class Maintenance(models.Model):
    ACTION_CHOICES = [
        ("maintenance", "Bảo trì"),
        ("replacement", "Thay thế"),
    ]

    STATUS_CHOICES = [
        ("pending", "Chờ duyệt"),
        ("approved", "Đã duyệt"),
        ("rejected", "Hủy bỏ"),
    ]

    ROLE_CHOICES = [
        ("user", "Người dùng"),
        ("Management", "Người quản lí"),
        ("admin", "Quản trị viên"),
    ]

    sensor = models.ForeignKey(
        Sensor, on_delete=models.CASCADE, related_name="maintenances"
    )
    image_before = models.ImageField(
        upload_to="maintenance_images/before/", null=True, blank=True
    )
    image_after = models.ImageField(
        upload_to="maintenance_images/after/", null=True, blank=True
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    update_at = models.DateTimeField(auto_now=True)  # tự động cập nhật khi sửa
    user_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    moderator = models.CharField(max_length=100, null=True, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, null=True, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )  # vĩ độ
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )  # kinh độ

    def __str__(self):
        return f"Maintenance for {self.sensor.model_sensor} - {self.get_action_display()} ({self.get_status_display()})"
