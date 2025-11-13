"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Stats = { volume: number; tradeCount: number }

export function UserProfileLive({ handle = "fengdubiying" }: { handle?: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    let timer: any
    const fetchData = async () => {
      const res = await fetch(`/api/user-trades?handle=${encodeURIComponent(handle)}&limit=200`)
      if (res.ok) {
        const json = await res.json()
        setAddress(json.address)
        setStats(json.stats)
      }
    }
    fetchData()
    timer = setInterval(fetchData, 15000)
    return () => clearInterval(timer)
  }, [handle])

  const displayName = `@${handle}`
  const fallback = displayName?.[1]?.toUpperCase() ?? "U"
  const profileUrl = `https://polymarket.com/@${handle}`

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={undefined as any} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle>{displayName}</CardTitle>
          {address ? <p className="text-sm text-muted-foreground">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p> : null}
        </div>
        <Badge className="ml-auto">Pro</Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1">
          <p className="text-sm font-medium">Total P/L</p>
          <p className={`text-2xl font-bold ${stats ? (stats.pnl > 0 ? 'text-emerald-600' : stats.pnl < 0 ? 'text-red-600' : '') : ''}`}>{stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.pnl) : "—"}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium">Total Trades</p>
          <p className="text-2xl font-bold">{stats ? stats.tradeCount : "—"}</p>
        </div>
        <Link href={profileUrl} target="_blank" className="text-primary hover:underline">Open Profile</Link>
      </CardContent>
    </Card>
  )
}
