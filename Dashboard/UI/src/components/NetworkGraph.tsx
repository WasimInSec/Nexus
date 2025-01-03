import React from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

const NetworkGraph: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex items-center mb-4 text-emerald-400">
        <Share2 className="w-5 h-5 mr-2" />
        <span className="font-medium">Network Analysis</span>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gray-900/50 rounded-lg overflow-hidden group"
        style={{ height: '300px' }}
      >
        <motion.iframe
          src="http://localhost:8080/dashboard/network"
          className="w-full h-full transition-transform duration-300 ease-in-out transform group-hover:scale-105"
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
          }}
          title="Network Analysis"
        />
      </motion.div>
    </div>
  );
};

export default NetworkGraph;
