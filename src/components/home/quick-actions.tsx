/**
 * QuickActions — heavy 모드 하단 2-col 4 카드.
 *
 * 사양 home.md §2-1 line 152-156, §3-9:
 * - grid 1fr 1fr, gap 12, padding 0_16, mt 18
 * - card padding 14_16, radius 14, bg-surface, border-default, minHeight 86
 *   - Icon 20 strokeWidth 1.75 gold (TrendingUp/Globe2/Star/Award)
 *   - title Inter 14 600 cream
 *   - sub Inter 12 text-muted lh 14.4 (card-meta)
 *
 * v0.1.0: cellar count는 props로 받음. map/favorites/badges 카운트는 정적 0 (실 데이터 v0.2.0).
 */
import { View, Text, Pressable } from 'react-native';
import { TrendingUp, Globe2, Star, Award } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { brand } from '@/lib/design-tokens';

interface QuickActionsProps {
  cellaredCount: number;
  regionsCount?: number;
  favoritesCount?: number;
  badgesOwned?: number;
  badgesTotal?: number;
}

interface ActionCardProps {
  Icon: typeof TrendingUp;
  title: string;
  sub: string;
  onPress: () => void;
}

function ActionCard({ Icon, title, sub, onPress }: ActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${title} ${sub}`}
      className="bg-surface dark:bg-surface border border-border-default dark:border-border-default"
      style={({ pressed }) => ({
        flexBasis: '48%',
        flexGrow: 1,
        minHeight: 86,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 6,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Icon size={20} strokeWidth={1.75} color={brand.gold} />
      <Text
        className="font-inter-semibold text-text-primary dark:text-text-primary"
        style={{ fontSize: 14 }}
      >
        {title}
      </Text>
      <Text
        className="font-inter text-text-muted dark:text-text-muted"
        style={{ fontSize: 12, lineHeight: 14.4 }}
      >
        {sub}
      </Text>
    </Pressable>
  );
}

export function QuickActions({
  cellaredCount,
  regionsCount = 0,
  favoritesCount = 0,
  badgesOwned = 0,
  badgesTotal = 12,
}: QuickActionsProps) {
  const { t } = useTranslation();

  const nav = (path: string) => () => {
    Haptics.selectionAsync().catch(() => undefined);
    try {
      router.push(path as never);
    } catch {
      // ignore (route 미존재)
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginTop: 18,
        gap: 12,
      }}
    >
      <ActionCard
        Icon={TrendingUp}
        title={t('home.quickActions.cellar')}
        sub={t('home.quickActions.cellarSub', { count: cellaredCount })}
        onPress={nav('/(tabs)/cellar')}
      />
      <ActionCard
        Icon={Globe2}
        title={t('home.quickActions.map')}
        sub={t('home.quickActions.mapSub', { count: regionsCount })}
        onPress={nav('/(tabs)/map')}
      />
      <ActionCard
        Icon={Star}
        title={t('home.quickActions.favorites')}
        sub={t('home.quickActions.favoritesSub', { count: favoritesCount })}
        onPress={nav('/favorites')}
      />
      <ActionCard
        Icon={Award}
        title={t('home.quickActions.badges')}
        sub={t('home.quickActions.badgesSub', { owned: badgesOwned, total: badgesTotal })}
        onPress={nav('/badges')}
      />
    </View>
  );
}
