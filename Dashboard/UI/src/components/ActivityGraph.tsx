import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ActivityGraphProps {
  data: { date: string; value: number }[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const ActivityGraph: React.FC<ActivityGraphProps> = ({ data }) => {
  const formattedData = data.map((entry) => ({
    ...entry,
    date: formatDate(entry.date),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[250px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "0.375rem",
              color: "#f3f4f6",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#34d399"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const [graphData, setGraphData] = useState<{ date: string; value: number }[]>(
    []
  );
  const [loading, setLoading] = useState(true); // Loading state added

  useEffect(() => {
    const dummyData = [
      { date: "2024-10-19", value: 3 },
      { date: "2024-10-20", value: 1 },
      { date: "2024-10-21", value: 5 },
      { date: "2024-10-22", value: 0 },
      { date: "2024-10-23", value: 2 },
      { date: "2024-10-24", value: 0 },
      { date: "2024-10-25", value: 1 },
    ];

    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8080/dashboard/activity",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const Data = data.map((item) => {
          const date = Object.keys(item)[0];
          const value = item[date];
          return { date, value };
        });
        const FinalData = dummyData.concat(Data);

        setGraphData(FinalData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Drug Trafficking Accounts Monitoring
      </h1>
      {loading ? (
        <div className="w-full h-[250px] flex items-center justify-center">
          {/* Simple loading spinner */}
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <ActivityGraph data={graphData} />
      )}
    </div>
  );
};

export default Dashboard;
