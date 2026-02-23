import React from "react";

const HistoryControls = ({
  fromDate,
  toDate,
  limit,
  onFromDateChange,
  onToDateChange,
  onLimitChange,
  onFetch,
  onExport,
  isLoading,
  error
}) => {
  return (
    <div className="glass-card mb-6 p-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">From</label>
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">To</label>
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs text-slate-400 mb-1">Limit</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onFetch}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-600/30"
          >
            {isLoading ? "Fetching..." : "Fetch"}
          </button>
          <button
            onClick={onExport}
            disabled={isLoading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors shadow-lg shadow-emerald-600/30"
          >
            📥 Export
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-3 text-sm text-red-400 bg-red-950/30 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default HistoryControls;