/**
 * useReport — 콘텐츠 신고 제출 훅 (M3 moderation).
 *
 * 사양: _workspace/design-specs/moderation-report-sheet.md "use-report 훅 계약".
 *   - reports INSERT. RLS INSERT `reporter_id = auth.uid()` (M1 reports 마이그레이션).
 *   - reporter_id 는 클라이언트가 명시 전달 (auth.uid() 와 동일 — RLS WITH CHECK 통과용).
 *   - UNIQUE(reporter_id, target_type, target_id) 위반(Postgres 23505) → 'duplicate' 매핑.
 *   - reason='other' 일 때 detail 필수 (DB CHECK + 앱 양쪽 검증).
 *
 * 임계값 자동 조치(≥3 pending / >10 댓글 removed)는 DB 트리거가 처리 — 클라이언트는 INSERT 만.
 */
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';

export type ReportTargetType = 'post' | 'comment' | 'note' | 'list' | 'profile';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'sexual'
  | 'misinfo'
  | 'impersonation'
  | 'other';

export type ReportResult = 'ok' | 'duplicate' | 'error';

export interface ReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail?: string;
}

export interface UseReportResult {
  submit: (input: ReportInput) => Promise<ReportResult>;
  loading: boolean;
}

export function useReport(): UseReportResult {
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async (input: ReportInput): Promise<ReportResult> => {
    setLoading(true);
    try {
      const uid = await getCurrentUserId();
      if (!uid) return 'error';

      const detail =
        input.reason === 'other' ? (input.detail?.trim() || null) : (input.detail?.trim() || null);

      const { error } = await supabase.from('reports').insert({
        reporter_id: uid,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason,
        detail,
      });

      if (error) {
        // Postgres unique_violation — 동일 유저 동일 타깃 재신고 (정상 흐름, 오류 아님).
        if (error.code === '23505') return 'duplicate';
        return 'error';
      }
      return 'ok';
    } catch {
      return 'error';
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading };
}
