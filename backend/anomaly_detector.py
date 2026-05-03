import numpy as np
from sklearn.ensemble import IsolationForest
import collections

class AnomalyDetector:
    def __init__(self, history_size=60):
        self.history_size = history_size
        self.history = {
            "push-delivery": collections.deque(maxlen=history_size),
            "tesseractdb-query": collections.deque(maxlen=history_size),
            "intellinode-scorer": collections.deque(maxlen=history_size)
        }
        # Isolation forest model
        self.model = IsolationForest(contamination=0.05, random_state=42)
        
    def detect(self, metrics: list) -> list:
        anomalies = []
        for m in metrics:
            service = m["service_name"]
            cpm = m["cost_per_million"]
            
            # Need minimum data to detect anomalies reliably
            if len(self.history[service]) < 10:
                self.history[service].append(cpm)
                continue
                
            history_array = np.array(self.history[service]).reshape(-1, 1)
            
            # 1. Z-Score Approach (against clean baseline)
            mean = np.mean(history_array)
            std = np.std(history_array)
            z_score = (cpm - mean) / std if std > 0 else 0
            
            # 2. Isolation Forest Approach (fit on recent history, predict current)
            self.model.fit(history_array)
            prediction = self.model.predict([[cpm]])
            
            # Flag if both agree or if Z-score is extreme
            is_anomaly = (prediction[0] == -1) or (z_score > 3.0)
            
            if is_anomaly:
                # Calculate blast radius (projected monthly overrun)
                current_rate_hr = m["events_per_sec"] * 3600
                normal_cpm = mean
                cost_diff_per_m = cpm - normal_cpm
                hourly_overrun = (current_rate_hr / 1_000_000) * cost_diff_per_m
                monthly_overrun = hourly_overrun * 24 * 30
                
                remediation = self._get_remediation(service)
                
                anomalies.append({
                    "service_name": service,
                    "is_anomaly": True,
                    "z_score": float(z_score),
                    "projected_monthly_overrun": float(monthly_overrun),
                    "remediation_suggestion": remediation
                })
            else:
                self.history[service].append(cpm)
                
        return anomalies
        
    def _get_remediation(self, service: str) -> str:
        if service == "push-delivery":
            return "Cross-AZ traffic spike detected. Enable NAT Gateway caching or reroute to local AZ."
        elif service == "tesseractdb-query":
            return "High unoptimized query volume. Throttle non-critical analytics ingestion."
        return "Investigate application logs for errors."
