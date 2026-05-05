import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

type TopCoinMarket = {
      id: string;
      name: string;
      symbol: string;
};

const CoinOverview = async () => {
      try {
            const [topCoin] = await fetcher<TopCoinMarket[]>('/coins/markets', {
                  vs_currency: 'usd',
                  order: 'market_cap_desc',
                  per_page: 1,
                  page: 1,
                  sparkline: false,
            });

            if (!topCoin) {
                  throw new Error("No top ranking coin found");
            }

            const [coin, coinOHLCData] = await Promise.all([
                  fetcher<CoinDetailsData>(`/coins/${topCoin.id}`, {
                        dex_pair_format: 'symbol',
                  }),

                  fetcher<OHLCData[]>(`/coins/${topCoin.id}/ohlc`, {
                        vs_currency: 'usd',
                        days: 1,
                        precision: 'full',
                  }),
            ]);

            return (
                  <div id="coin-overview" className="w-full">
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