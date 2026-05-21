/**
 * /community — Community placeholder (v0.2.0 구현 예정)
 *
 * 출처: _workspace/design-specs/bottom-nav.md §11.
 * v0.1.0: empty state (제목 + 설명 + v0.2.0 hint).
 */
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react-native';
import { brand } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

// TODO(v0.2.0): Community 구현 (피드 + 팔로잉 + 노트 탭)
export default function CommunityPlaceholder() {
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: tokens.bg.deepest }}>
      <Users size={48} strokeWidth={1.5} color={brand.gold} />
      <Text
        style={{
          marginTop: 16,
          fontFamily: 'PlayfairDisplay_400Regular',
          fontSize: 22,
          lineHeight: 28.6,
          textAlign: 'center',
          color: tokens.text.primary,
        }}
      >
        {t('nav.community')}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          lineHeight: 22.4,
          textAlign: 'center',
          color: tokens.text.muted,
        }}
      >
        {t('placeholders.communityDesc')}
      </Text>
      <View
        style={{
          marginTop: 16,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: tokens.bg.surface,
          borderWidth: 1,
          borderColor: tokens.border.default,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.4,
            color: brand.gold,
            textTransform: 'uppercase',
          }}
        >
          {t('placeholders.comingSoon')}
        </Text>
      </View>
    </View>
  );
}
