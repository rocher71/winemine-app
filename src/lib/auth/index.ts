/**
 * Auth 통합 API. v0.1.0은 anonymous-only. OAuth 진입점은 stub.
 *
 * 사용 예 (v0.1.0):
 *   await signInAnonymouslyIfNeeded();        // _layout.tsx에서 부팅 시
 *   await signOut();                          // 설정 → 데이터 초기화
 *
 * v0.2.0:
 *   const r = await signInWithGoogle();
 *   await linkProvider({ provider: 'google', idToken: r.idToken, email: r.email });
 */
import { supabase } from '../supabase';

export type { LinkableProvider, LinkIdentityInput, LinkIdentityResult } from './link-identity';
export { linkProvider } from './link-identity';
export { signInWithGoogle } from './providers/google';
export { signInWithApple } from './providers/apple';
export { signInWithKakao } from './providers/kakao';

export async function signInAnonymouslyIfNeeded(): Promise<{ userId: string } | null> {
  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.user.id) return { userId: existing.session.user.id };

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) return null;
  return { userId: data.user.id };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
