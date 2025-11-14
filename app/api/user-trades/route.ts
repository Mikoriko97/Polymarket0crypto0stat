import { NextRequest } from "next/server"

export const runtime = "nodejs"

async function resolveAddress(handle?: string, address?: string) {
  if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) return address
  if (!handle) return null
  const url = `https://polymarket.com/@${handle}`
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } })
  const html = await res.text()
  const m = html.match(/0x[a-fA-F0-9]{40}/)
  return m?.[0] || null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const handle = searchParams.get("handle")?.replace(/^@/, "") || undefined
  const addressParam = searchParams.get("address") || undefined
  const limit = Number(searchParams.get("limit") || 100)
  const address = await resolveAddress(handle, addressParam || undefined)
  if (!address) return new Response(JSON.stringify({ error: "address_missing" }), { status: 400 })
  try {
    // Prefer direct user-filtered endpoint with pagination
    let collected: any[] = []
    let offset = 0
    const pageSize = Math.min(1000, Math.max(100, limit))
    for (let i = 0; i < 5; i++) {
      const u = `https://data-api.polymarket.com/trades?user=${encodeURIComponent(address)}&limit=${pageSize}&offset=${offset}`
      const r = await fetch(u, { headers: { "content-type": "application/json" }, cache: 'no-store' as any })
      if (!r.ok) break
      const arr = await r.json()
      if (!Array.isArray(arr) || arr.length === 0) break
      collected = collected.concat(arr)
      if (collected.length >= limit) break
      offset += arr.length
    }
    // Fallback: global trades filter if direct endpoint returned empty
    if (collected.length === 0) {
      const url = `https://data-api.polymarket.com/trades`
      const res = await fetch(url, { headers: { "content-type": "application/json" }, cache: 'no-store' as any })
      if (!res.ok) return new Response(JSON.stringify({ error: "trades_failed" }), { status: res.status })
      const all = await res.json()
      const userAll = Array.isArray(all) ? all.filter((t: any) => (t?.user || "").toLowerCase() === address.toLowerCase()) : []
      collected = userAll
    }
    const trades = collected.slice(0, Math.max(1, Math.min(limit, 5000)))
    const stats = trades.reduce(
      (acc: { volume: number; tradeCount: number; pnl: number }, t: any) => {
        const v = Number(t.size_usd) || 0
        acc.volume += v
        acc.tradeCount += 1
        let pnl = 0
        const pnlDirect = t.pnl_usd ?? t.profit_usd ?? t.realized_pnl ?? t.realized_pnl_usd ?? t.realized_profit_usd ?? t.profit
        if (pnlDirect != null) pnl = Number(pnlDirect) || 0
        if (!pnl) {
          const payout = Number(t.payout_usd ?? t.received_usd ?? t.redeem_usd) || 0
          const cost = Number(t.cost_usd ?? t.spent_usd) || 0
          if (payout || cost) pnl = payout - cost
        }
        acc.pnl += pnl
        return acc
      },
      { volume: 0, tradeCount: 0, pnl: 0 },
    )
    return new Response(JSON.stringify({ address, stats, trades }), { headers: { "content-type": "application/json", "Cache-Control": "no-store" } })
  } catch (e) {
    const fallback = { volume: 0, tradeCount: 0, pnl: 0 }
    return new Response(JSON.stringify({ address, stats: fallback, trades: [], error: "user_trades_failed" }), { headers: { "content-type": "application/json", "Cache-Control": "no-store" }, status: 200 })
  }
}
