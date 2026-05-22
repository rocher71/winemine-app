/**
 * useTastingTemplates — 저장한 커뮤니티 양식 ID 영속 hook (v0.1.0).
 *
 * 사양: design-spec community-side.md §10-B §1-C-4 §4-7.
 *
 * 키스크린 동등: `../winemine-keyscreen/src/context/tasting-template-context.tsx`.
 * RN 측은 Context 대신 hook + module-level state + AsyncStorage 사용 (단일 source 충분).
 *
 * - AsyncStorage 키: `winemine.savedTemplates` (string array JSON)
 * - mount 시 AsyncStorage.getItem → setSavedIds
 * - save/unsave 시 setSavedIds + AsyncStorage.setItem
 * - 여러 화면이 동일 hook 사용 시 module-level subscriber list로 sync (notes/new picker 통합 §10-E 대비)
 *
 * §0-2 light-only mode.
 *
 * v0.2.0: supabase `saved_templates(user_id, template_id)` join table 대체.
 */
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'winemine.savedTemplates';

// Module-level cache + subscriber list — hook 인스턴스 간 sync 보장
let cache: string[] | null = null;
let loaded = false;
const subscribers = new Set<(ids: string[]) => void>();

async function loadFromStorage(): Promise<string[]> {
  if (loaded && cache != null) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
        cache = parsed as string[];
      } else {
        cache = [];
      }
    } else {
      cache = [];
    }
  } catch {
    cache = [];
  }
  loaded = true;
  return cache;
}

async function persistToStorage(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 영속 실패 (드물게 storage full 등) — silent fail. v0.2.0 supabase 시 error toast.
  }
}

function notifyAll(next: string[]): void {
  cache = next;
  subscribers.forEach((cb) => cb(next));
}

export interface UseTastingTemplates {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  saveTemplate: (id: string) => void;
  unsaveTemplate: (id: string) => void;
}

export function useTastingTemplates(): UseTastingTemplates {
  const [savedIds, setSavedIds] = useState<string[]>(cache ?? []);

  useEffect(() => {
    let cancelled = false;
    if (!loaded) {
      loadFromStorage().then((ids) => {
        if (!cancelled) setSavedIds(ids);
      });
    }
    const cb = (ids: string[]) => {
      if (!cancelled) setSavedIds(ids);
    };
    subscribers.add(cb);
    return () => {
      cancelled = true;
      subscribers.delete(cb);
    };
  }, []);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );

  const saveTemplate = useCallback((id: string) => {
    const current = cache ?? [];
    if (current.includes(id)) return;
    const next = [...current, id];
    notifyAll(next);
    void persistToStorage(next);
  }, []);

  const unsaveTemplate = useCallback((id: string) => {
    const current = cache ?? [];
    if (!current.includes(id)) return;
    const next = current.filter((x) => x !== id);
    notifyAll(next);
    void persistToStorage(next);
  }, []);

  return { savedIds, isSaved, saveTemplate, unsaveTemplate };
}
