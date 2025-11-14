import { NextRequest } from "next/server"

export const runtime = "nodejs"

function extractJson(html: string) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

function findNumber(obj: any, keys: string[]): number | null {
  const stack = [obj]
  let best: number | null = null
  while (stack.length) {
    const cur = stack.pop()
    if (cur && typeof cur === 'object') {
      for (const k of Object.keys(cur)) {
        const v = cur[k]
        if (typeof v === 'object' && v) stack.push(v)
        else if (typeof v === 'number' && isFinite(v)) {
          const lk = k.toLowerCase()
          if (keys.some(x => lk.includes(x))) {
            best = v
          }
        }
        else if (typeof v === 'string') {
          const lv = v.toLowerCase()
          if (keys.some(x => lv.includes(x))) {
            const n = Number(v.replace(/[^0-9.\-]/g, ''))
            if (isFinite(n)) best = n
          }
        }
      }
    }
  }
  return best
}

function findInt(obj: any, keys: string[]): number | null {
  const stack = [obj]
  let best: number | null = null
  while (stack.length) {
    const cur = stack.pop()
    if (cur && typeof cur === 'object') {
      for (const k of Object.keys(cur)) {
        const v = cur[k]
        if (typeof v === 'object' && v) stack.push(v)
        else if (typeof v === 'number' && Number.isInteger(v)) {
          const lk = k.toLowerCase()
          if (keys.some(x => lk.includes(x))) best = v
        }
      }
    }
  }
  return best
}

async function resolveAddress(handle?: string, address?: string) {
  if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) return address
  if (!handle) return null
  const url = `https://polymarket.com/@${handle}`
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, cache: 'no-store' as any })
  const html = await res.text()
  const m = html.match(/0x[a-fA-F0-9]{40}/)
  return m?.[0] || null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const handle = searchParams.get("handle")?.replace(/^@/, "") || undefined
  const addressParam = searchParams.get("address") || undefined
  const address = await resolveAddress(handle, addressParam || undefined)
  if (!address) return new Response(JSON.stringify({ error: "address_missing" }), { status: 400 })
  try {
    // Prefer accurate aggregation from trades API
    let collected: any[] = []
    let offset = 0
    const pageSize = 1000
    for (let i = 0; i < 5; i++) {
      const u = `https://data-api.polymarket.com/trades?user=${encodeURIComponent(address)}&limit=${pageSize}&offset=${offset}`
      const r = await fetch(u, { headers: { "content-type": "application/json" }, cache: 'no-store' as any })
      if (!r.ok) break
      const arr = await r.json()
      if (!Array.isArray(arr) || !arr.length) break
      collected = collected.concat(arr)
      offset += arr.length
    }
    if (!collected.length) {
      const rg = await fetch(`https://data-api.polymarket.com/trades`, { headers: { "content-type": "application/json" }, cache: 'no-store' as any })
      if (rg.ok) {
        const all = await rg.json()
        if (Array.isArray(all)) {
          collected = all.filter((t: any) => (t?.user || "").toLowerCase() === address.toLowerCase())
        }
      }
    }
    let pnl = 0
    for (const t of collected) {
      let p = 0
      const direct = t.pnl_usd ?? t.profit_usd ?? t.realized_pnl ?? t.realized_pnl_usd ?? t.realized_profit_usd ?? t.profit
      if (direct != null) p = Number(direct) || 0
      if (!p) {
        const payout = Number(t.payout_usd ?? t.received_usd ?? t.redeem_usd) || 0
        const cost = Number(t.cost_usd ?? t.spent_usd) || 0
        if (payout || cost) p = payout - cost
        if (!p) {
          const size = Number(t.size_usd ?? t.sizeUSD ?? t.usd_size ?? t.amount_usd) || 0
          let sign = 0
          for (const k of Object.keys(t)) {
            const v = t[k]
            if (typeof v === 'string') {
              const s = v.toLowerCase()
              if (s.includes('sell') || s.includes('ask') || s.includes('redeem')) sign = 1
              else if (s.includes('buy') || s.includes('bid') || s.includes('mint')) sign = -1
            }
          }
          if (size && sign) p = sign * size
        }
      }
      pnl += p
    }
    const trades = collected.length
    // Fallback parse from profile page only if trades empty
    if (!trades) {
      const url = `https://polymarket.com/profile/${address}`
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, cache: 'no-store' as any })
      const html = await res.text()
      const data = extractJson(html)
      if (data) {
        const t = findInt(data, ['trade', 'trades', 'tradecount'])
        if (t != null) {
          return new Response(JSON.stringify({ address, stats: { pnl: 0, tradeCount: t } }), { headers: { "content-type": "application/json", "Cache-Control": "no-store" } })
        }
      }
    }
    if (!pnl) {
      const url = `https://polymarket.com/profile/${address}`
      const res2 = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, cache: 'no-store' as any })
      const html = await res2.text()
      const m = html.match(/Profit\/?Loss[^$]*\$([0-9,\.\-]+)/i)
      if (m && m[1]) {
        const num = Number(m[1].replace(/[^0-9\.\-]/g, ''))
        if (isFinite(num)) pnl = num
      }
    }
    return new Response(JSON.stringify({ address, stats: { pnl, tradeCount: trades } }), { headers: { "content-type": "application/json", "Cache-Control": "no-store" } })
  } catch (e) {
    return new Response(JSON.stringify({ address, stats: { pnl: 0, tradeCount: 0 }, error: "stats_failed" }), { headers: { "content-type": "application/json", "Cache-Control": "no-store" }, status: 200 })
  }
}
