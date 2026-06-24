import { motion } from 'motion/react';

// --- CURVED REVENUE AREA CHART ---
interface AreaChartProps {
  data: { date: string; amount: number }[];
}

export function RevenueAreaChart({ data }: AreaChartProps) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.amount), 100);
  const width = 500;
  const height = 200;
  const padding = 30;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    // Invert Y so 0 is at bottom
    const y = padding + chartHeight - (d.amount / maxVal) * chartHeight;
    return { x, y, date: d.date, amount: d.amount };
  });

  // Generate SVG path (curved line)
  let linePath = '';
  let fillPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Bezier curve control points
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }

    // Close fill path
    fillPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;
  }

  return (
    <div className="w-full h-full relative" id="revenue-chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Gradients */}
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Areas */}
        <motion.path
          d={fillPath}
          fill="url(#chartFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              className="fill-emerald-400 stroke-slate-900 stroke-2 transition-all duration-200 group-hover:r-7"
            />
            {/* Amount overlay on hover */}
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              className="fill-emerald-300 text-[10px] font-mono font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              ₹{p.amount}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, idx) => (
          <text
            key={idx}
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-slate-400 text-[9px] font-mono"
          >
            {p.date}
          </text>
        ))}
      </svg>
    </div>
  );
}


// --- CIRCULAR RADIAL RINGS (VEHICLE TYPE REVENUE/COUNT) ---
interface VehicleTypeAnalyticsProps {
  data: { type: 'car' | 'bike' | 'truck'; count: number; revenue: number }[];
}

export function VehicleTypeRadialRings({ data }: VehicleTypeAnalyticsProps) {
  const colors = {
    car: { ring: '#3b82f6', text: 'text-blue-400' },
    bike: { ring: '#10b981', text: 'text-emerald-400' },
    truck: { ring: '#f59e0b', text: 'text-amber-400' }
  };

  const totalCount = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-4" id="vehicle-rings-container">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Ring SVGs stacked over each other */}
        <svg className="w-full h-full transform -rotate-90">
          {data.map((item, idx) => {
            const radius = 55 - idx * 14;
            const circumference = 2 * Math.PI * radius;
            const percentage = item.count / totalCount;
            const strokeDashoffset = circumference - percentage * circumference;

            return (
              <g key={item.type}>
                {/* Background Ring */}
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="8"
                />
                {/* Foreground Active Ring */}
                <motion.circle
                  cx="88"
                  cy="88"
                  r={radius}
                  fill="transparent"
                  stroke={colors[item.type].ring}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1 + idx * 0.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {/* Center Total Counters */}
        <div className="absolute text-center">
          <div className="text-2xl font-sans font-bold text-white">{totalCount === 1 && data.every(d => d.count === 0) ? 0 : totalCount}</div>
          <div className="text-[10px] font-mono text-slate-400 tracking-wider">TOTAL VEHICLES</div>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-3 min-w-44">
        {data.map((item) => {
          const percentage = Math.round((item.count / totalCount) * 100) || 0;
          return (
            <div key={item.type} className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors[item.type].ring }}
                />
                <span className="capitalize text-xs font-semibold text-slate-300">{item.type}s</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-white font-bold">{item.count}</span>
                <span className="text-slate-500 ml-1.5">({percentage}%)</span>
                <div className={`${colors[item.type].text} text-[10px] font-semibold`}>
                  ₹{item.revenue}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// --- BAR CHART FOR FLOOR OCCUPANCY ---
interface FloorOccupancyProps {
  data: { floorNumber: number; name: string; occupied: number; total: number }[];
}

export function FloorOccupancyBarChart({ data }: FloorOccupancyProps) {
  return (
    <div className="flex flex-col gap-4" id="floor-bars-container">
      {data.map((floor, i) => {
        const percentage = floor.total > 0 ? Math.round((floor.occupied / floor.total) * 100) : 0;
        
        // Progress color logic based on utilization
        let progressColor = 'bg-blue-500';
        if (percentage >= 85) {
          progressColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
        } else if (percentage >= 60) {
          progressColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
        } else {
          progressColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
        }

        return (
          <div key={floor.floorNumber} className="group">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-sans">{floor.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                  F-0{floor.floorNumber}
                </span>
              </div>
              <div className="font-mono text-slate-400">
                <span className="text-white font-bold">{floor.occupied}</span> / {floor.total} Slots
                <span className="text-slate-500 ml-1.5">({percentage}%)</span>
              </div>
            </div>

            {/* Bar Outer */}
            <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${progressColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
