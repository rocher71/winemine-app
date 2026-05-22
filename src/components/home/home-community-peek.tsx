/**
 * HomeCommunityPeek — 팔로잉의 새 노트 카드 (heavy 모드).
 *
 * 사양 home.md §2-1 line 99-116, §3-6, §3-6-PATCH (2026-05-21):
 * - section mt 22
 * - SectionTitle padding 0_20_8 items-end justify-between
 *   - eyebrow "커뮤니티" Inter 10 500 gold UPPER tracking 1.8
 *   - title "팔로잉의 새 노트" Playfair 17 cream lh 20.4
 *   - action "모두 보기 →" Inter 11 600 gold (toast "곧 출시" — v0.1.0 alpha)
 * - card m 0_16 p 4_14 radius 14 bg-surface border-default
 *   - post row × 2 (gap 10, borderBottom hairline 마지막 제외)
 *     - CommUserAvatar 28 (noteAuthorAvatarGradient + cream text)
 *     - meta: PostTypeBadge (pill + icon + locale 분기) + author/ago + title 2-line + reactions
 *
 * v0.1.0: mock 2 posts. community 라우트 미구현 — dead-press 방지 toast.
 *   - row 1: type='note' (gold pill, PenLine icon) — L4 벨벳폭스
 *   - row 2: type='album' (pink pill, Image icon) — L3 실키나이트 (셀러 사진 추가 = 사진 앨범)
 */
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Wine, MessageSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { PostTypeBadge, type PostType } from '@/components/community/post-type-badge';

interface MockPost {
  id: string;
  type: PostType;
  author: string;
  ago: string;
  title: string;
  initial: string;
  levelId: 1 | 2 | 3 | 4 | 5;
  wineCount: number;
  messageCount: number;
  appellation?: string;
}

// v0.1.0 mock — design-spec §12 Q4 + §3-6-PATCH (line 1416 권장 PATCH).
// row 2 type='album' 채택 — 셀러 사진 추가 = 사진 앨범 — mock 메시지 의미 보존.
const MOCK_POSTS_KO: MockPost[] = [
  {
    id: 'mock-1',
    type: 'note',
    author: '벨벳폭스',
    ago: '3h',
    title: '여운이 길고 우아한 부르고뉴 한 잔, 오늘 저녁이 특별해졌어요.',
    initial: '벨',
    levelId: 4,
    wineCount: 12,
    messageCount: 3,
    appellation: 'Burgundy',
  },
  {
    id: 'mock-2',
    type: 'album',
    author: '실키나이트',
    ago: '5h',
    title: '셀러에 보르도 빈티지 새로 추가했어요.',
    initial: '실',
    levelId: 3,
    wineCount: 8,
    messageCount: 1,
    appellation: 'Bordeaux',
  },
];

const MOCK_POSTS_EN: MockPost[] = [
  {
    id: 'mock-1',
    type: 'note',
    author: 'velvetfox',
    ago: '3h',
    title: 'A long, elegant Burgundy finish made tonight special.',
    initial: 'V',
    levelId: 4,
    wineCount: 12,
    messageCount: 3,
    appellation: 'Burgundy',
  },
  {
    id: 'mock-2',
    type: 'album',
    author: 'silkynight',
    ago: '5h',
    title: 'Added a fresh Bordeaux vintage to my cellar.',
    initial: 'S',
    levelId: 3,
    wineCount: 8,
    messageCount: 1,
    appellation: 'Bordeaux',
  },
];

function PostRow({ post, last }: { post: MockPost; last: boolean }) {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const badgeLabel = t(`community.postType.${post.type}`);
  // Round 10 패턴 (§4-11): Pressable은 hit target + opacity만, layout/visual은 inner View.
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${post.author} · ${badgeLabel} · ${post.title}`}
      accessibilityHint={t('home.communityPeek.openHint')}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        Alert.alert(t('app.name'), t('home.communityPeek.comingSoon'));
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          paddingVertical: 14,
          ...(last
            ? null
            : {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: tokens.border.default,
              }),
        }}
      >
        <CommUserAvatar levelId={post.levelId} initial={post.initial} size={32} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <PostTypeBadge type={post.type} />
            <Text
              style={{ fontSize: 11, color: tokens.text.muted, fontFamily: 'Freesentation_4Regular' }}
              allowFontScaling={false}
            >
              {post.author} · {post.ago}
            </Text>
          </View>
          <Text
            style={{ fontSize: 14, lineHeight: 19.6, fontFamily: 'Freesentation_4Regular', color: tokens.text.primary }}
            numberOfLines={2}
          >
            {post.title}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 14,
              marginTop: 8,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Wine size={11} strokeWidth={1.7} color={brand.gold} />
              <Text
                style={{ fontSize: 11, color: tokens.text.muted, fontFamily: 'Freesentation_4Regular' }}
                allowFontScaling={false}
              >
                {post.wineCount}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MessageSquare size={11} strokeWidth={1.7} color={tokens.text.muted} />
              <Text
                style={{ fontSize: 11, color: tokens.text.muted, fontFamily: 'Freesentation_4Regular' }}
                allowFontScaling={false}
              >
                {post.messageCount}
              </Text>
            </View>
            {post.appellation && (
              <Text
                style={{ color: brand.gold, fontSize: 10, letterSpacing: 0.5, fontFamily: 'Freesentation_5Medium' }}
                allowFontScaling={false}
              >
                · {post.appellation}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function HomeCommunityPeek() {
  const { t, i18n } = useTranslation();
  const tokens = useThemeTokens();
  const posts = i18n.language === 'en' ? MOCK_POSTS_EN : MOCK_POSTS_KO;

  const onViewAll = () => {
    Haptics.selectionAsync().catch(() => undefined);
    Alert.alert(t('app.name'), t('home.communityPeek.comingSoon'));
  };

  return (
    <View style={{ marginTop: 22 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          paddingBottom: 8,
          paddingHorizontal: 20,
        }}
      >
        <View>
          <Text
            className="font-inter-medium uppercase"
            style={{
              color: brand.gold,
              fontSize: 10,
              letterSpacing: 1.8,
              marginBottom: 2,
            }}
            allowFontScaling={false}
          >
            {t('home.communityPeek.eyebrow')}
          </Text>
          <Text
            className="font-playfair text-text-primary dark:text-text-primary"
            style={{ fontSize: 17, lineHeight: 20.4 }}
          >
            {t('home.communityPeek.title')}
          </Text>
        </View>
        <Pressable
          onPress={onViewAll}
          accessibilityRole="link"
          accessibilityLabel={t('home.communityPeek.viewAll')}
          accessibilityHint={t('home.communityPeek.openHint')}
        >
          <Text
            className="font-inter-semibold"
            style={{ color: brand.gold, fontSize: 11 }}
          >
            {t('home.communityPeek.viewAll')}
          </Text>
        </Pressable>
      </View>
      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 16,
          paddingVertical: 4,
          paddingHorizontal: 16,
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: tokens.border.default,
        }}
      >
        {posts.map((p, i) => (
          <PostRow key={p.id} post={p} last={i === posts.length - 1} />
        ))}
      </View>
    </View>
  );
}
