export default function MarketStats({ crypto }: { crypto: any }) {
  return (
    <div className="neumorphic-elevated p-6 space-y-4">
      <h2 className="text-2xl font-bold">Market Statistics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(crypto.stats).map(([key, value]) => (
          <div key={key} className="neumorphic-inset p-4 rounded-lg">
            <p className="text-sm text-text-secondary mb-2 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
            <p className="text-lg font-bold">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Market Health</span>
            <div className="w-full mx-4 bg-surface rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "72%" }} />
            </div>
            <span className="font-bold">72%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Trading Activity</span>
            <div className="w-full mx-4 bg-surface rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: "58%" }} />
            </div>
            <span className="font-bold">58%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
