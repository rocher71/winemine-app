/**
 * Community Posts & Users — mock data (v0.1.0).
 *
 * 키스크린 verbatim 포팅 (`../winemine-keyscreen/src/lib/mock/community-posts.ts`, 151 LOC).
 * 사양 community-components.md §10 H: v0.1.0 단계는 mock 단독 정의.
 * v0.2.0: supabase `community_posts` / `community_users` 테이블 마이그레이션 후 `shared/types/database.types.ts` import 로 대체.
 *
 * - 7 users (level 1~5)
 * - 6 posts (type: note | column | question | news | album)
 * - wineId 는 `wines.ts` mock id 참조 (현 RN 단계에서는 mock wines.ts 부재 — wineId 는 LWIN 미지원, fallback stub 사용)
 */

export type PostType = 'note' | 'question' | 'column' | 'news' | 'album';

export interface CommReactions {
  glass: number;
  sparkle: number;
  bookmark: number;
  drank: number;
}

export type ReactionId = keyof CommReactions;

export interface CommUser {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
  /** Level identity color — keyscreen verbatim (mock 단계에만 보존, v0.2.0에서는 user.level → noteAuthorAvatarGradient lookup) */
  color: string;
  initial: string;
}

export interface CommPost {
  id: string;
  type: PostType;
  userId: string;
  ago: string;
  /** wineId — mock wines.ts id 참조 (v0.1.0 본 RN 단계에서는 stub 처리) */
  wineId?: string;
  rating?: number;
  title: string;
  body: string;
  cover?: 'vineyard';
  reactions: CommReactions;
  comments: number;
  photoCount?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────────────────────────────────

export const COMM_USERS: CommUser[] = [
  { id: 'jiwon',     name: '박지원',     level: 5, levelLabel: '마스터',   color: '#8B1A2A', initial: '박' },
  { id: 'suyeon',    name: '이서윤',     level: 4, levelLabel: '소믈리에', color: '#C9A84C', initial: '이' },
  { id: 'minho',     name: '김민호',     level: 3, levelLabel: '코노시어', color: '#b8b8c0', initial: '김' },
  { id: 'duckhu',    name: '와인덕후',   level: 4, levelLabel: '소믈리에', color: '#C9A84C', initial: '덕' },
  { id: 'mineral',   name: '미네랄러버', level: 5, levelLabel: '마스터',   color: '#8B1A2A', initial: '미' },
  { id: 'sommelier', name: '함소믈리에', level: 5, levelLabel: '마스터',   color: '#8B1A2A', initial: '함' },
  { id: 'haerin',    name: '정해린',     level: 3, levelLabel: '코노시어', color: '#b8b8c0', initial: '정' },
];

// ────────────────────────────────────────────────────────────────────────────
// Posts
// ────────────────────────────────────────────────────────────────────────────

export const COMM_POSTS: CommPost[] = [
  {
    id: 'p1',
    type: 'note',
    userId: 'jiwon',
    ago: '12분 전',
    wineId: 'bgy-pommard',
    rating: 4.5,
    title: '두 시간 디캔팅한 레 루지엥, 정점이 이렇게 아름답습니다',
    body: '코르크를 따고 5분, 환원취 가득. 30분, 검은 체리. 1시간, 가죽이 살짝. 2시간 — 모든 향이 한 자리에 모인다. 권장 시간과 정확히 일치.',
    reactions: { glass: 38, sparkle: 12, bookmark: 7, drank: 4 },
    comments: 6,
  },
  {
    id: 'p2',
    type: 'question',
    userId: 'haerin',
    ago: '37분 전',
    title: '결혼식에 손님 30분께 낼 와인, 추천 부탁드려요',
    body: '예산 병당 7-9만 원. 가벼운 화이트 + 미디엄 레드 한 종씩 생각 중인데, 의외로 어렵네요. 너무 드라이하지 않으면서 식사와 잘 어울리는 것이 좋겠어요. 다들 어떤 와인 내셨나요?',
    reactions: { glass: 8, sparkle: 2, bookmark: 14, drank: 0 },
    comments: 23,
  },
  {
    id: 'p3',
    type: 'column',
    userId: 'sommelier',
    ago: '3시간 전',
    title: '부르고뉴 도멘 르플레브 방문기 — 9월의 첫 수확',
    body: '비행기를 타고 디종, 다시 두 시간을 달려 도착한 퓔리니-몽라셰. 안 클로드의 손녀가 직접 안내해준 빈야드는 생각보다 작았고, 생각보다 조용했고, 생각보다 정밀했다.',
    cover: 'vineyard',
    reactions: { glass: 142, sparkle: 67, bookmark: 89, drank: 0 },
    comments: 31,
  },
  {
    id: 'p4',
    type: 'news',
    userId: 'duckhu',
    ago: '5시간 전',
    title: '신세계 강남, 부르고뉴 2022 빈티지 사전 예약 오늘 오픈',
    body: '예약 가능 도멘 12곳, 한정 수량. 르플레브 / 라몽네 / 콩트 라퐁 포함.',
    reactions: { glass: 22, sparkle: 4, bookmark: 51, drank: 0 },
    comments: 8,
  },
  {
    id: 'p5',
    type: 'album',
    userId: 'minho',
    ago: '어제',
    title: '소소한 셀러 정리의 하루',
    body: 'B-3 공간을 비우고 새로 들어온 6병 자리 잡기. 라벨이 다 보이게 두면 시간이 좋아진다.',
    reactions: { glass: 56, sparkle: 8, bookmark: 12, drank: 0 },
    comments: 11,
    photoCount: 7,
  },
  {
    id: 'p6',
    type: 'note',
    userId: 'mineral',
    ago: '어제',
    wineId: 'bgy-puligny-montrachet',
    rating: 5,
    title: '레 퓌셀 2018 — 이제 막 깨어나는 중',
    body: '레몬·헤이즐넛 사이로 부싯돌이 슬쩍. 산도가 펜처럼 또렷한데 미네랄이 길게 따라옴. 아직 6년은 더 좋아질 거예요.',
    reactions: { glass: 89, sparkle: 34, bookmark: 23, drank: 5 },
    comments: 14,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

export function getCommunityUsers(): CommUser[] {
  return COMM_USERS;
}

export function getCommunityPosts(): CommPost[] {
  return COMM_POSTS;
}

export function getCommunityUser(id: string): CommUser | undefined {
  return COMM_USERS.find((u) => u.id === id);
}

export function getCommunityPost(id: string): CommPost | undefined {
  return COMM_POSTS.find((p) => p.id === id);
}
