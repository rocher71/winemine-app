---
name: rn-screen-impl
description: "winemine RN+Expo 화면 구현 가이드. expo-router 파일 기반 라우팅, NativeWind v4 className, 디자인 토큰 적용, expo-camera/Storage 통합, supabase 직접 호출, BeginnerForm/ExpertForm, BottomSheet, swipe action, 다크/라이트·ko/en 양쪽 모드 동작. 12 화면(온보딩 4, 홈, 캡처, 와인 상세, 셀러 리스트/상세, 노트 source/write/detail, 설정 4) 구현 요청 시 사용."
---

# RN Screen Implementation — winemine 12 화면 구현 패턴

이 스킬은 rn-screen-builder가 화면을 구현할 때 따르는 절차다.

## 진실 소스 우선순위

1. `docs/spec/v0.1.0.md`의 `<pages_and_interfaces>` — 각 화면 레이아웃·데이터·인터랙션
2. `../winemine-keyscreen/pages/{route}.md` — Phase 2 시안 상세 (복붙 X, 변환 input)
3. `../winemine-keyscreen/docs/design-system/*` — 디자인 토큰 (RN으로 변환된 design-tokens.ts와 일치)
4. `../winemine-keyscreen/src/lib/{drink-window,xp,compatibility}.ts` — 비즈니스 로직 변환 base (SQL 함수로 옮기는 것이 원칙이지만 클라이언트 헬퍼가 필요한 경우)

## 데이터 호출 표준 패턴

### 와인 단건 (LWIN으로)

```ts
const { data, error } = await supabase
  .from('wines_localized')
  .select('*')
  .eq('lwin', lwin)
  .single();
// data: { lwin, display_name, name_ko, producer_name, country, region, type_canonical, bottle_color, drink_window_*, vintage, ... }
```

### 사용자 노트 리스트 (with 와인 join)

```ts
const { data } = await supabase
  .from('tasting_notes')
  .select('*, wine:wines_localized!inner(lwin, display_name, name_ko, bottle_color, type_canonical, vintage)')
  .eq('user_id', uid)  // RLS 자동 적용되지만 명시
  .order('tasted_at', { ascending: false })
  .limit(3);
```

### 와인 검색 (한글+영문 동시)

```ts
const { data } = await supabase
  .from('wines_localized')
  .select('lwin, display_name, name_ko, producer_name, vintage, bottle_color, type_canonical')
  .or(`display_name.ilike.%${q}%,name_ko.ilike.%${q}%`)
  .limit(20);
```

trigram 인덱스가 이미 양쪽에 걸려있어 빠름.

### INSERT 노트 (zod 검증 후)

```ts
import { z } from 'zod';

const NoteInputSchema = z.object({
  wine_lwin: z.string().regex(/^\d{7}$|^\d{11}$|^\d{13}$/),
  mode: z.enum(['beginner', 'expert']),
  rating: z.number().min(0).max(5).multipleOf(0.5).optional(),
  tasted_at: z.string().refine(d => new Date(d) <= new Date(), 'not future'),
  source: z.enum(['cellar','restaurant','shop','gift','tasting_event','other']).optional(),
  beginner_fields: z.object({...}).optional(),
  expert_fields: z.object({...}).optional(),
});

const parsed = NoteInputSchema.parse(input);
const { data, error } = await supabase
  .from('tasting_notes')
  .insert({ user_id: session.user.id, ...parsed })
  .select()
  .single();
```

## 와인명 표시 — WineNameDisplay 일관 사용

모든 와인명 표시는 다음 컴포넌트 사용:

```tsx
<WineNameDisplay
  lwin={wine.lwin}
  name_ko={wine.name_ko}
  display_name={wine.display_name}
  size="card" | "title" | "meta"
/>
```

내부 로직:
- ko 모드 + name_ko 있음 → name_ko
- ko 모드 + name_ko 없음 → display_name + 작은 "EN" 칩 (--color-text-muted)
- en 모드 → display_name

## bottle_color 결정 (WineCard, WineHero)

