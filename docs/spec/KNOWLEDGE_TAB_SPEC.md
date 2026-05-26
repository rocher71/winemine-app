<project_specification>

<project_name>winemine Knowledge Tab — v0.2.0</project_name>

<overview>
  지도 탭(map)을 와인 지식 탭(knowledge)으로 교체한다.
  시안 C Light (아이보리/크림 라이트 테마, 상단 4-탭 구조)을 기준으로 구현.
  라이트 모드 전용. 하위 4탭: 레슨/지역/와이너리/빈티지.

  참고 시안: ~/dev/local-handoff/knowledge-tab-export/
    - knowledge-c-light.jsx           (메인 + 4탭 내용)
    - knowledge-c-light-details.jsx   (레슨 상세 3종)
    - knowledge-c-light-region.jsx    (지역 드릴다운 3단계)
    - knowledge-c-light-winery.jsx    (와이너리 상세)
    - knowledge-c-light-vintage.jsx   (빈티지 상세)

  개발 방침:
  - 컴포넌트 정의 우선(재활용성), 이후 화면 조립
  - Phase 1: 목 데이터 (src/lib/mock/knowledge.ts)
  - Phase 2: Supabase 테이블 + RLS (추후 마이그레이션)
</overview>

<scope_boundaries>
  <in_scope>
    - app/(tabs)/map.tsx → knowledge.tsx 교체 (파일명 + i18n 키)
    - 상단 4-탭 컨트롤 (레슨/지역/와이너리/빈티지)
    - 레슨 탭: 연속 학습 현황 + 오늘의 카드 + 이전 레슨 목록
    - 레슨 상세: 읽기 뷰 + 학습 완료 뷰 + 학습 기록 뷰
    - 지역 탭: 국가 그리드 + 국가 상세 + 지역 상세 + 아펠라시옹 상세
    - 와이너리 탭: 목록 + 와이너리 프로필 + 라인업
    - 빈티지 탭: 목록 + 빈티지 상세 + 차트
    - 10개 신규 재활용 가능 컴포넌트 (src/components/knowledge/)
    - design-tokens.ts 라이트 모드 토큰 4개 보강
    - i18n ko/en 스트링 추가
    - 목 데이터 파일 (src/lib/mock/knowledge.ts)
  </in_scope>
  <out_of_scope>
    - Supabase 마이그레이션 SQL (Phase 2)
    - 실제 콘텐츠 CMS / 관리자 UI
    - 검색 기능 (AppHeader 검색 아이콘은 현재 비활성)
    - 다크 모드 지원 (라이트 모드 전용)
    - 유저 북마크 / 공유 기능 (UI는 있으나 기능 미연결)
    - AI 소믈리에 탭 (Exp-3 검증 이후 별도 스펙)
  </out_of_scope>
</scope_boundaries>

<technology_stack>
  <!-- 기존 프로젝트 스택 그대로 계승 -->
  <item>React Native 0.81 + Expo SDK 54</item>
  <item>expo-router v4 (file-based routing)</item>
  <item>NativeWind v4 + jsxImportSource nativewind (Fabric)</item>
  <item>TypeScript strict</item>
  <item>i18next + react-i18next</item>
  <item>design-tokens.ts (src/lib/design-tokens.ts)</item>
  <item>useThemeTokens() hook for token access</item>
  <item>CLAUDE.md §4-11 Pressable 3-layer 패턴 필수</item>
</technology_stack>

