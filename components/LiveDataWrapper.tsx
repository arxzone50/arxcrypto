'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import CandlestickChart from '@/components/CandlestickChart';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useState, useEffect } from 'react';
import CoinHeader from '@/components/CoinHeader';

// Tipe data untuk Trade (Recent Trades)
interface Trade {
  price: number;
  amount: number;
  value: number;
  type: 'b' | 's';
  timestamp: number;
}

// Tipe data untuk Exchange (Tickers)
interface ExchangeTicker {
  base: string;
  target: string;
  last: number;
  converted_last: { usd: number };
  converted_volume: { usd: number };
  market: {
    name: string;
    identifier: string;
    logo?: string;
  };
  trust_score: 'green' | 'yellow' | 'red';
  bid_ask_spread_percentage: number | null;
  last_traded_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
}

interface LiveDataProps {
  children: React.ReactNode;
  coinId: string;
  poolId?: string;
  coin: any;
  coinOHLCData: any;
}

/**
 * Helper function untuk membuat Data Simulasi (Mock Trades)
 */
const generateMockTrades = (currentPrice: number): Trade[] => {
  const trades: Trade[] = [];
  const now = Date.now();

  for (let i = 0; i < 10; i++) {
    const randomPrice = currentPrice + (Math.random() - 0.5) * (currentPrice * 0.005);
    const randomAmount = parseFloat((Math.random() * 2).toFixed(4));
    const type = Math.random() > 0.5 ? 'b' : 's';

    trades.push({
      price: randomPrice,
      amount: randomAmount,
      value: randomPrice * randomAmount,
      type,
      timestamp: now - i * 60000,
    });
  }
  return trades;
};

/**
 * Custom Hook untuk mengambil data via REST API
 */
