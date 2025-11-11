export default function RelatedMarkets({ crypto }: { crypto: any }) {
  const markets = [
    { pair: `${crypto.ticker}/USDT`, price: crypto.price, change: crypto.priceChange, volume: "$850M" },
    { pair: `${crypto.ticker}/USD`, price: crypto.price, change: crypto.priceChange, volume: "$420M" },
    { pair: `${crypto.ticker}/EUR`, price: crypto.price, change: crypto.priceChange, volume: "$180M" },
    { pair: `${crypto.ticker}/GBP`, price: crypto.price, change: crypto.priceChange, volume: "$120M" },
  ]

  return (
    <div className="neumorphic-elevated p-6 space-y-4">
      <h2 className="text-2xl font-bold">Trading Pairs</h2>

      <div className="space-y-3">
        {markets.map((market, idx) => (
          <div key={idx} className="neumorphic-inset p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold">{market.pair}</p>
              <p className="text-sm text-text-secondary">{market.volume} 24h</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{market.price}</p>
              <p className={`text-sm ${market.change.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                {market.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
