# CommFeedCard / CommFeedRow

커뮤니티 피드의 두 가지 카드 스타일. **같은 파일(`comm-feed-card.tsx`)에서 2개 export.**

---

## CommFeedCard

following 탭용 **풀 카드** — 타입 배지 + 유저 행 + 제목 + 본문(3줄) + [와인 임베드 stub] + ReactionBar.

### Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `post` | `CommPost` | yes | — | 포스트 데이터 |
| `mine` | `ReactionId \| null` | no | `null` | 현재 사용자가 선택한 리액션 |
| `onPress` | `(postId: string) => void` | no | no-op | 카드 탭 콜백 |
| `onMore` | `(postId: string) => void` | no | no-op | 더보기(`⋯`) 탭 콜백 |
| `onReact` | `(postId: string, id: ReactionId) => void` | no | no-op | 리액션 탭 콜백 |
| `onComment` | `(postId: string) => void` | no | no-op | 댓글 탭 콜백 |

### 사용처

```tsx
// app/(tabs)/community.tsx — following 탭 피드
followingPosts.map((p) => (
  <CommFeedCard
    key={p.id}
    post={p}
    mine={p.id === 'p1' ? 'glass' : null}
    onPress={handlePostPress}
  />
))
```

### 시각 스펙

- 컨테이너: padding 14/16/12, radius 14, border 1 `light.border.default`, bg `light.bg.surface`
- 유저 행: CommUserAvatar 36 + 이름(Freesentation 600 14) + 레벨 pill + ago(12 muted) + MoreHorizontal 14
- 제목: Freesentation_7Bold 19 primary
- 본문: Freesentation_4Regular 14.5 secondary, 3줄 clamp
- WineEmbedCard: v0.1.0 stub Text (note 타입 + wineId 있을 때만)
- ReactionBar: 하단

---

## CommFeedRow

all 탭용 **밀도 높은 리스트 행** — 유저(작게) + 타입 배지 + ago + 제목 + 본문(2줄) + 카운트 footer.

### Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `post` | `CommPost` | yes | — | 포스트 데이터 |
| `onPress` | `(postId: string) => void` | no | no-op | 행 탭 콜백 |

### 사용처

```tsx
// app/(tabs)/community.tsx — all 탭 피드
filteredPosts.map((p) => (
  <CommFeedRow key={p.id} post={p} onPress={handlePostPress} />
))

// app/community/[postId]/index.tsx — column variant Related 섹션
relatedPosts.map((rp) => (
  <CommFeedRow
    key={rp.id}
    post={rp}
    onPress={(rpId) => router.push(`/community/${rpId}`)}
  />
))
```

### 시각 스펙

- 컨테이너: padding 12, mb 6, radius 12, border 1 `light.border.default`, gap 8
- top row: CommUserAvatar 26 + 이름(13 primary) + PostTypeBadge + spacer + ago(12 muted)
- 제목: Freesentation_6SemiBold 17
- 본문: 14.5 secondary, 2줄 clamp
- footer: Wine 11 + glass count, MessageSquare 11 + comment count, (drank > 0) Wine wine-red + drank count

---

## 구조 비교

| | CommFeedCard | CommFeedRow |
|---|---|---|
| 탭 | following | all |
| 아바타 크기 | 36 | 26 |
| 본문 clamp | 3줄 | 2줄 |
| ReactionBar | 있음 | 없음 (카운트만) |
| More 버튼 | 있음 | 없음 |
| WineEmbed | stub 있음 | 없음 |
