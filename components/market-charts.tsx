"use client"

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const volumeData = [
  { name: "Mon", value: 2400 },
  { name: "Tue", value: 2800 },
  { name: "Wed", value: 2200 },
  { name: "Thu", value: 3200 },
  { name: "Fri", value: 3800 },
  { name: "Sat", value: 2900 },
  { name: "Sun", value: 4100 },
]

const priceData = [
  { name: "Week 1", BTC: 92000, ETH: 3400, SOL: 185 },
  { name: "Week 2", BTC: 93500, ETH: 3520, SOL: 195 },
  { name: "Week 3", BTC: 91800, ETH: 3380, SOL: 188 },
  { name: "Week 4", BTC: 94230, ETH: 3580, SOL: 210 },
]

export default function MarketCharts() {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Market Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neumorphic-elevated p-6 space-y-4">
          <h3 className="font-bold text-lg">Daily Trading Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
              <YAxis stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", border: "none", borderRadius: "8px" }}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neumorphic-elevated p-6 space-y-4">
          <h3 className="font-bold text-lg">Price Trends (4 Weeks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
              <YAxis stroke="var(--text-secondary)" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", border: "none", borderRadius: "8px" }}
              />
              <Line type="monotone" dataKey="BTC" stroke="var(--primary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ETH" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
