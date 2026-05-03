import random

class CostEngine:
    def __init__(self):
        # Base cost per million events
        self.base_cpm = {
            "push-delivery": 0.12, 
            "tesseractdb-query": 0.45,
            "intellinode-scorer": 1.20
        }

    def calculate_metrics(self, event_rates: dict, is_burst_mode: bool) -> list:
        metrics = []
        for service, rate_per_sec in event_rates.items():
            rate_per_hour = rate_per_sec * 3600
            rate_in_millions = rate_per_hour / 1_000_000
            
            current_cpm = self.base_cpm[service]
            
            # Introduce non-linear cost degradation during burst (the anomaly)
            if is_burst_mode and service == "push-delivery":
                # Simulated inefficiency: network NAT gateway limits hit, excessive cross-AZ traffic
                degradation_factor = random.uniform(3.5, 4.2)
                current_cpm *= degradation_factor
                
            if is_burst_mode and service == "tesseractdb-query":
                 # Slight degradation
                 current_cpm *= random.uniform(1.2, 1.5)

            # Add slight random jitter to cost to simulate real-world pricing micro-fluctuations
            current_cpm = current_cpm * random.uniform(0.98, 1.02)
                
            total_cost_per_hour = rate_in_millions * current_cpm
            
            metrics.append({
                "service_name": service,
                "events_per_sec": rate_per_sec,
                "cost_per_million": current_cpm,
                "total_cost_per_hour": total_cost_per_hour
            })
            
        return metrics
