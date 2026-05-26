export interface ExternalRatings {
  vivino: number | null;
  wineSearcher: number | null;
  cellarTracker: number | null;
}

export interface AveragePriceData {
  krw: number | null;
  trendPercent: number | null;
  trendPeriod: string | null;
}

export interface PricePoint {
  month: string;
  price: number;
}

export interface CommunityPeakData {
  median: number;
  expertCount: number;
  histogram: number[];
  startYear: number;
}

export interface WineStoryData {
  preview: string;
  quote: string | null;
}

export interface WineDetailData {
  externalRatings: ExternalRatings;
  avgPrice: AveragePriceData;
  priceHistory: PricePoint[];
  communityPeak: CommunityPeakData;
  story: WineStoryData;
}
