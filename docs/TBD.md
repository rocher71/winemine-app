# TBD — winemine-app 결정 필요 항목

라이브러리·설정 선택. spec writer 실행 시 사용자에게 묻고 결정.

> winemine-specs/TBD.md는 contract·도메인 결정. 이 파일은 winemine-app 구현 결정.

---

## 라이브러리 선택

| 항목 | 옵션 |
|---|---|
| Navigation | **Expo Router** (권장 — Expo 표준) vs React Navigation |
| 스타일링 | **NativeWind** (Tailwind, 권장) vs StyleSheet vs styled-components |
| 상태 관리 | **Zustand** (권장) vs Jotai vs Redux Toolkit |
| 네트워크 wrapper | **Supabase client 직접** (권장 v0.1.0) vs TanStack Query |
| 아이콘 | **lucide-react-native** (권장 — 키스크린 일관성) vs @expo/vector-icons |
| i18n | **i18next** (권장) vs lingui vs format.js |
| 지도 | react-native-maps vs MapLibre GL vs Mapbox (v0.2.0에서 결정 — v0.1.0 defer) |
| 차트 | Victory Native vs react-native-svg + 직접 (v0.1.0 placeholder만) |
| 환경변수 | **expo-constants** (권장) vs react-native-config |
| Expo SDK 버전 | **51+ 권장** (현재 LTS) |

---

## 테스트 도구

| 항목 | 옵션 |
|---|---|
| RN 단위/스냅샷 | **Jest + React Native Testing Library** (권장, Expo 표준) |
| Edge Functions | **Deno test** (built-in, 권장) |
| DB / RLS | **Supabase CLI local + SQL 단위 테스트** |
| E2E (v0.2.0) | Detox vs Maestro (defer) |

---

## 환경변수 (확정)

- `EXPO_PUBLIC_SUPABASE_URL` — `https://<project>.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — public anon key
- **금지**: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` — Supabase Dashboard Secrets만

---

## 결정 로그

(결정 후 본 표에서 제거하고 여기에 누적)

### 2026-05-19 — 아키텍처 Plan D 확정

- Full Supabase 1-repo
- Supabase Auth (anonymous + JWT)
- 6개월간 결제 없음, v2.0에서 Spring 전환 검토
- 상세 근거는 winemine-specs/TBD.md #15
