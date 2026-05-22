# Community Components

커뮤니티 탭 (`/(tabs)/community`) 및 서브 화면 전체에서 사용하는 컴포넌트 카탈로그.

---

## 화면 트리

### 커뮤니티 메인 `/(tabs)/community`

```
Animated.View (scroll-aware 헤더)
  View (left: eyebrow + 탭별 타이틀)
  View (right: BellButton (nav/) + LevelChip (shared/))

ScrollView
  [Tab bar — all / following]
    Pressable × 2 (inline TabButton 패턴)

  [following 탭]
    View (피드 리스트)
      CommFeedCard × N
    EmptyState (inline — community 전용 Freesentation 스타일)

  [all 탭]
    ScrollView (horizontal)
      Pressable × 6 (TypeFilter chip — inline, pill 패턴)
    View (피드 리스트)
      CommFeedRow × N
    EmptyState (inline)

FAB (absolute outer View)
  Pressable → LinearGradient + PenLine
```

### 포스트 상세 `/community/[postId]`

```
LightBackHeader (inline — Share/Bookmark 우측 액션 포함)
ScrollView
  [note]    NoteVariant → PostTypeBadge + UserRow + ReactionBar + AlsoTriedCta + CommentsPreview
  [column]  ColumnVariant → 히어로 + PostTypeBadge + UserRow + ReactionBar + CommFeedRow × 2 (Related)
  [question] QuestionVariant → PostTypeBadge + UserRow + ReactionBar + 추천 와인 목록 + CommentRow × 3
  [album]   AlbumVariant → PostTypeBadge + UserRowInline + 포토 그리드 + ReactionBar + CommentRow × 2
  [news]    NewsVariant → PostTypeBadge + UserRow + ReactionBar + CommentRow × 2
ComposeFooter (absolute 하단 고정 — column 제외)
  CommUserAvatar + Composer pill + Send btn
```

### 글 작성 `/community/new`

```
LightCloseHeader (inline — X 버튼 + 가운데 타이틀)
ScrollView
  IntroSection (inline)
  CardsList
    PostTypeCard × 5 (inline)
  TonightCta (inline)
```

### 오늘 밤 `/community/tonight`

```
CommunityBackHeader (title 없음, 보더 없음)
ScrollView
  Hero (inline)
  SeoulDotMap (inline SVG)
  ParticipateCta (inline)
  SectionLabel (inline)
  EntriesList
    EntryRow × 5 (inline)
      CommUserAvatar
```

### 팔로우 추천 `/community/discover`

```
CommunityBackHeader title="community.discover.headerTitle"
ScrollView
  HeaderSection (inline)
  UserCardsList
    UserCard × 5 (inline)
      CommUserAvatar
      LevelPill (inline — discover 전용 §10-G text color deviation)
      CompatibilityBar (inline)
      FollowButton (inline)
```

### 양식 보관함 `/community/templates`

```
CommunityBackHeader title="community.templates.headerTitle"
ScrollView
  Intro (inline)
  SortToggle
    SortChip × 2 (inline)
  TemplatesList
    TemplateCard × N (inline)
      LocaleText (shared/)
      BookmarkToggleBtn (inline)
  Toast (shared/)
```

---

## 컴포넌트 레퍼런스

### CommunityBackHeader
**파일:** `community-back-header.tsx` · **문서:** `community-back-header.md`

| Prop | Type | 설명 |
|------|------|------|
| `title` | `string?` | 헤더 타이틀. 미전달 시 백 버튼만 |
| `showBorder` | `boolean?` | 하단 hairline. 기본: `!!title` |
| `onBack` | `() => void?` | 커스텀 뒤로가기 |

tonight(no title/border) / discover·templates(title+border) 두 변형을 통합.

---

### CommFeedCard
**파일:** `comm-feed-card.tsx` · **문서:** `comm-feed-card.md`

| Prop | Type | 설명 |
|------|------|------|
| `post` | `CommPost` | 포스트 데이터 |
| `mine` | `ReactionId \| null` | 내 리액션 |
| `onPress` | `(id) => void?` | 카드 탭 |
| `onMore` | `(id) => void?` | 더보기 탭 |
| `onReact` | `(id, r) => void?` | 리액션 탭 |
| `onComment` | `(id) => void?` | 댓글 탭 |

following 탭 풀 카드. `CommUserAvatar` + `PostTypeBadge` + `ReactionBar` 내장.

---

### CommFeedRow
**파일:** `comm-feed-card.tsx` · **문서:** `comm-feed-card.md`

| Prop | Type | 설명 |
|------|------|------|
| `post` | `CommPost` | 포스트 데이터 |
| `onPress` | `(id) => void?` | 행 탭 |

all 탭 밀도 높은 리스트 행. column variant Related 섹션에서도 재사용.

---

