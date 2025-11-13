import Header from "@/components/header";
import Dashboard from "@/components/dashboard";
import { UserProfileLive } from "@/components/user-profile-live";
import Footer from "@/components/footer";
import CryptoMarketListClient from "@/components/crypto-market-list-client";
import { getMarkets, getTrades } from "@/lib/gamma";
import { Market } from "@/lib/types";

export const revalidate = 60;

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
  const question = (market.question ?? "").toLowerCase();
  const category = market.category?.toLowerCase() ?? "";

  if (category === "crypto") {
    return true;
  }

  return CRYPTO_KEYWORDS.some((keyword) => question.includes(keyword));
}

interface Trade {
  user: string;
  size_usd: number;
  [key: string]: any; 
}

interface UserTradesAccumulator {
  [key: string]: {
    volume: number;
    tradeCount: number;
    user: string;
  }
}

export default async function Home() {
  const allOpenMarkets = await getMarkets({ limit: 500 });
  let markets = allOpenMarkets.filter(isCryptoMarket);

  markets = markets.slice().sort((a, b) => {
    const idDiff = (b.id ?? 0) - (a.id ?? 0);
    if (idDiff !== 0) return idDiff;
    return (a.slug ?? "").localeCompare(b.slug ?? "");
  });

  console.log(`[Home] crypto markets=${markets.length}`);

  const trades: Trade[] = await getTrades();
  const userTrades = trades.reduce((acc: UserTradesAccumulator, trade: Trade) => {
    if (!acc[trade.user]) {
      acc[trade.user] = { volume: 0, tradeCount: 0, user: trade.user };
    }
    acc[trade.user].volume += trade.size_usd;
    acc[trade.user].tradeCount++;
    return acc;
  }, {} as UserTradesAccumulator);

  const mostActiveTraderAddress = Object.keys(userTrades).reduce((a, b) =>
    userTrades[a].volume > userTrades[b].volume ? a : b
  );

  const mostActiveTrader = userTrades[mostActiveTraderAddress];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl flex-1">
        <Dashboard markets={markets} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {markets.length > 0 ? (
              <CryptoMarketListClient markets={markets} />
            ) : (
              <div className="neumorphic p-8">
                <p className="text-text-secondary">
                  Наразі відкритих крипто-ринків не знайдено. Спробуйте пізніше.
                </p>
              </div>
            )}
          </div>
          <div>
            <UserProfileLive handle="fengdubiying" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
