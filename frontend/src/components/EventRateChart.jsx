import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EventRateChart = ({ data }) => {
  return (
    <div className="glass-panel p-6 h-[300px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Event Throughput (events/sec)</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPush" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorQuery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B026FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#B026FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorScorer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00FF66" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => (val / 1000).toFixed(0) + 'k'} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="push-delivery" stroke="#00F0FF" fillOpacity={1} fill="url(#colorPush)" strokeWidth={2} />
            <Area type="monotone" dataKey="tesseractdb-query" stroke="#B026FF" fillOpacity={1} fill="url(#colorQuery)" strokeWidth={2} />
            <Area type="monotone" dataKey="intellinode-scorer" stroke="#00FF66" fillOpacity={1} fill="url(#colorScorer)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventRateChart;
