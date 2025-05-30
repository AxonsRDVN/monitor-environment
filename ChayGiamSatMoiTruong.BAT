@echo off
:: Chạy backend
cd /d "D:\Axons_dev\monitor-environment\backend\backend"
start cmd /k "python manage.py runserver 192.168.1.10:8010"

:: Chạy frontend
cd /d "D:\Axons_dev\monitor-environment\frontend"
start cmd /k "npm start"