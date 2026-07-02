/**
 * useHomeActivity — 홈 Activity feed 데이터 파생 (사양 home.md §3-4, 핸드오프 home-design §Activity feed).
 *
 * 소식 3종 (핸드오프 충실 재현):
 *  - 'peak'  (음용 적기/지금 마시기 좋은): flame, 셀러 출처.
 *  - 'price' (가격 변동): trend, 즐겨찾기 출처.
 *  - 'badge' (새 뱃지): award, 레벨 업.
 *
 * 데이터 소스 정책:
 *  - 실데이터 모드: 실 소스 있는 type만 노출. v0.1.0엔 'peak'만 실 소스(cellar drink-window)가 있어
 *    peak 행만 생성. price/badge는 백엔드 이벤트 테이블 부재 → v0.2.0에 합류.
 *  - DEMO_MODE: 핸드오프 3행(peak/price/badge)을 그대로 쇼케이스 (시각 검증·TestFlight 데모용).
 *    → fabricated 데이터를 production에 노출하지 않음(§Q2) — DEMO_MODE 한정.
 *
 * title은 titleLead + <emphasis> + titleTail 3분할 (badge는 강조가 뒤에 오므로 2분할로 불가).
 * 같은 와인(동일 lwin) 여러 병 보유 시 peak 소식은 한 줄만 (셀러 list 화면과 동일 dedupe 규칙).
 * 데이터 0건 → 빈 배열 → 모듈은 EmptyState + '셀러 둘러보기' CTA 노출 (리더 Q6).
 */
import { useMemo } from 'react';
import { useCellarList } from '@/hooks/use-cellar';
import { currentLocale } from '@/lib/i18n';
import { DEMO_MODE } from '@/lib/demo-mode';

export type HomeActivityKind = 'peak' | 'price' | 'badge';

export interface HomeActivityRow {
  id: string;
  kind: HomeActivityKind;
  /** 강조(굵은 wine-color) 앞 텍스트. 예: badge "새 뱃지 — " / peak·price "" */
  titleLead: string;
  /** 강조 텍스트 (와인명 또는 뱃지명) */
  emphasis: string;
  /** 강조 뒤 텍스트. 예: peak "이(가) 지금 마시기 좋은 시기예요" / badge "" */
  titleTail: string;
  /** 메타 한 줄 (출처 · 상대시간). 예: "셀러 · 2시간 전" */
  meta: string;
  /** 탭 시 이동 라우트 (expo-router path). null이면 비-탭 */
  route: string | null;
}

export interface UseHomeActivityResult {
  rows: HomeActivityRow[];
  loading: boolean;
}

function localizedWineName(wine: {
  name_ko: string | null;
  display_name: string | null;
} | null): string | null {
  if (!wine) return null;
  if (currentLocale() === 'ko' && wine.name_ko) return wine.name_ko;
  return wine.display_name ?? wine.name_ko ?? null;
}

/** DEMO_MODE 쇼케이스 3행 — 핸드오프 home-design §Activity feed 카피 그대로. */
function demoRows(locale: string): HomeActivityRow[] {
  const ko = locale === 'ko';
  return [
    {
      id: 'demo-peak',
      kind: 'peak',
      titleLead: '',
      emphasis: ko ? '레 루지엥 2017' : 'Les Rugiens 2017',
      titleTail: ko ? '이 음용 적기에 들어섰어요' : ' has entered its drinking window',
      meta: ko ? '셀러 · 2시간 전' : 'Cellar · 2h ago',
      route: '/(tabs)/cellar',
    },
    {
      id: 'demo-price',
      kind: 'price',
      titleLead: '',
      emphasis: ko ? '피숑 바롱 2015' : 'Pichon Baron 2015',
      titleTail: ko ? ' 가격이 12% 올랐어요' : ' is up 12% in price',
      meta: ko ? '즐겨찾기 · 6시간 전' : 'Favorites · 6h ago',
      route: '/favorites',
    },
    {
      id: 'demo-badge',
      kind: 'badge',
      titleLead: ko ? '새 뱃지 — ' : 'New badge — ',
      emphasis: ko ? '이탈리아 입문자' : 'Italy Beginner',
      titleTail: '',
      meta: ko ? '어제 · 레벨 +1' : 'Yesterday · Level +1',
      route: '/profile',
    },
  ];
}

export function useHomeActivity(): UseHomeActivityResult {
  const { items, loading } = useCellarList('cellared');
  const locale = currentLocale();

  const rows = useMemo<HomeActivityRow[]>(() => {
    // DEMO_MODE: 핸드오프 3행 쇼케이스 (peak/price/badge).
    if (DEMO_MODE) return demoRows(locale);

    // 실데이터 모드: v0.1.0 실 소스는 peak(cellar drink-window)뿐.
    const year = new Date().getFullYear();
    const peakRows: HomeActivityRow[] = [];
    // 같은 와인(동일 lwin) 여러 병 보유 → 한 줄만. 빈티지 다르면 lwin 달라 별개 와인.
    const seenLwins = new Set<string>();
    for (const item of items) {
      const wine = item.wine;
      if (!wine) continue;
      const from = (wine as { drink_window_from_year?: number | null }).drink_window_from_year;
      const to = (wine as { drink_window_to_year?: number | null }).drink_window_to_year;
      // 현재 연도가 음용 가능 구간(from~to) 안에 들면 "지금 마시기 좋은" 활동으로 간주 (사용자 결정 2026-06).
      if (from != null && to != null && year >= from && year <= to) {
        const lwin = wine.lwin != null ? String(wine.lwin) : null;
        if (lwin != null) {
          if (seenLwins.has(lwin)) continue;
          seenLwins.add(lwin);
        }
        const name = localizedWineName(wine) ?? '';
        peakRows.push({
          id: `peak-${item.id}`,
          kind: 'peak',
          titleLead: '',
          emphasis: name,
          titleTail: locale === 'ko' ? '이(가) 지금 마시기 좋은 시기예요' : ' is ready to drink now',
          meta: locale === 'ko' ? '셀러' : 'Cellar',
          route: lwin != null ? `/cellar/${lwin}` : null,
        });
      }
    }
    return peakRows.slice(0, 3);
  }, [items, locale]);

  return { rows, loading };
}
