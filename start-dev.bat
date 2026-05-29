@echo off
cd /d "%~dp0"
echo Servis Dosya Takip - http://localhost:3000
echo Bu pencereyi KAPATMAYIN; sunucu burada calisir.
"C:\Program Files\nodejs\npm.cmd" run dev
pause
