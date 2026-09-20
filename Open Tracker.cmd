@echo off
powershell.exe -NoProfile -File "%~dp0Open-Tracker.ps1"
if errorlevel 1 pause
