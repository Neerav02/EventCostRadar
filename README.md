# EventCostRadar

A Real-Time Cost-Per-Event Anomaly Dashboard for High-Throughput MarTech Infrastructure.

> "To deliver messaging at CleverTap's scale, we don’t just optimize for performance; we have to optimize for unit economics. When you're pushing 289 million events per second during an IPL match, an architectural inefficiency doesn't just slow things down—it destroys margins." 
> — *Inspired by CleverTap's Engineering Culture & CloudZero approach*

## The Problem

Existing cloud cost tools (AWS Cost Explorer, Kubecost, Finout) are designed for FinOps teams looking at daily or weekly aggregations. They do not correlate cloud cost spikes with **application-level traffic burst events** in real-time. 

When an IPL match starts or a brand launches a flash sale, CleverTap's infrastructure scales massively (e.g., `push-delivery` or `tesseractdb-query` services). If a recent deployment introduced an unoptimized query, or if cross-AZ network traffic spikes due to auto-scaling imbalance, the **cost-per-million-events** will quietly skyrocket. 

By the time the AWS billing alarm fires 12 hours later, thousands of dollars are lost.

## The Solution: EventCostRadar

EventCostRadar is a prototype that bridges event-stream observability with cloud cost intelligence. It is built specifically for the scale and patterns of a MarTech SaaS like CleverTap.

### Key Features

1. **Real-Time Unit Economics:** Calculates the blended and per-service Cost-per-1M-Events dynamically via Server-Sent Events (SSE).
2. **Statistical Anomaly Detection:** Utilizes `scikit-learn` Isolation Forests and standard Z-score deviations to detect when cost-efficiency breaks (independent of total traffic volume).
3. **Blast Radius Projection:** Instantly calculates the projected monthly $$ overrun if the anomaly isn't fixed, prioritizing engineering response.
4. **Actionable Alerts:** Fires Slack webhooks with specific remediation suggestions for the on-call engineer.

## Architecture

*   **Backend:** Python 3.11, FastAPI, `scikit-learn` for anomaly detection.
*   **Frontend:** React, Vite, Recharts, Framer Motion, Tailwind CSS v4 (Custom Dark/Neon theme).
*   **Integration:** Real-time push via SSE (`EventSource`).
*   **Infrastructure:** Docker & Docker Compose.

## How to Run

No complex dependencies. Just Docker.

```bash
# 1. Clone the repository
# 2. Add your Slack webhook (Optional)
cp .env.example .env

# 3. Spin up the stack
docker-compose up --build
```

**Access the Dashboard:** `http://localhost:5173`
**API Docs:** `http://localhost:8000/docs`

## Demo Scenario

1. Open the dashboard at `http://localhost:5173`.
2. You will see normal background traffic (~5k-8k events/sec) across services. Cost efficiency is stable.
3. Click **"SIMULATE IPL BURST"**.
4. **Watch the throughput spike** to hundreds of thousands of events per second.
5. Notice how `push-delivery`'s **unit cost** begins to climb asynchronously due to simulated auto-scaling inefficiencies (e.g., cross-AZ NAT gateway fees).
6. Within 10-15 seconds, the Isolation Forest model detects the deviation. 
7. The anomaly feed updates, a Slack alert is dispatched, and the blast radius projection highlights the business impact.

---
*Built as a prototype for CleverTap Engineering by [Your Name]*
