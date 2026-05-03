import random
import time

SERVICES = ["push-delivery", "tesseractdb-query", "intellinode-scorer"]

class EventSimulator:
    def __init__(self):
        self.is_burst_mode = False
        self.burst_start_time = None
        
        # Base lines
        self.base_rates = {
            "push-delivery": {"base": 8000, "vol": 1000},
            "tesseractdb-query": {"base": 5000, "vol": 500},
            "intellinode-scorer": {"base": 2000, "vol": 200}
        }
        
    def set_burst_mode(self, enabled: bool):
        self.is_burst_mode = enabled
        if enabled:
            self.burst_start_time = time.time()
        else:
            self.burst_start_time = None

    def get_current_rates(self):
        rates = {}
        for service in SERVICES:
            base = self.base_rates[service]["base"]
            vol = self.base_rates[service]["vol"]
            
            # Normal fluctuation
            current_rate = random.normalvariate(base, vol)
            
            # Burst logic (IPL traffic simulation)
            if self.is_burst_mode:
                if service == "push-delivery":
                    # Massive spike for push
                    current_rate = random.normalvariate(base * 35, vol * 10) 
                elif service == "tesseractdb-query":
                    # High spike
                    current_rate = random.normalvariate(base * 15, vol * 5)
                elif service == "intellinode-scorer":
                    # Moderate spike
                    current_rate = random.normalvariate(base * 5, vol * 2)
                    
            rates[service] = max(0, current_rate) # Prevent negative rates
            
        return rates
