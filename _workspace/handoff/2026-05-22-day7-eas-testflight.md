# 핸드오프: Day 7 — EAS Build → TestFlight → Production

> 작성: 2026-05-22
> 사전 완료: Day 1~6 (인프라 + 10 마이그레이션 + Edge Function + 12 화면 + 디자인 polishing + lint pass)
> 이 문서: Apple Developer 계정/Supabase production 접근이 필요한 단계만 정리. 사용자 직접 실행.

---

## 사전 점검 (자동 — 사용자 직접 실행 불필요)

다음은 이미 자동화·검증된 상태:

| 항목 | 상태 | 확인 |
|---|---|---|
| `eas.json` (preview + production profiles) | OK | `cat eas.json` |
| `app.config.ts` (bundleId, splash, permissions) | OK | `cat app.config.ts` |
| `npm run lint:hex` | PASS | 0 violations |
| `npm run lint:emoji` | PASS | 0 violations |
| `npx tsc --noEmit` | PASS (Deno/nativewind 제외) | docs/spec/v0.1.0.md 사전 존재 에러 |
| 마이그레이션 10개 (로컬 검증 완료) | OK | `supabase/migrations/` |
| `supabase/tests/{rls_*,wines_localized_view}.sql` | OK | 3개 파일 |

---

## Step 1 — EAS CLI / 계정 셋업 (사용자 1회)

```bash
npm i -g eas-cli
eas login                  # Expo 계정 (https://expo.dev)
eas whoami                 # 확인
eas init                   # 프로젝트와 EAS 연결 (extra.eas.projectId 자동 추가)
```

`app.config.ts`의 `extra.eas.projectId`가 자동 채워지는지 확인. 안 채워지면 수동 추가.

---

## Step 2 — Apple Developer 계정 자격 등록 (사용자 1회)

`eas credentials --platform ios`로 인터랙티브 등록:
- Apple ID + 앱별 비밀번호 (또는 Apple Developer Team ID + App Store Connect API Key)
- iOS Distribution Certificate 신규 생성
- Provisioning Profile 신규 생성 (com.winemine.app)
- App Store Connect의 앱 등록 (Bundle ID `com.winemine.app`)

`eas.json`의 `submit.preview.ios` 3개 placeholder를 실제 값으로 교체:
- `appleId`: Apple ID 이메일
- `ascAppId`: App Store Connect 앱 ID (숫자)
- `appleTeamId`: Apple Developer Team ID (10자 영숫자)

또는 EAS Secrets로 주입 가능 (`eas secret:create` — `EAS_SUBMIT_APPLE_ID` 등).

---

## Step 3 — Production Supabase 마이그레이션 push

**⚠️ CRITICAL — 기존 wines/wine_korean_names 손상 0 검증 필수 (§4-6, spec test_scenario_12)**

```bash
# 1) 사전 count 기록
psql "$SUPABASE_PROD_URL" -c "SELECT 'wines' AS t, count(*) FROM public.wines UNION ALL SELECT 'wine_korean_names', count(*) FROM public.wine_korean_names;" | tee /tmp/winemine-pre.txt

# 2) link → push
supabase link --project-ref <project-ref>
supabase db push --linked
# 또는 dry-run: supabase db diff --linked

# 3) push 후 count 재확인 — 값 동일해야 함
psql "$SUPABASE_PROD_URL" -c "SELECT 'wines' AS t, count(*) FROM public.wines UNION ALL SELECT 'wine_korean_names', count(*) FROM public.wine_korean_names;" | tee /tmp/winemine-post.txt

diff /tmp/winemine-pre.txt /tmp/winemine-post.txt
# diff 출력이 없어야 함 (count 변동 0). 변동 있으면 즉시 rollback 필요.
```

추가로:
- `EXPO_PUBLIC_ANONYMIZATION_SALT_DEV` 같은 dev salt는 production에서 사용 금지 — Supabase Vault에 `winemine_anonymization_salt` 따로 설정 (마이그레이션 20260520000000_anonymize_use_vault.sql 의도).
- Anonymous Auth가 production Supabase에서 ON 되어 있는지 Dashboard 확인.

---

## Step 4 — Edge Function 배포

```bash
supabase functions deploy label-scan --linked
# verify_jwt 기본 ON — 익명 사용자도 JWT 통해 호출되므로 OK
```

---

## Step 5 — Preview iOS 빌드

```bash
eas build --profile preview --platform ios
# 15~20분 소요. 진행상황은 https://expo.dev/accounts/<owner>/projects/winemine-app/builds 에서 확인.
```

빌드 완료 후 `.ipa` 다운로드 또는 EAS에서 직접 TestFlight 업로드.

### 빌드 사이즈 검증 (success_criteria <50MB)

`eas build` 완료 후:
```bash
# 빌드 결과 .ipa 다운로드 → 사이즈 확인
curl -sLO <build_url_from_eas_dashboard>
ls -lh winemine-preview.ipa | awk '{print $5}'
# <50MB 확인
```

---

## Step 6 — TestFlight 업로드

```bash
eas submit --profile preview --platform ios --latest
# --latest는 가장 최근 빌드를 업로드
```

또는 빌드 시 자동:
```bash
eas build --profile preview --platform ios --auto-submit
```

App Store Connect에서 TestFlight 진입 → 내부 테스터 그룹 생성 → 사용자 1명 초대.

---

## Step 7 — Internal Tester 시나리오 (test_scenario_11)

내부 테스터 디바이스에서:
1. TestFlight 앱 → winemine 설치
2. 첫 실행 → onboarding 1-welcome → 2-language → 3-experience → 4-mode → home 도달
3. capture FAB tap → 카메라 권한 허용 → 라벨 촬영 → label-scan mock 응답 → 와인 카드 표시
4. 와인 → "Add to Cellar" → cellar 리스트 확인
5. 노트 작성 source picker → beginner form → 별점/메모 → 저장 → 노트 상세 확인
6. 설정 → 언어 ko↔en 토글 → 양쪽 모드 텍스트 정상
7. 설정 → 외관 light↔dark 토글 → 양쪽 모드 색상 정상

위 7단계 모두 통과 = test_scenario_11 PASS.

---

## Step 8 — final integration test 보고 (선택)

`docs/spec/v0.1.0.md` final_integration_test의 12 시나리오 결과를 `_workspace/qa_v0.1.0_release.md` 등에 기록. 시나리오 1~12 PASS/FAIL 표 권장.

---

## 트러블슈팅

| 증상 | 원인 | 대처 |
|---|---|---|
| `eas build` "no Apple credentials" | Step 2 미완료 | `eas credentials --platform ios` |
| TestFlight 업로드 후 "Missing compliance" | `ITSAppUsesNonExemptEncryption` 미설정 | app.config.ts 19행 `false` 확인 — 이미 설정됨 |
| `supabase db push` "ERROR: relation already exists" | 기존 wines/wine_korean_names가 신규 마이그레이션과 충돌 | 마이그레이션은 새 테이블만 추가하므로 절대 발생 X — 발생 시 즉시 중단 후 조사 |
| 빌드 사이즈 >50MB | 이미지 asset 과다 | `npx expo-asset-optimizer` 또는 미사용 asset 제거 |
| iOS 시뮬레이터 빌드 필요 | profile 미스매치 | `eas build --profile development --platform ios` (개발 빌드는 simulator: true) |
