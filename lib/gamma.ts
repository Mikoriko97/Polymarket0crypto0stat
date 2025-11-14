const GAMMA_API = "https://gamma-api.polymarket.com"

export interface GammaTag {
  id: number
  name: string
  slug?: string
  // Additional fields are present but not required here
}

export interface GammaMarket {
  id: number
  slug?: string
  question?: string
  event_id?: number
  event_slug?: string
  category?: string
  volume24hr?: number
  volume?: number
  liquidity?: number
  is_active?: boolean
  is_open?: boolean
  is_closed?: boolean
  // Keep the shape open for forward compatibility
  [key: string]: unknown
}

async function gammaFetch<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const url = `${GAMMA_API}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: init?.revalidate ?? 60 },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gamma API error ${res.status}: ${text}`)
  }
  const text = await res.text()
  return JSON.parse(text) as T
}

export async function getTags(): Promise<GammaTag[]> {
  const data = await gammaFetch<{ tags: GammaTag[] }>(`/tags`, { revalidate: 3600 })
  return Array.isArray((data as any).tags) ? (data as any).tags : (data as unknown as GammaTag[])
}

export async function getCryptoTagIdByName(name = "Crypto"): Promise<number | null> {
  const tags = await getTags()
  const tag = tags.find((t) => {
    const tagName = (t.name ?? (t as any).title ?? "").toString()
    return tagName.toLowerCase() === name.toLowerCase()
  })
  return tag ? tag.id : null
}

export interface GetMarketsOptions {
  closed?: boolean
  limit?: number
  offset?: number
}

export async function getMarketsByTagId(tagId: number, options: GetMarketsOptions = {}): Promise<GammaMarket[]> {
  const params = new URLSearchParams()
  params.set("tag_id", String(tagId))
  if (options.closed != null) params.set("closed", String(options.closed))
  else params.set("closed", "false") // Default to open markets
  if (options.limit != null) params.set("limit", String(options.limit))
  if (options.offset != null) params.set("offset", String(options.offset))

  const data = await gammaFetch<{ markets: GammaMarket[] }>(`/markets?${params.toString()}`, { revalidate: 60 })
  const arr = Array.isArray((data as any).markets) ? (data as any).markets : (data as unknown as GammaMarket[])
  if (arr?.length) {
    const sample = arr[0] as any
    console.log('[Gamma:getMarketsByTagId] sample keys=', Object.keys(sample))
  }
  return arr.map(normalizeMarket)
}

export async function getMarkets(options: GetMarketsOptions = {}): Promise<GammaMarket[]> {
  const params = new URLSearchParams()
  if (options.closed != null) params.set("closed", String(options.closed))
  else params.set("closed", "false") // Default to open markets
  if (options.limit != null) params.set("limit", String(options.limit))
  if (options.offset != null) params.set("offset", String(options.offset))

  const data = await gammaFetch<{ markets: GammaMarket[] }>(`/markets?${params.toString()}`, { revalidate: 60 })
  const arr = Array.isArray((data as any).markets) ? (data as any).markets : (data as unknown as GammaMarket[])
  if (arr?.length) {
    const sample = arr[0] as any
    console.log('[Gamma:getMarkets] sample keys=', Object.keys(sample))
  }
  return arr.map(normalizeMarket);
}

export async function getMarketBySlug(slug: string): Promise<GammaMarket | null> {
  const params = new URLSearchParams()
  params.set("slug", slug)
  params.set("limit", "1")
  const data = await gammaFetch<{ markets: GammaMarket[] }>(`/markets?${params.toString()}`, { revalidate: 60 })
  const arr = Array.isArray((data as any).markets) ? (data as any).markets : (data as unknown as GammaMarket[])
  return arr?.[0] ? normalizeMarket(arr[0]) : null
}

export const GammaAPI = {
  getTags,
  getCryptoTagIdByName,
  getMarketsByTagId,
  getMarkets,
  getMarketBySlug,
}
function toNumber(val: unknown): number | undefined {
  if (typeof val === "number" && Number.isFinite(val)) return val
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.\-]/g, "")
    const num = Number.parseFloat(cleaned)
    return Number.isFinite(num) ? num : undefined
  }
  return undefined
}

function normalizeMarket(raw: GammaMarket): GammaMarket {
  const anyRaw = raw as any
  const volume24hr = toNumber(anyRaw.volume24hr) ?? toNumber(anyRaw.volume1day) ?? raw.volume24hr
  const volume = toNumber(anyRaw.volume) ?? toNumber(anyRaw.volumeNum) ?? raw.volume
  const liquidity = toNumber(anyRaw.liquidity) ?? toNumber(anyRaw.liquidityNum) ?? raw.liquidity

  const closed = typeof anyRaw.closed === "boolean" ? anyRaw.closed : raw.is_closed ?? false
  const active = typeof anyRaw.active === "boolean" ? anyRaw.active : raw.is_active ?? false
  const is_open = (raw.is_open ?? (active && !closed)) as boolean

  const slug = (raw.slug ?? anyRaw.slug ?? "")?.toString() || undefined
  const question = (raw.question ?? anyRaw.question ?? "")?.toString() || undefined
  const category = (raw.category ?? anyRaw.category ?? "")?.toString() || undefined

  const bestBid = toNumber(anyRaw.bestBid)
  const bestAsk = toNumber(anyRaw.bestAsk)
  const lastTradePrice = toNumber(anyRaw.lastTradePrice)
  const oneDayPriceChange = toNumber(anyRaw.oneDayPriceChange)

  let clobTokenIds = anyRaw.clobTokenIds
  if (typeof clobTokenIds === 'string') {
    try {
      clobTokenIds = JSON.parse(clobTokenIds)
    } catch (e) {
      clobTokenIds = []
    }
  }
  if (!Array.isArray(clobTokenIds)) {
    clobTokenIds = []
  }

  return {
    ...raw,
    slug,
    question,
    category,
    volume24hr,
    volume,
    liquidity,
    is_closed: closed,
    is_active: active,
    is_open,
    bestBid,
    bestAsk,
    lastTradePrice,
    oneDayPriceChange,
    clobTokenIds,
  }
}

export async function getMarketPriceHistory(clobTokenId: string, interval: "1d" | "1w" | "1m" | "6h" | "1h" | "max" = "max") {
  console.log('[getMarketPriceHistory] clobTokenId:', clobTokenId);
  const params = new URLSearchParams()
  params.set("market", clobTokenId)
  params.set("interval", interval)
  // The prices-history endpoint is on a different API
  const url = `https://clob.polymarket.com/prices-history?${params.toString()}`
  const res = await fetch(url, {
    headers: {
      "content-type": "application/json",
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Clob API error ${res.status}: ${text}`)
  }
  const data = (await res.json()) as { history: { t: number; p: number }[] }
  return data.history
}

export async function getAllMarketsByTagId(tagId: number, options: GetMarketsOptions & { pageSize?: number } = {}) {
  const pageSize = options.pageSize ?? 200
  const closed = options.closed ?? false
  let offset = options.offset ?? 0
  const out: GammaMarket[] = []
  for (let i = 0; i < 50; i++) {
    const batch = await getMarketsByTagId(tagId, { closed, limit: pageSize, offset })
    if (!batch.length) break
    out.push(...batch)
    offset += batch.length
    if (batch.length < pageSize) break
  }
  return out
}

export async function getTrades() {
  const response = await fetch('https://data-api.polymarket.com/trades');
  if (!response.ok) {
    throw new Error(`Gamma API error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}
