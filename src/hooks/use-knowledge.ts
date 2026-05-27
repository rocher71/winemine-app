/**
 * Knowledge 탭 데이터 훅 — v0.1.0 mock 단계 (src/lib/mock/knowledge.ts 정적 모듈).
 *
 * 모든 훅은 동기 mock 반환이므로 isLoading 은 항상 false.
 * v0.2.0 에서 supabase.from(...) 비동기 조회로 교체 시 동일 시그니처 유지 + isLoading 활성.
 */
import {
  MOCK_LESSONS,
  MOCK_STREAK,
  MOCK_REGIONS,
  MOCK_WINERIES,
  MOCK_VINTAGES,
  MOCK_VINTAGE_CHART_BORDEAUX,
  MOCK_VINTAGE_COMPARE_BDX,
  type Lesson,
  type LessonStreak,
  type Region,
  type Winery,
  type VintageEntry,
  type VintageChartData,
  type VintageCompareData,
} from '@/lib/mock/knowledge';

export interface UseLessonsResult {
  lessons: Lesson[];
  streak: LessonStreak;
  todayLesson: Lesson;
  previousLessons: Lesson[];
  isLoading: boolean;
}

export function useLessons(): UseLessonsResult {
  return {
    lessons: MOCK_LESSONS,
    streak: MOCK_STREAK,
    todayLesson: MOCK_LESSONS[MOCK_LESSONS.length - 1],
    previousLessons: MOCK_LESSONS.slice(0, -1).reverse(),
    isLoading: false,
  };
}

export interface UseLessonDetailResult {
  lesson: Lesson | undefined;
  isLoading: boolean;
  markComplete: () => Promise<void>;
}

export function useLessonDetail(id: string): UseLessonDetailResult {
  return {
    lesson: MOCK_LESSONS.find((l) => l.id === id),
    isLoading: false,
    // v0.2.0: lesson_completions upsert. mock 단계는 no-op.
    markComplete: async () => {},
  };
}

export interface UseRegionsResult {
  regions: Region[];
  isLoading: boolean;
}

/**
 * type / parentId 로 필터링. 인자 없으면 country 레벨만 반환 (탭 진입 기본 화면).
 */
export function useRegions(
  type?: Region['type'],
  parentId?: string | null,
): UseRegionsResult {
  let regions = MOCK_REGIONS;
  if (type !== undefined) {
    regions = regions.filter((r) => r.type === type);
  } else if (parentId === undefined) {
    regions = regions.filter((r) => r.type === 'country');
  }
  if (parentId !== undefined) {
    regions = regions.filter((r) => r.parentId === parentId);
  }
  return { regions, isLoading: false };
}

export interface UseRegionDetailResult {
  region: Region | undefined;
  children: Region[];
  isLoading: boolean;
}

export function useRegionDetail(id: string): UseRegionDetailResult {
  return {
    region: MOCK_REGIONS.find((r) => r.id === id),
    children: MOCK_REGIONS.filter((r) => r.parentId === id),
    isLoading: false,
  };
}

export interface UseWineriesResult {
  wineries: Winery[];
  isLoading: boolean;
}

export function useWineries(): UseWineriesResult {
  return { wineries: MOCK_WINERIES, isLoading: false };
}

export interface UseWineryDetailResult {
  winery: Winery | undefined;
  isLoading: boolean;
}

export function useWineryDetail(id: string): UseWineryDetailResult {
  return {
    winery: MOCK_WINERIES.find((w) => w.id === id),
    isLoading: false,
  };
}

export interface UseVintagesResult {
  vintages: VintageEntry[];
  isLoading: boolean;
}

export function useVintages(): UseVintagesResult {
  return { vintages: MOCK_VINTAGES, isLoading: false };
}

export interface UseVintageDetailResult {
  vintage: VintageEntry | undefined;
  isLoading: boolean;
}

export function useVintageDetail(id: string): UseVintageDetailResult {
  return {
    vintage: MOCK_VINTAGES.find((v) => v.id === id),
    isLoading: false,
  };
}

export interface UseVintageChartResult {
  chart: VintageChartData | undefined;
  isLoading: boolean;
}

export function useVintageChart(regionId: string): UseVintageChartResult {
  const chart = MOCK_VINTAGE_CHART_BORDEAUX.regionId === regionId
    ? MOCK_VINTAGE_CHART_BORDEAUX
    : undefined;
  return { chart, isLoading: false };
}

export interface UseVintageCompareResult {
  compare: VintageCompareData | undefined;
  aVintage: VintageEntry | undefined;
  bVintage: VintageEntry | undefined;
  isLoading: boolean;
}

export function useVintageCompare(aId: string, bId: string): UseVintageCompareResult {
  const compare =
    MOCK_VINTAGE_COMPARE_BDX.aId === aId && MOCK_VINTAGE_COMPARE_BDX.bId === bId
      ? MOCK_VINTAGE_COMPARE_BDX
      : undefined;
  return {
    compare,
    aVintage: MOCK_VINTAGES.find((v) => v.id === aId),
    bVintage: MOCK_VINTAGES.find((v) => v.id === bId),
    isLoading: false,
  };
}