### CommUserAvatar
**파일:** `comm-user-avatar.tsx` · **문서:** `comm-user-avatar.md`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `levelId` | `1~5` | — | 레벨 → 그라디언트 |
| `initial` | `string` | — | 이니셜 |
| `size` | `number` | `36` | 지름 px |
| `userId` | `string?` | — | asLink 라우팅용 |
| `asLink` | `boolean` | `false` | Pressable 래핑 여부 |

커뮤니티 전 화면에서 사용. Outer Pressable 안에 들어갈 땐 `asLink=false`.

---

### PostTypeBadge
**파일:** `post-type-badge.tsx` · **문서:** `post-type-badge.md`

| Prop | Type | 설명 |
|------|------|------|
| `type` | `PostType` | `note \| question \| column \| news \| album` |

피드 카드, 피드 행, 포스트 상세 모든 variant에서 사용.

---

### ReactionBar
**파일:** `reaction-bar.tsx` · **문서:** `reaction-bar.md`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `reactions` | `Partial<CommReactions>` | `{}` | 리액션 카운트 |
| `comments` | `number` | `0` | 댓글 수 |
| `mine` | `ReactionId \| null` | `null` | 내 리액션 (on 상태) |
| `onReact` | `(id) => void?` | — | 리액션 탭 |
| `onComment` | `() => void?` | — | 댓글 탭 |

glass / sparkle / bookmark / drank 4종 + 댓글 버튼. CommFeedCard · 포스트 상세 5 variant에서 사용.

---

### CommentRow
**파일:** `comment-row.tsx` · **문서:** `comment-row.md`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `userId` | `string` | — | 댓글 작성자 |
| `ago` | `string` | — | 경과 시간 |
| `text` | `string` | — | 본문 |
| `reactions` | `number` | `0` | 리액션 수 |
| `isReply` | `boolean` | `false` | 대댓글 (들여쓰기) |
| `expert` | `boolean` | `false` | 전문가 배지 |
| `onReply` | `(userId) => void?` | — | 답글 탭 |
| `onReact` | `(userId) => void?` | — | 리액션 탭 |

포스트 상세 4개 variant + comments 화면에서 사용.

---

### CommunityShortcutCard
**파일:** `community-shortcut-card.tsx` · **문서:** `community-shortcut-card.md`

Props 없음. 홈 화면 전용 커뮤니티 진입 카드. 최신 포스트 제목 preview 자동 표시.

---

## 공유 컴포넌트 (커뮤니티에서 사용)

| 컴포넌트 | 파일 | 커뮤니티 사용처 |
|----------|------|----------------|
| `BellButton` | `nav/bell-button.tsx` | 메인 탭 헤더 우측 |
| `LevelChip` | `shared/level-chip.tsx` | 메인 탭 헤더 우측 |
| `LocaleText` | `shared/locale-text.tsx` | templates TemplateCard |
| `Toast` | `shared/toast.tsx` | templates bookmark 토글, CommunityShortcutCard |

---

## 인라인 컴포넌트 (파일 내 분리 — 추출 미해당)

아래 컴포넌트는 현재 각 화면 파일 내에 함수로 선언되어 있으며, 해당 화면 내에서만 쓰임. 재사용 범위가 단일 화면에 한정되어 별도 파일 추출 실익이 낮음.

| 컴포넌트 | 위치 | 비고 |
|----------|------|------|
| `EmptyState` | `(tabs)/community.tsx` | Freesentation 스타일 커뮤니티 전용. shared/EmptyState와 폰트 다름 |
| `LightBackHeader` | `[postId]/index.tsx` | Share/Bookmark 우측 액션 포함 — 재사용 시 props 확장 검토 |
| `LightCloseHeader` | `new/index.tsx` | X 버튼 + 가운데 타이틀 레이아웃 |
| `UserRow` / `UserRowInline` | `[postId]/index.tsx` | 두 함수가 marginTop 유무만 다름 — v0.2.0 때 통합 검토 |
| `WineEmbedStub` | `[postId]/index.tsx` | Wine 아이콘 + 이름 + ChevronRight 카드. v0.2.0 실 데이터 연결 시 분리 |
| `CommentsPreview` | `[postId]/index.tsx` | 포스트 상세에서만 사용 |
| `ComposeFooter` | `[postId]/index.tsx` | 포스트 상세 하단 댓글 입력 bar |
| `Hero` / `SeoulDotMap` / `ParticipateCta` / `EntryRow` | `tonight.tsx` | tonight 화면 전용 |
| `UserCard` / `CompatibilityBar` | `discover.tsx` | discover 화면 전용 |
| `SortToggle` / `SortChip` / `TemplateCard` | `templates.tsx` | templates 화면 전용 |
| `PostTypeCard` / `TonightCta` | `new/index.tsx` | new 화면 전용 |
