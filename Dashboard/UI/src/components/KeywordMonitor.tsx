import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface KeywordData {
  keyword: string;
  count: number;
}

const fetchKeywordData = async (): Promise<KeywordData[]> => {
  const response = await fetch(
    "http://127.0.0.1:8080/dashboard/keyword-monitor"
  );
  const data = await response.json();
  return Object.entries(data).map(([keyword, count]) => ({
    keyword,
    count: count as number,
  }));
};

const KeywordMonitor: React.FC = () => {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);

  useEffect(() => {
    const loadKeywords = async () => {
      const fetchedKeywords = await fetchKeywordData();
      setKeywords(fetchedKeywords);
    };
    loadKeywords();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex space-x-4 overflow-x-auto p-4"
    >
      {keywords.map((item, index) => (
        <motion.div
          key={item.keyword}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center justify-center min-w-[100px] hover:bg-gray-600/50 hover:scale-105 transition-all duration-300"
        >
          <h3 className="text-lg font-medium text-red-400 mb-1">
            {item.keyword.replace(/_/g, " ")}
          </h3>
          <motion.p
            className="text-3xl font-bold text-green-100"
            animate={{ scale: [1, 1.2, 1] }}
          >
            {item.count}
          </motion.p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default KeywordMonitor;
