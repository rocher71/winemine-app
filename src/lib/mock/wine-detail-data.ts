import type { WineDetailData } from '@/lib/types/wine-detail';

export const MOCK_WINE_DETAIL: WineDetailData = {
  externalRatings: {
    vivino: 4.4,
    wineSearcher: 94,
    cellarTracker: 4.3,
  },
  avgPrice: {
    krw: 215000,
    trendPercent: 8.5,
    trendPeriod: '6개월',
  },
  priceHistory: [
    { month: '24.06', price: 185 },
    { month: '24.09', price: 192 },
    { month: '24.12', price: 198 },
    { month: '25.03', price: 205 },
    { month: '25.06', price: 215 },
    { month: '25.09', price: 228 },
    { month: '25.12', price: 235 },
    { month: '26.03', price: 248 },
  ],
  communityPeak: {
    median: 2030,
    expertCount: 142,
    histogram: [3, 5, 9, 14, 22, 31, 38, 42, 35, 26, 18, 11, 6, 3],
    startYear: 2024,
  },
  story: {
    preview:
      '1830년 설립된 Domaine de Courcel은 포마르 1er Cru 레 루지엥 단일 클리마에서 190년 넘게 한 가족의 손을 거쳐 온 도멘이다.',
    quote: '바닥의 붉은 진흙이 와인의 정체성을 만든다',
  },
};
