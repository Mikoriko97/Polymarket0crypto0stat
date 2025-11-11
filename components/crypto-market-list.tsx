import Link from "next/link"
import type { GammaMarket } from "@/lib/gamma"

function formatCurrency(value?: number) {
  if (value == null) return "—"
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      value
    )
  } catch {
    return `$${Math.round(value).toLocaleString()}`
  }
}

export default function CryptoMarketList({ markets }: { markets: GammaMarket[] }) {
  return (
    <section className="space-y-4" suppressHydrationWarning>
      <h2 className="text-3xl font-bold">Crypto Markets (Polymarket)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {markets.map((m) => {
          const title = m.question ?? m.slug ?? `Market #${m.id}`
          const volume = m.volume24hr ?? m.volume
          const liquidity = m.liquidity
          const marketUrl = m.slug ? `https://polymarket.com/market/${m.slug}` : undefined
          const key = m.slug ?? String(m.id ?? title)
          return (
            <div key={key} className="neumorphic-elevated p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{title}</h3>
                  {m.category ? <p className="text-sm text-text-secondary">{m.category}</p> : null}
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-20`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="neumorphic-inset p-3 rounded-md">
                  <p className="text-xs text-text-secondary">24h Volume</p>
                  <p className="text-lg font-bold">{formatCurrency(volume)}</p>
                </div>
                <div className="neumorphic-inset p-3 rounded-md">
                  <p className="text-xs text-text-secondary">Liquidity</p>
                  <p className="text-lg font-bold">{formatCurrency(liquidity)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-text-secondary">Status</span>
                <span className="font-bold text-primary">
                  {m.is_closed ? "Closed" : m.is_open ? "Open" : m.is_active ? "Active" : "—"}
                </span>
              </div>

              <div className="pt-2 flex gap-4">
                {m.slug ? (
                  <Link prefetch={false} href={`/market/${m.slug}`} className="text-primary hover:underline inline-flex items-center gap-2">
                    View Details
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : null}
                {marketUrl ? (
                  <Link
                    href={marketUrl}
                    className="text-text-secondary hover:text-foreground inline-flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Polymarket
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3h7v7M10 14L21 3M21 10v11H3V3h11" />
                    </svg>
                  </Link>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}