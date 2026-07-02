/**
 * Mock profile — demo mode 전용. heavy user 1명만.
 *
 * keyscreen `me-heavy` (level 3, XP 850) 시나리오 동등.
 * shape: Database['public']['Tables']['profiles']['Row']
 *
 * v0.1.0 supabase profiles 테이블에 실제 삽입되지 않음 — DEMO_MODE 시 useProfile() 훅이 반환.
 */
import type { Database } from '@shared/types/database.types';
import { DEMO_USER_ID } from '@/lib/demo-mode';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const MOCK_ME_PROFILE: ProfileRow = {
  id: DEMO_USER_ID,
  anonymous_display: 'velvety-fox-37',
  bio: null,
  email: null,
  experience: 'expert',
  follower_count: 248,
  following_count: 192,
  handle: null,
  is_upgraded: false,
  language: 'ko',
  level: 3,
  linked_providers: [],
  mode: 'heavy',
  moderation_status: 'visible',
  nickname: null,
  role: 'user',
  public_countries_count: 14,
  public_notes_count: 86,
  public_regions_count: 27,
  public_wines_count: 62,
  theme: 'light',
  xp: 850,
  created_at: '2025-09-01T00:00:00.000Z',
  updated_at: '2026-05-22T00:00:00.000Z',
};

/**
 * Mock 다른 유저 프로필 — DEMO_MODE 시 useOtherUserProfile() 반환.
 *
 * profile-other 디자인 리뷰 스크린샷용. handoff `OtherUserScreen` 박지원 (level 5) 시나리오 동등.
 */
export const MOCK_OTHER_PROFILE: ProfileRow = {
  id: '00000000-0000-0000-0000-000000000002',
  anonymous_display: 'amber-heron-08',
  bio: '부르고뉴 · 이탈리아 레드',
  email: null,
  experience: 'expert',
  follower_count: 1284,
  following_count: 342,
  handle: 'jiwon',
  is_upgraded: false,
  language: 'ko',
  level: 5,
  linked_providers: [],
  mode: 'heavy',
  moderation_status: 'visible',
  nickname: null,
  role: 'user',
  public_countries_count: 9,
  public_notes_count: 156,
  public_regions_count: 21,
  public_wines_count: 118,
  theme: 'light',
  xp: 4200,
  created_at: '2023-02-01T00:00:00.000Z',
  updated_at: '2026-05-22T00:00:00.000Z',
};

/**
 * Mock 팔로우 목록 — DEMO_MODE 시 useFollowers() 반환.
 *
 * handoff `FOLLOW_USERS` 8명 동등 (디자인 리뷰 스크린샷용).
 * shape는 use-followers.ts FollowUser 와 동일하나 순환 import 회피 위해 inline 정의.
 */
export interface MockFollowUser {
  userId: string;
  anonymousDisplay: string;
  handle: string | null;
  levelId: 1 | 2 | 3 | 4 | 5;
  bio: string | null;
  isMutual: boolean;
  isFollowing: boolean;
}

export const MOCK_FOLLOW_USERS: MockFollowUser[] = [
  { userId: '00000000-0000-0000-0000-0000000000a1', anonymousDisplay: 'amber-heron-08', handle: 'jiwon', levelId: 5, bio: '부르고뉴 · 이탈리아 레드', isMutual: true, isFollowing: true },
  { userId: '00000000-0000-0000-0000-0000000000a2', anonymousDisplay: 'crimson-otter-21', handle: 'minseo', levelId: 4, bio: '내추럴 와인 탐험 중', isMutual: true, isFollowing: true },
  { userId: '00000000-0000-0000-0000-0000000000a3', anonymousDisplay: 'velvet-lark-44', handle: null, levelId: 3, bio: null, isMutual: false, isFollowing: false },
  { userId: '00000000-0000-0000-0000-0000000000a4', anonymousDisplay: 'gilded-sparrow-77', handle: 'haneul', levelId: 2, bio: '로제 입문자', isMutual: false, isFollowing: true },
  { userId: '00000000-0000-0000-0000-0000000000a5', anonymousDisplay: 'oaken-finch-13', handle: 'sungho', levelId: 4, bio: '보르도 좌안 · 우안', isMutual: true, isFollowing: true },
  { userId: '00000000-0000-0000-0000-0000000000a6', anonymousDisplay: 'rosy-wren-59', handle: null, levelId: 1, bio: null, isMutual: false, isFollowing: false },
  { userId: '00000000-0000-0000-0000-0000000000a7', anonymousDisplay: 'dusky-quail-36', handle: 'yuna', levelId: 3, bio: '샴페인과 스파클링', isMutual: false, isFollowing: false },
  { userId: '00000000-0000-0000-0000-0000000000a8', anonymousDisplay: 'tawny-robin-92', handle: 'dohyun', levelId: 5, bio: '리슬링 · 독일 화이트', isMutual: true, isFollowing: true },
];
