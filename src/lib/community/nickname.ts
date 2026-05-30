/**
 * 닉네임 모듈 — 작성 콘텐츠 표시명 (2026-05-30 정체성 모델).
 *
 * 소스 우선순위:
 *   1. 세션 캐시 (cachedNickname)
 *   2. AsyncStorage('community.nickname') — 데모/실모드 공통 로컬 캐시
 *   3. (실모드) profiles.nickname — 서버 값
 *
 * 저장: AsyncStorage 기록 + (실모드면) profiles.nickname 업데이트(best-effort).
 * 데모 모드에선 Supabase 미접근 — AsyncStorage 만으로 동작.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo-mode';

const STORAGE_KEY = 'community.nickname';

let cachedNickname: string | null = null;

/** 동기 접근 — load 이후 즉시 사용 가능. */
export function getCachedNickname(): string | null {
  return cachedNickname;
}

/** 닉네임을 로드 (캐시 → AsyncStorage → 실모드 profiles). 없으면 null. */
export async function loadNickname(): Promise<string | null> {
  if (cachedNickname) return cachedNickname;

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    cachedNickname = stored;
    return stored;
  }

  if (!DEMO_MODE) {
    const uid = await getCurrentUserId();
    if (uid) {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('nickname')
        .eq('id', uid)
        .maybeSingle();
      const serverNick = data?.nickname ?? null;
      if (serverNick) {
        cachedNickname = serverNick;
        await AsyncStorage.setItem(STORAGE_KEY, serverNick);
        return serverNick;
      }
    }
  }
  return null;
}

/** 닉네임 저장 — 캐시 + AsyncStorage + (실모드) profiles.nickname. */
export async function saveNickname(nickname: string): Promise<void> {
  const value = nickname.trim();
  if (!value) return;
  cachedNickname = value;
  await AsyncStorage.setItem(STORAGE_KEY, value);

  if (!DEMO_MODE) {
    const uid = await getCurrentUserId();
    if (uid) {
      await (supabase as any).from('profiles').update({ nickname: value }).eq('id', uid);
    }
  }
}
