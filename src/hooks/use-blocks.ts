/**
 * useBlocks — 차단 목록 조회 + 차단/해제 토글 훅 (M3 moderation).
 *
 * 사양: _workspace/design-specs/moderation-block-confirm-sheet.md "use-blocks 훅 계약"
 *       + moderation-blocked-screen.md "use-blocks 연동".
 *   - user_blocks SELECT/INSERT/DELETE 모두 RLS `blocker_id = auth.uid()` (M1).
 *   - blockedList: 본인이 차단한 유저 목록. 각 항목 `{ id, anonymous_display, handle }`.
 *     id(UUID)는 onPress 핸들러 인자로만 사용 — UI Text 출력 금지 (§4-5).
 *   - 표시명(anonymous_display)·핸들은 profiles_public VIEW 에서 조회 (안전 컬럼만).
 *   - follows 양방향 해제는 DB 트리거(user_blocks AFTER INSERT) — 클라이언트 추가 호출 불필요.
 *
 * 차단 상태는 RLS 가 콘텐츠 가시성을 자동 강제(§4-6). 이 훅은 목록 관리 + 토글만 책임.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';

export interface BlockedUser {
  /** blocked 유저 UUID — §4-5: 핸들러 인자 전용, Text 출력 금지. */
  id: string;
  anonymous_display: string;
  handle?: string | null;
}

export type BlockToggleResult = 'blocked' | 'unblocked' | 'error';

export interface UseBlocksResult {
  blockedList: BlockedUser[];
  isBlocked: (userId: string) => boolean;
  toggle: (userId: string) => Promise<BlockToggleResult>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBlocks(): UseBlocksResult {
  const [blockedList, setBlockedList] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setBlockedList([]);
        return;
      }
      // 1) 본인 차단 목록 (RLS: blocker_id = auth.uid()).
      const { data: blocks, error: blockErr } = await supabase
        .from('user_blocks')
        .select('blocked_id, created_at')
        .order('created_at', { ascending: false });
      if (blockErr) throw blockErr;

      const ids = (blocks ?? []).map((b) => b.blocked_id);
      if (ids.length === 0) {
        setBlockedList([]);
        return;
      }

      // 2) 표시명·핸들 — profiles_public VIEW (안전 컬럼만, §4-5).
      const { data: profiles, error: profErr } = await supabase
        .from('profiles_public')
        .select('id, anonymous_display, handle')
        .in('id', ids);
      if (profErr) throw profErr;

      const profMap = new Map(
        (profiles ?? []).map((p) => [p.id, p]),
      );

      // 차단 순서(blocks) 보존 + 프로필 미발견 시 id fallback (표시명 누락 방어).
      const list: BlockedUser[] = ids.map((id) => {
        const p = profMap.get(id);
        return {
          id,
          anonymous_display: p?.anonymous_display ?? '—',
          handle: p?.handle ?? null,
        };
      });
      setBlockedList(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setBlockedList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isBlocked = useCallback(
    (userId: string) => blockedList.some((b) => b.id === userId),
    [blockedList],
  );

  const toggle = useCallback(
    async (userId: string): Promise<BlockToggleResult> => {
      try {
        const uid = await getCurrentUserId();
        if (!uid || !userId || uid === userId) return 'error';

        const already = blockedList.some((b) => b.id === userId);
        if (already) {
          const { error: delErr } = await supabase
            .from('user_blocks')
            .delete()
            .eq('blocker_id', uid)
            .eq('blocked_id', userId);
          if (delErr) return 'error';
          setBlockedList((prev) => prev.filter((b) => b.id !== userId));
          return 'unblocked';
        }

        const { error: insErr } = await supabase.from('user_blocks').insert({
          blocker_id: uid,
          blocked_id: userId,
        });
        if (insErr) return 'error';
        await load();
        return 'blocked';
      } catch {
        return 'error';
      }
    },
    [blockedList, load],
  );

  return { blockedList, isBlocked, toggle, loading, error, refresh: load };
}
