import asyncio
import json

import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from metrics import collect_all

# warm up cpu_percent (first call always returns 0)
psutil.cpu_percent(interval=None, percpu=True)

app = FastAPI(title="System Monitor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/metrics")
async def metrics_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = collect_all()
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass


@app.get("/health")
def health():
    return {"status": "ok"}
