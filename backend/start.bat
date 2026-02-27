@echo off
echo Starting Digital Pet Backend...
cd /d "c:\Users\zleepzleepzleep\Desktop\zuzex_case\backend"
call venv\Scripts\activate.bat
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
