# EmptyState

데이터 없음 / 빈 목록 / 오류 상태를 나타내는 **공통 레이아웃 컴포넌트**.

## Props

| Prop | Type | Required | Default | 설명 |
|------|------|----------|---------|------|
| `title` | `string` | yes | — | 주 제목 (Playfair, `text-empty-title`) |
| `description` | `string` | no | `undefined` | 보조 설명 (Inter, `text-card-body`) |
| `illustration` | `ReactNode` | no | `undefined` | 아이콘 또는 이미지 — title 위에 배치 |
| `action` | `ReactNode` | no | `undefined` | CTA 버튼 등 — description 아래에 배치 |

## 언제 사용하는가

- 리스트가 **완전히 비어있을 때** (데이터 자체 없음)
- 오류로 데이터를 **불러오지 못했을 때**
- 검색/필터 결과가 아닌 순수 빈 상태 (`NoResults`와 구분)

| 상황 | 컴포넌트 |
|------|---------|
| 데이터 자체 없음 | `EmptyState` |
| 데이터는 있지만 필터 결과 0건 | `NoResults` |
| 로딩 중 | `ActivityIndicator` |

## 기본 사용법

```tsx
<EmptyState
  title={t('cellar.empty.title')}
  description={t('cellar.empty.sub')}
/>
```

## 시나리오별 활용

### 1. 셀러 비어있음 — 아이콘 + CTA

```tsx
<EmptyState
  illustration={<GlassWater size={56} strokeWidth={1.25} color={brand.gold} />}
  title={t('cellar.empty.title')}
  description={t('cellar.empty.sub')}
  action={
    <PrimaryButton
      label={t('cellar.empty.cta')}
      size="md"
      onPress={() => router.push('/(tabs)/capture')}
    />
  }
/>
```

### 2. 아이템 미발견 — 아이콘 + 돌아가기 버튼

```tsx
<View className="flex-1 items-center justify-center px-6">
  <AlertCircle size={48} strokeWidth={1.5} color={brand.gold} />
  <View className="mt-4">
    <EmptyState
      title={t('cellar.detail.notFound.title')}
      description={t('cellar.detail.notFound.description')}
      action={
        <PrimaryButton
          label={t('cellar.detail.notFound.back')}
          size="md"
          variant="secondary"
          onPress={() => router.back()}
        />
      }
    />
  </View>
</View>
```

> illustration 없이 아이콘을 직접 위에 배치하는 패턴 — EmptyState 위에 `AlertCircle`을 직접 렌더 후 `mt-4` 간격.

### 3. tasted 탭 비어있음 — 설명만

```tsx
<EmptyState
  title={t('cellar.tasted.empty')}
  description={t('cellar.tasted.emptyHint')}
/>
// 아이콘도 CTA도 없음 — 타이틀 + 설명만
```

### 4. 노트 목록 비어있음

```tsx
<EmptyState
  illustration={<BookOpen size={48} strokeWidth={1.25} color={brand.gold} />}
  title={t('notes.empty.title')}
  description={t('notes.empty.sub')}
  action={
    <PrimaryButton
      label={t('notes.empty.cta')}
      size="md"
      onPress={() => router.push('/notes/new/source')}
    />
  }
/>
```

### 5. FlatList ListEmptyComponent에서 사용

```tsx
const renderEmpty = () => {
  if (loading) return <ActivityIndicator />;
  return (
    <EmptyState
      title="검색 결과가 없습니다"
      description="다른 검색어를 입력해 보세요"
    />
  );
};

<FlatList
  data={items}
  ListEmptyComponent={renderEmpty}
  ...
/>
```

## 시각 스펙

- 컨테이너: `flex-1 items-center justify-center px-6`
- illustration 아래 간격: `marginBottom: 16`
- title: `font-playfair text-empty-title text-text-primary`, 중앙 정렬
- description: `font-inter text-card-body text-text-muted`, `mt-3`, 중앙 정렬
- action: `mt-6`

## 주의사항

- `flex-1`이 적용되어 있어 부모 컨테이너가 충분한 높이를 줘야 중앙 정렬이 동작
- `illustration`은 `ReactNode` — 어떤 컴포넌트든 전달 가능, 내부에서 `View`로 감쌈
- 로딩 상태(`loading=true`)에서는 EmptyState 대신 `ActivityIndicator` 사용
