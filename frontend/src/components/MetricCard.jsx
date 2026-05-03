import React from 'react';
import { Activity, DollarSign, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, colorClass, highlight }) => {
  return (
    <motion.div 
      className={`glass-panel p-6 flex items-center space-x-4 ${highlight ? 'animate-pulse-alert ring-2 ring-pink-500' : ''}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`p-3 rounded-full bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
      </div>
    </motion.div>
  );
};

export default MetricCard;
