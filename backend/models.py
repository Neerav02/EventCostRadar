from pydantic import BaseModel
from typing import List, Optional

class ServiceMetric(BaseModel):
    service_name: str
    events_per_sec: float
    cost_per_million: float
    total_cost_per_hour: float

class AnomalyAlert(BaseModel):
    service_name: str
    is_anomaly: bool
    z_score: float
    projected_monthly_overrun: float
    remediation_suggestion: str

class DashboardState(BaseModel):
    timestamp: str
    is_burst_mode: bool
    services: List[ServiceMetric]
    anomalies: List[AnomalyAlert]
