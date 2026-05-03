import React from 'react';
import { ShieldAlert, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const RemediationPanel = ({ activeAnomaly }) => {
  if (!activeAnomaly) {
    return (
      <div className="glass-panel p-6 flex flex-col h-full items-center justify-center text-gray-500">
        <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
        <p>No active incidents requiring remediation.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 flex flex-col h-full ring-1 ring-cyan-500/30">
      <h3 className="text-lg font-semibold mb-4 text-cyan-400 flex items-center">
        <Terminal className="w-5 h-5 mr-2" /> Recommended Action
      </h3>
      
      <div className="bg-obsidian-light rounded-lg p-4 mb-4 border border-gray-800 flex-1">
        <p className="text-sm text-gray-300 mb-3">
          <span className="font-semibold text-white">Target Service: </span> 
          {activeAnomaly.service_name}
        </p>
        <p className="text-sm text-gray-400 mb-4 bg-gray-900/50 p-3 rounded">
          {activeAnomaly.remediation_suggestion}
        </p>
        
        <div className="mt-auto">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 240, 255, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 px-4 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium transition-colors"
          >
            Apply Remediation via AWS Systems Manager
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RemediationPanel;