```ts
import { getDefaultBottleColor } from '@/lib/lwin';

const color = wine.bottle_color ?? getDefaultBottleColor(wine.type_canonical);
const gradient = `linear-gradient(160deg, ${color} 0%, #1a0a1e 80%)`;
```

RN에서 linear-gradient는 `expo-linear-gradient` 또는 `react-native-svg`로 구현.

## NativeWind 사용 원칙

- className 우선: `className="bg-surface text-text-primary px-4 py-3 rounded-lg"`
- 토큰은 tailwind.config.ts에 등록된 이름만 사용 (`bg-surface`, `text-text-primary` 등). 하드코딩 hex 금지.
- 동적 값은 style prop: `style={{ backgroundColor: bottle_color }}` (예외 허용 — 30개 와인 색)
- 다크/라이트: NativeWind v4의 `dark:` 변형은 RN에서 useColorScheme + className 결합으로

## expo-router 파일 기반 라우팅

| URL | 파일 |
|---|---|
| `/` | `app/(tabs)/index.tsx` |
| `/capture` | `app/(tabs)/capture.tsx` |
| `/cellar` | `app/(tabs)/cellar/index.tsx` |
| `/cellar/:lwin` | `app/(tabs)/cellar/[lwin].tsx` |
| `/wine/:lwin` | `app/wine/[lwin].tsx` |
| `/notes/new` | `app/notes/new.tsx` |
| `/notes/new/write` | `app/notes/new/write.tsx` |
| `/notes/:noteId` | `app/notes/[noteId].tsx` |
| `/settings/*` | `app/(tabs)/settings/*.tsx` |
| `/onboarding/*` | `app/onboarding/*.tsx` |

`useLocalSearchParams()`로 파라미터 추출. LWIN은 text (parseInt 금지).

## 캡처 화면 흐름

```ts
// 1. 권한
const [permission, requestPermission] = useCameraPermissions();

// 2. 촬영 또는 갤러리
const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
// 또는 await ImagePicker.launchImageLibraryAsync({ ... });

// 3. Storage 업로드
const path = `${session.user.id}/${uuid()}.jpg`;
const { data: uploadData } = await supabase.storage
  .from('label-photos')
  .upload(path, blob, { contentType: 'image/jpeg' });
const photoUrl = supabase.storage.from('label-photos').getPublicUrl(path).data.publicUrl;

// 4. label-scan invoke
const { data: scan } = await supabase.functions.invoke('label-scan', {
  body: { photo_url: photoUrl }
});

// 5. wines_localized 조회
const { data: wine } = await supabase
  .from('wines_localized').select('*').eq('lwin', scan.lwin).single();

// 6. LabelScanResultModal 표시 → "기록하기" → /notes/new/write?wine_lwin={lwin}&photo_url={photoUrl}
```

## 절대 금지

- 사용자 UUID UI 표시 (`session.user.id` 직접 노출 X) — profiles.anonymous_display만
- 와인명을 `display_name`만 직접 사용 — 반드시 WineNameDisplay 거치기
- 하드코딩 hex (bottle_color, brand-fixed Gold 외)
- emoji
- inline style의 색상값 (bottle_color 예외)
- `SUPABASE_SERVICE_ROLE_KEY` import (어떤 형태든)
- mock 데이터 RN 코드에 하드코딩 (와인은 wines_localized에서, 사용자 데이터는 사용자 입력)

## 다크/라이트·ko/en 검증 (구현 직후 자체 점검)

- 빌드 후 두 모드 모두에서 화면 렌더 — 시뮬레이터 Cmd+Shift+A 또는 settings/appearance에서 토글
- 영어 모드에서 한글 노출 없는지 화면 살펴보기 (와인명 fallback 제외)
- 텍스트 잘림·overflow 없는지

이후 qa-inspector에게 SendMessage로 incremental 검증 요청.

## 자세한 reference

각 화면 명세: `docs/spec/v0.1.0.md`의 `<pages_and_interfaces>` + `../winemine-keyscreen/pages/{route}.md`
