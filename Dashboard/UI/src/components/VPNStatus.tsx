import { motion } from 'framer-motion';

const VPNStatus = ({ isVPN, confidenceScore, detectedAt }) => {
  const statusColor = isVPN ? 'red' : 'emerald';
  const bgColor = isVPN ? 'bg-red-500/10' : 'bg-emerald-500/10';
  const borderColor = isVPN ? 'border-red-500/20' : 'border-emerald-500/20';
  const textColor = isVPN ? 'text-red-400' : 'text-emerald-400';
  const confidenceColor = isVPN ? 'text-red-400' : 'text-emerald-400';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <div className="flex items-center space-x-3">
        <div className={`h-3 w-3 rounded-full bg-${statusColor}-500 animate-pulse`} />
        <span className={`font-medium ${textColor}`}>
          VPN Detected: {isVPN ? 'Yes' : 'No'}
        </span>
      </div>
      <span className="text-sm text-gray-400">Last checked: {detectedAt}</span>

      {/* Confidence Score */}
      <div className="relative pt-4 w-full">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">VPN Confidence Score</span>
          <span className={`text-sm font-medium ${confidenceColor}`}>{confidenceScore}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidenceScore}%` }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className={`h-3 rounded-full bg-${statusColor}-400 relative`}
          >
            <div className={`absolute -right-1 -top-1 h-5 w-5 rounded-full bg-${statusColor}-400 shadow-lg shadow-${statusColor}-500/50`} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VPNStatus;
