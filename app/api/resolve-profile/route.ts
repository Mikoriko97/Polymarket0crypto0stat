import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const handle = searchParams.get("handle")?.replace(/^@/, "") || ""
  if (!handle) return new Response(JSON.stringify({ error: "missing_handle" }), { status: 400 })
  try {
    const url = `https://polymarket.com/@${handle}`
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } })
    const html = await res.text()
    const m = html.match(/0x[a-fA-F0-9]{40}/)
    const address = m?.[0] || null
    if (!address) return new Response(JSON.stringify({ error: "address_not_found" }), { status: 404 })
    return new Response(JSON.stringify({ address }), { headers: { "content-type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: "resolve_failed" }), { status: 500 })
  }
}

