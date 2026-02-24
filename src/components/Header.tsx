import React from "react";
import { motion } from "framer-motion";

const DashboardHeader = ({ mode, onModeChange, description }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Machine Vibration Dashboard
        </h1>
        <motion.p
          key={mode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-slate-600 text-sm"
        >
          {description}
        </motion.p>
      </div>
      <div className="mt-4 sm:mt-0 flex items-center gap-3">
        <div className="flex p-1 bg-slate-100 rounded-full backdrop-blur-sm border border-slate-300">
          <button
            onClick={() => onModeChange("live")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "live"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live
          </button>
          <button
            onClick={() => onModeChange("history")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "history"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-600 hover:text-slate-900"
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
