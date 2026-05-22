# CommunityBackHeader

커뮤니티 서브 화면(tonight / discover / templates 등 Stack 내부 depth 화면)에서 공통으로 쓰는 **백 헤더**. light-only 전용.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `title` | `string` | no | `undefined` | 헤더 타이틀. 미전달 시 백 버튼만 표시 |
| `showBorder` | `boolean` | no | `!!title` | 하단 hairline 보더 표시 여부 |
| `onBack` | `() => void` | no | `router.back()` | 커스텀 뒤로가기 핸들러 |

## 변형 패턴

### 타이틀 없음 (tonight 화면 — 헤더가 배경과 자연스럽게 이어짐)

```tsx
<CommunityBackHeader />
```

### 타이틀 + 보더 (discover, templates 화면)

```tsx
<CommunityBackHeader title={t('community.discover.headerTitle')} />
```

### 커스텀 뒤로가기

```tsx
<CommunityBackHeader
  title={t('community.myPage.title')}
  onBack={() => router.push('/(tabs)/community')}
/>
```

## 사용 화면

| 화면 | 파일 | 변형 |
|------|------|------|
| /community/tonight | `app/community/tonight.tsx` | 타이틀 없음, 보더 없음 |
| /community/discover | `app/community/discover.tsx` | 타이틀 있음, 보더 있음 |
| /community/templates | `app/community/templates.tsx` | 타이틀 있음, 보더 있음 |

## 비슷한 컴포넌트와의 차이

| 컴포넌트 | 특징 | 사용처 |
|----------|------|--------|
| `CommunityBackHeader` | light-only, Freesentation, 타이틀 optional | 커뮤니티 서브 화면 |
| `BackHeader` (`nav/`) | dark/light NativeWind, 타이틀 필수, right slot | 셀러·노트 등 전역 화면 |
| `LightBackHeader` in `[postId]/index.tsx` | Share/Bookmark 우측 액션 포함, 고정 높이 56 | 포스트 상세만 (inline 유지) |
| `LightCloseHeader` in `new/index.tsx` | X 버튼 + 가운데 타이틀 + 우측 spacer | 글 작성 picker만 (inline 유지) |

> `[postId]/index.tsx`의 헤더는 Share/Bookmark 버튼 로직이 포스트 상태와 결합되어 있고, `new/index.tsx`는 X 버튼 레이아웃(가운데 정렬)이 달라 별도 파일 추출 실익이 낮아 현재 inline 유지.

## 시각 스펙

- 배경: `light.bg.deepest`
- paddingTop: `insets.top + 8` | paddingBottom: `8` | paddingHorizontal: `16`
- 백 버튼: ChevronLeft 24 strokeWidth 1.75 `light.text.primary`
- hit target: `width:32 height:32` + `hitSlop:8`
- 타이틀: Freesentation_4Regular 600 16 `light.text.primary`, `marginLeft: 4`
- 보더: `StyleSheet.hairlineWidth` `light.border.default`
