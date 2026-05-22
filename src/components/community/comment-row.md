# CommentRow

포스트 상세 화면의 **댓글 / 대댓글 행**.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `userId` | `string` | yes | — | 댓글 작성자 userId (mock getCommunityUser 조회) |
| `ago` | `string` | yes | — | 경과 시간 문자열 ("3시간 전" 등) |
| `text` | `string` | yes | — | 댓글 본문 |
| `reactions` | `number` | no | `0` | 이 댓글에 달린 리액션 수 |
| `isReply` | `boolean` | no | `false` | 대댓글 여부 (true 시 36px 들여쓰기, 아바타 24px) |
| `expert` | `boolean` | no | `false` | 전문가 배지 표시 여부 |
| `onReply` | `(userId: string) => void` | no | no-op | 답글 버튼 탭 콜백 |
| `onReact` | `(userId: string) => void` | no | no-op | 리액션 버튼 탭 콜백 |

## 사용처

```tsx
// [postId]/index.tsx — CommentsPreview (NoteVariant), QuestionVariant answers, AlbumVariant, NewsVariant
previewComments.map((c) => (
  <CommentRow
    key={c.id}
    userId={c.userId}
    ago={c.ago}
    text={localizedBody(c, i18n.language)}
    reactions={c.reactions}
    isReply={c.isReply}
    expert={c.isExpert}
  />
))

// /community/[postId]/comments.tsx (전체 댓글 목록)
```

## 시각 스펙

- 레이아웃: flexDirection row, gap 10, paddingVertical 10
- 들여쓰기: `isReply ? paddingLeft: 36 : 0`
- 하단 hairline: `StyleSheet.hairlineWidth light.border.default`
- 아바타 크기: `isReply ? 24 : 30`
- 이름: Freesentation 600 11 primary (Pressable — v0.1.0 profile 미존재 no-op)
- 레벨 pill: borderRadius 999, `user.color` 배경/테두리 alpha, fontSize 9
- expert 배지: gold alpha bg, `light.border.active` 텍스트 (§6-5 deviation)
- 본문: Freesentation_4Regular 12 lineHeight 18.6 secondary
- footer: ago(10 muted) + 답글(10 muted) + spacer + [Wine icon 11 + 리액션 수]
