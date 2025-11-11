export default function TradingActivity({ crypto }: { crypto: any }) {
  const activities = [
    { type: "Large Buy", amount: "125.5 BTC", value: "$11.8M", time: "5 min ago" },
    { type: "Large Sell", amount: "89.3 BTC", value: "$8.4M", time: "12 min ago" },
    { type: "Large Buy", amount: "156.2 BTC", value: "$14.7M", time: "18 min ago" },
    { type: "Large Sell", amount: "102.8 BTC", value: "$9.7M", time: "24 min ago" },
    { type: "Large Buy", amount: "78.9 BTC", value: "$7.4M", time: "31 min ago" },
  ]

  return (
    <div className="neumorphic-elevated p-6 space-y-4">
      <h2 className="text-2xl font-bold">Recent Activity</h2>

      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="neumorphic-inset p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  activity.type.includes("Buy") ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"
                }`}
              >
                {activity.type}
              </span>
              <span className="text-xs text-text-secondary">{activity.time}</span>
            </div>
            <p className="text-sm font-semibold">{activity.amount}</p>
            <p className="text-xs text-text-secondary">{activity.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