<design_token_extensions>
  <!-- design-tokens.ts에 추가해야 할 토큰 4개 -->
  <!-- 파일: src/lib/design-tokens.ts -->

  brand 그룹 추가:
    goldWash:  '#F2E5BD'   // lesson card inset, compare card bg
    wineWash:  '#F1D9DC'   // lesson category badge bg

  light.bg 그룹 추가:
    surfaceUp: '#FCF7EB'   // raised card (compare, callout 내부)
    inset:     '#EAE0C9'   // input slot, progress bar track

  <!-- KTL 토큰 → design-tokens.ts 매핑 참조표 -->
  KTL.pageBg1      → light.bg.deep        (#F2EAD9)
  KTL.pageBg2      → light.bg.map         (#EDE2CC)
  KTL.surface      → light.bg.deepest     (#FAF5EC)
  KTL.surfaceUp    → light.bg.surfaceUp   (#FCF7EB) [신규]
  KTL.inset        → light.bg.inset       (#EAE0C9) [신규]
  KTL.gold         → light.border.active  (#B89438)
  KTL.goldHover    → brand.goldDeep       (#A07F2E)
  KTL.goldSoft     → brand.goldSoft       (#D4B85C)
  KTL.goldWash     → brand.goldWash       (#F2E5BD) [신규]
  KTL.wine         → brand.wineRed        (#8B1A2A)
  KTL.wineWash     → brand.wineWash       (#F1D9DC) [신규]
  KTL.textPrimary  → light.text.primary   (#2A1A14)
  KTL.textSecond   → light.text.secondary (#5A463C) [근사값]
  KTL.textMuted    → light.text.muted     (#8B7766) [근사값]
  KTL.textDim      → light.text.disabled  (#C0B0A0) [근사값]
  KTL.border       → light.border.default (#E0D2BC) [근사값]
  KTL.borderSoft   → light.border.default (#E0D2BC) [동일]
  KTL.borderActive → light.border.active  (#B89438)
</design_token_extensions>

<route_definitions>
  <!-- 탭 교체 -->
  app/(tabs)/knowledge.tsx    // 지식 탭 메인 (map.tsx 대체)

  <!-- 레슨 상세 -->
  app/knowledge/lesson/[id].tsx          // 레슨 읽기 뷰
  app/knowledge/lesson/[id]/done.tsx     // 학습 완료 celebration
  app/knowledge/history.tsx              // 학습 기록 + 캘린더

  <!-- 지역 드릴다운 -->
  app/knowledge/country/[id].tsx         // 국가 상세 (예: 프랑스)
  app/knowledge/subregion/[id].tsx       // 지역 상세 (예: 부르고뉴)
  app/knowledge/appellation/[id].tsx     // 아펠라시옹 상세 (예: Vosne-Romanée)

  <!-- 와이너리 -->
  app/knowledge/winery/[id].tsx          // 와이너리 프로필
  app/knowledge/winery/[id]/lineup.tsx   // 전체 라인업

  <!-- 빈티지 -->
  app/knowledge/vintage/[id].tsx         // 빈티지 상세
  app/knowledge/vintage/chart.tsx        // 지역별 빈티지 차트

  <!-- 네비게이션 변경 -->
  app/(tabs)/_layout.tsx:
    <Tabs.Screen name="map" .../>  →  <Tabs.Screen name="knowledge" .../>
    title: t('nav.map')            →  t('nav.knowledge')
</route_definitions>

<component_hierarchy>
  <!-- ── src/components/knowledge/ (신규, 재활용 우선 설계) ── -->

  KnowledgeTabBar           // 상단 4탭 슬라이딩 언더라인
  SectionLabel              // 금색 uppercase 섹션 라벨
  StreakBar                 // 연속 학습 현황 위젯
  TodayLessonCard           // 오늘의 레슨 카드 (gold/wine top accent)
  LessonListRow             // 이전 레슨 목록 행
  RegionFlag                // 국가 컬러 그라디언트 타일
  ScoreArc                  // 원형 점수 arc SVG (빈티지 점수)
  CompareCard               // 좌우 2열 비교 카드
  Callout                   // 왼쪽 보더 인용구 블록
  ProfileBar                // 5축 바 (바디/산도/타닌 등)
  StatTile                  // k/v 단일 통계 타일
  TagChip                   // 소형 accent 태그 뱃지

  <!-- ── 기존 재활용 컴포넌트 ── -->
  src/components/shared/primary-button.tsx    // 학습 완료 CTA
  src/components/shared/locale-text.tsx       // ko/en 텍스트
  src/components/shared/wm-bottle.tsx         // 와이너리 탭 병 아이콘 (LBottleMini 대체)
  src/components/shared/mini-bar-chart.tsx    // 가격 비교 바 (PriceCompare 대체)
  src/components/shared/empty-state.tsx       // 빈 상태
  src/components/nav/bottom-nav.tsx           // BottomNav (변경 없음)
</component_hierarchy>

<core_data_entities>
  <!-- Phase 1: 목 데이터 (src/lib/mock/knowledge.ts) -->
  <!-- Phase 2: Supabase 테이블로 이관 -->

  Lesson {
    id: string
    day: number                 // Day 1, Day 2, ...
    category: string            // '비교 학습' | '품종' | '지역' | '양조' | '테이스팅' | '서빙'
    title: LocalizedString      // { ko, en }
    subtitle: LocalizedString   // 리드 문장
    body: Section[]             // 섹션 배열 (idx, title, content)
    summary: LocalizedString    // 오늘의 한 줄
    readMinutes: number
    publishedAt: string         // ISO 날짜
  }

  Section {
    idx: string                 // '01', '02', ...
    title: LocalizedString
    content: ContentBlock[]
  }

  ContentBlock {
    type: 'paragraph' | 'compare' | 'callout' | 'price-chart'
    // type별 payload 다름
  }

  LessonCompletion {
    lessonId: string
    completedAt: string
    userId: string              // Supabase UUID (Phase 2)
  }

  LessonStreak {
    currentStreak: number
    longestStreak: number
    totalCompleted: number
    completedDays: number[]     // 이번 달 완료일 (달력용)
  }

  Region {
    id: string
    type: 'country' | 'subregion' | 'appellation'
    parentId: string | null
    name: LocalizedString
    nameLatin: string
    accent: string              // hex, 지도 색상
    grapes: string[]
    stats: Record<string, string>   // { '와인 산지': '13', 'AOC': '234' }
    description: LocalizedString
    climate: string
    soil: string
    grapeCount: number
    profile: ProfileAxis[]
    tiers: TierRow[]
  }

  ProfileAxis {
    label: string   // '바디' | '산도' | '타닌' | '과실' | '스파이스'
    value: number   // 1~5
  }

  TierRow {
    name: string    // 'Grand Cru' | 'Premier Cru' | ...
    sub: string
    pct: number     // 시각적 폭 비율
    color: string
  }

  Winery {
    id: string
    shortName: string           // 'DRC'
    fullName: string            // 'Domaine de la Romanée-Conti'
    country: string             // 'FR'
    location: LocalizedString
    established: number
    acreage: string             // '25 ha'
    flagship: string
    philosophy: LocalizedString
    description: LocalizedString
    accentColor: string         // hex, bottle 색상
    lineup: WineEntry[]
    grandCrus: CruEntry[]
  }

  WineEntry {
    id: string
    name: string
    type: string
    vintage?: number
  }

  CruEntry {
    name: string
    ha: number
    highlight: boolean
    desc: LocalizedString
  }

  VintageEntry {
    id: string
    region: LocalizedString
    year: number
    score: number               // 0~100
    climate: LocalizedString
    tag: LocalizedString        // '최고작' | '바디감 강함' | ...
    summary: LocalizedString
    accentColor: string
    climateEvents: ClimateEvent[]
  }

  ClimateEvent {
    when: string                // '봄' | '초여름' | ...
    headline: string
    body: string
    tone: string                // hex
  }
</core_data_entities>

<mock_data_file>
  <!-- 경로: src/lib/mock/knowledge.ts -->
  <!-- 내용: knowledge-c-light.jsx 내 L_TODAY, L_PREV, L_REGIONS, L_WINERIES, L_VINTAGES를
       TypeScript 타입 기반으로 변환. LocalizedString 형식 (ko/en 양쪽 필수) -->

  export const MOCK_LESSONS: Lesson[]         // 12개 (Day 1~12)
  export const MOCK_STREAK: LessonStreak
  export const MOCK_REGIONS: Region[]         // 국가 5개 + 하위 지역 포함
  export const MOCK_WINERIES: Winery[]        // 4개 (DRC, Opus One, Penfolds, Sassicaia)
  export const MOCK_VINTAGES: VintageEntry[]  // 4개
</mock_data_file>

<pages_and_interfaces>

  <!-- ═══════════════════════════════════════════════
       1. 지식 탭 메인 — app/(tabs)/knowledge.tsx
       ═══════════════════════════════════════════════ -->
  <screen name="KnowledgeTab">
    <layout>
      StatusBar (light content)
      AppHeader title="지식" (Playfair Display 24px, light.text.primary) + 검색 아이콘 (비활성)
      KnowledgeTabBar (4탭 슬라이딩 언더라인)
      ScrollView (flex: 1, paddingBottom: 110)
        [tab === 'lesson'] → LessonTabContent
        [tab === 'region'] → RegionTabContent
        [tab === 'winery'] → WineryTabContent
        [tab === 'vintage'] → VintageTabContent
    </layout>

    <lesson_tab_content name="LessonTabContent">
      StreakBar (margin 16px 20px)
      TodayLessonCard (margin 0 20px 24px) → onPress: router.push('/knowledge/lesson/[id]')
      SectionLabel "이전 레슨"
      LessonList:
        {MOCK_PREV.map(l => <LessonListRow key={l.day} {...l}
          onPress={() => router.push('/knowledge/lesson/[id]')} />)}
    </lesson_tab_content>

    <region_tab_content name="RegionTabContent">
      힌트 텍스트 "국가를 선택하면 지역·아펠라시옹으로 드릴다운됩니다." (fontSize 11, light.text.muted)
      2열 그리드 (gap 10px):
        {MOCK_REGIONS.filter(r => r.type === 'country').map(r =>
          <CountryCard key={r.id} region={r}
            onPress={() => router.push('/knowledge/country/[id]')} />)}
    </region_tab_content>

    <winery_tab_content name="WineryTabContent">
      flexColumn gap 10:
        {MOCK_WINERIES.map(w =>
          <WineryListCard key={w.id} winery={w}
            onPress={() => router.push('/knowledge/winery/[id]')} />)}
    </winery_tab_content>

    <vintage_tab_content name="VintageTabContent">
      flexColumn gap 10:
        {MOCK_VINTAGES.map(v =>
          <VintageListCard key={v.id} vintage={v}
            onPress={() => router.push('/knowledge/vintage/[id]')} />)}
    </vintage_tab_content>
  </screen>

  <!-- ═══════════════════════════════════════════════
       2. 레슨 읽기 — app/knowledge/lesson/[id].tsx
       ═══════════════════════════════════════════════ -->
  <screen name="LessonDetail">
    <layout>
      LBackHeader title="Day {lesson.day}" sub="{category} · {readMinutes}분"
        trailing: 북마크 아이콘 + 공유 아이콘 (비활성)
      ScrollView paddingBottom 92
        Hero: 카테고리 뱃지(wine red) + 날짜 + H1(Playfair 28px) + 리드 문장(Cormorant italic)
        Divider (gold dot + 라인)
        {lesson.body.map(section =>
          <SectionBlock idx={s.idx} title={s.title}>
            {s.content.map(block => <ContentRenderer block={block} />)}
          </SectionBlock>)}
        WrapUp: 오늘의 한 줄 (gold wash 배경, Cormorant italic 17px)
      StickyBottom CTA:
        PrimaryButton "오늘 학습 완료" onPress={() => router.push('/knowledge/lesson/[id]/done')}
    </layout>

    <content_blocks>
      paragraph → <Text style={paraStyle}>
      compare   → <CompareCard left={...} right={...} />
      callout   → <Callout>{text}</Callout>
      price-chart → <MiniBarChart rows={...} /> (기존 컴포넌트 재활용)
    </content_blocks>
  </screen>

  <!-- ═══════════════════════════════════════════════
       3. 학습 완료 — app/knowledge/lesson/[id]/done.tsx
       ═══════════════════════════════════════════════ -->
  <screen name="LessonDone">
    <layout>
      닫기 버튼 (X 아이콘)
      ScrollView paddingBottom 110
        MedalSeal SVG (148x148)
        "Day {n} · 학습 완료" uppercase gold
        H1 Playfair "오늘도 한 잔,\n채웠어요"
        설명 본문
        StreakProgressCard: 현재 N일 → N+1일 + 다음 보상 표시
        MiniStatGrid (3열): 이번 주 / 평균 소요 / 누적
        NextLessonPreview: Day N+1 내일 만날 레슨 카드
      StickyBottom 2-버튼:
        Secondary "공유" (비활성)
        PrimaryButton "홈으로 돌아가기" onPress={() => router.back()}
    </layout>
  </screen>

  <!-- ═══════════════════════════════════════════════
       4. 학습 기록 — app/knowledge/history.tsx
       ═══════════════════════════════════════════════ -->
  <screen name="LessonHistory">
    <layout>
      LBackHeader title="학습 기록"
      ScrollView paddingBottom 36
        BigStatGrid (3열): 현재 연속 / 최장 연속 / 총 학습
        CalendarSection:
          월 네비게이션 (이전/다음 버튼)
          Calendar 7열 그리드 (완료=gold, 오늘=wine, 미학습=dim)
          범례 (완료/오늘/미학습)
        CategoryDistribution:
          각 카테고리별 DistRow (label + count + 퍼센트 바)
        BadgeGrid (3열): 획득 배지 + 다음 목표 배지 (dashed border, 0.7 opacity)
    </layout>
  </screen>

  <!-- ═══════════════════════════════════════════════
       5. 국가 상세 — app/knowledge/country/[id].tsx
       ═══════════════════════════════════════════════ -->
  <screen name="CountryDetail">
    <layout>
      LBackHeader title="{region.name.ko}" sub="{region.nameLatin} · {n}개 산지"
        trailing: 북마크 아이콘
      ScrollView paddingBottom 36
        HeroBand (132px, 국기 컬러 그라디언트 + FR·WINE 배지 + 국가명 italic)
        QuickStatRow (3열): StatTile
        IntroParagraph (surface 카드, 12.5px)
        SectionLabel "주요 산지"
        subRegions.map(r =>
          <RegionRow key={r.id} {...r}
            onPress={() => router.push('/knowledge/subregion/[id]')} />)
    </layout>
  </screen>

  <!-- ═══════════════════════════════════════════════
       6. 지역 상세 — app/knowledge/subregion/[id].tsx
       ═══════════════════════════════════════════════ -->
  <screen name="SubRegionDetail">
    <layout>
      LBackHeader title="{region.name.ko}" sub="{region.nameLatin} · {n} sub-zones"
        trailing: 북마크 아이콘
      ScrollView paddingBottom 36
        Breadcrumb (국가 > 지역)
        Hero: H1 Playfair 30px latin name + italic 부제 + 설명
        ClimateChipRow (3열): 기후/토양/품종 (ThermometerIcon/SoilIcon/GrapeIcon)
        SectionLabel "등급 체계"
        TierPyramid (역피라미드 시각화)
        SectionLabel "하위 산지"
        subzones.map(z =>
          <SubzoneCard key={z.id} {...z}
            onPress={() => router.push('/knowledge/appellation/[id]')} />)
    </layout>
  </screen>

  <!-- ═══════════════════════════════════════════════
       7. 아펠라시옹 상세 — app/knowledge/appellation/[id].tsx
       ═══════════════════════════════════════════════ -->
  <screen name="AppellationDetail">
    <layout>
      LBackHeader title="{appellation.nameLatin}" sub="AOC · {appellation.name.ko}"
        trailing: 북마크 아이콘 (활성 상태)
      ScrollView paddingBottom 36
        Breadcrumb (국가 > 지역 > 하위산지)
        Hero: 카테고리 뱃지(마을 AOC) + H1 latin name + italic 설명 + 본문
        KeyFactStrip (3열): 면적/품종/Grand Cru 수
        SectionLabel "스타일 프로파일"
        ProfileBar axes={appellation.profile}
        SectionLabel "그랑크뤼 ({count})"
        GrandCruList (목록)
        SectionLabel "주요 도멘"
        ProducerGrid (2열)
    </layout>
  </screen>

  <!-- ═══════════════════════════════════════════════
       8. 와이너리 프로필 — app/knowledge/winery/[id].tsx
       ═══════════════════════════════════════════════ -->
  <screen name="WineryProfile">
    <layout>
      LBackHeader title="{winery.shortName}" sub="{winery.fullName}"
        trailing: 북마크 아이콘
      ScrollView paddingBottom 36
        CrestHero: WineryCrest SVG + EST. 연도 + 풀네임 H1 + 위치
        MicroStatGrid (4열): 설립/면적/Grand Cru/연 생산
        SectionLabel "철학"
        PhilosophyCard: 인용구 (Cormorant italic) + 설명
        SectionLabel "보유 그랑크뤼"
        OwnedCruList
        SecondaryButton "전체 라인업 {n}종 보기"
          onPress={() => router.push('/knowledge/winery/[id]/lineup')}
    </layout>
  </screen>

  <!-- ═══════════════════════════════════════════════
       9. 와이너리 라인업 — app/knowledge/winery/[id]/lineup.tsx
       ═══════════════════════════════════════════════ -->
  <screen name="WineryLineup">
    <layout>
      LBackHeader title="라인업" sub="{winery.shortName}"
      ScrollView paddingBottom 36
        Breadcrumb (와이너리명)
        라인업 목록: WineEntry 행 (WmBottle + 이름 + 타입 + 빈티지 + 점수)
    </layout>
  </screen>

  <!-- ═══════════════════════════════════════════════
       10. 빈티지 상세 — app/knowledge/vintage/[id].tsx
       ═══════════════════════════════════════════════ -->
  <screen name="VintageDetail">
    <layout>
      LBackHeader title="{vintage.year} · {vintage.region.ko}" sub="빈티지 · {vintage.region.ko}"
        trailing: 북마크 아이콘
      ScrollView paddingBottom 36
        ScoreHero: ScoreArc (84px) + 연도 H1 + 지역 + 기후/태그 뱃지
        SectionLabel "기후 연대기"
        ClimateTimeline events={vintage.climateEvents}
        SectionLabel "스타일 특징"
        StyleProfile (전통/현대/아치브용이성/고령 등 축)
        SectionLabel "음식 페어링"
        PairingRow
        SectionLabel "같은 지역 다른 빈티지"
        RelatedVintageList (3개)
    </layout>
  </screen>

</pages_and_interfaces>

<new_components_spec>
  <!-- 각 컴포넌트는 src/components/knowledge/{name}.tsx 에 위치 -->
  <!-- CLAUDE.md §4-11 Pressable 3-layer 패턴 적용 의무 -->
  <!-- 모든 색은 design-tokens.ts 토큰 참조 (하드코딩 hex 금지) -->

  <component name="KnowledgeTabBar" file="knowledge-tab-bar.tsx">
    Props:
      activeTab: 'lesson' | 'region' | 'winery' | 'vintage'
      onTabChange: (tab: string) => void
    Behavior:
      4탭 버튼 (레슨/지역/와이너리/빈티지)
      activeTab 하단 gold 2px 언더라인 (width = 25%, left = idx * 25%)
      언더라인 transition: left 0.32s cubic-bezier(0.32, 0.72, 0, 1)
      활성 탭 색: light.text.primary, fontWeight 600
      비활성 탭 색: light.text.muted, fontWeight 500
      배경: light.bg.deep
      하단 0.5px border: light.border.default
    Notes:
      cssInterop 충돌 방지 — 언더라인 위치는 inline style로만 (className 미사용)
      React.useState는 부모(KnowledgeTab)에서 관리, 이 컴포넌트는 controlled
  </component>

  <component name="SectionLabel" file="section-label.tsx">
    Props:
      children: string
      style?: StyleProp
    Render:
      padding: 0 20px, marginBottom 12
      Text: fontSize 11, fontWeight 700, color light.border.active (gold),
            letterSpacing 0.16em, textTransform uppercase
    Re-usable: 셀러/홈에서도 동일 패턴 사용 가능
  </component>

  <component name="StreakBar" file="streak-bar.tsx">
    Props:
      streak: LessonStreak
    Render:
      외부 카드: margin 16px 20px, padding 14px 16px, borderRadius 12
                 bg light.bg.deepest, border light.border.default
      상단 행: gold flame 아이콘 (36px 원형) + "N일째 학습 중" + "+2일이면 14일" 텍스트
      하단 진행 바: height 6px, borderRadius 999
                   track: light.bg.inset
                   fill: linear-gradient(gold gradient), glow shadow
  </component>

  <component name="TodayLessonCard" file="today-lesson-card.tsx">
    Props:
      lesson: Pick(Lesson, day, category, title, body 요약, summary)
      onPress: () => void
    Render:
      카드: margin 0 20px 24px, borderRadius 14, bg light.bg.deepest, border light.border.default
      최상단 3px 그라디언트 바 (gold → goldHover 60% → wine)
      헤더 행: "오늘의 레슨 · Day N" (wine, uppercase) | category
      H2: Playfair 22px light.text.primary
      본문 요약: Inter 13.5px light.text.secondary
      비교 요약 그리드 (inset bg 패널): LSummary 스타일 3행
      PrimaryButton "오늘 학습 완료" (check 아이콘 포함)
    Pressable pattern: outer View(flex) → Pressable(opacity only) → inner View(all styles)
  </component>

  <component name="LessonListRow" file="lesson-list-row.tsx">
    Props:
      lesson: { day, title, sub, read: boolean }
      onPress: () => void
    Render:
      행 패딩 13px 14px, borderBottom 0.5px light.border.default (마지막 행 제외)
      왼쪽 28px 원형: read=true → gold check 아이콘, false → day 숫자
      중앙: "DAY N · {sub}" 캡션 + 제목 텍스트
      오른쪽: chevron 아이콘
    read=true 시 전체 opacity 0.8, 텍스트 색 light.text.secondary
  </component>

  <component name="RegionFlag" file="region-flag.tsx">
    Props:
      accentColor: string   // 국가 대표색 hex
      code: string          // 'FRA' | 'ITA' | ...
      height?: number       // default 68
    Render:
      View: width 100%, height h, borderRadius 8
            bg: linear-gradient(135deg, accent, accent+'aa', accent+'55')
            overlay: 45도 반복 줄무늬 (rgba white 7%)
      우하단 이탤릭 코드 텍스트 (Playfair 22px)
    Re-usable: 향후 와인 상세 페이지 지역 섹션에서 재활용 가능
  </component>

  <component name="ScoreArc" file="score-arc.tsx">
    Props:
      value: number   // 0~100
      size?: number   // default 44
    Render:
      SVG: size x size
      배경 원: stroke light.border.default, strokeWidth 2.5
      점수 원: stroke light.border.active (gold), strokeDasharray 계산값
               rotate -90도, strokeLinecap round
      중앙 텍스트: Playfair 14px, light.text.primary
    Re-usable: 와인 평점 표시에도 재활용 가능
  </component>

  <component name="CompareCard" file="compare-card.tsx">
    Props:
      left: { name: string; items: string[] }
      right: { name: string; items: string[] }
    Render:
      외부 카드: borderRadius 12, bg light.bg.surfaceUp, border light.border.default
      내부 3열 그리드 (1fr 1px 1fr): 왼쪽 CompareCol | 구분선 | 오른쪽 CompareCol
      CompareCol: 상단 colored dot + 이름 + items 목록 (Cormorant italic/Inter 혼합)
      왼쪽 accent: brand.wineRed, 오른쪽 accent: brand.goldDeep
  </component>

  <component name="Callout" file="callout.tsx">
    Props:
      children: ReactNode
    Render:
      margin 4px 0 14px
      padding 14px 16px
      borderLeft 3px solid light.border.active (gold)
      bg brand.goldWash + '66' (transparent wash)
      borderRadius 0 8px 8px 0
      fontFamily Cormorant Garamond, fontSize 14.5, italic
  </component>

  <component name="ProfileBar" file="profile-bar.tsx">
    Props:
      axes: ProfileAxis[]   // { label, value: 1~5 }
    Render:
      flexColumn gap 9
      각 축: label(56px 고정폭) + 5개 세그먼트 바 + 숫자
      세그먼트: height 7px, borderRadius 2
                filled: bg light.border.active (gold), border goldDeep
                empty: bg light.bg.inset, border light.border.default
  </component>

  <component name="StatTile" file="stat-tile.tsx">
    Props:
      label: string
      value: string | number
      unit?: string
      highlight?: boolean
    Render:
      padding 12px, borderRadius 12
      bg: highlight ? brand.goldWash : light.bg.deepest
      border: highlight ? brand.goldWash + '99' : light.border.default
      label: fontSize 9.5 uppercase, muted/goldDeep
      value: Playfair 20~28px (size=large prop으로 조절)
      unit: fontSize 11, muted
    Re-usable: 셀러 통계, 프로필 통계에서 재활용 가능
  </component>

  <component name="TagChip" file="tag-chip.tsx">
    Props:
      label: string
      accentColor: string   // hex
    Render:
      fontSize 9.5, padding 2px 7px, borderRadius 999
      bg: accentColor + '22'
      color: accentColor
      border: 1px solid accentColor + '55'
      fontWeight 600
    Re-usable: 와인 스타일 태그, 셀러 필터 등
  </component>
</new_components_spec>

<reused_components_guidance>
  PrimaryButton (src/components/shared/primary-button.tsx):
    학습 완료 CTA, 완료 화면 홈 이동 버튼에 사용.
    variant="gold" 또는 기본 스타일이 light 모드에 맞는지 확인 후 사용.

  WmBottle (src/components/shared/wm-bottle.tsx):
    와이너리 목록 카드에서 LBottleMini 대체 역할.
    color prop: winery.accentColor 전달.
    크기는 w=26 h=78 수준.

  MiniBarChart (src/components/shared/mini-bar-chart.tsx):
    레슨 상세의 PriceCompare 블록에서 사용.
    rows prop 타입 확인 후 LessonDetail ContentRenderer에서 'price-chart' type 처리.

  LocaleText (src/components/shared/locale-text.tsx):
    모든 LocalizedString 필드 렌더링 시 사용.
    knowledge 탭도 ko/en 양쪽 지원 필수 (CLAUDE.md §4-4).

  EmptyState (src/components/shared/empty-state.tsx):
    각 탭 데이터 로딩 실패 또는 빈 상태 표시.
</reused_components_guidance>

<navigation_changes>
  <!-- 1. 탭 _layout.tsx 수정 -->
  File: app/(tabs)/_layout.tsx
  변경:
    <Tabs.Screen name="map" options={{ title: t('nav.map') }} />
    →
    <Tabs.Screen name="knowledge" options={{ title: t('nav.knowledge') }} />

  <!-- 2. BottomNav 아이콘/레이블 수정 확인 -->
  File: src/components/nav/bottom-nav.tsx
  확인: 'map' 탭 항목을 'knowledge'로 교체 (icon: BookOpen 또는 기존 book 아이콘)
  지식 탭 active 시: color light.border.active (gold)

  <!-- 3. 기존 map.tsx 처리 -->
  app/(tabs)/map.tsx → 파일 삭제 후 app/(tabs)/knowledge.tsx 신규 생성
  기존 지도 관련 로직은 삭제 (map 탭은 완전 교체)
</navigation_changes>

<i18n_additions>
  <!-- src/lib/i18n/ko.json 추가 -->
  {
    "nav": {
      "knowledge": "지식"
    },
    "knowledge": {
      "tabs": {
        "lesson": "레슨",
        "region": "지역",
        "winery": "와이너리",
        "vintage": "빈티지"
      },
      "lesson": {
        "todayLabel": "오늘의 레슨",
        "prevLabel": "이전 레슨",
        "streakLabel": "연속 학습",
        "streakUnit": "일째 학습 중",
        "completeBtn": "오늘 학습 완료",
        "doneTitle": "오늘도 한 잔,\n채웠어요",
        "doneBackBtn": "홈으로 돌아가기",
        "shareBtn": "공유",
        "historyTitle": "학습 기록",
        "nextLesson": "내일 만날 레슨",
        "categoryLabel": "카테고리 분포",
        "badgesLabel": "획득 배지",
        "calendarLabel": "2026년 {month}월"
      },
      "region": {
        "hint": "국가를 선택하면 지역·아펠라시옹으로 드릴다운됩니다.",
        "subRegions": "주요 산지",
        "subzones": "하위 산지",
        "tierSystem": "등급 체계",
        "styleProfile": "스타일 프로파일",
        "grandCrus": "그랑크뤼 ({count})",
        "producers": "주요 도멘"
      },
      "winery": {
        "philosophy": "철학",
        "grandCrus": "보유 그랑크뤼",
        "lineupBtn": "전체 라인업 {count}종 보기",
        "lineupTitle": "라인업"
      },
      "vintage": {
        "climateTimeline": "기후 연대기",
        "styleFeatures": "스타일 특징",
        "pairing": "음식 페어링",
        "related": "같은 지역 다른 빈티지"
      }
    }
  }

  <!-- src/lib/i18n/en.json 추가 (동일 구조, 영문) -->
  {
    "nav": { "knowledge": "Learn" },
    "knowledge": {
      "tabs": {
        "lesson": "Lesson", "region": "Region",
        "winery": "Winery", "vintage": "Vintage"
      },
      "lesson": {
        "todayLabel": "Today's Lesson",
        "prevLabel": "Previous Lessons",
        "streakLabel": "Streak",
        "streakUnit": "days in a row",
        "completeBtn": "Complete Today's Lesson",
        "doneTitle": "One more glass\nof knowledge",
        "doneBackBtn": "Back to Home",
        "shareBtn": "Share",
        "historyTitle": "Learning History",
        "nextLesson": "Tomorrow's Lesson",
        "categoryLabel": "Category Breakdown",
        "badgesLabel": "Earned Badges"
      },
      "region": {
        "hint": "Tap a country to explore regions and appellations.",
        "subRegions": "Major Regions",
        "subzones": "Sub-zones",
        "tierSystem": "Classification",
        "styleProfile": "Style Profile",
        "grandCrus": "Grand Crus ({count})",
        "producers": "Notable Producers"
      },
      "winery": {
        "philosophy": "Philosophy",
        "grandCrus": "Grand Crus",
        "lineupBtn": "View full lineup ({count})",
        "lineupTitle": "Lineup"
      },
      "vintage": {
        "climateTimeline": "Climate Timeline",
        "styleFeatures": "Style Profile",
        "pairing": "Food Pairing",
        "related": "Other Vintages in This Region"
      }
    }
  }
</i18n_additions>

<hooks_spec>
  <!-- src/hooks/use-knowledge.ts -->
  <!-- Phase 1: 목 데이터 반환, Phase 2: Supabase 쿼리 -->

  export function useLessons(): {
    lessons: Lesson[]
    streak: LessonStreak
    todayLesson: Lesson | null
    previousLessons: Lesson[]
    isLoading: boolean
  }

  export function useLessonDetail(id: string): {
    lesson: Lesson | null
    isLoading: boolean
    markComplete: () => Promise<void>
  }

  export function useRegions(type?: Region['type'], parentId?: string): {
    regions: Region[]
    isLoading: boolean
  }

  export function useWineries(): {
    wineries: Winery[]
    isLoading: boolean
  }

  export function useWineryDetail(id: string): {
    winery: Winery | null
    isLoading: boolean
  }

  export function useVintages(): {
    vintages: VintageEntry[]
    isLoading: boolean
  }

  export function useVintageDetail(id: string): {
    vintage: VintageEntry | null
    isLoading: boolean
  }
</hooks_spec>

<implementation_order>
  <!-- 의존성 순서 기준 빌드 순서 -->

  Phase 0 — 기반 (하루 이내):
    1. design-tokens.ts 토큰 4개 추가
    2. src/lib/mock/knowledge.ts 목 데이터 파일 작성
    3. src/hooks/use-knowledge.ts 훅 작성 (목 데이터 반환)
    4. i18n ko.json + en.json 스트링 추가

  Phase 1 — 컴포넌트 (1~2일):
    5. SectionLabel, TagChip (단순, 의존성 없음)
    6. ScoreArc (SVG only)
    7. RegionFlag (SVG only)
    8. StatTile
    9. ProfileBar
    10. Callout, CompareCard
    11. StreakBar
    12. LessonListRow
    13. TodayLessonCard (PrimaryButton 재활용)
    14. KnowledgeTabBar (마지막, 위 컴포넌트 통합 후 탭 전환 테스트)

  Phase 2 — 메인 탭 화면 (1일):
    15. 네비게이션 변경 (map → knowledge)
    16. app/(tabs)/knowledge.tsx 메인 탭 (4탭 + 각 탭 콘텐츠)

  Phase 3 — 상세 화면 (2~3일):
    17. app/knowledge/lesson/[id].tsx
    18. app/knowledge/lesson/[id]/done.tsx
    19. app/knowledge/history.tsx
    20. app/knowledge/country/[id].tsx
    21. app/knowledge/subregion/[id].tsx
    22. app/knowledge/appellation/[id].tsx
    23. app/knowledge/winery/[id].tsx
    24. app/knowledge/winery/[id]/lineup.tsx
    25. app/knowledge/vintage/[id].tsx

  Phase 4 — 연결 + QA (0.5일):
    26. 라우터 연결 확인 (모든 onPress → router.push)
    27. 라이트 모드 토글 검증
    28. ko/en 모드 양쪽 검증
    29. Pressable 감사 명령 실행: bash scripts/audit-pressable.sh
</implementation_order>

<aesthetic_guidelines>
  <!-- 라이트 모드 전용 — 다크 모드 CSS 없음 -->

  배경:
    페이지: linear-gradient(165deg, light.bg.deep 0%, light.bg.map 60%, light.bg.deep 100%)
    카드: light.bg.deepest (#FAF5EC)
    raised 카드: light.bg.surfaceUp (#FCF7EB)
    inset 패널: light.bg.inset (#EAE0C9)

  타이포그래피:
    페이지 타이틀: Playfair Display 24px, weight 400, light.text.primary
    카드 타이틀: Playfair Display 22px, weight 500
    섹션 레이블: Inter 11px, weight 700, gold(#B89438), letter-spacing 0.16em, uppercase
    본문: Inter 13.5px, weight 400, light.text.secondary, lineHeight 1.7
    메타/캡션: Inter 10~11px, weight 400, light.text.muted
    인용구/이탤릭: Cormorant Garamond 14~17px, italic

  강조 색상:
    Gold (primary CTA, 진행 바, 언더라인): light.border.active = #B89438
    Wine (today 배지, 카테고리 뱃지): brand.wineRed = #8B1A2A
    카드 보더: light.border.default = #E0D2BC
    inset 보더: borderSoft 수준 (#E2D2AE 수준)

  카드 스타일:
    borderRadius: 12~14px
    boxShadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(60,40,15,0.04)
    (RN에서 shadow 속성으로 변환: shadowColor #3C280F, shadowOffset {0,1}, shadowOpacity 0.04)

  버튼:
    Primary (gold): bg #B89438, color #FAF3E3, height 44~50px, borderRadius 12~14px
    Secondary: bg light.bg.deepest, border light.border.default, color light.text.primary
    inner shadow (RN에서는 제거 또는 생략 가능)

  아이콘:
    크기 22px (탭바 아이콘), 18~20px (헤더 액션)
    strokeWidth 1.6~1.8, strokeLinecap round, strokeLinejoin round
    색: 비활성 light.text.muted, 활성 light.border.active (gold)
</aesthetic_guidelines>

<security_considerations>
  - 사용자 학습 기록(LessonCompletion)은 Phase 2에서 RLS로 보호 (user_id 기반)
  - 목 데이터 Phase 1에서는 서버 요청 없음
  - 북마크 기능 Phase 1 미연결 — UI만 존재 (빈 onPress)
  - SERVICE_ROLE_KEY 미사용 (지식 콘텐츠는 public read 가능)
</security_considerations>

<final_integration_test>
  1. 지식 탭 진입 → 4개 탭 버튼 렌더 확인
  2. 레슨 탭: StreakBar + TodayLessonCard + LessonListRow 목록 렌더
  3. 레슨 카드 탭 → LessonDetail 화면 이동
  4. "오늘 학습 완료" → LessonDone 화면 이동 + MedalSeal 렌더
  5. 지역 탭: 국가 그리드 렌더 → 국가 탭 → CountryDetail → RegionRow 탭 → SubRegionDetail → SubzoneCard 탭 → AppellationDetail
  6. 와이너리 탭: WineryListCard 렌더 → WineryProfile → "라인업 보기" → WineryLineup
  7. 빈티지 탭: VintageListCard (ScoreArc 포함) 렌더 → VintageDetail → ClimateTimeline 렌더
  8. ko/en 언어 전환 → 모든 텍스트 로케일 변경 확인 (와인 고유명은 영문 유지)
  9. 라이트 모드 확인 → 모든 bg/text/border가 light.* 토큰 사용 확인
  10. Pressable 감사: bash scripts/audit-pressable.sh → DANGEROUS 0건
</final_integration_test>

<success_criteria>
  - 탭 전환 시 슬라이딩 언더라인 애니메이션 작동 (0.32s)
  - 레슨 탭 → 상세 → 완료 → 홈 복귀 플로우 완성
  - 지역 드릴다운 3단계 (국가 → 지역 → 아펠라시옹) 네비게이션 완성
  - ScoreArc, StreakBar, ProfileBar, CompareCard 시각 렌더 정상
  - ko/en 양쪽 locale에서 한글 한 글자도 영문 모드에 노출되지 않음
  - Pressable audit DANGEROUS 0건
  - 라이트 모드 하드코딩 hex 0건 (design-tokens.ts 토큰만 사용)
  - MOCK 데이터 로드 시 로딩 상태 (isLoading: true 동안 Skeleton 또는 ActivityIndicator)
</success_criteria>

<build_output>
  신규 파일:
    app/(tabs)/knowledge.tsx
    app/knowledge/lesson/[id].tsx
    app/knowledge/lesson/[id]/done.tsx
    app/knowledge/history.tsx
    app/knowledge/country/[id].tsx
    app/knowledge/subregion/[id].tsx
    app/knowledge/appellation/[id].tsx
    app/knowledge/winery/[id].tsx
    app/knowledge/winery/[id]/lineup.tsx
    app/knowledge/vintage/[id].tsx
    src/components/knowledge/knowledge-tab-bar.tsx
    src/components/knowledge/section-label.tsx
    src/components/knowledge/streak-bar.tsx
    src/components/knowledge/today-lesson-card.tsx
    src/components/knowledge/lesson-list-row.tsx
    src/components/knowledge/region-flag.tsx
    src/components/knowledge/score-arc.tsx
    src/components/knowledge/compare-card.tsx
    src/components/knowledge/callout.tsx
    src/components/knowledge/profile-bar.tsx
    src/components/knowledge/stat-tile.tsx
    src/components/knowledge/tag-chip.tsx
    src/hooks/use-knowledge.ts
    src/lib/mock/knowledge.ts

  수정 파일:
    src/lib/design-tokens.ts           (토큰 4개 추가)
    src/lib/i18n/ko.json              (knowledge 네임스페이스 추가)
    src/lib/i18n/en.json              (knowledge 네임스페이스 추가)
    app/(tabs)/_layout.tsx            (map → knowledge 탭 교체)
    src/components/nav/bottom-nav.tsx (book 아이콘 + 'knowledge' 라우트 매핑)

  삭제 파일:
    app/(tabs)/map.tsx                (지도 탭 완전 교체)
</build_output>

<key_implementation_notes>
  1. PRESSABLE PATTERN (CRITICAL):
     CLAUDE.md §4-11 필수. TodayLessonCard, LessonListRow, CountryCard 등
     모든 탭 가능 카드는 3-layer 구조:
       <View style={{ flex: 1 }}>                    // flex 분포
         <Pressable onPress style={({pressed}) => ({ opacity: pressed ? 0.9 : 1 })}>
           <View style={{ /* 모든 시각 스타일 */ }}>   // visual
             {children}
           </View>
         </Pressable>
       </View>

  2. TOKEN MAPPING (CRITICAL):
     KTL 토큰 → design-tokens.ts 매핑표 (design_token_extensions 섹션) 반드시 참조.
     inline style에서 직접 hex 사용 금지. 모두 토큰 변수로.

  3. LIGHT-ONLY:
     useThemeTokens() 또는 light 토큰을 직접 import해서 사용.
     다크 토큰(dark.*) 참조 없음. colorScheme 조건 분기 없음.

  4. SCROLL PATTERN:
     각 탭 콘텐츠는 ScrollView paddingBottom: 110 (BottomNav 높이 + 여유).
     상세 화면은 paddingBottom: 36 (sticky CTA 없을 때) 또는 92 (sticky CTA 있을 때).

  5. NAVIGATION:
     expo-router useRouter().push() 사용.
     LBackHeader의 뒤로가기는 router.back().
     KnowledgeTabBar 내부 탭 전환은 상태 변경 (라우터 이동 아님).

  6. FONTS:
     Playfair Display: fontFamily 'PlayfairDisplay_400Regular' (기존 앱 로드 확인)
     Cormorant Garamond: fontFamily 'CormorantGaramond_400Regular' — 기존 앱에 없으면
       app/_layout.tsx에 useFonts로 추가 필요.
     Inter: 기존 앱에서 사용 중 (확인 후 동일 fontFamily 사용).

  7. SVG GRAPHICS:
     MedalSeal, RegionFlag 그라디언트, ScoreArc — react-native-svg 사용.
     기존 WmBottle이 react-native-svg 사용하므로 동일 패턴 계승.

  8. MOCK DATA PHASE:
     Phase 1에서 Supabase 호출 없음. use-knowledge.ts는 목 데이터를 반환하되
     Supabase 인터페이스와 동일한 {data, isLoading, error} shape 유지
     (Phase 2 교체 비용 최소화).
</key_implementation_notes>

</project_specification>
