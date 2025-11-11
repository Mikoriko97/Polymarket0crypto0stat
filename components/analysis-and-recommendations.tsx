"use client"

export default function AnalysisAndRecommendations({ crypto }: { crypto: any }) {
  const getRecommendationColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-emerald-600 dark:text-emerald-400"
      case "neutral":
        return "text-blue-600 dark:text-blue-400"
      case "bearish":
        return "text-orange-600 dark:text-orange-400"
      default:
        return "text-text-secondary"
    }
  }

  const analysisData: Record<string, any> = {
    btc: {
      technicalAnalysis:
        "Strong uptrend with support at $92,500 and resistance at $96,000. RSI shows momentum but not overbought.",
      sentiment: "bullish",
      riskLevel: "Medium",
      recommendation: "Accumulate on dips to support level",
      keyLevels: [
        { level: "$96,000", type: "Resistance" },
        { level: "$94,230", type: "Current" },
        { level: "$92,500", type: "Support" },
      ],
    },
    eth: {
      technicalAnalysis: "Steady upward movement with consolidation phases. MACD showing positive crossover signals.",
      sentiment: "bullish",
      riskLevel: "Medium-Low",
      recommendation: "Hold long-term positions, add on pullbacks",
      keyLevels: [
        { level: "$3,800", type: "Resistance" },
        { level: "$3,580", type: "Current" },
        { level: "$3,300", type: "Support" },
      ],
    },
    sol: {
      technicalAnalysis: "Strong momentum with breakout above $200 level. Volume confirms buying pressure.",
      sentiment: "bullish",
      riskLevel: "Medium-High",
      recommendation: "Ride the trend with trailing stops",
      keyLevels: [
        { level: "$250", type: "Resistance" },
        { level: "$210", type: "Current" },
        { level: "$185", type: "Support" },
      ],
    },
    matic: {
      technicalAnalysis: "Consolidating in range $0.70-$0.85. Watch for breakout direction. Volume moderate.",
      sentiment: "neutral",
      riskLevel: "Medium",
      recommendation: "Wait for clear breakout signal",
      keyLevels: [
        { level: "$0.85", type: "Resistance" },
        { level: "$0.78", type: "Current" },
        { level: "$0.70", type: "Support" },
      ],
    },
    ada: {
      technicalAnalysis: "Slight weakness with RSI below 50. Testing support levels. Watch for reversal signals.",
      sentiment: "bearish",
      riskLevel: "Medium",
      recommendation: "Wait for confirmation of uptrend before entering",
      keyLevels: [
        { level: "$1.20", type: "Resistance" },
        { level: "$1.12", type: "Current" },
        { level: "$1.00", type: "Support" },
      ],
    },
    xrp: {
      technicalAnalysis: "Breaking above key resistance with strong volume. Momentum indicators aligned bullish.",
      sentiment: "bullish",
      riskLevel: "Medium",
      recommendation: "Strong buy signal - set targets at $3.50 and $3.80",
      keyLevels: [
        { level: "$3.80", type: "Resistance" },
        { level: "$3.24", type: "Current" },
        { level: "$2.90", type: "Support" },
      ],
    },
  }

  const data = analysisData[crypto.ticker.toLowerCase()] || analysisData.btc

  return (
    <div className="space-y-6">
      <div className="neumorphic-elevated p-6 space-y-6">
        <h2 className="text-2xl font-bold">Technical Analysis & Recommendations</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="neumorphic-inset p-4 rounded-lg">
            <p className="text-sm text-text-secondary mb-2">Market Sentiment</p>
            <p className={`text-lg font-bold capitalize ${getRecommendationColor(data.sentiment)}`}>{data.sentiment}</p>
          </div>
          <div className="neumorphic-inset p-4 rounded-lg">
            <p className="text-sm text-text-secondary mb-2">Risk Level</p>
            <p className="text-lg font-bold">{data.riskLevel}</p>
          </div>
          <div className="neumorphic-inset p-4 rounded-lg">
            <p className="text-sm text-text-secondary mb-2">Volatility Index</p>
            <p className="text-lg font-bold">42.5</p>
          </div>
        </div>

        {/* Technical analysis text */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Technical Analysis</h3>
          <p className="text-text-secondary leading-relaxed">{data.technicalAnalysis}</p>
        </div>

        {/* Key price levels */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Key Price Levels</h3>
          <div className="space-y-2">
            {data.keyLevels.map((level: any, idx: number) => (
              <div key={idx} className="neumorphic p-3 rounded-lg flex justify-between items-center">
                <span className="text-text-secondary">{level.type}</span>
                <span className="font-bold text-lg">{level.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="neumorphic p-4 rounded-lg border-l-4 border-blue-600 dark:border-blue-400">
          <p className="text-sm text-text-secondary mb-2">Recommendation</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{data.recommendation}</p>
        </div>

        {/* Trading signals */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Trading Signals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="neumorphic p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-sm font-medium">Buy Signal</span>
              </div>
              <p className="text-xs text-text-secondary">Price above 50-day MA</p>
            </div>
            <div className="neumorphic p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm font-medium">Momentum</span>
              </div>
              <p className="text-xs text-text-secondary">MACD positive</p>
            </div>
            <div className="neumorphic p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-sm font-medium">Volume</span>
              </div>
              <p className="text-xs text-text-secondary">Above average</p>
            </div>
            <div className="neumorphic p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                <span className="text-sm font-medium">Trend</span>
              </div>
              <p className="text-xs text-text-secondary">Uptrend confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
