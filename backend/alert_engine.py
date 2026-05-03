import os
import requests
from dotenv import load_dotenv

load_dotenv()

class AlertEngine:
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        self.recently_alerted = set()

    def send_alerts(self, anomalies: list):
        if not self.webhook_url or self.webhook_url == "https://hooks.slack.com/services/YOUR/WEBHOOK/URL":
            # Just log to console if not configured
            for a in anomalies:
                print(f"[ALERT FIRED] {a['service_name']} anomaly! Overrun: ${a['projected_monthly_overrun']:,.2f}")
            return

        for a in anomalies:
            service = a["service_name"]
            
            # Simple deduplication (don't spam slack every second for the same anomaly)
            if service in self.recently_alerted:
                continue
                
            self.recently_alerted.add(service)
            
            payload = {
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"🚨 EventCostRadar Anomaly: {service}",
                            "emoji": True
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*Projected Monthly Overrun:* ${a['projected_monthly_overrun']:,.2f}\n*Z-Score:* {a['z_score']:.2f} standard deviations\n*Remediation:* {a['remediation_suggestion']}"
                        }
                    }
                ]
            }
            try:
                requests.post(self.webhook_url, json=payload, timeout=5)
            except Exception as e:
                print(f"Failed to send Slack alert: {e}")
