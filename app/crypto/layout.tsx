import type React from "react"
import { getTrades, getMarkets } from "@/lib/gamma";
import { UserProfile } from "@/components/user-profile";
import CryptoMarketListClient from "@/components/crypto-market-list-client";
import { Market } from "@/lib/types";

interface Trade {
  user: string;
  size_usd: number;
  [key: string]: any;
}

interface UserTradesAccumulator {
  [key: string]: {
    volume: number;
    tradeCount: number;
  } & Trade;
}

const CRYPTO_KEYWORDS = [
  "crypto",
  "bitcoin",
  "ethereum",
  "btc",
  "eth",
  "solana",
  "sol",
  "usdc",
  "usdt",
  "meme",
  "token",
  "altcoin",
  "defi",
  "nft",
];

function isCryptoMarket(market: Market): boolean {
  const question = market.question?.toLowerCase() ?? "";
  const category = market.category?.toLowerCase() ?? "";

  if (category === "crypto") {
    return true;
  }

  return CRYPTO_KEYWORDS.some((keyword) => question.includes(keyword));
}

export default async function CryptoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trades: Trade[] = await getTrades();
  const userTrades = trades.reduce((acc: UserTradesAccumulator, trade) => {
    if (!acc[trade.user]) {
      acc[trade.user] = { volume: 0, tradeCount: 0, ...trade };
    }
    acc[trade.user].volume += trade.size_usd;
    acc[trade.user].tradeCount++;
    return acc;
  }, {});

  const mostActiveTraderAddress = Object.keys(userTrades).reduce((a, b) =>
    userTrades[a].volume > userTrades[b].volume ? a : b
  );

  const mostActiveTrader = userTrades[mostActiveTraderAddress];

  const allOpenMarkets = await getMarkets({ limit: 500 });
  let markets = allOpenMarkets.filter(isCryptoMarket);

  markets = markets.slice().sort((a, b) => {
    const idDiff = (b.id ?? 0) - (a.id ?? 0);
    if (idDiff !== 0) return idDiff;
    return (a.slug ?? "").localeCompare(b.slug ?? "");
  });

  return (
    <div className="w-full flex flex-col gap-5 overflow-hidden">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="col-span-1">
          <UserProfile user={mostActiveTrader} />
        </div>
        <div className="col-span-1 lg:col-span-2 h-full">
          <div className="w-full h-full flex flex-col gap-y-5">
            <div className="w-full h-full">
              <CryptoMarketListClient markets={markets} />
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
