import Header from "@/components/header"
import Link from "next/link"
import { getMarketBySlug } from "@/lib/gamma"
import { MarketPriceChart } from "@/components/market-price-chart"
import { MarketAnalysis } from "@/components/market-analysis";
import { MarketInsightCard } from "@/components/market-insight-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card"
import { CopyLinkButton } from "@/components/copy-link-button"

export const revalidate = 60
export default async function MarketDetailPage({ params }: { params: Promise<{ slug?: string }> }) {
  const p = await params
  const slug = p?.slug ?? ""
  const baseSlug = slug.replace(/-0x[0-9a-fA-F]+$/, '')
  const market = await getMarketBySlug(baseSlug)

  if (!market) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Market not found</h1>
            <Link href="/" className="neumorphic-elevated px-6 py-3 inline-block rounded-lg">
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const title = market.question ?? market.slug ?? `Market #${market.id}`
  const marketUrl = market.slug ? `https://polymarket.com/market/${market.slug}` : undefined

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 text-text-secondary hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">{title}</CardTitle>
              <CardDescription>{market.category}</CardDescription>
              <CardAction>
                {marketUrl ? (
                  <Link href={marketUrl} target="_blank" rel="noopener noreferrer" className="neumorphic px-3 py-2 rounded-lg">Open Polymarket</Link>
                ) : null}
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div className="neumorphic-inset p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">24h Volume</p>
                  <p className="text-2xl font-bold">{formatCurrency(market.volume24hr ?? market.volume)}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">Liquidity</p>
                  <p className="text-2xl font-bold">{formatCurrency(market.liquidity)}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">Status</p>
                  <p className="text-2xl font-bold">{market.is_closed ? "Closed" : market.is_open ? "Open" : market.is_active ? "Active" : "—"}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">Best Bid</p>
                  <p className="text-2xl font-bold">{formatCurrency(market.bestBid as number)}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">Best Ask</p>
                  <p className="text-2xl font-bold">{formatCurrency(market.bestAsk as number)}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">Last Trade</p>
                  <p className="text-2xl font-bold">{formatCurrency(market.lastTradePrice as number)}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">24h Price ∆</p>
                  <p className="text-2xl font-bold">{formatCurrency(market.oneDayPriceChange as number)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {market.slug ? (
                <CopyLinkButton url={marketUrl!} />
              ) : null}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketPriceChart market={market} />
            </CardContent>
          </Card>

          <MarketInsightCard marketQuestion={market.question ?? ""} />
        </div>

      </main>
    </div>
  )
}

function formatCurrency(value?: number) {
  if (value == null) return "—"
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
  } catch {
    return `$${Math.round(value).toLocaleString()}`
  }
}
