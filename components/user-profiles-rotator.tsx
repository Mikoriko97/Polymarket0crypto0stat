"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Stats = { volume: number; tradeCount: number; pnl: number }

type Target = { address?: string; handle?: string }

export function UserProfilesRotator({ addresses = [], handles = [], intervalMs = 10000 }: { addresses?: string[]; handles?: string[]; intervalMs?: number }) {
  const initialTargets: Target[] = useMemo(() => {
    const a = (addresses || []).map((x) => ({ address: x }))
    const h = (handles || []).map((x) => ({ handle: x }))
    const arr = [...a, ...h]
    if (arr.length) return arr
    const defaults = ["fengdubiying", "polymarket", "polybot", "crypto"]
    return defaults.map((d) => ({ handle: d }))
  }, [addresses, handles])
  const [targets, setTargets] = useState<Target[]>(initialTargets)

  const [index, setIndex] = useState(0)
  const [stats, setStats] = useState<Stats>({ volume: 0, tradeCount: 0, pnl: 0 })
  const [address, setAddress] = useState<string | null>(null)
  const [handle, setHandle] = useState<string | null>(null)

  useEffect(() => {
    if (!targets.length) return
    const tick = () => setIndex((i) => (i + 1) % targets.length)
    const timer = setInterval(tick, intervalMs)
    return () => clearInterval(timer)
  }, [targets.length, intervalMs])

  useEffect(() => {
    if (!targets.length) return
    if (index >= targets.length) setIndex(0)
  }, [targets.length])

  useEffect(() => {
    if (addresses.length || handles.length) return
    fetch(`/api/leaderboard`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        const a: Target[] = Array.isArray(json.addresses) ? json.addresses.map((x: string) => ({ address: x })) : []
        const h: Target[] = a.length ? [] : (Array.isArray(json.handles) ? json.handles.map((x: string) => ({ handle: x })) : [])
        const next = a.length ? a : h
        if (next.length) setTargets(next)
      })
      .catch(() => {})
  }, [addresses.length, handles.length])

  useEffect(() => {
    if (!targets.length) return
    const len = targets.length
    const t = targets[(index % len + len) % len]
    if (!t) return
    let url = ""
    if (t.address) url = `/api/user-stats?address=${encodeURIComponent(String(t.address))}`
    else if (t.handle) url = `/api/user-stats?handle=${encodeURIComponent(String(t.handle))}`
    else return
    fetch(url, { cache: 'no-store' })
      .then((r) => r.json())
      .then(async (json) => {
        const st = json.stats || {}
        setStats({ volume: 0, tradeCount: st.tradeCount ?? 0, pnl: st.pnl ?? 0 })
        setAddress(json.address || t.address || null)
        if (t.handle) setHandle(t.handle)
      })
      .catch(() => {
        setStats({ volume: 0, tradeCount: 0, pnl: 0 })
      })
  }, [index, targets])

  const title = handle ? `@${handle}` : address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "—"
  const fallback = title?.[1]?.toUpperCase() ?? "U"
  const profileUrl = handle ? `https://polymarket.com/@${handle}` : address ? `https://polymarket.com/profile/${address}` : "#"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={undefined as any} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle>@polymarket</CardTitle>
          {address ? <p className="text-sm text-muted-foreground">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p> : null}
        </div>
        <Badge className="ml-auto">Pro</Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1">
          <p className="text-sm font-medium">Profit/Loss</p>
          <p className={`text-2xl font-bold ${stats.pnl > 0 ? 'text-emerald-600' : stats.pnl < 0 ? 'text-red-600' : ''}`}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.pnl)}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium">Total Trades</p>
          <p className="text-2xl font-bold">{stats.tradeCount}</p>
        </div>
        <Link href={profileUrl} target="_blank" className="text-primary hover:underline">Open Profile</Link>
      </CardContent>
    </Card>
  )
}
