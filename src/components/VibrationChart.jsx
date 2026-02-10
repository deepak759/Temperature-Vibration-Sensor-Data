import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function VibrationChart({ data }) {
  return (
    <div className="rounded-2xl shadow-sm bg-white p-4 overflow-hidden">
      <div className="text-lg font-semibold mb-2">
        Vibration (Acceleration & Velocity)
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            minTickGap={30}
            tick={{ fontSize: 12 }}
          />

          {/* Acceleration axis (mg) */}
          <YAxis
            yAxisId="accel"
            domain={[0, 'dataMax + 10']}
            tick={{ fontSize: 12 }}
            label={{ value: 'Acceleration (mg)', angle: -90, position: 'insideLeft' }}
          />

          {/* Velocity axis (mm/s) */}
          <YAxis
            yAxisId="vel"
            orientation="right"
            domain={[0, 'dataMax + 0.1']}
            tick={{ fontSize: 12 }}
            label={{ value: 'Velocity (mm/s)', angle: -90, position: 'insideRight' }}
          />

          <Tooltip />
          <Legend />

          {/* Acceleration */}
          <Line
            yAxisId="accel"
            type="monotone"
            dataKey="accelRms"
            name="Accel RMS (mg)"
            stroke="#2563eb"
            dot={false}
            strokeWidth={2}
          />

          <Line
            yAxisId="accel"
            type="monotone"
            dataKey="accelMax"
            name="Accel Max (mg)"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={1.5}
          />

          {/* Velocity */}
          <Line
            yAxisId="vel"
            type="monotone"
            dataKey="velocityRms"
            name="Velocity RMS (mm/s)"
            stroke="#10b981"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
