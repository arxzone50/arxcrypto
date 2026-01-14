'use server';

import qs from 'query-string';

// --- 1. CONFIGURATION ---
const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

// --- 2. TYPES & INTERFACES ---
type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface CoinGeckoErrorBody {
  error?: string;
}

export interface PoolData {
  id: string;
  address: string;
  name: string;
  network: string;
}

// Tipe untuk hasil pencarian
export interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  large: string;
  market_cap_rank: number;
  data?: {
    price?: number;
    price_change_percentage_24h?: number;
  };
}

// Tipe untuk hasil trending (berbeda strukturnya dengan SearchCoin)
export interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    large: string;
    market_cap_rank?: number;
    data: {
      price_change_percentage_24h?: {
        usd?: number;
      };
    };
  };
}

// --- 3. HELPER FUNCTIONS ---

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': API_KEY,
      'Content-Type': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));

    throw new Error(
      `API Error: ${response.status}: ${errorBody.error || response.statusText} `,
    );
  }

  return response.json();
}

// --- 4. DATA FUNCTIONS ---

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );
      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>('/onchain/search/pools', {
      query: id,
    });
    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

export async function searchCoins(query: string): Promise<SearchCoin[]> {
  try {
    const data = await fetcher<{ coins: SearchCoin[] }>('/search', { query });
    return data.coins || [];
  } catch (error) {
    console.error('Error searching coins:', error);
    return [];
  }
}

export async function getTrending(): Promise<TrendingCoin[]> {
  try {
    const data = await fetcher<{ coins: TrendingCoin[] }>('/search/trending');
    return data.coins || [];
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return [];
  }
}