import React from 'react';
import { fetcher, getPools } from '@/lib/coingecko.actions';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import LiveDataWrapper from '@/components/LiveDataWrapper';
import Converter from '@/components/Converter';
import CoinMilestones from '@/components/CoinMilestones';
import { TopMovers, CoinMarketItem } from '@/components/TopMovers';

const Page = async ({ params }: NextPageProps) => {
    const { id } = await params;

    const [coinData, coinOHLCData, marketList] = await Promise.all([
        fetcher<CoinDetailsData>(`/coins/${id}`, {
            dex_pair_format: 'contract_address',
        }),
        fetcher<OHLCData>(`/coins/${id}/ohlc`, {
            vs_currency: 'usd',
            days: 1,
            precision: 'full',
        }),
        fetcher<CoinMarketItem[]>('/coins/markets', {
            vs_currency: 'usd',
            per_page: 100,
            order: 'market_cap_desc',
            sparkline: false,
            price_change_percentage: '24h',
        }),
    ]);


    const platform = coinData.asset_platform_id
        ? coinData.detail_platforms?.[coinData.asset_platform_id]
        : null;
    const network = platform?.geckoterminal_url.split('/')[3] || null;
    const contractAddress = platform?.contract_address || null;

    const pool = await getPools(id, network, contractAddress);

    // Format helper untuk angka supply (supaya tidak ada tanda mata uang $, tapi pemisah ribuan)
    const formatSupply = (value: number | null | undefined) => {
        if (!value) return '-';
        return `${value.toLocaleString('en-US')} ${coinData.symbol.toUpperCase()}`;
    };

    const coinDetails = [
        {
            label: 'Market Cap',
            value: formatCurrency(coinData.market_data.market_cap.usd),
        },
        // --- TAMBAHAN: FDV (Fully Diluted Valuation) ---
        {
            label: 'Fully Diluted Valuation',
            value: coinData.market_data.fully_diluted_valuation?.usd
                ? formatCurrency(coinData.market_data.fully_diluted_valuation.usd)
                : '-',
        },
        // -----------------------------------------------
        {
            label: 'Market Cap Rank',
            value: `# ${coinData.market_cap_rank}`,
        },
        {
            label: 'Total Volume',
            value: formatCurrency(coinData.market_data.total_volume.usd),
        },
        // --- TAMBAHAN: SUPPLIES ---
        {
            label: 'Circulating Supply',
            value: formatSupply(coinData.market_data.circulating_supply),
        },
        {
            label: 'Total Supply',
            value: formatSupply(coinData.market_data.total_supply),
        },
        {
            label: 'Max Supply',
            value: formatSupply(coinData.market_data.max_supply),
        },
        // ---------------------------
        {
            label: 'Website',
            value: '-',
            link: coinData.links.homepage[0],
            linkText: 'Homepage',
        },
        {
            label: 'Explorer',
            value: '-',
            link: coinData.links.blockchain_site[0],
            linkText: 'Explorer',
        },
        {
            label: 'Community',
            value: '-',
            link: coinData.links.subreddit_url,
            linkText: 'Community',
        },
    ];

    return (
        <main id="coin-details-page">
            <section className="primary">
                <LiveDataWrapper coinId={id} poolId={pool.id} coin={coinData} coinOHLCData={coinOHLCData}>
                    <h1>Exchange Listings</h1>
                </LiveDataWrapper>
            </section>

            <section className="secondary">
                <Converter
                    symbol={coinData.symbol}
                    icon={coinData.image.small}
                    priceList={coinData.market_data.current_price}
                />

                <Separator className="my-4 h-px w-full bg-gray-700" />

                <div className="details">
                    <h4>Coin Details</h4>
                    <ul className="details-grid">
                        {coinDetails.map(({ label, value, link, linkText }, index) => (
                            <li key={index}>
                                <p className={label}>{label}</p>
                                {link ? (
                                    <div className="link">
                                        <Link href={link} target="_blank">
                                            {linkText || label}
                                        </Link>
                                        <ArrowUpRight size={16} />
                                    </div>
                                ) : (
                                    <p className="text-base font-medium">{value}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-8">
                    <CoinMilestones marketData={coinData.market_data} />
                </div>

                <Separator className="my-4 h-px w-full bg-gray-700" />

                <TopMovers coins={marketList} />
            </section>
        </main>
    );
};

export default Page;