#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir(r'c:\Users\zleepzleepzleep\Desktop\zuzex_case\backend')

python_exe = r'c:\Users\zleepzleepzleep\Desktop\zuzex_case\backend\venv\Scripts\python.exe'

# Uninstall old SQLAlchemy
subprocess.run([python_exe, '-m', 'pip', 'uninstall', 'sqlalchemy', '-y'], capture_output=True)

# Install new SQLAlchemy (2.0.47 is the latest stable compatible with Python 3.13)
print("Installing SQLAlchemy 2.0.47...")
result = subprocess.run([python_exe, '-m', 'pip', 'install', 'sqlalchemy==2.0.47', '--force-reinstall'], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

print("Done!")
