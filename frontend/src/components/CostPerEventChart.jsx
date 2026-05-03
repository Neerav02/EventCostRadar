import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const CostPerEventChart = ({ data, anomalies }) => {
  return (
    <div className="glass-panel p-6 h-[300px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Unit Economics (Cost per 1M Events)</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => '$' + val.toFixed(2)} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value) => ['$' + value.toFixed(3), 'Cost / 1M']}
            />
            {anomalies && anomalies.length > 0 && anomalies.map((a, i) => (
                <ReferenceArea key={i} x1={a.time} x2={a.time} strokeOpacity={0.3} fill="#FF0055" fillOpacity={0.2} />
            ))}
            <Line type="monotone" dataKey="push-delivery-cpm" stroke="#00F0FF" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="tesseractdb-query-cpm" stroke="#B026FF" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="intellinode-scorer-cpm" stroke="#00FF66" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostPerEventChart;
