import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';
// Import useState jika Anda akan mengubah interval secara dinamis (opsional, lihat catatan di bawah)
// import { useState } from 'react';

const CoinOverview = async () => {
      try {
            const [coin, coinOHLCData] = await Promise.all([
                  fetcher<CoinDetailsData>('/coins/bitcoin', {
                        dex_pair_format: 'symbol',
                  }),
                  fetcher<OHLCData[]>('/coins/bitcoin/ohlc', {
                        vs_currency: 'usd',
                        days: 1,
                        interval: 'hourly',
                        precision: 'full',
                  }),
            ]);

            // PERBAIKAN DI SINI: Tambahkan liveInterval dan setLiveInterval
            // Catatan: Karena komponen ini 'async', Anda tidak bisa menggunakan useState langsung di sini.
            // Biasanya untuk chart statis, kita pass default value atau dummy function.
            
            return (
                  <div id="coin-overview">
                        <CandlestickChart 
                              data={coinOHLCData} 
                              coinId="bitcoin"
                              liveInterval="1m" // Atau "hourly" tergantung kebutuhan default chart Anda
                              setLiveInterval={() => {}} // Fungsi kosong karena ini parent async
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