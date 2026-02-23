import React from "react";
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import { motion } from "framer-motion";
import CrestGauge from "./GaugeMeter";
export default function VibrationDashboard({ data }) {
  const latest = data[data.length - 1] || {};

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Machine Vibration Dashboard
        </h1>
        <p className="text-slate-500 text-sm">Real-time condition monitoring</p>
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
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
          <ChartTitle title="Acceleration & Velocity Trends" />
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis yAxisId="accel" stroke="#3b82f6" />
              <YAxis yAxisId="vel" orientation="right" stroke="#10b981" />

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
          <ChartTitle title="Acceleration RMS Trend" />
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="accelRms"
                stroke="#3b82f6"
                fill="#3b82f699"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity Area */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
          <ChartTitle title="Velocity RMS Trend" />
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="velocityRms"
                stroke="#10b981"
                fill="#10b98199"
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
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md text-center"
    >
      <div className="text-slate-600 text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold text-slate-900">
        {value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
    </motion.div>
  );
}

/* Chart Title */
function ChartTitle({ title }) {
  return (
    <div className="text-lg font-semibold mb-3 text-slate-800">{title}</div>
  );
}
