import React, { Suspense } from 'react';
import CoinOverview from '@/components/home/CoinOverview';
import TrendingCoins from '@/components/home/TrendingCoins';
import { TopGainer, TopLoser } from '@/components/home/CryptoRankings';
import {
	TopCategoriesFallback,
	CoinOverviewFallback,
	TrendingCoinsFallback,
} from '@/components/home/fallback';
import Categories from '@/components/home/TopCategories';

const Page = async () => {
	return (
		<main className="main-container">
			<section className="home-grid">
				<Suspense fallback={<CoinOverviewFallback />}>
					<CoinOverview />
				</Suspense>

				<Suspense fallback={<TrendingCoinsFallback />}>
					<TrendingCoins />
				</Suspense>
			</section>

			<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<TopGainer />
				<TopLoser />
			</section>

			<section className="w-full mt-7 space-y-4">
				<Suspense fallback={<TopCategoriesFallback />}>
					<Categories />
				</Suspense>
			</section>

		</main>
	);
};

export default Page;