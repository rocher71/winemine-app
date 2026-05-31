/**
 * ShareToCommunity — Beginner/Expert 공통 커뮤니티 공유 토글 카드.
 *
 * 사양: design-spec notes-write.md §2-2 ShareToCommunityToggle + §10 E16.
 * 키스크린 원본: note-write-beginner.tsx ShareToCommunityToggle.
 *
 * 구조:
 *   View (padding 14, radius 12, bg-surface,
 *          border 1 (active gold / idle border-default))
 *   └── Row (flex-row items-center gap 12)
 *       ├── Stack (flex-1)
 *       │   ├── Title (Inter 13 600 text-primary)
 *       │   └── Sub   (Inter 11 muted lh 13.2 mt 2)
 *       └── Switch (track wineRed/textDisabled, thumb cream)
 *
 * v0.1.0 SCOPE: UI state only — tasting_notes.is_public 컬럼 부재 시 insert payload omit.
 * TODO(v0.2.0 supabase-engineer): is_public boolean default false + RLS select 정책 확장.
 */
import { View, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ShareToCommunity({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderDefault = scheme === 'light' ? light.border.default : dark.border.default;
  const textDisabled = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  return (
    <View
      style={{
        backgroundColor: surfaceBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: value ? brand.gold : borderDefault,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text
            className="font-inter-semibold text-text-primary dark:text-text-primary"
            style={{ fontSize: 13, lineHeight: 19.5 }}
          >
            {t('notes.writeForm.shareLabel')}
          </Text>
          <Text
            className="font-inter text-text-muted dark:text-text-muted"
            style={{ fontSize: 11, lineHeight: 13.2, marginTop: 2 }}
          >
            {t('notes.writeForm.shareSub')}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ true: brand.gold, false: textDisabled }}
          thumbColor={brand.cream}
          accessibilityLabel={t('notes.writeForm.shareLabel')}
        />
      </View>
    </View>
  );
}
