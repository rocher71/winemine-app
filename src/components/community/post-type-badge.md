# PostTypeBadge

포스트 종류를 나타내는 **pill 배지**. 아이콘 + 라벨 인라인.

## Props

| Prop | Type | Required | 설명 |
|------|------|----------|------|
| `type` | `PostType` | yes | `'note' \| 'question' \| 'column' \| 'news' \| 'album'` |

`PostType`을 re-export하므로 이 파일에서 import 가능.

## 타입별 스펙

| type | 아이콘 | 색 |
|------|--------|-----|
| note | PenLine | `postTypeBadgeColorLight.note` (deep gold) |
| question | CircleQuestionMark | `postTypeBadgeColorLight.question` (deep green) |
| column | BookOpen | `postTypeBadgeColorLight.column` (#8B7766 warm neutral) |
| news | Sparkles | `postTypeBadgeColorLight.news` (indigo) |
| album | ImageIcon | `postTypeBadgeColorLight.album` (rust) |

> column 타입은 keyscreen의 cream이 light 모드 흰 배경 위에서 invisible → `#8B7766`으로 대체 (§10 F).

## 사용처

```tsx
// CommFeedCard 상단
<View style={{ marginBottom: 10, flexDirection: 'row' }}>
  <PostTypeBadge type={post.type} />
</View>

// CommFeedRow top row (텍스트 사이에 인라인)
<PostTypeBadge type={post.type} />

// [postId]/index.tsx 모든 variant 상단
<View style={{ flexDirection: 'row' }}>
  <PostTypeBadge type={post.type} />
</View>
```

## 시각 스펙

- padding: vertical 3, horizontal 9. borderRadius 999 (pill)
- bg: `color + 10% alpha`, border: `color + 33% alpha`
- icon: 10px strokeWidth 2
- 라벨: Freesentation_4Regular 10 weight 600 letterSpacing 0.4
- i18n 키: `community.postType.{type}`
