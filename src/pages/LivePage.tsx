import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import ChartTitle from "../components/ChartTitle";
import CrestGauge from "../components/GaugeMeter";
import KPICards from "../components/KPICard";
import ChartLoader from "../components/ChartLoader";
import { motion } from "framer-motion";
import { ShimmerEffect } from "../components/ShimmerEffect";

const LivePage = ({ liveData, isLoading }) => {
  if (isLoading || !liveData?.length) {
    return <LivePageLoader />;
  }

  return (
    <>
      <KPICards data={liveData} mode="live" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card">
          <ChartTitle title="Acceleration & Velocity Trends" />
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={liveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis yAxisId="accel" stroke="#60a5fa" />
              <YAxis yAxisId="vel" orientation="right" stroke="#34d399" />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Line
                yAxisId="accel"
                type="monotone"
                dataKey="accelRms"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="accel"
                type="monotone"
                dataKey="accelMax"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="vel"
                type="monotone"
                dataKey="velocityRms"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1">
          <CrestGauge value={liveData[liveData.length - 1]?.velocityRms || 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="glass-card">
          <ChartTitle title="Acceleration RMS Trend" />
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={liveData}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="accelRms"
                stroke="#3b82f6"
                fill="#3b82f633"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card">
          <ChartTitle title="Velocity RMS Trend" />
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={liveData}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="velocityRms"
                stroke="#10b981"
                fill="#10b98133"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

const LivePageLoader = () => (
  <>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {[...Array(5)].map((_, i) => (
        <KpiLoader key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card">
        <ChartTitle title="Acceleration & Velocity Trends" />
        <ChartLoader height={320} />
      </div>
      <div className="lg:col-span-1">
        <GaugeLoader />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="glass-card">
        <ChartTitle title="Acceleration RMS Trend" />
        <ChartLoader height={250} />
      </div>
      <div className="glass-card">
        <ChartTitle title="Velocity RMS Trend" />
        <ChartLoader height={250} />
      </div>
    </div>
  </>
);

const KpiLoader = () => (
  <motion.div
    className="glass-card text-center relative overflow-hidden"
    initial={{ opacity: 0.6 }}
    animate={{ opacity: 1 }}
    transition={{
      repeat: Infinity,
      duration: 1.2,
      ease: "easeInOut",
      repeatType: "reverse",
    }}
  >
    <div className="relative">
      <div className="h-4 bg-slate-200 rounded w-16 mx-auto mb-2"></div>
      <div className="h-8 bg-slate-200 rounded w-20 mx-auto"></div>
      <ShimmerEffect />
    </div>
  </motion.div>
);

const GaugeLoader = () => (
  <motion.div
    className="glass-card h-full flex flex-col items-center justify-center relative overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative">
      <svg width="240" height="240" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="339.292"
          strokeDashoffset="339.292"
          initial={{ strokeDashoffset: 339.292 }}
          animate={{ strokeDashoffset: 169.646 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        <circle cx="60" cy="60" r="6" fill="#3b82f6">
          <animate
            attributeName="r"
            values="6;8;6"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-3xl font-bold text-slate-700"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            --
          </motion.div>
          <div className="text-sm text-slate-600">mm/s</div>
        </div>
      </div>
    </div>
    <div className="mt-4 text-sm text-slate-600 flex items-center gap-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      Initializing gauge
    </div>
    <ShimmerEffect />
  </motion.div>
);

export default LivePage;