const useCoinGeckoRest = ({ coinId }: { coinId: string }) => {
  const [data, setData] = useState({
    price: { usd: 0, change24h: 0 },
    trades: [] as Trade[],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const marketRes = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`
        );
        const marketData = await marketRes.json();

        if (isMounted && marketData.length > 0) {
          const currentPrice = marketData[0].current_price;

          setData({
            price: {
              usd: currentPrice,
              change24h: marketData[0].price_change_percentage_24h,
            },
            trades: generateMockTrades(currentPrice),
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [coinId]);

  return data;
};

const LiveDataWrapper = ({ children, coinId, coin, coinOHLCData }: LiveDataProps) => {
  const { trades, price } = useCoinGeckoRest({ coinId });

  // --- LIMIT EXCHANGES KE 10 TERATAS ---
  const exchanges = (coin.tickers || []).slice(0, 10) as ExchangeTicker[];

  // Hitung total volume untuk menghitung share per exchange
  const totalVolume = exchanges.reduce(
    (sum, t) => sum + (t.converted_volume?.usd ?? 0),
    0
  );

  const exchangeColumns: DataTableColumn<ExchangeTicker>[] = [
    {
      header: '#',
      cellClassName: 'rank-cell',
      cell: (_, index) => index + 1,
    },
    {
      header: 'Exchange',
      cellClassName: 'name-cell',
      cell: (ticker) => (
        <div className="flex items-center gap-2">
          {ticker.market.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ticker.market.logo}
              alt={ticker.market.name}
              className="w-5 h-5 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-xs sm:text-sm">{ticker.market.name}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              ({ticker.market.identifier})
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Pair',
      cellClassName: 'pair-cell',
      cell: (ticker) => `${ticker.base}/${ticker.target}`,
    },
    {
      header: 'Price (USD)',
      cellClassName: 'price-cell',
      cell: (ticker) => formatCurrency(ticker.converted_last?.usd ?? ticker.last),
    },
    {
      header: 'Volume (24h)',
      cellClassName: 'volume-cell',
      cell: (ticker) => formatCurrency(ticker.converted_volume?.usd ?? 0),
    },
    {
      header: 'Vol Share',
      cellClassName: 'vol-share-cell',
      cell: (ticker) => {
        const vol = ticker.converted_volume?.usd ?? 0;
        const share = totalVolume > 0 ? (vol / totalVolume) * 100 : 0;
        return <span className="text-xs">{share.toFixed(1)}%</span>;
      },
    },
    {
      header: 'Spread',
      cellClassName: 'spread-cell',
      cell: (ticker) => {
        const spread = ticker.bid_ask_spread_percentage;
        if (typeof spread !== 'number') return <span className="text-muted-foreground">-</span>;

        const colorClass =
          spread < 0.05
            ? 'text-green-500'
            : spread < 0.2
            ? 'text-yellow-500'
            : 'text-red-500';

        return <span className={colorClass}>{spread.toFixed(3)}%</span>;
      },
    },
    {
      header: 'Last Trade',
      cellClassName: 'last-trade-cell',
      cell: (ticker) => {
        const lastTradedAt = new Date(ticker.last_traded_at).getTime();
        return <span className="text-xs">{timeAgo(lastTradedAt)}</span>;
      },
    },
    {
      header: 'Trust',
      cellClassName: 'trust-cell',
      cell: (ticker) => {
        const trust = ticker.trust_score;
        
        // Logic Manual Coloring untuk Badge
        if (trust === 'green') {
          return (
            <Badge className="bg-green-500 text-white border-transparent hover:bg-green-600">
              High
            </Badge>
          );
        }
        
        if (trust === 'yellow') {
          return (
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20">
              Medium
            </Badge>
          );
        }

        if (trust === 'red') {
          return (
            <Badge variant="destructive">
              Low
            </Badge>
          );
        }

        return <Badge>-</Badge>;
      },
    },
    {
      header: 'Status',
      cellClassName: 'status-cell',
      cell: (ticker) => {
        const badges: React.ReactNode[] = [];

        if (ticker.is_anomaly) {
          badges.push(
            <Badge variant="destructive" key="anomaly" className="text-[10px] px-1.5">
              Anomaly
            </Badge>
          );
        }

        if (ticker.is_stale) {
          badges.push(
            <Badge variant="outline" key="stale" className="text-[10px] px-1.5">
              Stale
            </Badge>
          );
        }

        // Jika normal (tidak anomaly & tidak stale), tampilkan teks hijau biasa
        if (!ticker.is_anomaly && !ticker.is_stale) {
          return <span className="text-green-500 font-medium text-xs">OK</span>;
        }

        return <div className="flex gap-1">{badges}</div>;
      },
    },
  ];

  const tradeColumns: DataTableColumn<Trade>[] = [
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (trade) => (trade.price ? formatCurrency(trade.price) : '-'),
    },
    {
      header: 'Amount',
      cellClassName: 'amount-cell',
      cell: (trade) => trade.amount?.toFixed(4) ?? '-',
    },
    {
      header: 'Value',
      cellClassName: 'value-cell',
      cell: (trade) => (trade.value ? formatCurrency(trade.value) : '-'),
    },
    {
      header: 'Buy/Sell',
      cellClassName: 'type-cell',
      cell: (trade) => (
        <span className={trade.type === 'b' ? 'text-green-500' : 'text-red-500'}>
          {trade.type === 'b' ? 'Buy' : 'Sell'}
        </span>
      ),
    },
    {
      header: 'Time',
      cellClassName: 'time-cell',
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : '-'),
    },
  ];

  return (
    <section id="live-data-wrapper">
      <CoinHeader
        name={coin.name}
        image={coin.image.large}
        livePrice={price?.usd ?? coin.market_data.current_price.usd}
        livePriceChangePercentage24h={
          price?.change24h ?? coin.market_data.price_change_percentage_24h_in_currency.usd
        }
        priceChangePercentage30d={coin.market_data.price_change_percentage_30d_in_currency.usd}
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
      />
      <Separator className="divider" />

      <div className="trend">
        <CandlestickChart
          coinId={coinId}
          data={coinOHLCData}
          mode="live"
          initialPeriod="daily"
        >
          <h4>Trend Overview</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />

      {/* Exchange List */}
      {exchanges.length > 0 && (
        <div className="exchanges mb-8">
          <h4 className="mb-4 text-lg font-semibold">Top Exchanges</h4>
          <DataTable
            columns={exchangeColumns}
            data={exchanges}
            rowKey={(row) => `${row.market.identifier}-${row.base}-${row.target}`}
            tableClassName="exchanges-table"
          />
        </div>
      )}

      {/* Recent Trades */}
      {tradeColumns && (
        <div className="trades">
          <h4 className="mb-4 text-lg font-semibold">Recent Trades (Simulasi)</h4>

          <DataTable
            columns={tradeColumns}
            data={trades}
            rowKey={(_, index) => index}
            tableClassName="trades-table"
          />
        </div>
      )}
    </section>
  );
};

export default LiveDataWrapper;