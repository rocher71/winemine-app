<project_specification>
<project_name>winemine — Wine Lists Feature (v0.2.0)</project_name>

<overview>
와인 리스트 기능: 사용자가 직접 와인 컬렉션을 큐레이션하고, 공개/비공개 설정으로 커뮤니티와 공유할 수 있는 소셜 큐레이션 기능.
셀러 화면의 3번째 탭("리스트")으로 진입하며, 리스트 생성·편집·상세 보기·공유·저장·복제를 지원한다.

핵심 사용자 가치:
- 큐레이션: 마셔본 와인 목록 또는 검색으로 주제별 컬렉션 생성
- 소셜 발견: 다른 사용자의 공개 리스트 저장·복제
- 커뮤니티 연계: Q&A 추천 결과를 리스트로 저장, 피드에 인라인 리스트 카드 삽입

CRITICAL: 기존 cellar.tsx의 CellarTab('cellar' | 'tasted')에 'list' 탭을 추가. DB 없는 리스트는 없으므로 모든 리스트 데이터는 Supabase에 저장 (RLS 필수).
CRITICAL: 리스트 표시 시 일러스트/이미지 없음 — 와인 이름 텍스트 + 병 색상 인덱스 번호로만 표시. TinyBottle SVG는 그리드 카드 내부에서만 사용.
CRITICAL: 모든 화면 ko/en 양방향 i18n. 영어 모드에서 한글 한 글자도 노출 금지.
</overview>

<scope_boundaries>
  <in_scope>
    - 셀러 탭 3번째 "리스트" 탭 추가 (CellarTabs 확장)
    - 내 리스트 목록 (카드 그리드)
    - 리스트 생성/편집 플로우 (제목·설명·공개토글·와인추가·드래그정렬)
    - 공개 리스트 상세 화면 (작성자·통계·와인 행·저장/가져오기 버튼)
    - 비공개 리스트 자체 상세 (동일 레이아웃, 수정 액션 노출)
    - 공개↔비공개 전환 확인 바텀시트 (2개)
    - 커뮤니티 피드 인라인 리스트 카드 컴포넌트
    - Q&A 글 하단 "리스트로 저장" CTA
    - 리스트 저장(bookmark) / 가져오기(내 리스트로 복제)
    - DB 마이그레이션: wine_lists, wine_list_items, wine_list_saves, wine_list_likes
    - i18n: ko/en 양쪽
  </in_scope>
  <out_of_scope>
    - 리스트 탐색/검색 (공개 리스트 검색 — 별도 화면, 추후)
    - 리스트 댓글 (통계 표시는 하되, 댓글 입력 UI 없음)
    - 와인 검색으로 추가 (검색 버튼 렌더링만, 기능은 stub — v0.3.0)
    - 드래그 앤 드롭 실제 구현 (grip 아이콘만, 실제 재정렬은 stub — v0.3.0)
    - 리스트 피드 자동 게시
    - 팔로우 기능 (버튼 렌더링만, 기능 stub)
  </out_of_scope>
  <future_considerations>
    - 리스트 공개 탐색 화면 (v0.3.0)
    - 드래그 앤 드롭 정렬 (react-native-reorderable-list, v0.3.0)
    - 와인 검색 통합 (v0.3.0)
    - 리스트 댓글 (v0.4.0)
  </future_considerations>
</scope_boundaries>

<technology_stack>
  <mobile_app>
    <framework>React Native 0.81 + Expo SDK 54 (newArchEnabled: true, Fabric)</framework>
    <routing>expo-router v4 (file-based)</routing>
    <styling>NativeWind v4.1 + inline StyleSheet (§4-11 Pressable 패턴)</styling>
    <state>useState / useReducer (로컬), Supabase realtime (없음 — polling 불필요)</state>
    <i18n>i18next + react-i18next</i18n>
    <icons>lucide-react-native (기존 패턴 유지)</icons>
  </mobile_app>
  <backend>
    <db>Supabase Postgres (PostgREST, RLS)</db>
    <auth>Supabase Auth (익명 JWT, 기존 유지)</auth>
    <client>@supabase/supabase-js (기존 client 재사용)</client>
  </backend>
</technology_stack>

<file_structure>
app/
├── cellar/
│   └── lists/
│       ├── [id]/
│       │   └── index.tsx           # 리스트 상세 (공개/비공개 공통)
│       └── create.tsx              # 리스트 생성 (modal stack)

src/
├── components/
│   ├── cellar/
│   │   ├── cellar-tabs.tsx         # MODIFY: 'list' 탭 추가
│   │   ├── list-card.tsx           # 리스트 카드 (셀러 탭)
│   │   ├── list-tab-content.tsx    # 리스트 탭 전체 뷰 (FAB 포함)
│   │   └── visibility-sheet.tsx   # 공개/비공개 전환 바텀시트
│   ├── community/
│   │   └── inline-list-card.tsx   # 피드 인라인 리스트 카드
│   └── shared/
│       └── wine-list-item-row.tsx  # 리스트 상세의 와인 행
├── hooks/
│   └── use-wine-lists.ts           # 리스트 CRUD + 저장/복제 훅
└── lib/
    └── i18n/
        ├── ko.json                 # MODIFY: lists 네임스페이스 추가
        └── en.json                 # MODIFY: lists 네임스페이스 추가

supabase/
└── migrations/
    └── 20260526000100_wine_lists.sql  # wine_lists + wine_list_items + saves + likes
</file_structure>

<core_data_entities>
  <wine_lists>
    - id: uuid (pk, default gen_random_uuid())
    - user_id: uuid (fk → auth.users.id, not null)
    - title: text (not null, max 50자)
    - description: text (nullable, max 200자)
    - visibility: text (check in ('public','private'), default 'private')
    - created_at: timestamptz (default now())
    - updated_at: timestamptz (default now())

    인덱스: [user_id], [visibility, updated_at desc]
    RLS: SELECT — public이면 전체, private이면 본인만 / INSERT/UPDATE/DELETE — 본인만
  </wine_lists>

  <wine_list_items>
    - id: uuid (pk, default gen_random_uuid())
    - list_id: uuid (fk → wine_lists.id ON DELETE CASCADE, not null)
    - lwin: bigint (fk → wines.lwin, not null)
    - sort_order: integer (not null, default 0)
    - note: text (nullable, 짧은 메모)
    - added_at: timestamptz (default now())

    인덱스: [list_id, sort_order], unique(list_id, lwin)
    RLS: SELECT — 부모 wine_lists에 따라 / INSERT/UPDATE/DELETE — 리스트 소유자만
  </wine_list_items>

  <wine_list_saves>
    - id: uuid (pk, default gen_random_uuid())
    - list_id: uuid (fk → wine_lists.id ON DELETE CASCADE, not null)
    - saver_id: uuid (fk → auth.users.id, not null)
    - saved_at: timestamptz (default now())

    인덱스: unique(list_id, saver_id)
    RLS: SELECT — 리스트 소유자 or 저장한 본인 / INSERT — 인증된 사용자 / DELETE — 저장한 본인
  </wine_list_saves>

  <wine_list_likes>
    - id: uuid (pk, default gen_random_uuid())
    - list_id: uuid (fk → wine_lists.id ON DELETE CASCADE, not null)
    - user_id: uuid (fk → auth.users.id, not null)
    - liked_at: timestamptz (default now())

    인덱스: unique(list_id, user_id)
    RLS: SELECT — 공개 / INSERT — 인증된 사용자 / DELETE — 본인
  </wine_list_likes>

  <wine_lists_stats_view>
    -- 읽기 전용 VIEW (저장 수, 좋아요 수, 댓글 수 집계)
    SELECT
      wl.id,
      wl.user_id,
      wl.title,
      wl.description,
      wl.visibility,
      wl.created_at,
      wl.updated_at,
      COUNT(DISTINCT wli.id)  AS wine_count,
      COUNT(DISTINCT wls.id)  AS save_count,
      COUNT(DISTINCT wll.id)  AS like_count
    FROM wine_lists wl
    LEFT JOIN wine_list_items wli ON wli.list_id = wl.id
    LEFT JOIN wine_list_saves wls ON wls.list_id = wl.id
    LEFT JOIN wine_list_likes wll ON wll.list_id = wl.id
    GROUP BY wl.id
  </wine_lists_stats_view>
