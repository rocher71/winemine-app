/**
 * Stores — 매장 14개 (오프라인 8, 온라인 6).
 *
 * 출처: ../winemine-keyscreen/src/lib/mock/stores.ts verbatim 동등 포팅.
 * v0.1.0 mock 단계 — wine-prices.md §10 A: supabase 마이그레이션 없이 정적 모듈.
 * v0.2.0 에서 `stores` 테이블 + seed.sql 이관 예정.
 *
 * LocalizedString shape — branch 는 null 가능 (온라인 매장).
 */
import type { LocalizedString } from '@/components/shared/locale-text';

export type StoreKind = 'offline' | 'online';

export type Store = {
  id: string;
  name: LocalizedString;
  branch: LocalizedString | null;
  kind: StoreKind;
  location: LocalizedString;
};

export const STORES: Store[] = [
  /* ── 오프라인 ── */
  {
    id: 'store_001',
    name: { ko: '신세계백화점 와인 셀러', en: 'Shinsegae Wine Cellar' },
    branch: { ko: '강남점', en: 'Gangnam' },
    kind: 'offline',
    location: { ko: '서울 서초구 신반포로 176', en: '176 Sinbanpo-ro, Seocho-gu, Seoul' },
  },
  {
    id: 'store_002',
    name: { ko: '신세계백화점 와인 셀러', en: 'Shinsegae Wine Cellar' },
    branch: { ko: '본점', en: 'Main Branch' },
    kind: 'offline',
    location: { ko: '서울 중구 소공로 63', en: '63 Sogong-ro, Jung-gu, Seoul' },
  },
  {
    id: 'store_003',
    name: { ko: '갤러리아 고메이494', en: 'Galleria Gourmet 494' },
    branch: { ko: '한남점', en: 'Hannam' },
    kind: 'offline',
    location: { ko: '서울 용산구 한남대로 60', en: '60 Hannam-daero, Yongsan-gu, Seoul' },
  },
  {
    id: 'store_004',
    name: { ko: '갤러리아 고메이494', en: 'Galleria Gourmet 494' },
    branch: { ko: '광교점', en: 'Gwanggyo' },
    kind: 'offline',
    location: { ko: '경기 수원시 영통구 광교호수공원로 95', en: '95 Gwanggyo Hosu Park-ro, Suwon' },
  },
  {
    id: 'store_005',
    name: { ko: '롯데백화점 본점 와인 셀러', en: 'Lotte Wine Cellar' },
    branch: { ko: '본점', en: 'Main Branch' },
    kind: 'offline',
    location: { ko: '서울 중구 남대문로 81', en: '81 Namdaemun-ro, Jung-gu, Seoul' },
  },
  {
    id: 'store_006',
    name: { ko: '하이트진로 더 와인', en: 'HiteJinro the Wine' },
    branch: { ko: '청담', en: 'Cheongdam' },
    kind: 'offline',
    location: { ko: '서울 강남구 도산대로 442', en: '442 Dosan-daero, Gangnam-gu, Seoul' },
  },
  {
    id: 'store_007',
    name: { ko: '나라셀라 와인숍', en: 'Nara Cellar Wine Shop' },
    branch: { ko: '서래마을점', en: 'Seorae Village' },
    kind: 'offline',
    location: { ko: '서울 서초구 서래로 12', en: '12 Seorae-ro, Seocho-gu, Seoul' },
  },
  {
    id: 'store_008',
    name: { ko: '코스트코', en: 'Costco' },
    branch: { ko: '양평점', en: 'Yangpyeong' },
    kind: 'offline',
    location: { ko: '서울 영등포구 양평로 71', en: '71 Yangpyeong-ro, Yeongdeungpo-gu, Seoul' },
  },

  /* ── 온라인 ── */
  {
    id: 'store_009',
    name: { ko: 'CU 와인콕', en: 'CU Wine.kok' },
    branch: null,
    kind: 'online',
    location: { ko: '온라인 예약 · 매장 픽업', en: 'Online reservation · Store pickup' },
  },
  {
    id: 'store_010',
    name: { ko: 'GS25 와인25플러스', en: 'GS25 Wine25Plus' },
    branch: null,
    kind: 'online',
    location: { ko: '온라인 예약 · 매장 픽업', en: 'Online reservation · Store pickup' },
  },
  {
    id: 'store_011',
    name: { ko: '데일리샷', en: 'Dailyshot' },
    branch: null,
    kind: 'online',
    location: { ko: '온라인 주문 · 보틀샵 픽업', en: 'Online order · Bottle shop pickup' },
  },
  {
    id: 'store_012',
    name: { ko: '와인포스트', en: 'Wine Post' },
    branch: null,
    kind: 'online',
    location: { ko: '온라인 주문 · 매장 픽업', en: 'Online order · Store pickup' },
  },
  {
    id: 'store_013',
    name: { ko: 'Vivino Marketplace', en: 'Vivino Marketplace' },
    branch: null,
    kind: 'online',
    location: { ko: '해외 직구 (Vivino)', en: 'Cross-border (Vivino)' },
  },
  {
    id: 'store_014',
    name: { ko: 'Wine.com', en: 'Wine.com' },
    branch: null,
    kind: 'online',
    location: { ko: '해외 직구 (Wine.com)', en: 'Cross-border (Wine.com)' },
  },
];

const STORES_BY_ID: Record<string, Store> = STORES.reduce<Record<string, Store>>(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {},
);

export function getStore(id: string): Store | undefined {
  return STORES_BY_ID[id];
}
