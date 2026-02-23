import React from "react";
import { motion } from "framer-motion";
import { ShimmerEffect } from "./ShimmerEffect";
export default function ChartLoader({ height }){
  return (
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
)};