</core_data_entities>

<route_definitions>
  <existing_modified>
    <route path="/(tabs)/cellar" note="CellarTab에 'list' 추가. tab='list'일 때 ListTabContent 렌더"/>
  </existing_modified>
  <new_routes>
    <route path="/cellar/lists/[id]" page="ListDetailScreen" note="공개/비공개 공통. 본인 리스트면 편집·삭제 메뉴 노출"/>
    <route path="/cellar/lists/create" page="ListCreateScreen" note="modal presentation (expo-router presentation:'modal')"/>
  </new_routes>
</route_definitions>

<component_hierarchy>
  <!-- 셀러 화면 (기존 확장) -->
  <cellar_tab_screen>
    <AppHeader title="내 셀러" />
    <CellarTabs value={tab} onChange={setTab} cellarCount tastedCount listCount/>  {/* 'list' 탭 추가 */}
    {tab === 'cellar'  && <CellarContent />}
    {tab === 'tasted'  && <TastedContent />}
    {tab === 'list'    && <ListTabContent />}  {/* NEW */}
  </cellar_tab_screen>

  <!-- 리스트 탭 컨텐츠 -->
  <ListTabContent>
    <CountSortBar count listCount sortLabel onSortPress/>
    <ScrollView>
      {lists.map(list => <ListCard key={list.id} item={list} onPress/>)}
      {empty && <ListEmptyState onCreatePress/>}
    </ScrollView>
    <ListFAB onPress={() => router.push('/cellar/lists/create')}/>
    <VisibilitySheet />  {/* 내부 상태로 제어 */}
  </ListTabContent>

  <!-- 리스트 상세 화면 -->
  <ListDetailScreen>
    <SafeAreaView>
      <TopBar onBack onShare onMore/>
      <ScrollView>
        <ListDetailHero label="공개 리스트" | "내 리스트" title author stats desc/>
        {wines.map((w, i) => <WineListItemRow key={w.id} wine={w} idx={i} onPress/>)}
      </ScrollView>
      <ListActionBar />  {/* 저장 + 가져오기 (공개 리스트) | 편집 (내 리스트) */}
      <VisibilitySheet visible={showVisibility} mode="toPublic"|"toPrivate" onClose onConfirm/>
    </SafeAreaView>
  </ListDetailScreen>

  <!-- 리스트 생성 화면 -->
  <ListCreateScreen>
    <TopBar onClose onSubmit/>
    <ScrollView>
      <TitleInput value onChangeText/>
      <DescInput value onChangeText/>
      <VisibilityToggleRow isPublic onToggle/>
      <WineSectionHeader count/>
      <AddWineButtons>
        <AddBySearchButton />    {/* stub v0.3.0 */}
        <AddFromTastedButton />  {/* 마셔본 목록 picker stub v0.3.0 */}
      </AddWineButtons>
      {wines.map((w, i) => <DraggableWineRow key={w.lwin} wine={w} idx={i} onRemove/>)}
    </ScrollView>
  </ListCreateScreen>

  <!-- 커뮤니티 인라인 카드 (기존 피드에 삽입) -->
  <InlineListCard list onPress/>

  <!-- 공개/비공개 전환 바텀시트 (공유 컴포넌트) -->
  <VisibilitySheet mode="toPublic"|"toPrivate" listTitle saveCount onConfirm onCancel/>
</component_hierarchy>

