# Generated by Django 5.0.14 on 2025-04-27 10:23

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor_environment', '0009_alter_sensor_day_clean'),
    ]

    operations = [
        migrations.AddField(
            model_name='sensor',
            name='create_at',
            field=models.DateField(auto_now_add=True, default=datetime.date(2024, 4, 26)),
            preserve_default=False,
        ),
    ]
