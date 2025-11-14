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
  const url = `https://polymarket.com/profile/${address}`
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, cache: 'no-store' as any })
    const html = await res.text()
    const data = extractJson(html)
    let pnl = 0
    let trades = 0
    if (data) {
      const p = findNumber(data, ['pnl', 'profit', 'profitloss', 'profit_loss'])
      if (p != null) pnl = p
      const t = findInt(data, ['trade', 'trades', 'tradecount'])
      if (t != null) trades = t
    }
    if (!trades) {
      const r = await fetch(`https://data-api.polymarket.com/trades?user=${encodeURIComponent(address)}&limit=1000`, { headers: { "content-type": "application/json" }, cache: 'no-store' as any })
      if (r.ok) {
        const arr = await r.json()
        if (Array.isArray(arr)) trades = arr.length
      }
    }
    return new Response(JSON.stringify({ address, stats: { pnl, tradeCount: trades } }), { headers: { "content-type": "application/json", "Cache-Control": "no-store" } })
  } catch (e) {
    return new Response(JSON.stringify({ address, stats: { pnl: 0, tradeCount: 0 }, error: "stats_failed" }), { headers: { "content-type": "application/json", "Cache-Control": "no-store" }, status: 200 })
  }
}

