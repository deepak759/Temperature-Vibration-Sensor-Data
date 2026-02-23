import React from "react";
export default function StatCard({ title, value, subtitle, accent = "blue" }) {
  const color =
    {
      blue: "from-blue-500 to-cyan-500",
      green: "from-emerald-500 to-lime-500",
      red: "from-rose-500 to-orange-500",
      gray: "from-slate-500 to-gray-500",
    }[accent] || "from-blue-500 to-cyan-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      <div
        className={`inline-block text-white text-sm px-3 py-1 rounded-full bg-gradient-to-r ${color} mb-3`}
      >
        {title}
      </div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      {subtitle && (
        <div className="text-sm text-slate-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
