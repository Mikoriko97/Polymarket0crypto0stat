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
    const url = `https://data-api.polymarket.com/trades?user=${encodeURIComponent(address)}&limit=${limit}`
    const res = await fetch(url, { headers: { "content-type": "application/json" } })
    if (!res.ok) return new Response(JSON.stringify({ error: "trades_failed" }), { status: res.status })
    const trades = await res.json()
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
    return new Response(JSON.stringify({ address, stats, trades }), { headers: { "content-type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: "user_trades_failed" }), { status: 500 })
  }
}
