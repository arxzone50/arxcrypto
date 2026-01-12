import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

// Definisi tipe sederhana untuk mendapatkan ID koin top 1
// (Anda bisa menyesuaikan ini dengan tipe yang sudah ada di proyek Anda)
type TopCoinMarket = {
      id: string;
      name: string;
      symbol: string;
};

const CoinOverview = async () => {
      try {
            // 1. Fetch koin peringkat #1 untuk mendapatkan ID-nya secara dinamis
            const [topCoin] = await fetcher<TopCoinMarket[]>('/coins/markets', {
                  vs_currency: 'usd',
                  order: 'market_cap_desc', // Urutkan dari market cap terbesar
                  per_page: 1, // Hanya ambil 1 koin (Top 1)
                  page: 1,
                  sparkline: false,
            });

            if (!topCoin) {
                  throw new Error("No top ranking coin found");
            }

            // 2. Fetch data detail dan Chart OHLC secara paralel menggunakan ID koin Top 1 tersebut
            const [coin, coinOHLCData] = await Promise.all([
                  // Data Detail (untuk gambar large, harga lengkap, dll)
                  fetcher<CoinDetailsData>(`/coins/${topCoin.id}`, {
                        dex_pair_format: 'symbol',
                  }),

                  // Data Chart OHLC
                  fetcher<OHLCData[]>(`/coins/${topCoin.id}/ohlc`, {
                        vs_currency: 'usd',
                        days: 1,
                        precision: 'full',
                  }),
            ]);

            return (
                  <div id="coin-overview" className="w-full">
                        <div className="mb-6 p-2">
                              <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Top Coin Overview
                              </h2>
                        </div>

                        <CandlestickChart
                              data={coinOHLCData}
                              coinId={topCoin.id}
                        >
                              <div className="header pt-2">
                                    <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
                                    <div className="info">
                                          <p>
                                                {coin.name} / {coin.symbol.toUpperCase()}
                                          </p>
                                          <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
                                    </div>
                              </div>
                        </CandlestickChart>
                  </div>
            );
      } catch (error) {
            console.error('Error fetching coin overview:', error);
            return <CoinOverviewFallback />;
      }
};

export default CoinOverview;