"use client"

import Link from "next/link"

const categories = [
  {
    name: "Bitcoin",
    ticker: "BTC",
    price: "$94,230",
    change: "+5.2%",
    volume: "$2.1B",
    markets: 156,
    color: "from-orange-400 to-orange-600",
  },
  {
    name: "Ethereum",
    ticker: "ETH",
    price: "$3,580",
    change: "+3.8%",
    volume: "$1.2B",
    markets: 142,
    color: "from-blue-400 to-blue-600",
  },
  {
    name: "Solana",
    ticker: "SOL",
    price: "$210.45",
    change: "+12.3%",
    volume: "$450M",
    markets: 98,
    color: "from-purple-400 to-purple-600",
  },
  {
    name: "Polygon",
    ticker: "MATIC",
    price: "$0.78",
    change: "+2.1%",
    volume: "$280M",
    markets: 65,
    color: "from-indigo-400 to-indigo-600",
  },
  {
    name: "Cardano",
    ticker: "ADA",
    price: "$1.12",
    change: "-1.4%",
    volume: "$190M",
    markets: 52,
    color: "from-cyan-400 to-cyan-600",
  },
  {
    name: "Ripple",
    ticker: "XRP",
    price: "$3.24",
    change: "+8.7%",
    volume: "$520M",
    markets: 78,
    color: "from-emerald-400 to-emerald-600",
  },
]

export default function CategoryCards() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Cryptocurrency Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {categories.map((crypto, idx) => (
          <Link
            key={idx}
            href={`/crypto/${crypto.ticker.toLowerCase()}`}
            className="block neumorphic-elevated p-6 space-y-4 cursor-pointer hover:scale-102 transition-transform"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{crypto.name}</h3>
                <p className="text-sm text-text-secondary">{crypto.ticker}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${crypto.color} opacity-20`} />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary mb-1">Current Price</p>
                <p className="text-2xl font-bold">{crypto.price}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="neumorphic-inset p-3 rounded-md">
                  <p className="text-xs text-text-secondary">24h Change</p>
                  <p
                    className={`text-lg font-bold ${
                      crypto.change.startsWith("+") ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {crypto.change}
                  </p>
                </div>
                <div className="neumorphic-inset p-3 rounded-md">
                  <p className="text-xs text-text-secondary">Volume</p>
                  <p className="text-lg font-bold">{crypto.volume}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-text-secondary">Markets</span>
                <span className="font-bold text-primary">{crypto.markets}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
