/**
 * /glossary/_layout — Stack 라우팅 그룹.
 *
 * 사양: _workspace/design-specs/glossary-list.md §0-1.
 *   - `(tabs)` 외부 Stack 라우트 (BottomNav 자동 hide).
 *   - 화면 내부 inline LightBackHeader 사용 → header hidden.
 *
 * 본 그룹 자식:
 *   - index.tsx (용어 사전 리스트)
 *   - [term].tsx (용어 상세 — v0.1.0 follow-up, glossary-detail 사양 별도)
 */
import { Stack } from 'expo-router';

export default function GlossaryLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
