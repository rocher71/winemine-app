/**
 * Demo mode — 사용자 시각 검증용 mock 데이터 fallback flag.
 *
 * 활성화: `.env`에 `EXPO_PUBLIC_DEMO_MODE=true` 설정 후 Metro 재시작.
 *
 * 활성 시 hooks (use-cellar / use-notes / use-my-note-for-wine / use-profile-stats /
 * use-profile / use-wine)가 supabase 호출 대신 `src/lib/mock/*` mock 데이터 반환.
 *
 * 비활성 시 (production 빌드 포함) 기존 supabase 호출 그대로 — 영향 0.
 *
 * - `DEMO_USER_ID`: mock cellar/notes에 사용되는 고정 UUID. supabase에 실제로 삽입되지 않음.
 *   keyscreen `me-heavy`와 의미적으로 동등 — heavy user 시나리오 데이터.
 *
 * 정합성: §4-7 EXPO_PUBLIC_* 접두사 (RN 번들 포함 OK, 시크릿 아님).
 */
import Constants from 'expo-constants';

type Extra = {
  demoMode?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const DEMO_MODE: boolean =
  extra.demoMode === true || process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

/** Mock heavy user UUID. cellar/notes mock 데이터의 user_id 필드 값. */
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
