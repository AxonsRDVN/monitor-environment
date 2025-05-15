from django.db import models

class Sensor(models.Model):
    image = models.ImageField(upload_to="sensor_images/", null=True)
    model_sensor = models.CharField(max_length=100, null=True)
    expiry = models.IntegerField(blank=True, null=True)
    manufacturer = models.CharField(max_length=100, null=True)
    create_at = models.DateField(auto_now_add=True)

    class Meta:
        db_table = "Sensor"  # 👈 Tạo bảng tên "Sensor"

    def __str__(self):
        return f"{self.model_sensor}"

class Parameter(models.Model):
    sensor = models.ForeignKey(
        Sensor, on_delete=models.CASCADE, related_name="parameters"
    )
    name = models.CharField(max_length=100, null=True)
    unit = models.CharField(max_length=50, null=True)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    has_threshold = models.BooleanField(default=False)

    class Meta:
        db_table = "Parameter"  # 👈 Tạo bảng tên "Parameter"

    def __str__(self):
        return f"{self.name} ({self.sensor})"
