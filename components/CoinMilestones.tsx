'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

// Interface yang diperbaiki: Field dibuat opsional (?) agar kompatibel dengan API yang ada
interface MarketData {
      ath?: { usd: number };
      ath_date?: { usd: string };
      atl?: { usd: number };
      atl_date?: { usd: string };
      ath_change_percentage?: { usd: number };
      atl_change_percentage?: { usd: number };
      // Menambahkan field lain agar tidak error jika API mengembalikan full object
      [key: string]: any;
}

interface CoinMilestonesProps {
      marketData?: MarketData; // Dibuat opsional juga
}

// Helper untuk format tanggal
const formatDate = (dateString?: string) => {
      if (!dateString) return '-';
      try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
            return '-';
      }
};

// Kartu Internal untuk Statistik
const StatCard = ({
      title,
      price,
      date,
      percentage,
      type,
}: {
      title: string;
      price?: number;
      date?: string;
      percentage?: number;
      type: 'high' | 'low';
}) => {
      const isHigh = type === 'high';

      // Logic Warna Persentase
      const isPositive = percentage !== undefined ? (isHigh ? percentage > 0 : percentage > 0) : false;

      return (
            <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium ${isHigh ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                              }`}>
                              {title}
                        </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                        <div className="flex flex-col gap-1">
                              {/* Harga Puncak/Dasar */}
                              <span className="text-xl font-bold tracking-tight">
                                    {price ? formatCurrency(price) : '-'}
                              </span>

                              {/* Tanggal */}
                              <span className="text-xs text-muted-foreground">
                                    {formatDate(date)}
                              </span>

                              {/* Persentase Perubahan */}
                              {percentage !== undefined && (
                                    <div className="mt-2 flex items-center gap-2">
                                          <Badge
                                                variant="secondary"
                                                className={isPositive
                                                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                      : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                                }
                                          >
                                                {isPositive ? '+' : ''}{percentage.toFixed(2)}%
                                          </Badge>
                                          <span className="text-[10px] text-muted-foreground">
                                                {isHigh ? 'since ATH' : 'since ATL'}
                                          </span>
                                    </div>
                              )}
                        </div>
                  </CardContent>
            </Card>
      );
};

const CoinMilestones = ({ marketData }: CoinMilestonesProps) => {
      if (!marketData) return null;

      // Ekstrak data secara aman dengan Optional Chaining (?.)
      const athPrice = marketData.ath?.usd;
      const athDate = marketData.ath_date?.usd;
      const athChange = marketData.ath_change_percentage?.usd;

      const atlPrice = marketData.atl?.usd;
      const atlDate = marketData.atl_date?.usd;
      const atlChange = marketData.atl_change_percentage?.usd;

      return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TOP GAINER / ALL TIME HIGH */}
                  {/* Hanya render jika data ATH ada */}
                  {athPrice && (
                        <StatCard
                              title="All-Time High (ATH)"
                              price={athPrice}
                              date={athDate}
                              percentage={athChange}
                              type="high"
                        />
                  )}

                  {/* TOP LOSER / ALL TIME LOW */}
                  {/* Hanya render jika data ATL ada */}
                  {atlPrice && (
                        <StatCard
                              title="All-Time Low (ATL)"
                              price={atlPrice}
                              date={atlDate}
                              percentage={atlChange}
                              type="low"
                        />
                  )}
            </div>
      );
};

export default CoinMilestones;