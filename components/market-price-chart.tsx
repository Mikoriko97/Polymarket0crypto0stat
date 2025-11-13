"use client"

import { getMarketPriceHistory, GammaMarket } from "@/lib/gamma"
import { useEffect, useMemo, useRef, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Brush } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { exportToCSV, exportToJSON } from "@/lib/utils"

export function MarketPriceChart({ market }: { market: GammaMarket }) {
  const [data, setData] = useState<{ t: number; p: number }[]>([])
  const [live, setLive] = useState(true)
  const [interval, setIntervalSel] = useState<"1d" | "1w" | "1m" | "6h" | "1h" | "max">("1h")
  const clobTokenId = (market.clobTokenIds as string[])?.[0]
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (clobTokenId) {
      getMarketPriceHistory(clobTokenId, interval).then(setData).catch(() => {})
    }
  }, [clobTokenId, interval])

  useEffect(() => {
    if (!clobTokenId || !live) {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
      return
    }
    const es = new EventSource(`/api/price-stream?clobTokenId=${encodeURIComponent(clobTokenId)}&interval=${interval}`)
    esRef.current = es
    es.onmessage = (evt) => {
      try {
        const point = JSON.parse(evt.data) as { t: number; p: number }
        setData((prev) => {
          if (!prev.length || point.t > prev[prev.length - 1].t) {
            const next = [...prev, point]
            return next.length > 1000 ? next.slice(-1000) : next
          }
          return prev
        })
      } catch {}
    }
    es.onerror = () => {}
    return () => {
      es.close()
      esRef.current = null
    }
  }, [clobTokenId, live, interval])

  if (!clobTokenId) {
    return <div className="text-center py-8">Price chart not available for this market.</div>
  }

  const config = useMemo(() => ({ price: { label: "Price", color: "#8884d8" } }), [])

  if (!data.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <select value={interval} onChange={(e) => setIntervalSel(e.target.value as any)} className="neumorphic px-2 py-1 rounded">
            <option value="1h">1h</option>
            <option value="6h">6h</option>
            <option value="1d">1d</option>
            <option value="1w">1w</option>
            <option value="1m">1m</option>
            <option value="max">max</option>
          </select>
          <button onClick={() => setLive((v) => !v)} className="neumorphic px-3 py-1 rounded">{live ? "Live" : "Paused"}</button>
        </div>
        <div>Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select value={interval} onChange={(e) => setIntervalSel(e.target.value as any)} className="neumorphic px-2 py-1 rounded">
          <option value="1h">1h</option>
          <option value="6h">6h</option>
          <option value="1d">1d</option>
          <option value="1w">1w</option>
          <option value="1m">1m</option>
          <option value="max">max</option>
        </select>
        <button onClick={() => setLive((v) => !v)} className="neumorphic px-3 py-1 rounded">{live ? "Live" : "Paused"}</button>
        <button onClick={() => exportToCSV(data.map((d) => ({ t: d.t, p: d.p })), `price-${clobTokenId}.csv`)} className="neumorphic px-3 py-1 rounded">CSV</button>
        <button onClick={() => exportToJSON(data, `price-${clobTokenId}.json`)} className="neumorphic px-3 py-1 rounded">JSON</button>
      </div>
      <ChartContainer config={config} className="w-full">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleString()} />
          <YAxis dataKey="p" />
          <ChartTooltip content={<ChartTooltipContent nameKey="price" />} />
          <Line type="monotone" dataKey="p" stroke="var(--color-price)" dot={false} />
          <Brush dataKey="t" height={24} travellerWidth={8} />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
