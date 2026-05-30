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

export type PostType = 'note' | 'question' | 'column' | 'news' | 'album' | 'list';

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
  /** listId — type==='list'일 때 InlineListCard에 연결할 wine_lists.id */
  listId?: string;
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
  {
    id: 'p7',
    type: 'list',
    userId: 'sommelier',
    ago: '2일 전',
    title: '소믈리에 추천 부르고뉴 10선',
    body: '도멘 루미에, 드 보기에, DRC 빌라주 등. 입문자도 마실 수 있는 부르고뉴 엔트리.',
    listId: 'list_pub_001',
    reactions: { glass: 54, sparkle: 21, bookmark: 37, drank: 0 },
    comments: 9,
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

// ────────────────────────────────────────────────────────────────────────────
// Dynamic user registry — 실/발행 작성자(auth.uid() 또는 DEMO_USER_ID)를 런타임에 등록.
// 커뮤니티 UI 전역이 getCommunityUser(id) 로 작성자를 해석하므로, 발행 훅이 현재 회원의
// CommUser 를 여기에 등록하면 피드·상세·댓글 어디서든 닉네임/레벨이 정상 표시된다.
// (mock COMM_USERS 는 그대로 유지 — 데모 콘텐츠 보존.)
// ────────────────────────────────────────────────────────────────────────────
const dynamicUsers = new Map<string, CommUser>();

/** 레벨 → identity color (COMM_USERS 패턴과 동일 계열). */
const LEVEL_COLOR: Record<number, string> = {
  1: '#b8b8c0',
  2: '#b8b8c0',
  3: '#b8b8c0',
  4: '#C9A84C',
  5: '#8B1A2A',
};

/** 레벨 → ko levelLabel (커뮤니티 mock 라벨 계열). */
const LEVEL_LABEL: Record<number, string> = {
  1: '입문자',
  2: '애호가',
  3: '코노시어',
  4: '소믈리에',
  5: '마스터',
};

/** 닉네임 + 레벨로 CommUser 구성 후 registry 에 등록. */
export function registerCommunityUser(input: {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}): CommUser {
  const user: CommUser = {
    id: input.id,
    name: input.name,
    level: input.level,
    levelLabel: LEVEL_LABEL[input.level] ?? '',
    color: LEVEL_COLOR[input.level] ?? '#b8b8c0',
    initial: input.name.trim().charAt(0) || '?',
  };
  dynamicUsers.set(user.id, user);
  return user;
}

export function getCommunityUser(id: string): CommUser | undefined {
  return COMM_USERS.find((u) => u.id === id) ?? dynamicUsers.get(id);
}

export function getCommunityPost(id: string): CommPost | undefined {
  return COMM_POSTS.find((p) => p.id === id);
}

// ────────────────────────────────────────────────────────────────────────────
// Wine embeds — note 타입 포스트의 wineId 슬러그 → 표시용 와인 메타.
//
// 데이터 caveat (GAP-REPORT §Data caveat): 포스트 wineId 는 슬러그(`bgy-pommard` 등)라
// MOCK_WINES.lwin (숫자) 과 매칭되지 않는다. WineEmbedCard 가 bottle + nameKo + producer·vintage
// 를 표시하려면 슬러그 → 와인 메타 매핑이 필요 — mock-only (v0.2.0 supabase 대체).
//
// bottleColor / type 은 wm-bottle.tsx 의 TypeCanonical / bottleColorDefault 와 정합.
//   - p1 = 레 루지엥 / Pommard (red)
//   - p6 = 레 퓌셀 / Puligny-Montrachet (white)
// ────────────────────────────────────────────────────────────────────────────

export interface WineEmbed {
  nameKo: string;
  producer: string;
  vintage: number;
  /** wm-bottle.tsx WMBottle bottleColor 와 정합 (hex). */
  bottleColor: string;
  /** wm-bottle.tsx TypeCanonical 과 정합. */
  type: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert';
  /** mock/wines.ts MOCK_WINES.lwin 과 정합 — 카드 탭 시 /wine/[lwin] 라우팅 대상. */
  lwin: string;
}

// v0.2.0 supabase 대체 (community_posts join wines_localized)
const WINE_EMBEDS: Record<string, WineEmbed> = {
  'bgy-pommard': {
    nameKo: '레 루지엥',
    producer: '도멘 드 쿠르셀',
    vintage: 2019,
    bottleColor: '#5b1424', // bottleColorDefault.red
    type: 'red',
    lwin: '1011318',
  },
  'bgy-puligny-montrachet': {
    nameKo: '레 퓌셀',
    producer: '도멘 르플레브',
    vintage: 2018,
    bottleColor: '#d9c277', // bottleColorDefault.white
    type: 'white',
    lwin: '1011323',
  },
};

export function getWineEmbed(wineId?: string): WineEmbed | null {
  if (!wineId) return null;
  return WINE_EMBEDS[wineId] ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Trending — 이번 주 키워드 + 순위 리스트 (트렌딩 탭).
//
// tint 는 SEMANTIC 토큰 이름 ('gold'|'wine'|'primary'|'neutral') — hex 금지.
// UI 레이어에서 light.* / brand.* 토큰으로 매핑 (라이트 모드 point color 규칙: red→gold).
// v0.2.0 supabase 대체 (community_trending_keywords / ranked posts aggregate).
// ────────────────────────────────────────────────────────────────────────────

export type TrendingTint = 'gold' | 'wine' | 'primary' | 'neutral';

export interface TrendingKeyword {
  /** i18n 키 suffix — community.trending.keywords.{id} */
  id: string;
  count: number;
  tint: TrendingTint;
}

const TRENDING_KEYWORDS: TrendingKeyword[] = [
  { id: 'k1', count: 142, tint: 'gold' },    // 부르고뉴 22빈티지
  { id: 'k2', count: 89, tint: 'wine' },     // 레 루지엥
  { id: 'k3', count: 67, tint: 'primary' },  // 디캔팅 시간
  { id: 'k4', count: 54, tint: 'neutral' },  // 결혼식 와인
  { id: 'k5', count: 41, tint: 'neutral' },  // 봄 음용 적기
  { id: 'k6', count: 33, tint: 'neutral' },  // 내츄럴
];

export function getTrendingKeywords(): TrendingKeyword[] {
  return TRENDING_KEYWORDS;
}

export function getTrendingRankedPosts(): CommPost[] {
  // 디자인 순서: COMM_POSTS[2], [5], [0], [4]
  return [COMM_POSTS[2], COMM_POSTS[5], COMM_POSTS[0], COMM_POSTS[4]].filter(
    (p): p is CommPost => Boolean(p),
  );
}
