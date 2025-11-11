"use client"

import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const priceData = [
  { time: "00:00", price: 93800, volume: 450, ma7: 93900 },
  { time: "04:00", price: 94120, volume: 380, ma7: 93950 },
  { time: "08:00", price: 93950, volume: 520, ma7: 94000 },
  { time: "12:00", price: 94450, volume: 610, ma7: 94100 },
  { time: "16:00", price: 94100, volume: 490, ma7: 94150 },
  { time: "20:00", price: 94230, volume: 680, ma7: 94200 },
  { time: "24:00", price: 94350, volume: 420, ma7: 94250 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="neumorphic-elevated p-3 rounded-lg backdrop-blur-sm">
        <p className="text-sm font-semibold">{payload[0].payload.time}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400">${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function PriceChart({ crypto }: { crypto: any }) {
  return (
    <div className="space-y-6">
      <div className="neumorphic-elevated p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Price Chart (24h)</h2>
          <div className="flex gap-2">
            <span className="neumorphic px-3 py-1 rounded-lg text-xs font-medium">24H</span>
            <span className="neumorphic px-3 py-1 rounded-lg text-xs font-medium text-text-secondary">7D</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={priceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="time" stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorPrice)"
              strokeWidth={2}
              name="Price"
            />
            <Line
              type="monotone"
              dataKey="ma7"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="MA7"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="neumorphic-elevated p-6 space-y-4">
        <h2 className="text-2xl font-bold">Trading Volume</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={priceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="time" stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: `1px solid var(--border)`,
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="volume" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
