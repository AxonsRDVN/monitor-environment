# Generated by Django 5.0.13 on 2025-05-06 15:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('monitor_environment', '0013_user_is_staff_user_is_superuser_user_last_login'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='is_staff',
        ),
        migrations.RemoveField(
            model_name='user',
            name='is_superuser',
        ),
        migrations.RemoveField(
            model_name='user',
            name='last_login',
        ),
    ]
