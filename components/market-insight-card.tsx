"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getMarketAnalysisStructured, getMarketAnalysisEvent, StructuredAnalysis, EventAnalysis } from "@/lib/open-router"

function classify(question: string): "price" | "event" {
  const q = question.toLowerCase()
  const priceHints = ["price", "$", "usd", "resistance", "support", "ma", "macd", "trend", "buy", "sell"]
  const eventHints = ["upgrade", "fork", "merge", "election", "bill", "policy", "release", "lawsuit", "implemented", "passed"]
  const isPrice = priceHints.some((h) => q.includes(h))
  const isEvent = eventHints.some((h) => q.includes(h))
  if (isEvent && !isPrice) return "event"
  return isPrice ? "price" : "event"
}

export function MarketInsightCard({ marketQuestion }: { marketQuestion: string }) {
  const [priceData, setPriceData] = useState<StructuredAnalysis | null>(null)
  const [eventData, setEventData] = useState<EventAnalysis | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const { toast } = useToast()
  const type = useMemo(() => classify(marketQuestion), [marketQuestion])

  useEffect(() => {
    if (!marketQuestion) return
    if (type === "price") {
      getMarketAnalysisStructured(marketQuestion)
        .then((res) => {
          if (res.latencyMs != null) setLatencyMs(res.latencyMs)
          if (res.ok && res.data) {
            setPriceData(res.data)
            toast({ title: "AI Ready", description: `${res.latencyMs ?? 0}ms` })
          } else {
            toast({ title: "AI Error", description: res.errorCode || "unknown", variant: "destructive" })
            getMarketAnalysisEvent(marketQuestion).then((ev) => {
              if (ev.ok && ev.data) setEventData(ev.data)
            })
          }
        })
        .catch(() => {
          toast({ title: "AI Error", description: "network", variant: "destructive" })
          getMarketAnalysisEvent(marketQuestion).then((ev) => {
            if (ev.ok && ev.data) setEventData(ev.data)
          })
        })
    } else {
      getMarketAnalysisEvent(marketQuestion)
        .then((res) => {
          if (res.latencyMs != null) setLatencyMs(res.latencyMs)
          if (res.ok && res.data) {
            setEventData(res.data)
            toast({ title: "AI Ready", description: `${res.latencyMs ?? 0}ms` })
          } else {
            toast({ title: "AI Error", description: res.errorCode || "unknown", variant: "destructive" })
          }
        })
        .catch(() => {
          toast({ title: "AI Error", description: "network", variant: "destructive" })
        })
    }
  }, [marketQuestion, type])

  if (type === "price") {
    return (
      <Card className="neumorphic-elevated">
        <CardHeader>
          <CardTitle>Market Insight</CardTitle>
          {latencyMs != null ? <CardDescription>Latency: {latencyMs}ms</CardDescription> : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {!priceData ? (
            <div className="text-sm text-text-secondary">Loading AI insights...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="neumorphic-inset rounded-lg p-4">
                  <p className="text-sm text-text-secondary">Sentiment</p>
                  <p className="text-xl font-semibold">{priceData.marketSentiment}</p>
                </div>
                <div className="neumorphic-inset rounded-lg p-4">
                  <p className="text-sm text-text-secondary">Risk Level</p>
                  <p className="text-xl font-semibold">{priceData.riskLevel}</p>
                </div>
                <div className="neumorphic-inset rounded-lg p-4">
                  <p className="text-sm text-text-secondary">Volatility Index</p>
                  <p className="text-xl font-semibold">{Number(priceData.volatilityIndex).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
                <p className="text-sm">{priceData.technicalAnalysis}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                <p className="text-sm text-primary font-medium">{priceData.recommendation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="neumorphic-elevated">
      <CardHeader>
        <CardTitle>Market Insight</CardTitle>
        {latencyMs != null ? <CardDescription>Latency: {latencyMs}ms</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {!eventData ? (
          <div className="text-sm text-text-secondary">Loading AI insights...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="neumorphic-inset rounded-lg p-4">
                <p className="text-sm text-text-secondary">Topic</p>
                <p className="text-xl font-semibold">{eventData.topic}</p>
              </div>
              <div className="neumorphic-inset rounded-lg p-4">
                <p className="text-sm text-text-secondary">Outcome</p>
                <p className="text-xl font-semibold">{eventData.outcome}</p>
              </div>
              <div className="neumorphic-inset rounded-lg p-4">
                <p className="text-sm text-text-secondary">Confidence</p>
                <p className="text-xl font-semibold">{eventData.confidence}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p className="text-sm">{eventData.summary}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="neumorphic-inset rounded-lg p-4 space-y-1">
                <p className="text-sm text-text-secondary">Why Likely</p>
                {eventData.whyLikely.map((x, i) => (
                  <p key={i} className="text-sm">• {x}</p>
                ))}
              </div>
              <div className="neumorphic-inset rounded-lg p-4 space-y-1">
                <p className="text-sm text-text-secondary">Counterpoints</p>
                {eventData.counterpoints.map((x, i) => (
                  <p key={i} className="text-sm">• {x}</p>
                ))}
              </div>
            </div>
            <div className="neumorphic-inset rounded-lg p-4 space-y-1">
              <p className="text-sm text-text-secondary">Key Factors</p>
              {eventData.keyFactors.map((x, i) => (
                <p key={i} className="text-sm">• {x}</p>
              ))}
            </div>
            {eventData.references.length ? (
              <div className="neumorphic-inset rounded-lg p-4 space-y-1">
                <p className="text-sm text-text-secondary">References</p>
                {eventData.references.map((x, i) => (
                  <p key={i} className="text-sm break-words">• {x}</p>
                ))}
              </div>
            ) : null}
            <div>
              <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
              <p className="text-sm text-primary font-medium">{eventData.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

