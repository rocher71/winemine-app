/**
 * Wine Lists mock data — DEMO_MODE용.
 * wm-lists-shared.jsx MY_LISTS + PUBLIC_LIST 기반 포팅.
 */
import { DEMO_USER_ID } from '@/lib/demo-mode';

export type MockWineList = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
};

export type MockWineListItem = {
  id: string;
  list_id: string;
  lwin: number;
  sort_order: number;
  note: string | null;
  added_at: string;
};

export type MockWineListStats = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  source_list_id: string | null;
  source_list_title: string | null;
  source_author_display: string | null;
  wine_count: number;
  save_count: number;
  like_count: number;
  creator_name: string | null;
  tasted_count: number;
};

export type MockWineListSave = {
  id: string;
  list_id: string;
  saver_id: string;
  saved_at: string;
};

export type MockWineListLike = {
  id: string;
  list_id: string;
  user_id: string;
  liked_at: string;
};

// 데모 공개 리스트 작성자 (DEMO_USER_ID가 아닌 커뮤니티 사용자)
export const DEMO_COMMUNITY_USER_ID = '00000000-0000-0000-0000-000000000002';

// 내 리스트 4개 (wm-lists-shared MY_LISTS)
export const MOCK_MY_LISTS: MockWineList[] = [
  {
    id: 'list_001',
    user_id: DEMO_USER_ID,
    title: '보르도 그랑 크뤼',
    description: '마고, 라피트, 오브리옹. 언젠가 꼭 마셔볼 리스트.',
    visibility: 'public',
    created_at: '2026-03-12T09:00:00Z',
    updated_at: '2026-05-20T14:30:00Z',
  },
  {
    id: 'list_002',
    user_id: DEMO_USER_ID,
    title: '여름 화이트 와인',
    description: null,
    visibility: 'private',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-05-15T11:00:00Z',
  },
  {
    id: 'list_003',
    user_id: DEMO_USER_ID,
    title: '자연주의 내추럴 셀렉션',
    description: '무개입, 최소 개입 양조. 산화 발효 포함.',
    visibility: 'public',
    created_at: '2026-04-22T08:00:00Z',
    updated_at: '2026-05-10T09:45:00Z',
  },
  {
    id: 'list_004',
    user_id: DEMO_USER_ID,
    title: '이탈리아 스파클링',
    description: null,
    visibility: 'private',
    created_at: '2026-05-01T07:00:00Z',
    updated_at: '2026-05-01T07:00:00Z',
  },
];

// 각 리스트의 와인 아이템 (LWIN 기반)
export const MOCK_WINE_LIST_ITEMS: MockWineListItem[] = [
  // 리스트 001 — 보르도 그랑 크뤼 (6병)
  { id: 'wli_001', list_id: 'list_001', lwin: 1011196, sort_order: 0, note: '2018 빈티지 추천', added_at: '2026-03-12T09:00:00Z' },
  { id: 'wli_002', list_id: 'list_001', lwin: 1017494, sort_order: 1, note: null, added_at: '2026-03-12T09:01:00Z' },
  { id: 'wli_003', list_id: 'list_001', lwin: 1011197, sort_order: 2, note: null, added_at: '2026-03-13T10:00:00Z' },
  { id: 'wli_004', list_id: 'list_001', lwin: 1012453, sort_order: 3, note: null, added_at: '2026-03-13T10:01:00Z' },
  { id: 'wli_005', list_id: 'list_001', lwin: 1016234, sort_order: 4, note: null, added_at: '2026-03-14T09:00:00Z' },
  { id: 'wli_006', list_id: 'list_001', lwin: 1013821, sort_order: 5, note: null, added_at: '2026-03-15T09:00:00Z' },
  // 리스트 002 — 여름 화이트 (4병)
  { id: 'wli_007', list_id: 'list_002', lwin: 1092453, sort_order: 0, note: null, added_at: '2026-04-01T10:00:00Z' },
  { id: 'wli_008', list_id: 'list_002', lwin: 1091234, sort_order: 1, note: null, added_at: '2026-04-01T10:01:00Z' },
  { id: 'wli_009', list_id: 'list_002', lwin: 1093215, sort_order: 2, note: null, added_at: '2026-04-02T09:00:00Z' },
  { id: 'wli_010', list_id: 'list_002', lwin: 1090000, sort_order: 3, note: '샤블리 1er', added_at: '2026-04-02T09:01:00Z' },
  // 리스트 003 — 내추럴 (5병)
  { id: 'wli_011', list_id: 'list_003', lwin: 1045621, sort_order: 0, note: null, added_at: '2026-04-22T08:00:00Z' },
  { id: 'wli_012', list_id: 'list_003', lwin: 1046832, sort_order: 1, note: null, added_at: '2026-04-22T08:01:00Z' },
  { id: 'wli_013', list_id: 'list_003', lwin: 1047123, sort_order: 2, note: null, added_at: '2026-04-23T09:00:00Z' },
  { id: 'wli_014', list_id: 'list_003', lwin: 1048000, sort_order: 3, note: null, added_at: '2026-04-23T09:01:00Z' },
  { id: 'wli_015', list_id: 'list_003', lwin: 1049000, sort_order: 4, note: null, added_at: '2026-04-24T09:00:00Z' },
  // 리스트 004 — 이탈리아 스파클링 (0병 — 빈 상태 테스트용)
];

