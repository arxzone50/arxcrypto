'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface RankingListProps {
  title: string;
  coins: Coin[]; 
  titleColorClass?: string;
  isGainer?: boolean; 
}

const RankingList = ({ title, coins, titleColorClass = 'text-primary', isGainer = true }: RankingListProps) => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className={`text-base font-medium ${titleColorClass}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {coins.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (
          <div className="space-y-4">
            {coins.map((coin, index) => (
              <Link key={coin.id} href={`/coin/${coin.id}`} className="block group">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm font-mono w-4">
                      {index + 1}.
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-6 h-6 rounded-full" 
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {coin.symbol.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {coin.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium">
                      {formatCurrency(coin.current_price)}
                    </span>
                    <span className={`text-xs font-bold ${
                      isGainer ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {coin.price_change_percentage_24h > 0 ? '+' : ''}
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CryptoRankings() {
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
        );
        const data = await res.json();
        setAllCoins(data);
      } catch (error) {
        console.error('Gagal mengambil rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const topGainers = useMemo(() => {
    return [...allCoins]
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 5);
  }, [allCoins]);

  const topLosers = useMemo(() => {
    return [...allCoins]
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 5);
  }, [allCoins]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top Gainer Component */}
      <RankingList 
        title="Top Gainers (24h)" 
        coins={topGainers} 
        titleColorClass="text-green-600 dark:text-green-500" 
        isGainer={true}
      />

      {/* Top Loser Component */}
      <RankingList 
        title="Top Losers (24h)" 
        coins={topLosers} 
        titleColorClass="text-red-600 dark:text-red-500" 
        isGainer={false}
      />
    </div>
  );
}