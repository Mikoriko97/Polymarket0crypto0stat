export default function CryptoDetailHeader({ crypto }: { crypto: any }) {
  const isPositive = crypto.priceChange.startsWith("+")

  return (
    <div className="neumorphic-elevated p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">{crypto.name}</h1>
            <span className="neumorphic px-3 py-1 rounded-full text-sm font-semibold text-text-secondary">
              {crypto.ticker}
            </span>
          </div>
          <p className="text-text-secondary">{crypto.description}</p>
        </div>
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${crypto.color} opacity-20`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="neumorphic-inset p-4 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">Current Price</p>
          <p className="text-3xl font-bold">{crypto.price}</p>
          <p className={`text-sm mt-2 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {crypto.priceChange} (${crypto.priceChangeValue})
          </p>
        </div>

        <div className="neumorphic-inset p-4 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">24h Volume</p>
          <p className="text-2xl font-bold">{crypto.volume24h}</p>
        </div>

        <div className="neumorphic-inset p-4 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">Market Cap</p>
          <p className="text-2xl font-bold">{crypto.marketCap}</p>
        </div>

        <div className="neumorphic-inset p-4 rounded-lg">
          <p className="text-sm text-text-secondary mb-2">ATH / ATL</p>
          <p className="text-sm font-bold">{crypto.allTimeHigh}</p>
          <p className="text-sm text-text-secondary">{crypto.allTimeLow}</p>
        </div>
      </div>
    </div>
  )
}
