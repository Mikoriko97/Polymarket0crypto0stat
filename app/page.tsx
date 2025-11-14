import Header from "@/components/header";
import Dashboard from "@/components/dashboard";
import { UserProfilesRotator } from "@/components/user-profiles-rotator";
import Footer from "@/components/footer";
import CryptoMarketListClient from "@/components/crypto-market-list-client";
import { getCryptoTagIdByName, getAllMarketsByTagId } from "@/lib/gamma";

export const revalidate = 60;


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
  const cryptoTagId = await getCryptoTagIdByName("Crypto");
  let markets: any[] = [];
  if (cryptoTagId != null) {
    markets = await getAllMarketsByTagId(cryptoTagId, { closed: false, pageSize: 300 });
  }

  markets = markets.slice().sort((a, b) => {
    const idDiff = (b.id ?? 0) - (a.id ?? 0);
    if (idDiff !== 0) return idDiff;
    return (a.slug ?? "").localeCompare(b.slug ?? "");
  });

  console.log(`[Home] crypto markets(total)=${markets.length}`);
  if (!markets.length) {
    const { getMarkets } = await import("@/lib/gamma")
    const allOpenMarkets = await getMarkets({ limit: 1000 })
    markets = allOpenMarkets.filter(isCryptoMarket)
  }


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
            <UserProfilesRotator intervalMs={12000} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
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

function isCryptoMarket(market: any): boolean {
  const question = (market?.question ?? "").toLowerCase();
  const category = (market?.category ?? "").toLowerCase();
  if (category === "crypto") return true;
  return CRYPTO_KEYWORDS.some((keyword) => question.includes(keyword));
}
