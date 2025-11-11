"use client"

import { getMarketPriceHistory, GammaMarket } from "@/lib/gamma"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function MarketPriceChart({ market }: { market: GammaMarket }) {
  const [data, setData] = useState<{ t: number; p: number }[]>([])
  const clobTokenId = (market.clobTokenIds as string[])?.[0];

  useEffect(() => {
    if (clobTokenId) {
      getMarketPriceHistory(clobTokenId).then(setData).catch((err) => {
        console.error('Failed to fetch price history:', err)
      })
    }
  }, [clobTokenId])

  if (!clobTokenId) {
    return <div className="text-center py-8">Price chart not available for this market.</div>
  }

  if (!data.length) {
    return <div>Loading chart...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="t" tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleDateString()} />
        <YAxis dataKey="p" />
        <Tooltip />
        <Line type="monotone" dataKey="p" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}