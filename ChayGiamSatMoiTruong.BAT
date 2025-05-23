@echo off
:: Chạy backend
cd /d "D:\Axons_dev\monitor-environment\backend\backend"
start cmd /k "python manage.py runserver 192.168.1.104:8000"

:: Chạy frontend
cd /d "D:\Axons_dev\monitor-environment\frontend"
start cmd /k "npm start"