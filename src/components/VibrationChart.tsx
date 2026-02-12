import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import CrestGauge from './GaugeMeter';

export default function VibrationDashboard({ data }) {
  const isLoading = !data || data.length === 0;
  const latest = data[data.length - 1] || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
        {/* Header unchanged */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Machine Vibration Dashboard
          </h1>
          <p className="text-slate-400 text-sm">Real-time condition monitoring</p>
        </div>

        {/* KPI Cards with shimmer effect */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <KpiLoader key={i} />
          ))}
        </div>

        {/* Main Layout with loaders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Combined Chart Loader */}
          <div className="lg:col-span-2 glass-card">
            <ChartTitle title="Acceleration & Velocity Trends" />
            <ChartLoader height={320} />
          </div>

          {/* Crest Gauge Loader */}
          <div className="lg:col-span-1">
            <GaugeLoader />
          </div>
        </div>

        {/* Secondary Charts Loaders */}
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
      </div>
    );
  }

  // Original return with data
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Machine Vibration Dashboard
        </h1>
        <p className="text-slate-400 text-sm">Real-time condition monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Kpi title="Accel RMS" value={latest.accelRms} unit="mg" />
        <Kpi title="Accel Max" value={latest.accelMax} unit="mg" />
        <Kpi title="Peak-to-Peak" value={latest.accelPP} unit="mg" />
        <Kpi title="Velocity RMS" value={latest.velocityRms} unit="mm/s" />
        <Kpi title="Crest Factor" value={latest.crest} />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Combined Chart */}
        <div className="lg:col-span-2 glass-card">
          <ChartTitle title="Acceleration & Velocity Trends" />
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis yAxisId="accel" stroke="#60a5fa" />
              <YAxis yAxisId="vel" orientation="right" stroke="#34d399" />
              <Tooltip
                contentStyle={{
                  background: '#020617',
                  border: '1px solid #334155',
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

        {/* Crest Gauge */}
        <div className="lg:col-span-1">
          <CrestGauge value={latest.velocityRms || 0} />
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Acceleration Area */}
        <div className="glass-card">
          <ChartTitle title="Acceleration RMS Trend" />
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
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

        {/* Velocity Area */}
        <div className="glass-card">
          <ChartTitle title="Velocity RMS Trend" />
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
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
    </div>
  );
}

/* KPI Card */
function Kpi({ title, value, unit }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="glass-card text-center">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-2xl font-bold">
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
    </motion.div>
  );
}

/* Chart Title */
function ChartTitle({ title }) {
  return (
    <div className="text-lg font-semibold mb-3 text-slate-200">{title}</div>
  );
}

/* === LOADER COMPONENTS === */

/* KPI Card Loader with Shimmer */
function KpiLoader() {
  return (
    <motion.div 
      className="glass-card text-center relative overflow-hidden"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", repeatType: "reverse" }}
    >
      <div className="relative">
        <div className="h-4 bg-slate-700/50 rounded w-16 mx-auto mb-2"></div>
        <div className="h-8 bg-slate-700/50 rounded w-20 mx-auto"></div>
        <ShimmerEffect />
      </div>
    </motion.div>
  );
}

/* Chart Loader with Animated Graph Placeholder */
function ChartLoader({ height }) {
  return (
    <div className="relative w-full" style={{ height }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="w-full h-full" 
          preserveAspectRatio="none" 
          viewBox="0 0 400 200"
        >
          {/* Background grid */}
          <rect width="400" height="200" fill="#0f172a" />
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 50}
              x2="400"
              y2={i * 50}
              stroke="#1e293b"
              strokeWidth="1"
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`v-${i}`}
              x1={i * 100}
              y1="0"
              x2={i * 100}
              y2="200"
              stroke="#1e293b"
              strokeWidth="1"
            />
          ))}

          {/* Animated waveform lines */}
          <motion.path
            d="M0,150 L50,100 L100,120 L150,80 L200,100 L250,60 L300,80 L350,40 L400,60"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0.5 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop"
            }}
          />
          
          <motion.path
            d="M0,180 L50,140 L100,160 L150,120 L200,140 L250,100 L300,120 L350,80 L400,100"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0.5 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop",
              delay: 0.3
            }}
          />

          {/* Animated data points */}
          {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x, i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={[150, 100, 120, 80, 100, 60, 80, 40, 60][i]}
              r="3"
              fill="#3b82f6"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.2,
                repeatDelay: 1
              }}
            />
          ))}
        </svg>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-300">Loading vibration data...</span>
        </div>
      </div>
      <ShimmerEffect />
    </div>
  );
}

/* Gauge Loader */
function GaugeLoader() {
  return (
    <motion.div 
      className="glass-card h-full flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        {/* Animated gauge circle */}
        <svg width="240" height="240" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          
          {/* Animated gauge arc */}
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
              ease: "easeInOut"
            }}
          />
          
          {/* Center point */}
          <circle cx="60" cy="60" r="6" fill="#3b82f6">
            <animate
              attributeName="r"
              values="6;8;6"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        
        {/* Value placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-slate-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              --
            </motion.div>
            <div className="text-sm text-slate-500">mm/s</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-slate-400 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        Initializing gauge
      </div>
      <ShimmerEffect />
    </motion.div>
  );
}

/* Shimmer Effect Component */
function ShimmerEffect() {
  return (
    <motion.div
      className="absolute inset-0 -translate-x-full"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      }}
      animate={{ x: ['0%', '200%'] }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "linear",
        repeatDelay: 0.5
      }}
    />
  );
}