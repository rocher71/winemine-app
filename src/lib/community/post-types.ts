/**
 * POST_TYPES 5종 — 커뮤니티 글 작성 타입 picker (`/community/new`) 데이터.
 *
 * 사양: _workspace/design-specs/community-new.md §1-A-1, §5-1, §10 B.
 *
 * §10 결정 (코드 명시 — 사양 §0-2 light-only):
 *   B: 신규 module `src/lib/community/post-types.ts` (이 파일) — type/Icon/color/colorLight/href 만.
 *      i18n 라벨/sub 는 별도 키 (community.compose.cardLabel/cardSub.<type>).
 *   A: href 매핑 (v0.1.0):
 *      - note  → routerKind: 'route'        target: '/notes/new'                 (이미 구현된 노트 picker)
 *      - question → routerKind: 'deferred' target: 'community.compose.questionDeferred'
 *      - column → routerKind: 'route'      target: '/community/new/column'        (이 cycle 신규)
 *      - news  → routerKind: 'deferred'   target: 'community.compose.newsDeferred'
 *      - album → routerKind: 'route'      target: '/community/new/album'         (이 cycle 신규)
 *      keyscreen verbatim 의 `/community/new` self-loop 은 무한 redirect 회피 위해 deferredToast 변환.
 *
 * Icon 매핑 (keyscreen verbatim):
 *   - note → PenLine, question → CircleQuestionMark (lucide v0.523 `HelpCircle` alias),
 *     column → BookOpen, news → Sparkles, album → ImageIcon (lucide `Image` alias §6-8).
 *
 * 색 (light fallback — community-components §10 F 결정 / design-tokens.ts §postTypeBadgeColorLight):
 *   - note: brand.gold (#C9A84C)
 *   - question: #A08EE0 (purple)
 *   - column: #8B7766 (light.text.muted — cream verbatim invisible on light bg)
 *   - news: #5B9CE6 (sky blue)
 *   - album: #E8B4D2 (soft pink)
 *
 * XP badge: keyscreen line 11-67 verbatim — note `+15 XP`, column `+25 XP` 만 표시.
 */
import {
  BookOpen,
  CircleQuestionMark,
  Image as ImageIcon,
  PenLine,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';

import { postTypeBadgeColorLight } from '@/lib/design-tokens';

export type PostType = 'note' | 'question' | 'column' | 'news' | 'album';

export type PostTypeRouterKind = 'route' | 'deferred';

export interface PostTypeOption {
  /** 5종 식별자 */
  id: PostType;
  /** i18n key — community.compose.cardLabel.<id> */
  labelKey: string;
  /** i18n key — community.compose.cardSub.<id> */
  descKey: string;
  /** lucide-react-native icon component */
  icon: LucideIcon;
  /** light fallback color (icon + bg alpha + border alpha 베이스) */
  colorLight: string;
  /** XP badge label — 없을 때 undefined (question / news / album) */
  badge?: string;
  /** §10 A 결정 — 라우팅 종류 */
  routerKind: PostTypeRouterKind;
  /** routerKind='route' 면 expo-router path. 'deferred' 면 i18n key (Alert.alert body 로 사용). */
  target: string;
  /** 최소 레벨 (미설정 시 제한 없음). 미달 시 카드 잠금 표시. */
  levelMin?: number;
}

export const POST_TYPES: readonly PostTypeOption[] = [
  {
    id: 'note',
    labelKey: 'community.compose.cardLabel.note',
    descKey: 'community.compose.cardSub.note',
    icon: PenLine,
    colorLight: postTypeBadgeColorLight.note,
    badge: '+15 XP',
    routerKind: 'route',
    target: '/community/new/note',
  },
  {
    id: 'question',
    labelKey: 'community.compose.cardLabel.question',
    descKey: 'community.compose.cardSub.question',
    icon: CircleQuestionMark,
    colorLight: postTypeBadgeColorLight.question,
    routerKind: 'deferred',
    target: 'community.compose.questionDeferred',
  },
  {
    id: 'column',
    labelKey: 'community.compose.cardLabel.column',
    descKey: 'community.compose.cardSub.column',
    icon: BookOpen,
    colorLight: postTypeBadgeColorLight.column,
    badge: '+25 XP',
    routerKind: 'route',
    target: '/community/new/column',
    levelMin: 4,
  },
  {
    id: 'news',
    labelKey: 'community.compose.cardLabel.news',
    descKey: 'community.compose.cardSub.news',
    icon: Sparkles,
    colorLight: postTypeBadgeColorLight.news,
    routerKind: 'deferred',
    target: 'community.compose.newsDeferred',
  },
  {
    id: 'album',
    labelKey: 'community.compose.cardLabel.album',
    descKey: 'community.compose.cardSub.album',
    icon: ImageIcon,
    colorLight: postTypeBadgeColorLight.album,
    routerKind: 'route',
    target: '/community/new/album',
  },
] as const;
