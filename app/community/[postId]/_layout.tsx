/**
 * /community/[postId] Stack 그룹 layout.
 *
 * 사양: community-post.md + community-post-comments.md.
 *   - 포스트 상세 (`index`) → 댓글 화면 (`comments`) Stack 진입.
 *   - BottomNav 비표시 (depth 진입 — BackHeader 화면).
 *   - headerShown=false — 각 화면 자체 inline `LightBackHeader` 사용 (light-only 정책).
 *   - Phase 6 추가 — community 피드 (v0.2.0) 에서 진입 예정 또는 community-shortcut-card 진입.
 */
import { Stack } from 'expo-router';

export default function CommunityPostLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="comments" />
    </Stack>
  );
}
