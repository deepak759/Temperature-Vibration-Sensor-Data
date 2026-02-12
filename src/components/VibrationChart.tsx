import React, { useState } from "react";
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
} from "recharts";
import { motion } from "framer-motion";
import * as XLSX from "xlsx"; // for Excel export
import CrestGauge from "./GaugeMeter"; // adjust import path as needed

// Reusable shimmer and loader components (same as in your live dashboard)
const ShimmerEffect = () => (
  <motion.div
    className="absolute inset-0 -translate-x-full"
    style={{
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
    }}
    animate={{ x: ["0%", "200%"] }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
      repeatDelay: 0.5,
    }}
  />
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
      <div className="h-4 bg-slate-700/50 rounded w-16 mx-auto mb-2"></div>
      <div className="h-8 bg-slate-700/50 rounded w-20 mx-auto"></div>
      <ShimmerEffect />
    </div>
  </motion.div>
);

const ChartLoader = ({ height }) => (
  <div className="relative w-full" style={{ height }}>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 400 200"
      >
        <rect width="400" height="200" fill="#0f172a" />
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
            repeatType: "loop",
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
            delay: 0.3,
          }}
        />
      </svg>
    </div>
    <div className="absolute bottom-4 left-0 right-0 text-center">
      <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-slate-300">
          Loading vibration data...
        </span>
      </div>
    </div>
    <ShimmerEffect />
  </div>
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
          stroke="#1e293b"
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

const Kpi = ({ title, value, unit }) => (
  <motion.div whileHover={{ scale: 1.03 }} className="glass-card text-center">
    <div className="text-slate-400 text-sm">{title}</div>
    <div className="text-2xl font-bold">
      {value !== undefined ? value.toFixed(2) : "—"}
      {unit && <span className="text-sm ml-1">{unit}</span>}
    </div>
  </motion.div>
);

const ChartTitle = ({ title }) => (
  <div className="text-lg font-semibold mb-3 text-slate-200">{title}</div>
);

// Main component
export default function VibrationDashboardWithHistory({ liveData }) {
  const [mode, setMode] = useState("live"); // 'live' or 'history'
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [limit, setLimit] = useState(100);
  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Helper to format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Transform API response to match chart data format
  const transformHistoryData = (apiResponse) => {
    return apiResponse.map((item) => ({
      time: formatTime(item.timestamp),
      rawTimestamp: item.timestamp,
      accelRms: item.accel?.rms,
      accelMax: item.accel?.max,
      accelPP: item.accel?.peakToPeak,
      crest: item.crestFactor,
      velocityRms: item.velocity?.rms,
    }));
  };

  const handleFetchHistory = async () => {
    if (!fromDate || !toDate) {
      setHistoryError("Please select both from and to dates");
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SOCKET_URL
        }/api/vibration/history?from=${new Date(
          fromDate
        ).toISOString()}&to=${new Date(toDate).toISOString()}&limit=${limit}`,
        {}
      );
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      const transformed = transformHistoryData(data.data);
      setHistoryData(transformed);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!historyData.length) {
      alert("No data to export");
      return;
    }

    // Prepare worksheet data: header row + data rows
    const headers = [
      "Timestamp",
      "Accel RMS (mg)",
      "Accel Max (mg)",
      "Accel Peak-to-Peak (mg)",
      "Crest Factor",
      "Velocity RMS (mm/s)",
    ];
    const rows = historyData.map((d) => [
      d.rawTimestamp ? new Date(d.rawTimestamp).toLocaleString() : d.time,
      d.accelRms,
      d.accelMax,
      d.accelPP,
      d.crest,
      d.velocityRms,
    ]);

    const wsData = [headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Vibration History");
    XLSX.writeFile(
      wb,
      `vibration_history_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Determine which data to display (live or history)
  const displayData = mode === "live" ? liveData : historyData;
  const isLoading = mode === "live" ? false : isLoadingHistory; // live loading handled separately
  const latest =
    displayData.length > 0 ? displayData[displayData.length - 1] : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      {/* Header with mode toggle */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Machine Vibration Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            {mode === "live"
              ? "Real-time condition monitoring"
              : "Historical data analysis"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex p-1 bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-700/50">
            <button
              onClick={() => setMode("live")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "live"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setMode("history")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "history"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Conditional rendering: History mode controls */}
      {mode === "history" && (
        <div className="glass-card mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">From</label>
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">To</label>
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs text-slate-400 mb-1">Limit</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFetchHistory}
                disabled={isLoadingHistory}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-600/30"
              >
                {isLoadingHistory ? "Fetching..." : "Fetch"}
              </button>
              <button
                onClick={handleDownloadExcel}
                disabled={!historyData.length}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors shadow-lg shadow-emerald-600/30"
              >
                📥 Export
              </button>
            </div>
          </div>
          {historyError && (
            <div className="mt-3 text-sm text-red-400 bg-red-950/30 px-4 py-2 rounded-lg">
              {historyError}
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Content */}
      {mode === "live" && !liveData?.length ? (
        // Live mode loading state (same as original)
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
      ) : mode === "history" && isLoadingHistory ? (
        // History loading state
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
      ) : (
        // Data is ready: show KPI cards, charts, gauge
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Kpi title="Accel RMS" value={latest.accelRms} unit="mg" />
            <Kpi title="Accel Max" value={latest.accelMax} unit="mg" />
            <Kpi title="Peak-to-Peak" value={latest.accelPP} unit="mg" />
            <Kpi title="Velocity RMS" value={latest.velocityRms} unit="mm/s" />
            <Kpi title="Crest Factor" value={latest.crest} unit="" />
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Combined Chart */}
            <div className="lg:col-span-2 glass-card">
              <ChartTitle title="Acceleration & Velocity Trends" />
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis yAxisId="accel" stroke="#60a5fa" />
                  <YAxis yAxisId="vel" orientation="right" stroke="#34d399" />
                  <Tooltip
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #334155",
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
            <div className="glass-card">
              <ChartTitle title="Acceleration RMS Trend" />
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={displayData}>
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
            <div className="glass-card">
              <ChartTitle title="Velocity RMS Trend" />
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={displayData}>
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
        </>
      )}
    </div>
  );
}
