import { NextRequest } from "next/server"

export const runtime = "nodejs"

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetch("https://polymarket.com/leaderboard/overall/all/profit", {
      headers: { "user-agent": "Mozilla/5.0" },
      cache: "no-store" as any,
    })
    const html = await res.text()
    const handles = uniq(Array.from(html.matchAll(/@([a-zA-Z0-9_]+)/g)).map((m) => m[1]))
    const addresses = uniq(Array.from(html.matchAll(/0x[a-fA-F0-9]{40}/g)).map((m) => m[0]))
    if (!handles.length && !addresses.length) {
      const tradesRes = await fetch("https://data-api.polymarket.com/trades", { headers: { "content-type": "application/json" }, cache: "no-store" as any })
      const trades = await tradesRes.json()
      const byUser = new Map<string, { volume: number; count: number }>()
      if (Array.isArray(trades)) {
        for (const t of trades) {
          const u = (t?.user || "").toLowerCase()
          if (!u) continue
          const v = Number(t?.size_usd) || 0
          const cur = byUser.get(u) || { volume: 0, count: 0 }
          cur.volume += v
          cur.count += 1
          byUser.set(u, cur)
        }
      }
      const top = Array.from(byUser.entries()).sort((a, b) => b[1].volume - a[1].volume).slice(0, 20).map(([u]) => u)
      return new Response(JSON.stringify({ handles: [], addresses: top }), {
        headers: { "content-type": "application/json", "Cache-Control": "no-store" },
      })
    }
    return new Response(JSON.stringify({ handles, addresses }), {
      headers: { "content-type": "application/json", "Cache-Control": "no-store" },
    })
  } catch (e) {
    return new Response(JSON.stringify({ handles: [], addresses: [], error: "leaderboard_fetch_failed" }), {
      headers: { "content-type": "application/json", "Cache-Control": "no-store" },
      status: 200,
    })
  }
}
