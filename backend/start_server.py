#!/usr/bin/env python
import subprocess
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

try:
    import uvicorn
    print("✓ uvicorn found locally")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
except ImportError:
    print("✗ uvicorn not found, trying direct command...")
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])
