/**
 * useWineStory — wine-story 화면 데이터 훅.
 *
 * 사양: _workspace/design-specs/wine-story.md §5-1.
 *
 * v0.1.0 — Step 1 §10 결정 A: supabase `wine_stories` 테이블 없이 정적 mock 사용.
 * 향후 v0.2.0 에서 supabase.from('wine_stories').select().eq('wine_lwin', lwin).maybeSingle()
 * 으로 교체 — 인터페이스는 그대로 유지.
 *
 * 비동기 형태로 노출해 supabase 마이그레이션 시 호환성 보장.
 */
import { useEffect, useState } from 'react';
import { getWineStoryByLwin, type WineStory } from '@/lib/mock/wine-stories';

export interface UseWineStoryResult {
  story: WineStory | null;
  loading: boolean;
}

export function useWineStory(lwin: string | null | undefined): UseWineStoryResult {
  const [story, setStory] = useState<WineStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // mock 단계 — sync lookup 이지만 future supabase 호환 위해 microtask 분리.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setStory(getWineStoryByLwin(lwin));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [lwin]);

  return { story, loading };
}
