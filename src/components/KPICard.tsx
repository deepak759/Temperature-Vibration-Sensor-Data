import React from "react";
import { motion } from "framer-motion";

const Kpi = ({ title, value, unit }) => (
  <motion.div whileHover={{ scale: 1.03 }} className="glass-card text-center">
    <div className="text-slate-400 text-sm">{title}</div>
    <div className="text-2xl font-bold">
      {value !== undefined && value !== null ? Number(value).toFixed(2) : "—"}
      {unit && <span className="text-sm ml-1">{unit}</span>}
    </div>
  </motion.div>
);
const KPICards = ({ data, mode = "live" }) => {
  if (mode === "live") {
    // Live mode: show latest value
    const latest = data?.length > 0 ? data[data.length - 1] : {};
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Kpi title="Accel RMS" value={latest.accelRms} unit="mg" />
        <Kpi title="Accel Max" value={latest.accelMax} unit="mg" />
        <Kpi title="Peak-to-Peak" value={latest.accelPP} unit="mg" />
        <Kpi title="Velocity RMS" value={latest.velocityRms} unit="mm/s" />
        <Kpi title="Crest Factor" value={latest.crest} unit="" />
      </div>
    );
  } else {
    // History mode: show statistical aggregates
    const avgAccelRms = data.reduce((sum, item) => sum + (item.accelRms || 0), 0) / data.length;
    const maxAccelMax = Math.max(...data.map(item => item.accelMax || 0));
    const avgVelocityRms = data.reduce((sum, item) => sum + (item.velocityRms || 0), 0) / data.length;
    const avgCrest = data.reduce((sum, item) => sum + (item.crest || 0), 0) / data.length;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Kpi title="Avg Accel RMS" value={avgAccelRms} unit="mg" />
        <Kpi title="Peak Accel Max" value={maxAccelMax} unit="mg" />
        <Kpi title="Avg Peak-to-Peak" value={data.reduce((sum, item) => sum + (item.accelPP || 0), 0) / data.length} unit="mg" />
        <Kpi title="Avg Velocity RMS" value={avgVelocityRms} unit="mm/s" />
        <Kpi title="Avg Crest Factor" value={avgCrest} unit="" />
      </div>
    );
  }
};

export default KPICards;