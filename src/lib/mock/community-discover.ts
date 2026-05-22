/**
 * Discover (follow suggestions) — mock data (v0.1.0).
 *
 * 사양: design-spec community-side.md §1-B §2-A §10-A.
 *
 * 키스크린 verbatim 포팅 (`../winemine-keyscreen/src/app/community/discover/page.tsx` line 12~43).
 * v0.2.0: supabase `taste_compatibility` view 마이그레이션 후 (last 7d notes/ratings 비교) 대체.
 *
 * §0-2 light-only mode.
 * §10-A 결정: 인라인 fixture → 별도 파일 분리.
 *
 * isFollowing 은 정적 (index === 0 만 true) — 키스크린 verbatim. 동적 toggle은 v0.2.0.
 */

export interface DiscoverRow {
  userId: string;
  /** 취향 일치도 % */
  pct: number;
  subKo: string;
  subEn: string;
}

export const DISCOVER_ROWS: readonly DiscoverRow[] = [
  { userId: 'jiwon', pct: 84, subKo: '부르고뉴 · 보르도 중심', subEn: 'Burgundy & Bordeaux focused' },
  { userId: 'mineral', pct: 76, subKo: '미네랄 화이트 전문', subEn: 'Mineral white specialist' },
  { userId: 'sommelier', pct: 72, subKo: '함소믈리에 · 마스터', subEn: 'Sommelier Ham · Master' },
  { userId: 'duckhu', pct: 68, subKo: '샹파뉴 컬렉터', subEn: 'Champagne collector' },
  { userId: 'minho', pct: 58, subKo: '이탈리아 레드', subEn: 'Italian reds' },
] as const;
