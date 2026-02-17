import React, { useEffect, useState } from 'react';

export default function CrestGauge({ value = 0 }) {
  let color = '#22c55e';
  let status = 'Normal';

  if (value > 4) {
    color = '#ef4444';
    status = 'Critical';
  } else if (value > 2) {
    color = '#f59e0b';
    status = 'Warning';
  }

  return (
    <div className="glass-card flex flex-col items-center justify-center text-center py-6 my-auto h-[420px]">
      <div className="text-xl font-semibold mb-4">Velocity RMS</div>

      {/* Bigger gauge */}
      <div className="w-[320px] h-full my-auto">
        <CustomGauge
          value={value}
          unit=""
          startValue={0}
          endValue={5}
          interval={1}
          width={320}
          height={320}
          innerRadius={110}
          segmentLength={22}
          segmentWidth={3}
        />
      </div>

      <div className="text-base mt-2 font-medium" style={{ color }}>
        {status}
      </div>
    </div>
  );
}

// polar → Cartesian
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// SVG arc
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
  return [
    'M',
    start.x,
    start.y,
    'A',
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

function CustomGauge({
  value = 0,
  unit = '',
  startValue = 0,
  endValue = 5,
  interval = 1,
  segmentCount = 70,
  segmentWidth = 3,
  segmentLength = 22,
  innerRadius = 110,
  activeColor = '#00B05D',
  inactiveColor = '#BCBCBC',
  width = 320,
  height = 200,
}) {
  const cx = width / 2;
  const cy = height / 2;

  const startAngle = 180;
  const endAngle = 0;
  const totalAngle = Math.abs(startAngle - endAngle);
  const span = endValue - startValue;

  const [animatedValue, setAnimatedValue] = useState(startValue);

  useEffect(() => {
    const targetValue = isNaN(value) ? startValue : value;
    const duration = 800;
    const startVal = animatedValue;
    const diff = targetValue - startVal;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedValue(startVal + diff * progress);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value, startValue]);

  const activeSegments = Math.max(
    0,
    Math.round(((animatedValue - startValue) / span) * segmentCount),
  );
    const decimals = (interval.toString().split(".")[1] || "").length;
    const labelRadius = innerRadius - 12;
const arcLabels = [];
  for (let v = startValue; v <= endValue; v += interval) {
    const frac = (v - startValue) / span;

    const ang = frac * totalAngle;
    const pos = polarToCartesian(cx, cy, labelRadius, ang);
    arcLabels.push({ x: pos.x, y: pos.y, value: v.toFixed(decimals) });
  }
  const rotation =
    (((animatedValue - startValue) / span) * totalAngle || 0) -
    totalAngle / 2 +
    90;

  const needleLen = innerRadius - 20;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {Array.from({ length: segmentCount }).map((_, i) => {
          const frac = i / (segmentCount - 1);
          const angle = frac * totalAngle;
          const p1 = polarToCartesian(cx, cy, innerRadius, angle);
          const p2 = polarToCartesian(
            cx,
            cy,
            innerRadius + segmentLength,
            angle,
          );
          const color = i < activeSegments ? activeColor : inactiveColor;

          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={color}
              strokeWidth={segmentWidth}
              style={{
                transition: 'stroke 0.1s linear',
              }}
            />
          );
        })}

        <path
          d={describeArc(
            cx,
            cy,
            innerRadius - 4,
            startAngle - 180,
            endAngle - 180,
          )}
          fill="none"
          stroke="#7E7E7E"
          strokeWidth="0.25"
        />

         {arcLabels.map((lab, idx) => (
            <text
              key={idx}
              x={lab.x}
              y={lab.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="7"
              fill="#555"
              transform={`rotate(90 ${lab.x} ${lab.y})`}
              pointerEvents={"none"}
            >
              {lab.value}
            </text>
          ))}
        {/* needle */}
        <g transform={`rotate(${rotation} ${cx} ${cy})`}>
          <polygon
            points={`${cx - 8},${cy} ${cx},${cy - needleLen} ${cx + 8},${cy}`}
            fill="#e7e7e7"
          />
        </g>

        {/* hub */}
        <circle
          cx={cx}
          cy={cy}
          r="8"
          fill="#fff"
          stroke="#333"
          strokeWidth="3"
        />

        {/* value */}
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          transform={`rotate(90 ${cx} ${cy})`}
          
        >
          <tspan fontSize="24"  fontWeight="bold" fill="#d2d2d2">
            {value}
          </tspan>
          {unit && (
            <tspan fontSize="18" fill="#333">
              {' '}
              {unit}
            </tspan>
          )}
        </text>
      </g>
    </svg>
  );
}
