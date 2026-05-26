import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { brand, withAlpha } from '@/lib/design-tokens';
import { useThemeTokens } from '@/lib/use-theme-tokens';

export interface SortOption {
  key: string;
  label: string;
}

interface Props {
  options: readonly SortOption[];
  currentKey: string;
  top: number;
  title: string;
  onSelect: (key: string) => void;
  onDismiss: () => void;
}

export function SortDropdown({ options, currentKey, top, title, onSelect, onDismiss }: Props) {
  const { bg, text, border, scheme } = useThemeTokens();
  const goldColor = scheme === 'light' ? brand.goldDeep : brand.gold;
  const cardBg = bg.surface;
  const borderColor = border.default;
  const selectedRowBg = withAlpha(brand.gold, 0.07);

  return (
    <Pressable style={StyleSheet.absoluteFillObject} onPress={onDismiss}>
      <View style={{ position: 'absolute', right: 16, top }} pointerEvents="box-none">
        {/* Dropdown card */}
        <View
          style={{
            width: 232,
            borderRadius: 18,
            backgroundColor: cardBg,
            borderWidth: 1,
            borderColor,
            shadowColor: 'rgba(31,18,12,1)',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.24,
            shadowRadius: 22,
            elevation: 14,
          }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12 }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 10,
                color: goldColor,
                textTransform: 'uppercase',
                letterSpacing: 1.8,
                marginBottom: 2,
              }}
            >
              Sort by
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: 'PlayfairDisplay_400Regular',
                fontSize: 16,
                fontStyle: 'italic',
                color: text.primary,
              }}
            >
              {title}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 0.5, backgroundColor: borderColor }} />

          {/* Option rows */}
          {options.map((opt) => {
            const isSelected = opt.key === currentKey;
            return (
              <Pressable
                key={opt.key}
                onPress={() => onSelect(opt.key)}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    backgroundColor: isSelected ? selectedRowBg : 'transparent',
                  }}
                >
                  {/* Selection dot */}
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isSelected ? brand.wineRed : 'transparent',
                      borderWidth: isSelected ? 0 : 1,
                      borderColor,
                      marginRight: 12,
                    }}
                  />
                  <Text
                    allowFontScaling={false}
                    style={{
                      flex: 1,
                      fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                      fontSize: 14,
                      color: isSelected ? text.primary : text.muted,
                    }}
                  >
                    {opt.label}
                  </Text>
                  {isSelected ? <Check size={14} color={goldColor} strokeWidth={2.5} /> : null}
                </View>
              </Pressable>
            );
          })}

          <View style={{ height: 8 }} />
        </View>

        {/* Caret — matching card bg erases top border */}
        <View
          style={{
            position: 'absolute',
            top: -7,
            right: 24,
            width: 14,
            height: 14,
            transform: [{ rotate: '45deg' }],
            backgroundColor: cardBg,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderColor,
          }}
        />
      </View>
    </Pressable>
  );
}
