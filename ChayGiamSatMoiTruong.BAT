@echo off
:: Chạy backend
cd /d "D:\Axons_dev\monitor-environment\backend\backend"
start cmd /k "python manage.py runserver 172.24.58.186:8000"

:: Chạy frontend
cd /d "D:\Axons_dev\monitor-environment\frontend"
start cmd /k "npm start"