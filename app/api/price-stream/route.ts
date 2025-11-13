import { NextRequest } from "next/server"
import { getMarketPriceHistory } from "@/lib/gamma"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clobTokenId = searchParams.get("clobTokenId") || ""
  const interval = (searchParams.get("interval") as "1d" | "1w" | "1m" | "6h" | "1h" | "max") || "1h"
  if (!clobTokenId) {
    return new Response("Missing clobTokenId", { status: 400 })
  }

  let prevT = 0
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const history = await getMarketPriceHistory(clobTokenId, interval)
        const last = history.at(-1)
        if (last) {
          prevT = last.t
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(last)}\n\n`))
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "init_failed" })}\n\n`))
      }

      const pollMs = 2000
      const hbMs = 10000
      const pollTimer = setInterval(async () => {
        try {
          const history = await getMarketPriceHistory(clobTokenId, interval)
          const last = history.at(-1)
          if (last && last.t > prevT) {
            prevT = last.t
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(last)}\n\n`))
          }
        } catch (e) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "poll_failed" })}\n\n`))
        }
      }, pollMs)

      const hbTimer = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`))
      }, hbMs)

      const cancel = req.signal
      const onAbort = () => {
        clearInterval(pollTimer)
        clearInterval(hbTimer)
      }
      if (cancel.aborted) onAbort()
      cancel.addEventListener("abort", onAbort)
    },
    cancel() {},
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}

