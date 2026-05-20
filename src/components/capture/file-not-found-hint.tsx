/**
 * FileNotFoundHint — recognized stage RecognizedCard 안에 photoLoadFailed=true 시 표시.
 *
 * design-spec capture.md §3-6.
 * padding 10 / bg capture.fileNotFoundBg / radius 8 / Inter 11 lh 16.5.
 * title 11 700 text-secondary + body 11 text-muted + hint 11 text-muted opacity 0.7.
 */
import { View, Text, useColorScheme } from 'react-native';
import { capture, dark, light, typography } from '@/lib/design-tokens';

interface FileNotFoundHintProps {
  title: string;
  body: string;
  hint: string;
}

export function FileNotFoundHint({ title, body, hint }: FileNotFoundHintProps) {
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const bg = isLight ? capture.fileNotFoundBg.light : capture.fileNotFoundBg.dark;
  const titleColor = isLight ? light.text.secondary : dark.text.secondary;
  const mutedColor = isLight ? light.text.muted : dark.text.muted;

  return (
    <View
      className="rounded-lg"
      style={{ backgroundColor: bg, padding: 10 }}
      accessibilityRole="alert"
    >
      <Text
        style={{
          fontFamily: typography.fileNotFoundTitle.family,
          fontSize: typography.fileNotFoundTitle.size,
          lineHeight: typography.fileNotFoundTitle.lineHeight,
          color: titleColor,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: typography.fileNotFoundBody.family,
          fontSize: typography.fileNotFoundBody.size,
          lineHeight: typography.fileNotFoundBody.lineHeight,
          color: mutedColor,
        }}
      >
        {body}
      </Text>
      <Text
        style={{
          fontFamily: typography.fileNotFoundBody.family,
          fontSize: typography.fileNotFoundBody.size,
          lineHeight: typography.fileNotFoundBody.lineHeight,
          color: mutedColor,
          opacity: 0.7,
        }}
      >
        {hint}
      </Text>
    </View>
  );
}
