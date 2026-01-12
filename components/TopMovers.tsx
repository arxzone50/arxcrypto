'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface CoinMarketItem {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h?: number | null;
}

interface TopMoversProps {
    coins: CoinMarketItem[];
}

export function TopMovers({ coins }: TopMoversProps) {
    const validCoins = coins.filter(
        (coin) => typeof coin.price_change_percentage_24h === 'number'
    );

    const topGainers = [...validCoins]
        .sort((a, b) => b.price_change_percentage_24h! - a.price_change_percentage_24h!)
        .slice(0, 5);

    const topLosers = [...validCoins]
        .sort((a, b) => a.price_change_percentage_24h! - b.price_change_percentage_24h!)
        .slice(0, 5);

    return (
        <div className="mt-8 p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="mb-4 text-lg font-semibold flex items-center gap-2">
                Market Movers (24 Jam)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div>
                    <h5 className="text-green-500 dark:text-green-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <TrendingUp size={16} /> Top Gainers
                    </h5>
                    <ul className="space-y-3">
                        {topGainers.map((coin) => (
                            <li key={coin.id} className="group">
                                <Link
                                    href={`/coins/${coin.id}`}
                                    className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={coin.image}
                                            alt={coin.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {coin.symbol.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {coin.name}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                        +{coin.price_change_percentage_24h!.toFixed(2)}%
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Top Losers */}
                <div>
                    <h5 className="text-red-500 dark:text-red-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <TrendingDown size={16} /> Top Losers
                    </h5>
                    <ul className="space-y-3">
                        {topLosers.map((coin) => (
                            <li key={coin.id} className="group">
                                <Link
                                    href={`/coins/${coin.id}`}
                                    className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={coin.image}
                                            alt={coin.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {coin.symbol.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {coin.name}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                        {coin.price_change_percentage_24h!.toFixed(2)}%
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}