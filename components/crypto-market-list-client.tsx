"use client"

import { useEffect, useState } from "react"
import type { GammaMarket } from "@/lib/gamma"
import CryptoMarketList from "@/components/crypto-market-list"

export default function CryptoMarketListClient({ markets }: { markets: GammaMarket[] }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Render nothing on the server
  }

  return <CryptoMarketList markets={markets} />
}