'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// Interface data koin dari CoinGecko
interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

// Props untuk komponen List internal
interface RankingListProps {
  title: string;
  order: 'gainers' | 'losers';
  titleColorClass?: string; // Untuk styling judul (misal hijau untuk gainer, merah untuk loser)
}

/**
 * Hook internal untuk fetch data Top Gainer/Loser
 */
const useRankings = (order: 'gainers' | 'losers') => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tentukan order API CoinGecko
        const sortOrder = order === 'gainers' 
          ? 'price_change_percentage_24h_desc' 
          : 'price_change_percentage_24h_asc';

        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${sortOrder}&per_page=5&page=1&sparkline=false`
        );
        const data = await res.json();
        setCoins(data);
      } catch (error) {
        console.error('Gagal mengambil rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [order]);

  return { coins, loading };
};

/**
 * Komponen UI untuk menampilkan List Ranking
 */
const RankingList = ({ title, order, titleColorClass = 'text-primary' }: RankingListProps) => {
  const { coins, loading } = useRankings(order);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className={`text-base font-medium ${titleColorClass}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (
          <div className="space-y-4">
            {coins.map((coin, index) => (
              <Link key={coin.id} href={`/coin/${coin.id}`} className="block group">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <span className="text-muted-foreground text-sm font-mono w-4">
                      {index + 1}.
                    </span>
                    
                    {/* Icon & Name */}
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

                  {/* Price & Change */}
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium">
                      {formatCurrency(coin.current_price)}
                    </span>
                    {/* 
                      Logic Warna: 
                      - Gainer list (order=gainers): selalu hijau (+)
                      - Loser list (order=losers): selalu merah (-)
                    */}
                    <span className={`text-xs font-bold ${
                      order === 'gainers' ? 'text-green-500' : 'text-red-500'
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

/**
 * EXPORT: Komponen Top Gainer
 * Menggunakan styling judul hijau
 */
export const TopGainer = () => {
  return (
    <RankingList 
      title="Top Gainers (24h)" 
      order="gainers" 
      titleColorClass="text-green-600 dark:text-green-500" 
    />
  );
};

/**
 * EXPORT: Komponen Top Loser
 * Menggunakan styling judul merah
 */
export const TopLoser = () => {
  return (
    <RankingList 
      title="Top Losers (24h)" 
      order="losers" 
      titleColorClass="text-red-600 dark:text-red-500" 
    />
  );
};