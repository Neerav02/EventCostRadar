import asyncio
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel

from simulator import EventSimulator
from cost_engine import CostEngine
from anomaly_detector import AnomalyDetector
from alert_engine import AlertEngine

app = FastAPI(title="EventCostRadar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = EventSimulator()
cost_engine = CostEngine()
detector = AnomalyDetector()
alert_engine = AlertEngine()

class BurstRequest(BaseModel):
    enabled: bool

@app.post("/api/burst")
async def toggle_burst(req: BurstRequest):
    simulator.set_burst_mode(req.enabled)
    return {"status": "success", "burst_mode": simulator.is_burst_mode}

@app.get("/api/stream")
async def stream_metrics():
    async def event_generator():
        while True:
            # 1. Simulate Traffic
            rates = simulator.get_current_rates()
            
            # 2. Calculate Costs
            metrics = cost_engine.calculate_metrics(rates, simulator.is_burst_mode)
            
            # 3. Detect Anomalies
            anomalies = detector.detect(metrics)
            
            # 4. Trigger Alerts
            if anomalies:
                alert_engine.send_alerts(anomalies)
                
            # 5. Build Payload
            import datetime
            payload = {
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "is_burst_mode": simulator.is_burst_mode,
                "services": metrics,
                "anomalies": anomalies
            }
            
            yield {
                "event": "message",
                "id": "message_id",
                "retry": 15000,
                "data": json.dumps(payload)
            }
            
            await asyncio.sleep(1.0) # Stream every second

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