<pages_and_interfaces>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SCREEN 1: 셀러 > 리스트 탭                  -->
  <!-- ═══════════════════════════════════════════ -->
  <screen_1_list_tab>
    <modification_note>
      기존 cellar.tsx의 tab 상태 타입을 'cellar' | 'tasted' | 'list'로 확장.
      CellarTabs에 listCount prop 추가. tab === 'list' 분기에서 ListTabContent 렌더.
    </modification_note>

    <cellar_tabs_update>
      세그먼트: [셀러 N병] [마신 와인 N] [리스트 N]
      - 각 탭: padding 7px 13px, radius 999, gap 6px
      - active: bg brand.wineRed(#8B1A2A), 레이블 #FFFFFF, 숫자 brand.goldSoft(#D4B85C)
      - idle: bg transparent, 레이블 text.primary, 숫자 text.muted
      - 탭 순서: 셀러 → 마신 와인 → 리스트 (왼쪽→오른쪽)
    </cellar_tabs_update>

    <count_sort_bar>
      왼쪽: "총 N개의 리스트" — fontSize 12, color text.muted, fontWeight 500
      오른쪽: "최근 수정순" + ChevronRight — fontSize 12, color text.secondary, fontWeight 600
      padding: 0 24px 12px
    </count_sort_bar>

    <list_card_component>
      container:
        bg: bg.surface (light) / bg.surface (dark)
        borderRadius: 16
        border: 1px border.default
        shadow: elevation 2 / '0 1px 2px rgba(31,18,12,0.04), 0 8px 16px -10px rgba(31,18,12,0.08)'
        overflow: hidden

      left_accent_stripe:
        position: absolute, left:0 top:0 bottom:0, width: 3
        color: accent (pink→#7A1E2D / cream→#9C8240 / rose→#8B4458 / sage→#4A6253)
        accent 결정: 리스트 ID 기반 deterministic 선택 (id.charCodeAt(0) % 4)

      padding: 12px 14px 12px 18px (왼쪽은 stripe 때문에 18px)

      header_row:
        title:
          fontFamily: Cormorant Garamond (Inter_600Regular fallback)
          fontStyle: italic
          fontSize: 20
          color: text.primary
          fontWeight: 600
          letterSpacing: -0.015em
          lineHeight: 1.2
        description (optional):
          marginTop: 3, fontSize: 11.5, color: text.muted
          lineClamp: 1 (numberOfLines={1})
        visibility_icon_circle:
          width: 24, height: 24, borderRadius: 999
          bg: bg.deep, border: 1px border.default
          icon: globe(공개) | lock(비공개), size 11, stroke 1.9
          globe color: brand.goldSoft / lock color: text.secondary

      footer_row:
        marginTop: 12
        display: flex, alignItems: center, gap: 10
        fontSize: 11, color: text.muted, fontWeight: 500
        - wine_count: bold숫자(text.primary, fontWeight:700) + "병"
        - dot_separator: width 2, height 2, borderRadius 999, bg border.default
        - updated: 상대시간 (예: "3일 전")
        - spacer: flex:1
        - savedBy (공개 리스트만): bookmark icon (size 11, color brand.wineRed) + count
          color: brand.wineRed, fontWeight: 700

    list_card_interaction:
      onPress: router.push('/cellar/lists/[id]')
      no swipe actions (v0.1.0)
    </list_card_component>

    <fab>
      position: absolute, right: 18, bottom: 102 (BottomNav 위)
      height: 52, padding: 0 20px 0 16px, borderRadius: 999
      bg: linear-gradient(135deg, brand.wineRed, brand.wineRedDeep)
      shadow: '0 10px 22px -6px rgba(122,30,45,0.55), 0 2px 6px rgba(122,30,45,0.30)'
      icon: Plus(size 18, color #fff, strokeWidth 2.6) + 텍스트 "새 리스트" | "New List"
      fontSize: 14, fontWeight: 700, color: #fff

      CRITICAL §4-11: Pressable은 opacity only, inner View에 모든 visual 적용.
      3-layer 구조:
        outer View (position absolute 등) → Pressable (opacity feedback) → inner View (bg/radius/shadow/padding)
    </fab>

    <empty_state>
      icon: layers (lucide-react-native), size 48, color: text.disabled
      title: "아직 리스트가 없어요" | "No lists yet"
      sub: "주제별로 와인을 큐레이션해보세요" | "Curate wines by topic"
      cta: "첫 리스트 만들기" | "Create your first list"
      onPress: router.push('/cellar/lists/create')
    </empty_state>

    <sort_options>
      [최근 수정순 | "Recently edited"] (default)
      [생성일순 | "Date created"]
      [이름순 | "Name"]
      [와인 수 | "Wine count"]
      — bottom sheet로 표시 (기존 SortChips 패턴 참고)
    </sort_options>
  </screen_1_list_tab>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SCREEN 2: 공개 리스트 상세                   -->
  <!-- ═══════════════════════════════════════════ -->
  <screen_2_list_detail>
    <top_bar>
      height: 50, padding: 6px 16px 8px
      left: ChevronLeft button (iconBtnSty: 38x38, radius 999, transparent)
      right: share icon button + more(ellipsis) icon button
      separator: none (borderBottom 없음)
    </top_bar>

    <hero_section>
      padding: 4px 24px 0

      eyebrow_row:
        layers icon (size 12, color brand.goldSoft, sw 2) + "공개 리스트" | "Public list"
        fontSize: 10, letterSpacing: 0.22em, textTransform: uppercase
        color: brand.goldSoft, fontWeight: 700

      title:
        marginTop: 8
        fontFamily: Cormorant Garamond italic
        fontSize: 32, fontWeight: 600
        letterSpacing: -0.02em, lineHeight: 1.1
        color: text.primary

      creator_row:
        marginTop: 14
        Avatar(size 36) + 이름(fontSize 13, fontWeight 700) + LevelPill + 팔로우버튼
        아래: "마지막 수정 N주 전 · N병" (fontSize 11, color text.muted)
        팔로우버튼: padding 7px 14px, radius 999, bg bg.deep, border 1px border.default
          fontSize 12, fontWeight 700 (stub — v0.3.0)

      description_blockquote:
        marginTop: 14
        paddingLeft: 12
        borderLeft: 2px solid brand.gold
        fontSize: 13, color: text.secondary
        lineHeight: 1.6, fontStyle: italic

      stats_row:
        marginTop: 16, padding: 12px 0
        borderTop/Bottom: 0.5px border.default
        3열 동등분할
        각 열: flex:1, center
          - icon (heart/message/bookmark, size 12, color brand.goldSoft) + 숫자
            숫자: fontSize 15, fontWeight 700, color text.primary, tabular-nums
          - 레이블: fontSize 10.5, color text.muted
          - 열 구분: borderLeft 0.5px border.default (1번째 열 제외)
    </hero_section>

    <wine_list_rows>
      padding: 8px 24px 120px (120px = 하단 액션바 높이 확보)

      WineListItemRow:
        display: flex, alignItems: center, gap: 12
        padding: 14px 0
        borderBottom: 0.5px border.default
        onPress: router.push('/wine/[lwin]')

        index_number:
          fontFamily: Cormorant Garamond italic
          fontSize: 14, fontStyle: italic
          color: brand.goldSoft, fontWeight: 500
          minWidth: 22, textAlign: right
          format: padStart(2,'0') → "01", "02" ...

        wine_info:
          flex: 1
          name: fontSize 13.5, fontWeight 700, color text.primary
          sub: fontSize 11, color text.muted, marginTop: 2
               format: "{producer} · {vintage} · {region}" (italic region)

        chevron_right: size 16, color border.default, sw 1.8
        note_chip (선택): note가 있으면 오른쪽에 작은 라벨 칩
                  bg bg.deep, radius 4, padding 2px 6px, fontSize 10, color text.muted
    </wine_list_rows>

    <bottom_action_bar>
      position: absolute, left:0 right:0 bottom:0
      padding: 14px 16px 30px (30px: safe area bottom)
      bg: rgba(light.bg.deepest, 0.94) | rgba(dark.bg.deep, 0.94)
      backdropFilter: blur(14px) — RN에서는 BlurView(expo-blur) 사용 또는 solid fallback
      borderTop: 0.5px border.default
      display: flex, gap: 10

      CRITICAL §4-11: 버튼들은 Pressable → inner View 패턴 사용.

      save_button (공개 리스트, 내 리스트 아닌 경우):
        height: 52, padding: 0 18px, borderRadius: 14
        bg: bg.surface, border: 1px border.default
        icon: Bookmark(size 16, sw 2) + "저장" | "Save"
        fontSize: 13.5, fontWeight: 700, color: text.primary

      import_button (공개 리스트):
        flex: 1, height: 52, borderRadius: 14
        bg: brand.wineRed, color: #fff
        icon: Copy(size 16, sw 2) + "내 리스트로 가져오기" | "Import to my lists"
        fontSize: 14, fontWeight: 700
        shadow: '0 8px 20px -8px rgba(122,30,45,0.55)'

      edit_button (내 리스트):
        flex: 1, height: 52, borderRadius: 14
        bg: brand.wineRed, color: #fff
        icon: Edit(size 16) + "편집" | "Edit"
        fontSize: 14, fontWeight: 700

      visibility_toggle_button (내 리스트):
        height: 52, padding: 0 14px, borderRadius: 14
        bg: bg.surface, border: 1px border.default
        icon: globe(공개일 때) | lock(비공개일 때), size 16, color text.secondary
        onPress: setShowVisibilitySheet(true)
    </bottom_action_bar>
  </screen_2_list_detail>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SCREEN 3: 리스트 생성/편집                   -->
  <!-- ═══════════════════════════════════════════ -->
  <screen_3_list_create>
    <top_bar>
      height: 50, padding: 6px 16px 10px
      borderBottom: 0.5px border.default
      left: X(close) button (iconBtnSty)
      center: "새 리스트" | "New list" (fontSize 15, fontWeight 700)
      right: "만들기" | "Create" 버튼
             padding: 8px 14px, radius 999
             bg: brand.wineRed, color: #fff
             fontSize: 13, fontWeight: 700
             disabled 상태: title empty이면 opacity 0.4
    </top_bar>

    <form_body>
      padding: 20px 24px 110px
      gap: 6

      title_field:
        fontFamily: Cormorant Garamond italic
        fontSize: 28, fontWeight: 600, color: text.primary
        letterSpacing: -0.02em, lineHeight: 1.2
        paddingBottom: 6
        borderBottom: 1px brand.gold (light) | brand.goldDeep (dark)
        placeholder: "리스트 제목" | "List title"
        placeholder color: text.disabled
        maxLength: 50
        hint: "리스트 제목 · 50자 이내" | "List title · Max 50 chars"
               fontSize: 10.5, color: text.muted, marginTop: 4

        blinking_cursor: 커서가 있는 동안 width:1 height:26 bg:brand.wineRed 깜빡임
          — TextInput의 cursorColor prop으로 구현 (RN 네이티브)

      desc_field:
        marginTop: 14
        multiline TextInput, minHeight: 56
        bg: transparent, border: none
        fontFamily: Inter, fontSize: 13.5, color: text.primary
        lineHeight: 1.6
        placeholder: "설명을 입력하세요 (선택)" | "Description (optional)"
        maxLength: 200
        hint: "설명 (선택) · 200자 이내" | "Description (optional) · Max 200 chars"
               fontSize: 10.5, color: text.muted

      visibility_toggle_row:
        marginTop: 18
        container: padding 12px 14px, borderRadius 14
                   bg bg.surface, border 1px border.default
        layout: flex row, gap 12

        icon_circle: width 32, height 32, radius 999, bg text.secondary+'10'
          icon: lock(비공개) | globe(공개), size 15, color text.secondary

        text_block:
          flex: 1
          label: "비공개" | "Private" / "공개" | "Public"
                  fontSize 13.5, fontWeight 700
          sub: "나만 볼 수 있어요" | "Only visible to you" /
               "누구나 볼 수 있어요" | "Visible to everyone"
                fontSize 11, color text.muted

        toggle_switch:
          width: 44, height: 26, borderRadius: 999
          off: bg border.default, thumb left
          on: bg brand.wineRed, thumb right
          thumb: width 20, height 20, radius 999, bg #fff, shadow light
          CRITICAL: onValueChange → setIsPublic (즉시 반영)
          접근성: accessibilityRole="switch", accessibilityState={{ checked: isPublic }}

      wines_section_header:
        marginTop: 22
        flex row, alignItems: baseline, gap: 8
        "Wines" eyebrow (fontSize 11, color brand.goldSoft, letterSpacing 0.18em, uppercase, fontWeight 700)
        "와인 추가" | "Add wines" (fontSize 14, fontWeight 700, color text.primary)
        "· N" (fontSize 12, color text.muted, tabular-nums)

      add_wine_buttons:
        marginTop: 10
        2-column grid, gap: 8

        search_button:
          padding: 14px, borderRadius: 14
          bg: bg.surface, border: 1px dashed brand.gold+'66'
          icon_circle: width 28, height 28, radius 999, bg brand.gold+'1A'
            icon: Search(size 14, color brand.goldSoft, sw 2)
          label: "검색으로 추가" | "Search wines" (fontSize 13, fontWeight 700)
          sub: "와인·생산자명" | "Wine or producer" (fontSize 10.5, color text.muted)
          onPress: stub toast "v0.3.0에서 추가됩니다" | "Coming in v0.3.0"

        tasted_button:
          같은 스타일, icon: Bookmark(size 14)
          label: "마셔본 목록" | "From tasted" (fontSize 13, fontWeight 700)
          sub: "N병 중 선택" | "Choose from N wines" (fontSize 10.5)
          onPress: stub toast

      wine_drag_rows:
        marginTop: 10
        각 행:
          display: flex, alignItems: center, gap: 10
          padding: 10px 4px
          borderBottom: 0.5px border.default (마지막 제외)

          drag_grip: GripVertical icon, size 16, color border.default (stub — 드래그 미구현)
          index: Cormorant italic, fontSize 12, color brand.goldSoft, minWidth 18 textAlign right
          wine_info:
            flex: 1
            name: fontSize 12.5, fontWeight 700, color text.primary
            sub: fontSize 10.5, color text.muted (producer · vintage)
          remove_btn:
            width 28, height 28, radius 999, transparent border none
            X icon, size 13, color text.muted
            onPress: remove wine from list
    </form_body>
  </screen_3_list_create>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SCREEN 4: 커뮤니티 피드 인라인 리스트 카드   -->
  <!-- ═══════════════════════════════════════════ -->
  <screen_4_inline_list_card>
    <InlineListCard props="list: WineListSummary, onPress: () => void">
      container:
        marginTop: 12
        borderRadius: 16
        bg: linear-gradient(180deg, bg.deep 0%, bg.surface 100%)
        border: 1px solid brand.gold+'55'
        shadow: '0 1px 2px rgba(31,18,12,0.04), 0 8px 18px -10px rgba(31,18,12,0.14)'
        overflow: hidden
        onPress: router.push('/cellar/lists/[id]')

      header_strip:
        padding: 10px 14px
        borderBottom: 0.5px border.default
        bg: brand.gold+'0F'
        layout: flex row, gap 8

        list_icon_square:
          width 24, height 24, borderRadius 7
          bg: linear-gradient(135deg, brand.gold, brand.goldSoft)
          icon: Layers(size 12, color #fff, sw 2.4)

        meta:
          flex: 1
          "리스트" | "List" (fontSize 9.5, color brand.goldSoft, letterSpacing 0.18em, uppercase)
          · dot (width 2, height 2, radius 999)
          · author_name (fontSize 10.5, color text.muted, fontWeight 600)
          · LevelPill

        chevron: ChevronRight(size 13, color brand.goldSoft, sw 2.2)

      body:
        padding: 14px 16px

        title: fontSize 16, fontWeight 700, color text.primary, letterSpacing -0.015em

        meta_row:
          marginTop: 6
          bottle icon (size 11, color brand.goldSoft) + bold N병 | N wines
          · bookmark icon + save_count

        wine_preview_rows:
          marginTop: 10, paddingTop: 10
          borderTop: 0.5px border.default
          상위 3개만 표시:
            index (Cormorant italic, 12px, brand.goldSoft) + name + producer·vintage
            각 행 padding: 7px 0
          더보기 행:
            "외 N병 더" | "N more wines" (fontSize 11, color brand.goldSoft, fontWeight 700)
            + ArrowRight(size 11, color brand.goldSoft, sw 2.2)
            marginLeft: 26 (index 너비 맞춤)
    </InlineListCard>
  </screen_4_inline_list_card>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SCREEN 5: Q&A → 리스트 변환                 -->
  <!-- ═══════════════════════════════════════════ -->
  <screen_5_qa_to_list>
    <save_as_list_cta>
      추천 섹션 카드 내부 최하단에 삽입.
      marginTop: 12, width: 100%
      padding: 14px, borderRadius: 14
      bg: linear-gradient(135deg, brand.wineRed, brand.wineRedDeep)
      shadow: '0 10px 24px -10px rgba(122,30,45,0.6)'

      layout: flex row, space-between

      left_content:
        icon_circle: width 32, height 32, radius 999, bg rgba(255,255,255,0.16)
          icon: Layers(size 15, color #fff, sw 2.2)
        text_block:
          label: "이 결과를 리스트로 저장" | "Save results as list"
                 fontSize 14, fontWeight 700, color #fff
          sub: "상위 N병 · 초안으로 생성됩니다" | "Top N wines · Saved as draft"
               fontSize 11, color brand.goldSoft+'CC', fontWeight 500

      right: ChevronRight(size 16, color #fff, sw 2.2)

      onPress:
        1. 해당 Q&A의 추천 상위 N병으로 wine_list_items 구성
        2. visibility: 'private' (초안)
        3. title: Q&A 제목 (50자 truncate)
        4. router.push('/cellar/lists/create', { params: { prefill: JSON } })
           또는 직접 insert 후 상세로 이동
    </save_as_list_cta>
  </screen_5_qa_to_list>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SCREEN 6: 공개 전환 바텀시트                 -->
  <!-- ═══════════════════════════════════════════ -->
  <screen_6_make_public_sheet>
    <VisibilitySheet mode="toPublic">
      backdrop: rgba(0,0,0,0.42) Modal overlay
      sheet_container:
        position: absolute, left:0 right:0 bottom:0
        bg: bg.deepest (light) | bg.deep (dark)
        borderTopLeftRadius: 28, borderTopRightRadius: 28
        paddingTop: 12, paddingBottom: 32 + safeArea.bottom
        shadow: '0 -20px 60px -16px rgba(20,12,8,0.45)'

      drag_handle:
        width 44, height 5, radius 999, bg border.default, margin: 0 auto 22px

      hero_icon_circle:
        width 64, height 64, radius 999
        bg: linear-gradient(135deg, brand.gold, brand.goldSoft)
        icon: Globe(size 28, color #fff, sw 1.7)
        shadow: '0 8px 22px -6px rgba(184,148,56,0.45)'

      title: "리스트를 공개로 전환할까요?" | "Make this list public?"
             fontSize 20, fontWeight 700, textAlign center, padding 0 28px
             marginTop: 14

      body: "공개하면 다른 사용자가 리스트 탐색에서 발견할 수 있습니다. 피드에 자동 게시되지는 않습니다."
            | "Others can discover this list in explore. It won't be auto-posted to the feed."
            fontSize 13, color text.secondary, lineHeight 1.65, textAlign center

      info_card:
        margin: 18px 24px 0
        padding: 12px 14px, borderRadius 14
        bg bg.surface, border 1px border.default
        3개 항목:
          [eye icon] "리스트 탐색·검색에 노출됩니다" | "Visible in list explore and search"
          [bookmark icon] "다른 사용자가 저장·복제할 수 있어요" | "Others can save and copy it"
          [lock icon] "언제든 다시 비공개로 바꿀 수 있어요" | "You can make it private anytime"
          각 항목: icon_circle(26x26, bg.deep, border.default) + fontSize 12.5, color text.secondary

      actions:
        padding: 20px 16px 0, gap 8
        confirm_btn: height 52, borderRadius 14, bg brand.wineRed, color #fff
                     "공개하기" | "Make public", fontSize 14.5, fontWeight 700
        cancel_btn: height 48, borderRadius 14, transparent, color text.secondary
                    "취소" | "Cancel", fontSize 13.5, fontWeight 600
    </VisibilitySheet>
  </screen_6_make_public_sheet>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SCREEN 7: 비공개 전환 경고 바텀시트           -->
  <!-- ═══════════════════════════════════════════ -->
  <screen_7_make_private_sheet>
    <VisibilitySheet mode="toPrivate" saveCount={N}>
      (sheet_container, drag_handle, actions — screen 6와 동일 구조)

      hero_icon_circle:
        width 64, height 64, radius 999
        bg: brand.wineRed+'14', border: 1px brand.wineRed+'30'
        icon: AlertCircle(size 28, color brand.wineRed, sw 1.8)

      title: "비공개로 전환할까요?" | "Make this list private?"

      body: "N명이 이 리스트를 저장했습니다. 비공개로 전환하면 그들의 저장 목록에서 보이지 않게 됩니다."
            | "N people saved this list. Making it private will hide it from their saved lists."
            bold N: color brand.wineRed

      savers_preview_card (saveCount > 0):
        margin: 18px 24px 0
        padding: 12px 14px, borderRadius 14, bg bg.surface, border 1px border.default
        layout: flex row, gap 10
        stacked_avatars: 최대 3개, marginLeft -10 겹치기, zIndex 내림차순
                         width 32, height 32, radius 999, border 2px bg.deepest
        text: saver_names (fontSize 12.5, fontWeight 700) + "지난 30일 안에 저장" | "Saved within 30 days"

      effects_card:
        margin: 10px 24px 0
        padding: 12px 14px, borderRadius 14
        bg bg.deep, border 1px dashed border.default
        3개 항목:
          [eye-off icon] "리스트 탐색·검색에서 사라집니다" | "Removed from list explore and search"
          [bookmark icon] "저장한 사람의 목록에서 숨겨집니다" | "Hidden from savers' saved lists"
          [message icon] "받은 좋아요·댓글은 보존됩니다" | "Your likes and comments are kept"

      confirm_btn: "비공개로 전환" | "Make private"
    </VisibilitySheet>
  </screen_7_make_private_sheet>

</pages_and_interfaces>

<core_functionality>
  <list_crud>
    - CREATE: title(required) + description(optional) + visibility(default private) + wine_list_items
    - READ: 내 리스트 = user_id 기준 / 공개 리스트 = visibility='public' OR user_id=me
    - UPDATE: title, description, visibility 변경 → updated_at 갱신
    - DELETE: 리스트 삭제 → ON DELETE CASCADE로 items, saves, likes 자동 정리
    - visibility 변경: public→private 시 save_count 조회 후 경고 시트 표시
  </list_crud>

  <wine_list_items_management>
    - 와인 추가: lwin + sort_order + optional note
    - 와인 제거: X 버튼 → 즉시 낙관적 UI (UI 먼저 제거, Supabase 비동기 delete)
    - 순서 변경: sort_order 업데이트 (v0.1.0은 stub — grip 아이콘만)
    - 중복 방지: unique(list_id, lwin) DB 제약
  </wine_list_items_management>

  <save_import>
    - 저장(bookmark): wine_list_saves INSERT. 이미 저장된 경우 → DELETE (토글)
    - 가져오기(import): wine_lists INSERT (title 복사 + " (복사본)") + wine_list_items 복사
                       visibility: 'private' (복사본은 항상 비공개로 시작)
    - 저장 수: wine_list_saves COUNT (stats view로 표시)
  </save_import>

  <qa_list_conversion>
    - Q&A 추천 섹션 하단 CTA onPress:
      1. 추천 와인 상위 5개 lwin 추출
      2. router.push('/cellar/lists/create?prefill=...')
      3. create 화면에서 prefill 파라미터로 title + wines 선채움
  </qa_list_conversion>
</core_functionality>

<aesthetic_guidelines>
  <wt_to_rn_token_mapping>
    WT 토큰(디자인 파일) → RN design-tokens.ts 매핑표:

    | WT 토큰       | Light 값                    | Dark 값                   | RN 참조                          |
    |--------------|----------------------------|--------------------------|----------------------------------|
    | WT.bg        | #FAF5EC                    | #2E1F3F                  | tokens.bg.deepest (light/dark)   |
    | WT.card      | #FFFFFF                    | #3D2A4A                  | tokens.bg.surface                |
    | WT.cardSoft  | #F2EAD9                    | #2E1F3F                  | tokens.bg.deep                   |
    | WT.border    | #E0D2BC                    | #5A3D6A                  | tokens.border.default            |
    | WT.borderSoft| #EDE2CC                    | #3A2440                  | tokens.bg.map                    |
    | WT.ink       | #2A1A14                    | #F8F4ED                  | tokens.text.primary              |
    | WT.ink2      | #5A463C                    | #EBE0CB                  | tokens.text.secondary            |
    | WT.muted     | #8B7766                    | #CABDA8                  | tokens.text.muted                |
    | WT.faint     | #C0B0A0                    | #7E6E8E                  | tokens.text.disabled             |
    | WT.burgundy  | #8B1A2A (≈#7A1E2D)         | 동일                      | brand.wineRed                    |
    | WT.burgundyD | #5b1424                    | 동일                      | brand.wineRedDeep                |
    | WT.gold      | #C9A84C                    | 동일                      | brand.gold                       |
    | WT.goldSoft  | #D4B85C                    | 동일                      | brand.goldSoft                   |
    | WT.goldChip  | #C9A84C (same as gold)     | 동일                      | brand.gold                       |
    | WT.display   | Cormorant Garamond italic  | 동일                      | fonts.display (Cormorant)         |
    | WT.body      | Inter / Noto Sans KR       | 동일                      | fonts.body (Inter)               |

    사용법: useThemeTokens() → const { bg, text, border } = tokens;
  </wt_to_rn_token_mapping>

  <level_pill_styles>
    LevelPill은 기존 LevelChip 컴포넌트 재사용.
    sm (default): padding 2px 8px, fontSize 10.5
    | Level   | fg       | bg       |
    |---------|----------|----------|
    | 입문자  | #6E5F4B  | #EFE6D1  |
    | 애호가  | #3D5A4E  | #DDE7DD  |
    | 감식가  | #5A5752  | #E3DED5  |
    | 소믈리에| #7A5C12  | #F3E6BE  |
    | 마스터  | #7A1E2D  | #F1D9DC  |
    다크 모드에서도 동일 값 사용 (불투명도로 구분하지 않음).
  </level_pill_styles>

  <list_accent_colors>
    카드 왼쪽 accent stripe — deterministic (list.id 기반):
    pink:  #7A1E2D (brand.wineRed에 가까움)
    cream: #9C8240 (brand.gold 계열)
    rose:  #8B4458
    sage:  #4A6253
    선택 로직: id의 첫 문자 charCode % 4 → 0=pink, 1=cream, 2=rose, 3=sage
    다크 모드에서도 동일 색 (충분히 채도 있어서 양쪽 모두 작동)
  </list_accent_colors>

  <typography>
    display_italic: Cormorant Garamond — 리스트 타이틀, 인덱스 번호, 히어로 제목
    body: Inter + Noto Sans KR — 나머지 모든 텍스트
    tabular_nums: fontVariant: ['tabular-nums'] — 수치(count, stats)
  </typography>

  <pressable_pattern>
    CRITICAL §4-11 준수:
    모든 Pressable → opacity press feedback만, 나머지 visual은 inner View:

    ```tsx
    // 올바른 패턴
    <View style={{ flex: 1 }}>  {/* flex 분배 필요한 경우 */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <View style={{
          // 모든 layout, bg, border, radius, shadow, padding 여기
          backgroundColor: tokens.bg.surface,
          borderRadius: 16,
          padding: 14,
          ...
        }}>
          {children}
        </View>
      </Pressable>
    </View>
    ```
  </pressable_pattern>
</aesthetic_guidelines>

<security_considerations>
  <rls_policies>
    CRITICAL: 모든 테이블 RLS ENABLED.

    wine_lists:
      - SELECT: visibility='public' OR user_id = auth.uid()
      - INSERT: user_id = auth.uid()
      - UPDATE: user_id = auth.uid()
      - DELETE: user_id = auth.uid()

    wine_list_items:
      - SELECT: list의 visibility='public' OR list의 user_id = auth.uid()
               (JOIN wine_lists로 구현)
      - INSERT: list의 user_id = auth.uid()
      - UPDATE: list의 user_id = auth.uid()
      - DELETE: list의 user_id = auth.uid()

    wine_list_saves:
      - SELECT: list의 user_id = auth.uid() OR saver_id = auth.uid()
      - INSERT: saver_id = auth.uid() AND list의 visibility='public'
      - DELETE: saver_id = auth.uid()

    wine_list_likes:
      - SELECT: 공개 리스트 좋아요는 전체 (count 집계용)
      - INSERT: user_id = auth.uid() AND list의 visibility='public'
      - DELETE: user_id = auth.uid()
  </rls_policies>

  <data_protection>
    - user_id는 UI에 절대 노출 금지 (익명화 패턴 — profiles.display_name 사용)
    - 리스트 작성자 표시: profiles.display_name (익명화된 이름)
    - SERVICE_ROLE_KEY RN 코드 사용 금지
  </data_protection>
</security_considerations>

<key_implementation_notes>
  <recommended_implementation_order>
    1. DB 마이그레이션 (wine_lists + items + saves + likes + stats view + RLS)
    2. shared/types/database.types.ts 재생성 (supabase gen types)
    3. use-wine-lists.ts 훅 작성 (CRUD + save + import)
    4. CellarTab 타입 확장 ('list' 추가) + cellar.tsx 분기 추가
    5. ListCard + ListTabContent + FAB (Screen 1)
    6. ListCreateScreen (Screen 3) — 생성 플로우
    7. ListDetailScreen (Screen 2) — 상세 + 액션바
    8. VisibilitySheet (Screen 6+7) — 공유 바텀시트
    9. InlineListCard (Screen 4) — 커뮤니티 피드 삽입
    10. Q&A → 리스트 CTA (Screen 5) — 커뮤니티 Q&A 화면 수정
    11. i18n ko/en 키 일괄 추가
    12. 다크/라이트 양쪽 검증 (§4-9)
  </recommended_implementation_order>

  <migration_sql_skeleton>
    파일명: supabase/migrations/20260526000100_wine_lists.sql

    -- wine_lists
    CREATE TABLE wine_lists (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title text NOT NULL CHECK (char_length(title) <= 50),
      description text CHECK (char_length(description) <= 200),
      visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public','private')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE wine_lists ENABLE ROW LEVEL SECURITY;

    -- wine_list_items
    CREATE TABLE wine_list_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      list_id uuid NOT NULL REFERENCES wine_lists(id) ON DELETE CASCADE,
      lwin bigint NOT NULL REFERENCES wines(lwin),
      sort_order integer NOT NULL DEFAULT 0,
      note text,
      added_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(list_id, lwin)
    );
    ALTER TABLE wine_list_items ENABLE ROW LEVEL SECURITY;

    -- wine_list_saves
    CREATE TABLE wine_list_saves (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      list_id uuid NOT NULL REFERENCES wine_lists(id) ON DELETE CASCADE,
      saver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      saved_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(list_id, saver_id)
    );
    ALTER TABLE wine_list_saves ENABLE ROW LEVEL SECURITY;

    -- wine_list_likes
    CREATE TABLE wine_list_likes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      list_id uuid NOT NULL REFERENCES wine_lists(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      liked_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(list_id, user_id)
    );
    ALTER TABLE wine_list_likes ENABLE ROW LEVEL SECURITY;

    -- updated_at trigger
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
    CREATE TRIGGER wine_lists_updated_at
      BEFORE UPDATE ON wine_lists
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  </migration_sql_skeleton>

  <i18n_keys_to_add>
    ko.json / en.json에 다음 네임스페이스 추가:

    "lists": {
      "tab": "리스트" | "Lists",
      "title": "내 리스트" | "My Lists",
      "totalCount": "총 {{count}}개의 리스트" | "{{count}} lists",
      "sortRecent": "최근 수정순" | "Recently edited",
      "sortCreated": "생성일순" | "Date created",
      "sortName": "이름순" | "Name",
      "sortCount": "와인 수" | "Wine count",
      "fab": "새 리스트" | "New list",
      "empty": {
        "title": "아직 리스트가 없어요" | "No lists yet",
        "sub": "주제별로 와인을 큐레이션해보세요" | "Curate wines by topic",
        "cta": "첫 리스트 만들기" | "Create your first list"
      },
      "create": {
        "title": "새 리스트" | "New list",
        "submit": "만들기" | "Create",
        "titlePlaceholder": "리스트 제목" | "List title",
        "titleHint": "리스트 제목 · 50자 이내" | "List title · Max 50 chars",
        "descPlaceholder": "설명을 입력하세요 (선택)" | "Description (optional)",
        "descHint": "설명 (선택) · 200자 이내" | "Description (optional) · Max 200 chars",
        "winesHeader": "와인 추가" | "Add wines",
        "addBySearch": "검색으로 추가" | "Search wines",
        "addFromTasted": "마셔본 목록" | "From tasted",
        "searchSub": "와인·생산자명" | "Wine or producer",
        "success": "리스트가 만들어졌어요" | "List created",
        "error": "리스트를 만들지 못했어요" | "Failed to create list"
      },
      "visibility": {
        "private": "비공개" | "Private",
        "privateSub": "나만 볼 수 있어요" | "Only visible to you",
        "public": "공개" | "Public",
        "publicSub": "누구나 볼 수 있어요" | "Visible to everyone"
      },
      "detail": {
        "publicLabel": "공개 리스트" | "Public list",
        "privateLabel": "내 리스트" | "My list",
        "lastEdited": "마지막 수정 {{time}} · {{count}}병" | "Last edited {{time}} · {{count}} wines",
        "follow": "팔로우" | "Follow",
        "save": "저장" | "Save",
        "saved": "저장됨" | "Saved",
        "import": "내 리스트로 가져오기" | "Import to my lists",
        "edit": "편집" | "Edit",
        "importedTitle": "{{title}} (복사본)" | "{{title}} (copy)",
        "importSuccess": "내 리스트로 가져왔어요" | "Imported to your lists",
        "stats": {
          "likes": "좋아요" | "Likes",
          "comments": "댓글" | "Comments",
          "saves": "저장됨" | "Saved"
        }
      },
      "makePublic": {
        "title": "리스트를 공개로 전환할까요?" | "Make this list public?",
        "body": "공개하면 다른 사용자가 리스트 탐색에서 발견할 수 있습니다. 피드에 자동 게시되지는 않습니다." | "Others can discover this list in explore. It won't be auto-posted to the feed.",
        "bullet1": "리스트 탐색·검색에 노출됩니다" | "Visible in list explore and search",
        "bullet2": "다른 사용자가 저장·복제할 수 있어요" | "Others can save and copy it",
        "bullet3": "언제든 다시 비공개로 바꿀 수 있어요" | "You can make it private anytime",
        "confirm": "공개하기" | "Make public",
        "cancel": "취소" | "Cancel"
      },
      "makePrivate": {
        "title": "비공개로 전환할까요?" | "Make this list private?",
        "body": "{{count}}명이 이 리스트를 저장했습니다. 비공개로 전환하면 그들의 저장 목록에서 보이지 않게 됩니다." | "{{count}} people saved this list. Making it private will hide it from their saved lists.",
        "saversSub": "지난 30일 안에 저장" | "Saved within 30 days",
        "effect1": "리스트 탐색·검색에서 사라집니다" | "Removed from list explore and search",
        "effect2": "저장한 사람의 목록에서 숨겨집니다" | "Hidden from savers' saved lists",
        "effect3": "받은 좋아요·댓글은 보존됩니다" | "Your likes and comments are kept",
        "confirm": "비공개로 전환" | "Make private",
        "cancel": "취소" | "Cancel"
      },
      "qa": {
        "saveAsList": "이 결과를 리스트로 저장" | "Save results as list",
        "saveAsListSub": "상위 {{count}}병 · 초안으로 생성됩니다" | "Top {{count}} wines · Saved as draft"
      }
    }
  </i18n_keys_to_add>

  <cellar_tabs_modification>
    src/components/cellar/cellar-tabs.tsx 수정:
    - CellarTab 타입: 'cellar' | 'tasted' | 'list'
    - Props에 listCount: number 추가
    - 탭 배열에 { id:'list', label: t('cellar.tabs.list'), count: listCount } 추가
    - i18n: cellar.tabs.list = "리스트" | "Lists"
    - cellar.tsx에서 tab === 'list' 분기 추가 → <ListTabContent />
  </cellar_tabs_modification>

  <hooks_design>
    use-wine-lists.ts:
    - useMyLists(sort: SortOption): { lists, isLoading, error, refetch }
    - useListDetail(id: string): { list, wines, stats, isSaved, isLoading }
    - useCreateList(): { create(title, desc, visibility, wines), isLoading }
    - useUpdateList(): { update(id, fields), isLoading }
    - useDeleteList(): { delete(id), isLoading }
    - useSaveList(): { save(listId), unsave(listId), isSaved }
    - useImportList(): { importList(listId), isLoading }
    - useToggleVisibility(): { toggle(id, currentVisibility, saveCount), isLoading }
  </hooks_design>

  <theme_verification_checklist>
    §4-9 준수: 구현 완료 후 반드시 Expo dev에서 다크/라이트 토글 검증.
    점검 항목:
    - ListCard 배경색 (bg.surface) — 다크: #3D2A4A, 라이트: #FFFFFF
    - ListCard accent stripe — 양쪽 동일 색상 (brand-fixed)
    - FAB 그라디언트 — brand-fixed, 양쪽 동일
    - VisibilitySheet 배경 — bg.deepest 토큰으로
    - InlineListCard 그라디언트 배경 — bg.deep→bg.surface (다크에서 자연스러운지 확인)
  </theme_verification_checklist>
</key_implementation_notes>

<final_integration_test>
  <test_scenario_1>
    <description>내 리스트 생성 → 목록 확인</description>
    <steps>
      1. 셀러 탭 진입 → "리스트" 탭 탭
      2. "총 0개의 리스트" + 빈 상태 화면 확인
      3. FAB "새 리스트" 탭 → create 모달 열림
      4. 제목 "보르도 컬렉션" 입력, 설명 입력
      5. "만들기" 버튼 탭 → 모달 닫힘, 목록에 새 카드 나타남
      6. 카드에 "보르도 컬렉션" 제목, 비공개 자물쇠 아이콘, "0병" 표시 확인
    </steps>
  </test_scenario_1>

  <test_scenario_2>
    <description>리스트 상세 → 공개 전환 → 비공개 전환</description>
    <steps>
      1. 리스트 카드 탭 → 상세 화면 진입
      2. 하단 자물쇠 버튼 탭 → 공개 전환 시트 열림
      3. 골드 글로브 아이콘 + 안내 3항목 확인
      4. "공개하기" 탭 → 시트 닫힘, 상단 라벨 "공개 리스트"로 변경
      5. 다시 자물쇠(→ 글로브) 버튼 탭 → 비공개 전환 경고 시트 열림
      6. 경고 아이콘 + 저장자 미리보기 확인
      7. "비공개로 전환" 탭 → 시트 닫힘, 라벨 "내 리스트"로 변경
    </steps>
  </test_scenario_2>

  <test_scenario_3>
    <description>공개 리스트 저장 + 가져오기</description>
    <steps>
      1. 공개 리스트 상세 진입 (타 사용자 리스트)
      2. "저장" 버튼 탭 → 버튼 텍스트 "저장됨"으로 변경 (토글)
      3. "내 리스트로 가져오기" 탭 → 내 리스트 탭에 복사본 카드 생성
      4. 복사본 제목: "{원제목} (복사본)" | "{title} (copy)"
      5. 복사본 가시성: 비공개
    </steps>
  </test_scenario_3>

  <test_scenario_4>
    <description>커뮤니티 인라인 리스트 카드</description>
    <steps>
      1. 커뮤니티 피드에서 리스트가 태그된 게시물 확인
      2. 인라인 카드에 리스트 아이콘, 작성자, 레벨 배지, 제목, 병 수, 저장 수 표시
      3. 상위 3개 와인 미리보기 + "외 N병 더" 표시
      4. 카드 탭 → 리스트 상세 화면으로 이동
    </steps>
  </test_scenario_4>

  <test_scenario_5>
    <description>Q&A → 리스트 저장 CTA</description>
    <steps>
      1. 커뮤니티 Q&A 글 진입
      2. "가장 많이 추천된 와인" 섹션 하단 CTA 확인
      3. "이 결과를 리스트로 저장" / "상위 5병 · 초안으로 생성됩니다" 텍스트 확인
      4. CTA 탭 → 리스트 생성 화면이 Q&A 제목 + 상위 5병 와인 선채워진 채로 열림
      5. "만들기" → 내 리스트 탭에 비공개 리스트 생성 확인
    </steps>
  </test_scenario_5>

  <test_scenario_6>
    <description>영어 모드 전체 검증</description>
    <steps>
      1. 설정에서 언어 English로 변경
      2. 셀러 탭 "Lists" 탭 확인 (한글 없음)
      3. FAB "New list" 확인
      4. 리스트 생성 화면 모든 레이블 영어 확인
      5. 공개/비공개 시트 영어 확인
      6. 커뮤니티 인라인 카드 "List" eyebrow 확인
    </steps>
  </test_scenario_6>

  <test_scenario_7>
    <description>다크 모드 시각 검증</description>
    <steps>
      1. 다크 모드 전환
      2. 리스트 탭: ListCard 배경 #3D2A4A, accent stripe 색상 유지 확인
      3. 리스트 상세: 히어로 섹션 배경, 와인 행 구분선 확인
      4. 생성 화면: 토글, 카드 배경 확인
      5. VisibilitySheet: 배경 bg.deep(#2E1F3F) 확인
      6. 하드코딩 hex 없이 토큰만 사용되었는지 grep 확인
    </steps>
  </test_scenario_7>
</final_integration_test>

<success_criteria>
  <functionality>
    - 리스트 생성·편집·삭제 모두 Supabase에 정상 반영
    - RLS: 비공개 리스트는 타 사용자 조회 불가 (Supabase SQL 단위 테스트 통과)
    - 공개 리스트 저장/복제 정상 동작
    - 커뮤니티 인라인 카드 렌더링 정상
    - Q&A → 리스트 변환 CTA 동작
  </functionality>
  <user_experience>
    - 리스트 탭 로딩 &lt; 1초 (셀러와 동일한 성능 목표)
    - 리스트 생성 플로우 3탭 이내 완료 가능
    - 공개/비공개 전환 시트 부드러운 슬라이드 애니메이션
  </user_experience>
  <visual_design>
    - WT 토큰 → RN 토큰 매핑 오차 없음 (hex 직접 비교)
    - §4-11 Pressable 패턴 100% 준수 (audit-pressable.sh DANGEROUS 0건)
    - 다크/라이트 양쪽 디자인 review PASS
    - 영어 모드 한글 노출 0건
  </visual_design>
  <technical_quality>
    - 모든 새 테이블 RLS ENABLED + 정책 단위 테스트
    - SERVICE_ROLE_KEY RN 코드 내 사용 0건
    - 하드코딩 hex 0건 (grep 통과)
  </technical_quality>
</success_criteria>

</project_specification>
