# ReactionBar

커뮤니티 포스트의 **리액션(4종) + 댓글 카운트 버튼** 행.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `reactions` | `Partial<CommReactions>` | no | `{}` | 각 리액션 카운트 |
| `comments` | `number` | no | `0` | 댓글 수 |
| `mine` | `ReactionId \| null` | no | `null` | 현재 사용자가 선택한 리액션 (on 상태 표시) |
| `onReact` | `(id: ReactionId) => void` | no | no-op | 리액션 탭 콜백 |
| `onComment` | `() => void` | no | no-op | 댓글 버튼 탭 콜백 |

`CommReactions` = `{ glass, sparkle, bookmark, drank }` (모두 number).  
`ReactionId` = `'glass' | 'sparkle' | 'bookmark' | 'drank'`.

## 리액션 4종

| id | 아이콘 | 색 토큰 | 의미 |
|----|--------|---------|------|
| glass | Wine | `reactionColor.glass` (gold) | 잔 들기 |
| sparkle | Sparkles | `reactionColor.sparkle` (cream) | 통찰 |
| bookmark | Bookmark | `reactionColor.bookmark` (purple) | 저장 |
| drank | Bot | `reactionColor.drank` (wine-red) | 나도 마심 |

## 사용처

```tsx
// CommFeedCard
<ReactionBar
  reactions={post.reactions}
  comments={post.comments}
  mine={mine}
  onReact={(id) => onReact?.(post.id, id)}
  onComment={() => onComment?.(post.id)}
/>

// [postId]/index.tsx — NoteVariant / ColumnVariant / QuestionVariant / AlbumVariant / NewsVariant
<ReactionBar
  reactions={post.reactions}
  comments={post.comments}
  mine={mine}
  onComment={handleComment}
/>
```

## 시각 스펙 (on/off 상태)

| 상태 | bg | border | 텍스트/아이콘 |
|------|-----|--------|--------------|
| off | transparent | `light.border.default` | `light.text.secondary` |
| on | `item.color + 13% alpha` | `item.color` | `item.color` |

- 버튼 padding: vertical 6, right 10, left 8. borderRadius 999.
- 아이콘: 13px strokeWidth 1.75
- 카운트: Freesentation_4Regular 11 weight 600 (카운트 0이면 숨김)
- 댓글 버튼: MessageSquare 12 + 카운트 텍스트 11 weight 500 muted. 우측 정렬 (`flex:1` 공간 사용)
