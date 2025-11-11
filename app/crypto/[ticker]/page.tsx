import Link from "next/link"
import Header from "@/components/header"
import CryptoMarketList from "@/components/crypto-market-list"
import { getCryptoTagIdByName, getMarketsByTagId, getMarkets } from "@/lib/gamma"

function formatCurrency(value?: number) {
  if (value == null) return "—"
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      value,
    )
  } catch {
    return `$${Math.round(value).toLocaleString()}`
  }
}

const NAME_MAP: Record<string, string> = {
  btc: "Bitcoin",
  eth: "Ethereum",
  sol: "Solana",
  matic: "Polygon",
  ada: "Cardano",
  xrp: "Ripple",
}

export const revalidate = 60
export default async function CryptoDetail({ params }: { params: Promise<{ ticker?: string }> }) {
  const p = await params
  const rawTicker = typeof p?.ticker === "string" ? p.ticker : ""
  const ticker = rawTicker.toLowerCase()
  if (!ticker) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Cryptocurrency not found</h1>
            <Link href="/" className="neumorphic-elevated px-6 py-3 inline-block rounded-lg">
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }
  const cryptoName = NAME_MAP[ticker] ?? ticker.toUpperCase()
  const synonyms = [ticker, cryptoName.toLowerCase()]

  const tagId = await getCryptoTagIdByName("Crypto")
  const allMarkets = tagId != null ? await getMarketsByTagId(tagId, { limit: 250 }) : []

  const markets = allMarkets.filter((m) => {
    const text = `${m.question ?? ""} ${m.slug ?? ""}`.toLowerCase()
    return synonyms.some((s) => text.includes(s))
  }).sort((a, b) => {
    const idDiff = (b.id ?? 0) - (a.id ?? 0) // Sort by most recent first
    if (idDiff !== 0) return idDiff
    return (a.slug ?? "").localeCompare(b.slug ?? "")
  })
  console.log(`[CryptoDetail] ticker=${ticker} markets=${markets.length}`)

  const totalMarkets = markets.length
  const volume24h = markets.reduce((sum, m) => sum + (m.volume24hr ?? 0), 0)
  const avgLiquidity = totalMarkets > 0 ? markets.reduce((sum, m) => sum + (m.liquidity ?? 0), 0) / totalMarkets : 0

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-text-secondary hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="neumorphic-elevated p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">{cryptoName}</h1>
                <span className="neumorphic px-3 py-1 rounded-full text-sm font-semibold text-text-secondary">
                  {ticker.toUpperCase()}
                </span>
              </div>
              <p className="text-text-secondary">Polymarket Crypto markets related to {cryptoName}.</p>
            </div>
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-20`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neumorphic-inset p-4 rounded-lg">
              <p className="text-sm text-text-secondary mb-2">Related Markets</p>
              <p className="text-2xl font-bold">{totalMarkets.toLocaleString()}</p>
            </div>
            <div className="neumorphic-inset p-4 rounded-lg">
              <p className="text-sm text-text-secondary mb-2">24h Volume</p>
              <p className="text-2xl font-bold">{formatCurrency(volume24h)}</p>
            </div>
            <div className="neumorphic-inset p-4 rounded-lg">
              <p className="text-sm text-text-secondary mb-2">Avg. Liquidity</p>
              <p className="text-2xl font-bold">{formatCurrency(avgLiquidity)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {markets.length > 0 ? (
            <CryptoMarketList markets={markets} />
          ) : (
            <div className="neumorphic p-8 text-center">
              <p className="text-text-secondary">No related markets found for {cryptoName}.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
