import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

export type AnalysisResult = {
  ok: boolean
  content?: string
  errorCode?: string
  latencyMs?: number
}

export async function getMarketAnalysis(marketQuestion: string): Promise<AnalysisResult> {
  if (!marketQuestion) {
    return { ok: false, errorCode: 'no_question' }
  }
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const attempts = 3
  let lastErr: unknown = null
  for (let i = 0; i < attempts; i++) {
    try {
      const completion = await openrouter.chat.completions.create({
        model: 'x-ai/grok-4-fast',
        messages: [
          {
            role: 'system',
            content: `You are a market analyst. Provide a brief analysis of the following market question. The analysis should include a prediction, a short explanation of why the prediction is likely, and a short explanation of why it might not be. The question is: ${marketQuestion}`,
          },
        ],
      })
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const content = completion.choices[0].message.content ?? ''
      return { ok: true, content, latencyMs: Math.round(end - start) }
    } catch (error: any) {
      lastErr = error
      const code = typeof error?.status === 'number' ? String(error.status) : error?.code || 'unknown'
      const retryable = code === '429' || code === '408' || code === '503' || code === 'ETIMEDOUT' || code === 'ECONNRESET'
      if (i < attempts - 1 && retryable) {
        const backoff = 300 * Math.pow(2, i)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      } else {
        const end = typeof performance !== 'undefined' ? performance.now() : Date.now()
        return { ok: false, errorCode: code || 'error', latencyMs: Math.round(end - start) }
      }
    }
  }
  return { ok: false, errorCode: 'error' }
}

export type StructuredAnalysis = {
  marketSentiment: string
  riskLevel: string
  volatilityIndex: number
  technicalAnalysis: string
  keyPriceLevels: {
    resistance: number
    current: number
    support: number
  }
  recommendation: string
  tradingSignals: {
    buySignal: string
    momentum: string
    volume: string
    trend: string
  }
}

export async function getMarketAnalysisStructured(marketQuestion: string): Promise<{ ok: boolean; data?: StructuredAnalysis; errorCode?: string; latencyMs?: number }> {
  if (!marketQuestion) {
    return { ok: false, errorCode: 'no_question' }
  }
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const attempts = 3
  for (let i = 0; i < attempts; i++) {
    try {
      const completion = await openrouter.chat.completions.create({
        model: 'x-ai/grok-4-fast',
        messages: [
          {
            role: 'system',
            content:
              'Return ONLY JSON matching this schema keys: {"marketSentiment": string (Bullish/Bearish/Neutral), "riskLevel": string, "volatilityIndex": number, "technicalAnalysis": string, "keyPriceLevels": {"resistance": number, "current": number, "support": number}, "recommendation": string, "tradingSignals": {"buySignal": string, "momentum": string, "volume": string, "trend": string}}. No markdown, no prose outside JSON.',
          },
          {
            role: 'user',
            content: `Analyze the market question and fill the JSON: ${marketQuestion}`,
          },
        ],
        response_format: { type: 'json_object' as any },
      })
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const content = (completion.choices[0].message.content ?? '').trim()
      let parsed: StructuredAnalysis | null = null
      try {
        parsed = JSON.parse(content) as StructuredAnalysis
      } catch {
        const match = content.match(/\{[\s\S]*\}/)
        if (match) {
          parsed = JSON.parse(match[0]) as StructuredAnalysis
        }
      }
      if (!parsed) {
        throw new Error('parse_failed')
      }
      return { ok: true, data: parsed, latencyMs: Math.round(end - start) }
    } catch (error: any) {
      const code = typeof error?.status === 'number' ? String(error.status) : error?.code || 'unknown'
      const retryable = code === '429' || code === '408' || code === '503' || code === 'ETIMEDOUT' || code === 'ECONNRESET'
      if (i < attempts - 1 && retryable) {
        const backoff = 300 * Math.pow(2, i)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      } else {
        const end = typeof performance !== 'undefined' ? performance.now() : Date.now()
        return { ok: false, errorCode: code || 'error', latencyMs: Math.round(end - start) }
      }
    }
  }
  return { ok: false, errorCode: 'error' }
}

export type EventAnalysis = {
  topic: string
  outcome: string
  confidence: string
  summary: string
  whyLikely: string[]
  counterpoints: string[]
  keyFactors: string[]
  references: string[]
  recommendation: string
}

export async function getMarketAnalysisEvent(marketQuestion: string): Promise<{ ok: boolean; data?: EventAnalysis; errorCode?: string; latencyMs?: number }> {
  if (!marketQuestion) {
    return { ok: false, errorCode: 'no_question' }
  }
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const attempts = 3
  for (let i = 0; i < attempts; i++) {
    try {
      const completion = await openrouter.chat.completions.create({
        model: 'x-ai/grok-4-fast',
        messages: [
          {
            role: 'system',
            content:
              'Return ONLY JSON with keys {"topic": string, "outcome": string, "confidence": string, "summary": string, "whyLikely": string[], "counterpoints": string[], "keyFactors": string[], "references": string[], "recommendation": string}. Do not include market prices or invented numbers. Focus on the event/policy/upgrade context strictly based on the question.',
          },
          { role: 'user', content: marketQuestion },
        ],
        response_format: { type: 'json_object' as any },
      })
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const content = (completion.choices[0].message.content ?? '').trim()
      const parsed = JSON.parse(content) as EventAnalysis
      return { ok: true, data: parsed, latencyMs: Math.round(end - start) }
    } catch (error: any) {
      const code = typeof error?.status === 'number' ? String(error.status) : error?.code || 'unknown'
      const retryable = code === '429' || code === '408' || code === '503' || code === 'ETIMEDOUT' || code === 'ECONNRESET'
      if (i < attempts - 1 && retryable) {
        const backoff = 300 * Math.pow(2, i)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      } else {
        const end = typeof performance !== 'undefined' ? performance.now() : Date.now()
        return { ok: false, errorCode: code || 'error', latencyMs: Math.round(end - start) }
      }
    }
  }
  return { ok: false, errorCode: 'error' }
}
