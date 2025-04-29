from rest_framework import serializers
from .models import Sensor, Parameter

class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = ['id', 'name', 'unit', 'min_value', 'max_value', 'has_threshold', 'sensor']

class SensorSerializer(serializers.ModelSerializer):
    parameters = ParameterSerializer(many=True, read_only=True)

    class Meta:
        model = Sensor
        fields = ['id', 'model_sensor', 'image', 'expiry', 'expiry_date', 'manufacturer', 'create_at', 'parameters']
