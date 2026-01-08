import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

const CoinOverview = async () => {
      try {
            // Fetch data secara paralel
            const [coin, coinOHLCData] = await Promise.all([
                  // Data Koin Umum
                  fetcher<CoinDetailsData>('/coins/bitcoin', {
                        dex_pair_format: 'symbol',
                  }),
                  
                  // Data Chart OHLC
                  fetcher<OHLCData[]>('/coins/bitcoin/ohlc', {
                        vs_currency: 'usd',
                        days: 1, 
                        precision: 'full',
                        // PASTIKAN TIDAK ADA BARIS 'interval' DI SINI
                  }),
            ]);

            return (
                  <div id="coin-overview">
                        <CandlestickChart 
                              data={coinOHLCData} 
                              coinId="bitcoin"
                              liveInterval="1m" 
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