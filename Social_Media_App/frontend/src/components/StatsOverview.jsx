import { motion, AnimatePresence } from "framer-motion";

export const StatsOverview = ({ data }) => {
  const stats = [
    { 
      label: "Total IPs", 
      value: data.length, 
      color: "bg-blue-900/80",
      gradient: "from-blue-500/20 to-blue-600/20" 
    },
    { 
      label: "High Risk", 
      value: data.filter(ip => ip.risk === "high").length, 
      color: "bg-red-900/80",
      gradient: "from-red-500/20 to-red-600/20"
    },
    { 
      label: "Medium Risk", 
      value: data.filter(ip => ip.risk === "medium").length, 
      color: "bg-yellow-900/80",
      gradient: "from-yellow-500/20 to-yellow-600/20"
    },
    { 
      label: "Low Risk", 
      value: data.filter(ip => ip.risk === "low").length, 
      color: "bg-green-900/80",
      gradient: "from-green-500/20 to-green-600/20"
    },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex gap-4">
      <AnimatePresence>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              damping: 15
            }}
            className={`
              ${stat.color} backdrop-blur-md p-4 rounded-lg shadow-lg
              border border-white/20 min-w-[140px]
              bg-gradient-to-br ${stat.gradient}
              hover:scale-105 transition-transform cursor-pointer
            `}
          >
            <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            <div className="text-white text-2xl font-bold mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};