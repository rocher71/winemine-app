/**
 * Supabase 클라이언트 — PKCE flowType + Database 제네릭 적용 완료 (T5).
 *
 * 사용 예:
 *   const { data, error } = await supabase.from('tasting_notes').select('*');
 *   // RLS로 본인 행만 반환. user_id = auth.uid() 자동 적용.
 *
 * 주의:
 *   - SUPABASE_SERVICE_ROLE_KEY는 절대 import 금지 (RN 번들 노출 위험)
 *   - flowType: 'pkce'는 v0.2.0 OAuth에 필요. anonymous에는 무해.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import type { Database } from '@shared/types/database.types';

type Extra = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  anonymizationSaltDev: string;
  appEnv: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;
const supabaseUrl = extra.supabaseUrl ?? '';
const supabaseAnonKey = extra.supabaseAnonKey ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[winemine] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 가 비어있습니다. .env 확인 필요.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

export const anonymizationSaltDev = extra.anonymizationSaltDev ?? '';
export const appEnv = extra.appEnv ?? 'development';
