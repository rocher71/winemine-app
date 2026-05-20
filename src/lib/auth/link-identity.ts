/**
 * supabase.auth.linkIdentity wrapper — v0.2.0 활성.
 * anonymous 세션 + OAuth provider → 영구 사용자로 업그레이드 (UUID 유지).
 *
 * 호환 시그니처: profiles.linked_providers (text[]) / is_upgraded (boolean) / email (text).
 */
export type LinkableProvider = 'google' | 'apple' | 'kakao';

export interface LinkIdentityInput {
  provider: LinkableProvider;
  idToken?: string;
  accessToken?: string;
  email?: string | null;
}

export interface LinkIdentityResult {
  linked: LinkableProvider[];
  isUpgraded: boolean;
  email: string | null;
}

export async function linkProvider(_input: LinkIdentityInput): Promise<LinkIdentityResult> {
  throw new Error('NotImplemented: linkIdentity는 v0.2.0에서 활성됩니다');
}
