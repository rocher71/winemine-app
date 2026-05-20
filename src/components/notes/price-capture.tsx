/**
 * PriceCapture — Beginner 폼 가격 입력 토글 카드.
 *
 * 사양: design-spec notes-write.md §2-2 PriceCapture + §10 E13.
 * 키스크린 원본: note-write-beginner.tsx PriceCapture.
 *
 * 구조:
 *   View (padding 14, radius 12, bg-surface border 1 border-default)
 *   ├── Label row (flex-row justify-between items-center)
 *   │   ├── Title (Inter 14 600 text-primary)
 *   │   └── Switch (track gold/disabled, thumb cream)
 *   └── if enabled
 *       NumberInput (TextInput keyboardType="number-pad",
 *                     bg bg-bottle-shelf (dark) / bg-deep (light), border border-default,
 *                     radius 8, padding 10v_12h, Inter 14 text-primary, mt 10)
 *
 * v0.1.0 SCOPE: UI state only — DB schema 변경 없음. tasting_data jsonb에 자유 저장.
 * TODO(v0.2.0): tasting_notes.is_public 컬럼 추가 + 가격 별도 컬럼 도입 시 분리.
 */
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { brand, dark, light } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export interface PriceCaptureState {
  enabled: boolean;
  krw: number | null;
}

interface Props {
  value: PriceCaptureState;
  onChange: (v: PriceCaptureState) => void;
}

export function PriceCapture({ value, onChange }: Props) {
  const { t } = useTranslation();
  const { scheme } = useThemeTokens();
  const surfaceBg = scheme === 'light' ? light.bg.surface : dark.bg.surface;
  const borderDefault = scheme === 'light' ? light.border.default : dark.border.default;
  const inputBg = scheme === 'light' ? light.bg.deep : dark.bg.bottleShelf;
  const textPrimary = scheme === 'light' ? light.text.primary : dark.text.primary;
  const textDisabled = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  // local text state — 빈 string ↔ number 동기화
  const [text, setText] = useState(value.krw !== null ? String(value.krw) : '');

  useEffect(() => {
    setText(value.krw !== null ? String(value.krw) : '');
  }, [value.krw]);

  const toggle = (next: boolean) => {
    onChange({ enabled: next, krw: next ? value.krw : null });
  };

  const onChangeText = (raw: string) => {
    setText(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange({ ...value, krw: null });
      return;
    }
    const n = parseInt(trimmed.replace(/[^0-9]/g, ''), 10);
    onChange({ ...value, krw: Number.isNaN(n) ? null : n });
  };

  return (
    <View
      style={{
        backgroundColor: surfaceBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: borderDefault,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          className="font-inter-semibold text-text-primary dark:text-text-primary"
          style={{ fontSize: 14, lineHeight: 16.8 }}
        >
          {t('notes.writeForm.priceCaptureLabel')}
        </Text>
        <Switch
          value={value.enabled}
          onValueChange={toggle}
          trackColor={{ true: brand.gold, false: textDisabled }}
          thumbColor={brand.cream}
          accessibilityLabel={t('notes.writeForm.priceCaptureLabel')}
        />
      </View>

      {value.enabled ? (
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder={t('notes.writeForm.pricePlaceholder')}
          placeholderTextColor={textDisabled}
          keyboardType="number-pad"
          accessibilityLabel={t('notes.writeForm.pricePlaceholder')}
          style={{
            marginTop: 10,
            backgroundColor: inputBg,
            borderWidth: 1,
            borderColor: borderDefault,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            color: textPrimary,
          }}
        />
      ) : null}
    </View>
  );
}

export function defaultPriceCapture(): PriceCaptureState {
  return { enabled: false, krw: null };
}
