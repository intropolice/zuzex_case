#!/usr/bin/env python
import subprocess
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    from main import app
    
    print("🚀 Starting Digital Pet API Server...")
    print("📍 Server running on http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=False,
        log_level="info"
    )
