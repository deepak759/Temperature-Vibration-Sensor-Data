import React from "react";
import { motion } from "framer-motion";

const DashboardHeader = ({ mode, onModeChange, description }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Machine Vibration Dashboard
        </h1>
        <motion.p 
          key={mode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-slate-400 text-sm"
        >
          {description}
        </motion.p>
      </div>
      <div className="mt-4 sm:mt-0 flex items-center gap-3">
        <div className="flex p-1 bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-700/50">
          <button
            onClick={() => onModeChange("live")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "live"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Live
          </button>
          <button
            onClick={() => onModeChange("history")}
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
  );
};

export default DashboardHeader;