import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get("address") || ""
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return new Response(JSON.stringify({ error: "missing_address" }), { status: 400 })
  try {
    const url = `https://polymarket.com/profile/${address}`
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } })
    const html = await res.text()
    const m = html.match(/@([a-zA-Z0-9_]+)/)
    const handle = m?.[1] || null
    if (!handle) return new Response(JSON.stringify({ error: "handle_not_found" }), { status: 404 })
    return new Response(JSON.stringify({ handle }), { headers: { "content-type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: "resolve_failed" }), { status: 500 })
  }
}

