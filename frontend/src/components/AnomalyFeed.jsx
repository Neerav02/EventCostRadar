import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const AnomalyFeed = ({ anomalies }) => {
  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-pink-500" /> Real-time Anomalies
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        <AnimatePresence>
          {anomalies.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-gray-500 text-sm italic text-center mt-10"
            >
              System nominal. Monitoring cost streams...
            </motion.div>
          )}
          {anomalies.map((anomaly, index) => (
            <motion.div
              key={`${anomaly.timestamp}-${anomaly.service_name}-${index}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="glass-panel-alert p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-pink-500">{anomaly.service_name}</span>
                <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full border border-pink-500/30">
                  {anomaly.z_score.toFixed(1)}σ Deviation
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Unit cost efficiency degraded.</p>
              <div className="bg-obsidian-light p-2 rounded text-xs border border-gray-800">
                <span className="text-gray-400">Proj. Blast Radius: </span>
                <span className="text-red-400 font-mono font-bold">+${anomaly.projected_monthly_overrun.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mo</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnomalyFeed;
