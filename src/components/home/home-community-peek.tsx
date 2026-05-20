/**
 * HomeCommunityPeek — 팔로잉의 새 노트 카드 (heavy 모드).
 *
 * 사양 home.md §2-1 line 99-116, §3-6:
 * - section mt 22
 * - SectionTitle padding 0_20_8 items-end justify-between
 *   - eyebrow "커뮤니티" Inter 10 500 gold UPPER tracking 1.8
 *   - title "팔로잉의 새 노트" Playfair 17 cream lh 20.4
 *   - action "모두 보기 →" Inter 11 600 gold
 * - card m 0_16 p 4_14 radius 14 bg-surface border-default
 *   - post row × 2 (gap 10, borderBottom hairline 마지막 제외)
 *     - CommUserAvatar 28
 *     - meta: PostTypeBadge + author/ago + title 2-line + reactions
 *
 * v0.1.0: mock 2 posts (사양 §12 Q4 — alpha decision). community 라우트 미구현.
 */
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Wine, MessageSquare } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';
import { CommUserAvatar } from '@/components/community/comm-user-avatar';
import { PostTypeBadge, type PostType } from '@/components/community/post-type-badge';

interface MockPost {
  id: string;
  type: PostType;
  typeLabel: string;
  author: string;
  ago: string;
  title: string;
  initial: string;
  levelId: 1 | 2 | 3 | 4 | 5;
  wineCount: number;
  messageCount: number;
  appellation?: string;
}

// v0.1.0 mock — design-spec §12 Q4: community posts mock 노출 결정.
// 영문/한글 모두 양 locale에서 자연스러운 짧은 텍스트. 실 데이터는 v0.2.0.
const MOCK_POSTS_KO: MockPost[] = [
  {
    id: 'mock-1',
    type: 'note',
    typeLabel: '노트',
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
    type: 'cellar',
    typeLabel: '셀러',
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
    typeLabel: 'NOTE',
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
    type: 'cellar',
    typeLabel: 'CELLAR',
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
  const tokens = useThemeTokens();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${post.author} ${post.title}`}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          gap: 10,
          paddingVertical: 10,
          opacity: pressed ? 0.85 : 1,
        },
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: tokens.border.default,
        },
      ]}
      onPress={() => {
        // v0.1.0: community 라우트 없음 — noop
      }}
    >
      <CommUserAvatar levelId={post.levelId} initial={post.initial} size={28} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
            marginBottom: 3,
          }}
        >
          <PostTypeBadge type={post.type} label={post.typeLabel} />
          <Text
            className="text-text-muted dark:text-text-muted"
            style={{ fontSize: 10 }}
            allowFontScaling={false}
          >
            {post.author} · {post.ago}
          </Text>
        </View>
        <Text
          className="font-playfair text-text-primary dark:text-text-primary"
          style={{ fontSize: 13, lineHeight: 16.9 }}
          numberOfLines={2}
        >
          {post.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginTop: 6,
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Wine size={10} strokeWidth={1.7} color={brand.gold} />
            <Text
              className="text-text-muted dark:text-text-muted"
              style={{ fontSize: 10 }}
              allowFontScaling={false}
            >
              {post.wineCount}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <MessageSquare size={10} strokeWidth={1.7} color={tokens.text.muted} />
            <Text
              className="text-text-muted dark:text-text-muted"
              style={{ fontSize: 10 }}
              allowFontScaling={false}
            >
              {post.messageCount}
            </Text>
          </View>
          {post.appellation && (
            <Text
              style={{ color: brand.gold, fontSize: 9, letterSpacing: 0.54 }}
              allowFontScaling={false}
            >
              · {post.appellation}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function HomeCommunityPeek() {
  const { t, i18n } = useTranslation();
  const posts = i18n.language === 'en' ? MOCK_POSTS_EN : MOCK_POSTS_KO;

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
          onPress={() => {
            // v0.1.0: community 라우트 없음 — noop
          }}
          accessibilityRole="link"
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
        className="bg-surface dark:bg-surface border border-border-default dark:border-border-default"
        style={{
          marginHorizontal: 16,
          borderRadius: 14,
          paddingVertical: 4,
          paddingHorizontal: 14,
        }}
      >
        {posts.map((p, i) => (
          <PostRow key={p.id} post={p} last={i === posts.length - 1} />
        ))}
      </View>
    </View>
  );
}
