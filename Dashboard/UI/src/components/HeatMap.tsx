import React, { useState } from 'react';
import { motion } from 'framer-motion';

const HeatMap: React.FC = () => {
  const [loading, setLoading] = useState(true); // Loading state

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Drug Trafficking Heatmap</h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        {loading && (
          <div className="w-full h-[600px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
        <iframe
          title="Sales Heatmap"
          src="http://127.0.0.1:8080/dashboard/heatmap" // URL served by Flask
          width="100%"
          height="600px"
          style={{ border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
          className={`transition-transform duration-300 hover:scale-105 ${loading ? 'hidden' : ''}`}
          onLoad={() => setLoading(false)} // Set loading to false once iframe loads
        />
      </motion.div>
    </div>
  );
};

export default HeatMap;
