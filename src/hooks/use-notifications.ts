/**
 * useNotifications — notifications 화면 데이터 훅.
 *
 * 사양: _workspace/design-specs/notifications.md §5-3 / §10 A.
 *
 * v0.1.0 — §10 결정 A: notifications 테이블 마이그레이션 부재 → 정적 mock 사용 (use-favorites.ts 동일 패턴).
 * v0.2.0 에서 supabase 교체 — 인터페이스 호환 유지.
 *
 *   v0.2.0 호출 패턴:
 *     const { data } = await supabase
 *       .from('notifications')
 *       .select('*')
 *       .order('created_at', { ascending: false })
 *       .limit(50);
 *
 *   v0.2.0 markAllRead mutation:
 *     await supabase
 *       .from('notifications')
 *       .update({ read: true })
 *       .eq('user_id', userId)
 *       .eq('read', false);
 *
 * 비동기 형태로 노출해 supabase 마이그레이션 시 호환성 보장 (use-favorites 동일).
 */
import { useCallback, useEffect, useState } from 'react';
import {
  NOTIFICATIONS,
  getNotificationsByUser,
  type NotificationKind,
  type NotificationMock,
} from '@/lib/mock/notifications';

/** RN UI 가 row 단위로 소비하는 정규화 shape. */
export interface NotificationRow {
  id: string;
  kind: NotificationKind;
  wineLwin: string | null;
  cellarItemId: string | null;
  badgeId: string | null;
  /** anonymous_display 값 (raw UUID 아님 — CLAUDE.md §4-5). */
  actorAnonDisplay: string | null;
  title: { ko: string; en: string };
  body: { ko: string; en: string };
  /** ISO 8601 timestamp. */
  createdAt: string;
  read: boolean;
}

export interface UseNotificationsResult {
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  /**
   * 모두 읽음 (v0.1.0 mock: in-memory 영속 X — keyscreen verbatim).
   * v0.2.0: supabase update + optimistic + rollback.
   */
  markAllRead: () => Promise<void>;
}

// v0.1.0 mock 단계 — hardcoded user (keyscreen `me-heavy` verbatim).
// v0.2.0 supabase: const { data: { user } } = await supabase.auth.getUser();
const MOCK_USER_ID = 'me-heavy';

function toRow(n: NotificationMock): NotificationRow {
  return {
    id: n.id,
    kind: n.kind,
    wineLwin: n.wineLwin,
    cellarItemId: n.cellarItemId,
    badgeId: n.badgeId,
    actorAnonDisplay: n.actorAnonDisplay,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt,
    read: n.read,
  };
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // mock 단계 — sync lookup 이지만 future supabase 호환 위해 microtask 분리.
      const rows = await Promise.resolve().then(() =>
        getNotificationsByUser(MOCK_USER_ID).map(toRow),
      );
      setNotifications(rows);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    // v0.1.0 mock — in-memory 영속 X (keyscreen verbatim § notifications/page.tsx line 32~35).
    // local state 만 모두 read=true 로 override.
    // v0.2.0: supabase update + optimistic + rollback (사양 §5-4).
    setNotifications((prev) =>
      prev.map((n) => (n.read ? n : { ...n, read: true })),
    );
    // mock 데이터 자체는 갱신하지 않음 — refresh() 시 원 상태 복귀 (keyscreen verbatim).
    // §10 결정 A: v0.1.0 mock 단계는 영속 0.
    void NOTIFICATIONS; // (no-op reference — 향후 v0.2.0 mutation 자리)
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: load,
    markAllRead,
  };
}
