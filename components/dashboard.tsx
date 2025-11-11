import type { GammaMarket } from "@/lib/gamma"

function formatUsd(value: number | undefined) {
  if (!value || !isFinite(value)) return "—"
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      value,
    )
  } catch {
    return `$${Math.round(value).toLocaleString()}`
  }
}

export default function Dashboard({ markets }: { markets: GammaMarket[] }) {
  const totalMarkets = markets.length
  const openMarkets = markets.filter((m) => m.is_open || (m.is_active && !m.is_closed)).length
  const volume24h = markets.reduce((sum, m) => sum + (m.volume24hr ?? 0), 0)
  const avgLiquidity = totalMarkets > 0 ? markets.reduce((sum, m) => sum + (m.liquidity ?? 0), 0) / totalMarkets : 0

  const stats = [
    { label: "Total Markets", value: totalMarkets.toLocaleString() },
    { label: "Open Markets", value: openMarkets.toLocaleString() },
    { label: "Trading Volume (24h)", value: formatUsd(volume24h) },
    { label: "Avg. Liquidity", value: formatUsd(avgLiquidity) },
  ]

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-3xl font-bold">Market Overview</h2>
        <span className="text-sm text-text-secondary">Last 24 hours</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="neumorphic p-6 space-y-2">
            <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
