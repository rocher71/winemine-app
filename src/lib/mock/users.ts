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
  email: null,
  experience: 'expert',
  is_upgraded: false,
  language: 'ko',
  level: 3,
  linked_providers: [],
  mode: 'heavy',
  theme: 'light',
  xp: 850,
  created_at: '2025-09-01T00:00:00.000Z',
  updated_at: '2026-05-22T00:00:00.000Z',
};
