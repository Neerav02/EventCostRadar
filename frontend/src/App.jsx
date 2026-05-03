import React, { useState, useEffect, useRef } from 'react';
import { Activity, DollarSign, Zap, CloudLightning } from 'lucide-react';
import MetricCard from './components/MetricCard';
import EventRateChart from './components/EventRateChart';
import CostPerEventChart from './components/CostPerEventChart';
import AnomalyFeed from './components/AnomalyFeed';
import RemediationPanel from './components/RemediationPanel';

const App = () => {
  const [dataHistory, setDataHistory] = useState(() => {
    const initial = [];
    const now = new Date();
    for (let i = 15; i > 0; i--) {
      const d = new Date(now.getTime() - i * 1000);
      initial.push({ 
        time: d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' }),
        "push-delivery": 0, "push-delivery-cpm": 0,
        "tesseractdb-query": 0, "tesseractdb-query-cpm": 0,
        "intellinode-scorer": 0, "intellinode-scorer-cpm": 0
      });
    }
    return initial;
  });
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [isBurstMode, setIsBurstMode] = useState(false);
  const sseRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Setup Server-Sent Events connection
    sseRef.current = new EventSource(`${API_URL}/api/stream`);
    
    sseRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const timeStr = new Date(data.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' });
      
      setIsBurstMode(data.is_burst_mode);
      
      // Format history point
      const historyPoint = { time: timeStr };
      let totalEventsSec = 0;
      let totalCostHr = 0;
      
      data.services.forEach(s => {
        historyPoint[s.service_name] = s.events_per_sec;
        historyPoint[`${s.service_name}-cpm`] = s.cost_per_million;
        totalEventsSec += s.events_per_sec;
        totalCostHr += s.total_cost_per_hour;
      });
      
      setDataHistory(prev => {
        const newHistory = [...prev, historyPoint];
        if (newHistory.length > 30) return newHistory.slice(newHistory.length - 30);
        return newHistory;
      });
      
      setCurrentMetrics({
        totalEventsSec,
        blendedCpm: (totalCostHr / (totalEventsSec * 3600 / 1000000)) || 0,
        totalCostHr
      });
      
      if (data.anomalies && data.anomalies.length > 0) {
        setAnomalies(prev => {
          const nowMs = Date.now();
          let newAnomaliesToAdd = [];
          
          data.anomalies.forEach(a => {
            const recentDuplicate = prev.find(p => 
              p.service_name === a.service_name && 
              p.addedAt && (nowMs - p.addedAt < 30000)
            );
            
            if (!recentDuplicate) {
              newAnomaliesToAdd.push({ ...a, timestamp: timeStr, addedAt: nowMs });
            }
          });
          
          if (newAnomaliesToAdd.length === 0) return prev;
          return [...newAnomaliesToAdd, ...prev].slice(0, 10); // Keep last 10
        });
      }
    };

    return () => {
      if (sseRef.current) sseRef.current.close();
    };
  }, [API_URL]);

  const toggleBurst = async () => {
    try {
      await fetch(`${API_URL}/api/burst`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isBurstMode })
      });
    } catch (e) {
      console.error("Failed to toggle burst mode", e);
    }
  };

  const hasActiveAnomaly = anomalies.length > 0 && 
    (new Date() - new Date(new Date().toDateString() + ' ' + anomalies[0].timestamp)) < 15000; // rough check for recency

  return (
    <div className="min-h-screen bg-obsidian text-gray-200 p-6 font-sans">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center tracking-tight">
            <Zap className="w-8 h-8 text-cyan-400 mr-3" /> EventCostRadar
          </h1>
          <p className="text-gray-400 mt-1">Real-Time Cost-Per-Event Anomaly Detection</p>
        </div>
        <button 
          onClick={toggleBurst}
          className={`px-6 py-3 rounded-lg font-bold flex items-center transition-all ${
            isBurstMode 
            ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-[0_0_15px_rgba(255,0,85,0.5)]' 
            : 'bg-obsidian-light hover:bg-gray-800 text-gray-300 border border-gray-700'
          }`}
        >
          <CloudLightning className="w-5 h-5 mr-2" />
          {isBurstMode ? 'STOP BURST SIMULATION' : 'SIMULATE IPL BURST'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          title="Total Ingestion Rate" 
          value={currentMetrics ? `${(currentMetrics.totalEventsSec / 1000).toFixed(1)}k/sec` : 'Loading...'} 
          icon={Activity} 
          colorClass="text-cyan-400"
        />
        <MetricCard 
          title="Blended Cost per 1M Events" 
          value={currentMetrics ? `$${currentMetrics.blendedCpm.toFixed(3)}` : '...'} 
          icon={DollarSign} 
          colorClass="text-purple-400"
          highlight={hasActiveAnomaly}
        />
        <MetricCard 
          title="Est. Hourly AWS Spend" 
          value={currentMetrics ? `$${currentMetrics.totalCostHr.toFixed(2)}` : '...'} 
          icon={Zap} 
          colorClass="text-green-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <EventRateChart data={dataHistory} />
          <CostPerEventChart data={dataHistory} anomalies={anomalies.filter((v,i,a)=>a.findIndex(t=>(t.timestamp === v.timestamp))===i)} />
        </div>
        <div className="space-y-6 flex flex-col">
          <div className="flex-1 min-h-[300px]">
             <AnomalyFeed anomalies={anomalies} />
          </div>
          <div className="h-[250px]">
             <RemediationPanel activeAnomaly={anomalies[0]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
