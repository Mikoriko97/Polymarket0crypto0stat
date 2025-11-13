"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { getMarketAnalysisStructured, StructuredAnalysis } from "@/lib/open-router"
import { useToast } from "@/components/ui/use-toast"

export function MarketAnalysisWhite({ marketQuestion }: { marketQuestion: string }) {
  const [data, setData] = useState<StructuredAnalysis | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!marketQuestion) return
    getMarketAnalysisStructured(marketQuestion)
      .then((res) => {
        if (res.latencyMs != null) setLatencyMs(res.latencyMs)
        if (res.ok && res.data) {
          setData(res.data)
          toast({ title: "AI Ready", description: `${res.latencyMs ?? 0}ms` })
        } else {
          toast({ title: "AI Error", description: res.errorCode || "unknown", variant: "destructive" })
          // Fallback to non-structured analysis
          import("@/lib/open-router").then(({ getMarketAnalysis }) => {
            getMarketAnalysis(marketQuestion).then((plain) => {
              if (plain.ok && plain.content) {
                setData({
                  marketSentiment: "Neutral",
                  riskLevel: "Medium",
                  volatilityIndex: 50,
                  technicalAnalysis: plain.content,
                  keyPriceLevels: { resistance: 0, current: 0, support: 0 },
                  recommendation: "Review fundamentals; add on pullbacks if trend confirms.",
                  tradingSignals: {
                    buySignal: "N/A",
                    momentum: "N/A",
                    volume: "N/A",
                    trend: "N/A",
                  },
                })
              }
            })
          })
        }
      })
      .catch(() => {
        toast({ title: "AI Error", description: "network", variant: "destructive" })
        import("@/lib/open-router").then(({ getMarketAnalysis }) => {
          getMarketAnalysis(marketQuestion).then((plain) => {
            if (plain.ok && plain.content) {
              setData({
                marketSentiment: "Neutral",
                riskLevel: "Medium",
                volatilityIndex: 50,
                technicalAnalysis: plain.content,
                keyPriceLevels: { resistance: 0, current: 0, support: 0 },
                recommendation: "Review fundamentals; add on pullbacks if trend confirms.",
                tradingSignals: { buySignal: "N/A", momentum: "N/A", volume: "N/A", trend: "N/A" },
              })
            }
          })
        })
      })
  }, [marketQuestion])

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Analysis & Recommendations</CardTitle>
          {latencyMs != null ? <CardDescription>Latency: {latencyMs}ms</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-text-secondary">Loading AI insights...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white text-black">
      <CardHeader>
        <CardTitle>Technical Analysis & Recommendations</CardTitle>
        {latencyMs != null ? <CardDescription>Latency: {latencyMs}ms</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="neumorphic-inset rounded-lg p-4">
            <p className="text-sm text-gray-500">Market Sentiment</p>
            <p className={`text-xl font-semibold ${data.marketSentiment === 'Bullish' ? 'text-emerald-600' : data.marketSentiment === 'Bearish' ? 'text-red-600' : 'text-gray-700'}`}>{data.marketSentiment}</p>
          </div>
          <div className="neumorphic-inset rounded-lg p-4">
            <p className="text-sm text-gray-500">Risk Level</p>
            <p className="text-xl font-semibold">{data.riskLevel}</p>
          </div>
          <div className="neumorphic-inset rounded-lg p-4">
            <p className="text-sm text-gray-500">Volatility Index</p>
            <p className="text-xl font-semibold">{Number(data.volatilityIndex).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
          <p className="text-sm">{data.technicalAnalysis}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Key Price Levels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="neumorphic-inset rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Resistance</span>
              <span className="text-lg font-semibold">${Number(data.keyPriceLevels.resistance).toLocaleString()}</span>
            </div>
            <div className="neumorphic-inset rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Current</span>
              <span className="text-lg font-semibold">${Number(data.keyPriceLevels.current).toLocaleString()}</span>
            </div>
            <div className="neumorphic-inset rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Support</span>
              <span className="text-lg font-semibold">${Number(data.keyPriceLevels.support).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="neumorphic-inset rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
          <p className="text-sm text-blue-600 font-medium">{data.recommendation}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Trading Signals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="neumorphic-inset rounded-lg p-4">
              <p className="text-sm text-gray-500">Buy Signal</p>
              <p className="text-sm">{data.tradingSignals.buySignal}</p>
            </div>
            <div className="neumorphic-inset rounded-lg p-4">
              <p className="text-sm text-gray-500">Momentum</p>
              <p className="text-sm">{data.tradingSignals.momentum}</p>
            </div>
            <div className="neumorphic-inset rounded-lg p-4">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-sm">{data.tradingSignals.volume}</p>
            </div>
            <div className="neumorphic-inset rounded-lg p-4">
              <p className="text-sm text-gray-500">Trend</p>
              <p className="text-sm">{data.tradingSignals.trend}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