// 커뮤니티 공개 리스트 (타 사용자 소유 — 저장·가져오기 테스트용)
export const MOCK_PUBLIC_LIST: MockWineListStats = {
  id: 'list_pub_001',
  user_id: DEMO_COMMUNITY_USER_ID,
  source_list_id: null,
  source_list_title: null,
  source_author_display: null,
  title: '소믈리에 추천 부르고뉴 10선',
  description: '도멘 루미에, 드 보기에, DRC 빌라주 등. 입문자도 마실 수 있는 부르고뉴 엔트리.',
  visibility: 'public',
  created_at: '2026-05-01T08:00:00Z',
  updated_at: '2026-05-22T10:00:00Z',
  wine_count: 10,
  save_count: 132,
  like_count: 318,
  creator_name: '함소믈리에',
  tasted_count: 0,
};

// Stats (VIEW 대용)
const noAttribution = { source_list_id: null, source_list_title: null, source_author_display: null };
export const MOCK_LIST_STATS: MockWineListStats[] = [
  { ...MOCK_MY_LISTS[0]!, ...noAttribution, wine_count: 6, save_count: 24, like_count: 47, creator_name: '나', tasted_count: 2 },
  { ...MOCK_MY_LISTS[1]!, ...noAttribution, wine_count: 4, save_count: 0,  like_count: 0,  creator_name: '나', tasted_count: 1 },
  { ...MOCK_MY_LISTS[2]!, ...noAttribution, wine_count: 5, save_count: 8,  like_count: 15, creator_name: '나', tasted_count: 0 },
  { ...MOCK_MY_LISTS[3]!, ...noAttribution, wine_count: 0, save_count: 0,  like_count: 0,  creator_name: '나', tasted_count: 0 },
  // 저장한 타인 공개 리스트 — 비오너 뷰 데모용
  MOCK_PUBLIC_LIST,
];

export const MOCK_PUBLIC_LIST_ITEMS: MockWineListItem[] = [
  { id: 'pwli_001', list_id: 'list_pub_001', lwin: 1011196, sort_order: 0, note: null, added_at: '2026-05-01T08:00:00Z' },
  { id: 'pwli_002', list_id: 'list_pub_001', lwin: 1017494, sort_order: 1, note: null, added_at: '2026-05-01T08:01:00Z' },
  { id: 'pwli_003', list_id: 'list_pub_001', lwin: 1013821, sort_order: 2, note: null, added_at: '2026-05-01T08:02:00Z' },
  { id: 'pwli_004', list_id: 'list_pub_001', lwin: 1012453, sort_order: 3, note: null, added_at: '2026-05-01T08:03:00Z' },
  { id: 'pwli_005', list_id: 'list_pub_001', lwin: 1016234, sort_order: 4, note: null, added_at: '2026-05-01T08:04:00Z' },
  { id: 'pwli_006', list_id: 'list_pub_001', lwin: 1011197, sort_order: 5, note: null, added_at: '2026-05-01T08:05:00Z' },
  { id: 'pwli_007', list_id: 'list_pub_001', lwin: 1045621, sort_order: 6, note: null, added_at: '2026-05-01T08:06:00Z' },
  { id: 'pwli_008', list_id: 'list_pub_001', lwin: 1046832, sort_order: 7, note: null, added_at: '2026-05-01T08:07:00Z' },
  { id: 'pwli_009', list_id: 'list_pub_001', lwin: 1047123, sort_order: 8, note: null, added_at: '2026-05-01T08:08:00Z' },
  { id: 'pwli_010', list_id: 'list_pub_001', lwin: 1048000, sort_order: 9, note: null, added_at: '2026-05-01T08:09:00Z' },
];
