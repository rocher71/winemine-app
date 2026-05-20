/**
 * SimulatingView — capture simulating stage 컴포넌트.
 *
 * design-spec capture.md §3-3 (NW v4 매핑표) + §6-1 wm-pulse animation.
 * 두 variant:
 *   - scan: PreviewFrame 240×320 bg #000 + Camera guide rect (inset 32 / border 2px gold / opacity 0.6 / radius 12)
 *           + 중앙 Loader2 (32 gold) with wm-pulse
 *   - gallery: 3×3 grid 9 cells (33.33% width × aspect-square / gap 2 / padding 8)
 *              i==4 emphasized (alpha 0.22 + border 2px gold) / others (alpha 0.04 + border 1px alpha 0.06)
 *              + 하단 Loader2 (28 gold, absolute bottom 24, wm-pulse)
 * 메시지: Sparkles 14 + 14px Inter cream 텍스트.
 */
import { View, Text, useColorScheme } from 'react-native';
import Animated from 'react-native-reanimated';
import { Loader2, Sparkles } from 'lucide-react-native';
import {
  brand,
  dark,
  light,
  typography,
  withAlpha,
} from '@/lib/design-tokens';
import { useWmPulse } from '@/lib/animations/wm-pulse';

interface SimulatingViewProps {
  source: 'scan' | 'gallery';
  message: string;
}

export function SimulatingView({ source, message }: SimulatingViewProps) {
  const pulseStyle = useWmPulse();
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const goldColor = isLight ? light.border.active : brand.gold;
  const previewBg = isLight ? light.text.primary : brand.black;
  const borderColor = isLight ? light.border.default : dark.border.default;
  const messageColor = isLight ? light.text.primary : brand.cream;

  return (
    <View
      className="items-center px-5"
      style={{ marginTop: 40, paddingVertical: 40, gap: 24 }}
      accessibilityLiveRegion="polite"
    >
      <View
        style={{
          width: 240,
          height: 320,
          backgroundColor: previewBg,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
          position: 'relative',
        }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {source === 'scan' ? (
          <>
            {/* Camera guide rect: inset 32 / border 2 gold opacity 0.6 / radius 12 */}
            <View
              style={{
                position: 'absolute',
                top: 32,
                left: 32,
                right: 32,
                bottom: 32,
                borderWidth: 2,
                borderColor: goldColor,
                opacity: 0.6,
                borderRadius: 12,
              }}
            />
            {/* Spinner center — wm-pulse */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 160 - 16,
                  left: 120 - 16,
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                pulseStyle,
              ]}
            >
              <Loader2 size={32} strokeWidth={1.5} color={goldColor} />
            </Animated.View>
          </>
        ) : (
          <>
            {/* Gallery 3x3 grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                padding: 8,
                width: 240,
                height: 320,
              }}
            >
              {Array.from({ length: 9 }).map((_, i) => {
                const emphasized = i === 4;
                const cellBg = emphasized
                  ? withAlpha(brand.cream, 0.22)
                  : withAlpha(brand.cream, 0.04);
                const cellBorderColor = emphasized
                  ? goldColor
                  : withAlpha(brand.cream, 0.06);
                return (
                  <View
                    key={i}
                    style={{
                      width: '33.33%',
                      aspectRatio: 1,
                      padding: 1,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: cellBg,
                        borderWidth: emphasized ? 2 : 1,
                        borderColor: cellBorderColor,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                );
              })}
            </View>
            {/* Spinner bottom-center (28px @ bottom 24) */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 24,
                  left: 120 - 14,
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                pulseStyle,
              ]}
            >
              <Loader2 size={28} strokeWidth={1.5} color={goldColor} />
            </Animated.View>
          </>
        )}
      </View>

      {/* Message row */}
      <View className="flex-row items-center gap-2">
        <Sparkles size={14} strokeWidth={1.75} color={goldColor} />
        <Text
          style={{
            fontFamily: typography.simulatingMessage.family,
            fontSize: typography.simulatingMessage.size,
            lineHeight: typography.simulatingMessage.lineHeight,
            color: messageColor,
            marginBottom: 4,
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
