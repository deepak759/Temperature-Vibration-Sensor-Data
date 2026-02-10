import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function TemperatureChart({ data }) {
  // Choose ONE:
  // 1) Fixed domain (stable):
  // const TEMP_DOMAIN = [20, 45]       // <-- adjust to your expected temp range
  // 2) Or dynamic with headroom:
  const TEMP_DOMAIN = ['dataMin - 1', 'dataMax + 1']

  return (
    <div className="rounded-2xl shadow-sm bg-white p-4  overflow-hidden">
      <div className="text-lg font-semibold mb-2">Temperature (°C)</div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            minTickGap={30}
            interval="preserveStartEnd"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={TEMP_DOMAIN}
            allowDataOverflow
            tick={{ fontSize: 12 }}
            tickCount={6}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorTemp)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}