# CommUserAvatar

커뮤니티 화면 전반에서 사용하는 **사용자 아바타**. 레벨별 그라디언트 원형 + 이니셜.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `levelId` | `1 \| 2 \| 3 \| 4 \| 5` | yes | — | 레벨 (그라디언트 결정) |
| `initial` | `string` | yes | — | 아바타 중앙 이니셜 (첫 글자) |
| `size` | `number` | no | `36` | 아바타 지름(px). borderRadius = size/2 자동 계산 |
| `userId` | `string` | no | `undefined` | asLink=true 시 프로필 라우팅용 |
| `asLink` | `boolean` | no | `false` | true 시 Pressable 래핑 (v0.1.0은 onPress no-op) |

## 레벨별 그라디언트

`noteAuthorAvatarGradient[L1~L5]` 토큰 사용. 보더 색 = `startColor + 53% alpha`.

## 사용처 & 크기

| 화면 | 크기 | asLink |
|------|------|--------|
| CommFeedCard 유저 행 | 36 | false |
| CommFeedRow 유저 행 | 26 | false |
| CommentRow | 24(reply) / 30(root) | false |
| [postId]/index.tsx UserRow | 36 | false |
| [postId]/index.tsx ComposeFooter | 32 | false |
| /community/tonight EntryRow | 28 | true |
| /community/discover UserCard | 48 | true |
| home-community-peek.tsx | (가변) | false |

## 사용 예시

```tsx
// 카드 내부 (outer Pressable 안 — asLink=false 필수)
<CommUserAvatar levelId={user.level} initial={user.initial} size={36} asLink={false} />

// 독립 클릭 가능 (tonight EntryRow)
<CommUserAvatar
  levelId={user.level}
  initial={user.initial}
  userId={entry.userId}
  size={28}
  asLink
/>
```

## 주의사항

- **`asLink=false` 기본값** — outer `Pressable` 안에 들어갈 때 nested Pressable 충돌 방지 (§4-11)
- `asLink=true`이어도 v0.1.0에서는 `/profile/{userId}` route 미존재 → onPress no-op. 호출처에서 Toast 처리 권장
- `flexShrink: 0` 적용됨 — flex container에서 크기 보존
