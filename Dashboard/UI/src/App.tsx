import React, { useState } from 'react';
import { Shield, Activity, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import HeatMap from './components/HeatMap';
import ActivityGraph from './components/ActivityGraph';
import KeywordMonitor from './components/KeywordMonitor';
import DashboardCard from './components/DashboardCard';
import UserBehaviorReport from './components/UserBehaviorReport';
import NetworkGraph from './components/NetworkGraph';

// Mock data for suspicious activities
const activityData = Array.from({ length: 14 }, (_, i) => ({
  date: `Mar ${i + 1}`,
  value: Math.floor(Math.random() * 50 + 20),
}));

// Mock data for keywords
const keywordData = [
  { keyword: "encrypted_comms", count: 127, trend: 23 },
  { keyword: "suspicious_transfer", count: 89, trend: -5 },
  { keyword: "unauthorized_access", count: 156, trend: 45 },
  { keyword: "data_breach", count: 73, trend: 12 },
  { keyword: "malicious_payload", count: 92, trend: -8 },
];

function App() {
  const [showReports, setShowReports] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 text-white p-6 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-emerald-400" />
              <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
            </div>
            <button
              onClick={() => setShowReports(!showReports)}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              {showReports ? 'Show Dashboard' : 'View Reports'}
            </button>
          </div>
        </div>
      </motion.div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!showReports ? (
          <div className="space-y-6">
            {/* Top row with two columns */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Heat Map */}
              <DashboardCard title="">
                <HeatMap />
              </DashboardCard>

              {/* Right column with stacked cards */}
              <div className="space-y-6">
                <DashboardCard title="Suspicious Activities">
                  <div className="flex items-center mb-4 text-emerald-400">
                    <Activity className="w-5 h-5 mr-2" />
                    <span className="font-medium">Real-time Monitoring</span>
                  </div>
                  <ActivityGraph data={activityData} />
                </DashboardCard>

                <DashboardCard title="Keyword Monitoring">
                  <div className="flex items-center mb-4 text-emerald-400">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <span className="font-medium">Trending Keywords</span>
                  </div>
                  <KeywordMonitor keywords={keywordData} />
                </DashboardCard>
              </div>
            </div>

            {/* Full-width Network Graph */}
            <DashboardCard title="Network Graph" className="w-full">
              <NetworkGraph />
            </DashboardCard>
          </div>
        ) : (
          <UserBehaviorReport />
        )}
      </main>
    </div>
  );
}

export default App;