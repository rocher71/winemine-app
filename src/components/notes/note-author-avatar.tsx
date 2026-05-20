/**
 * NoteAuthorAvatar — 32×32 gradient avatar + 한 글자 letter.
 *
 * 사양: design-spec notes-detail.md §2-3 + §6-2 noteAuthorAvatarGradient.
 * 키스크린 원본: src/app/notes/[noteId]/page.tsx line 244~260 + line 381~389 levelGradient().
 *
 * v0.1.0은 profiles.level_id 컬럼 부재 → L1 fallback (§10 D3).
 * 한 글자는 anonymous_display의 첫 글자 (UUID 노출 금지 §4-5) — fallback "M"/"나" (mine 인 경우).
 * a11y: decorative — accessibilityElementsHidden=true.
 */
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  brand,
  withAlpha,
  noteAuthorAvatarGradient,
  type NoteAuthorLevel,
} from '@/lib/design-tokens';

interface Props {
  /** 표시할 첫 글자. 미지정 시 "?" */
  letter: string;
  /** 사용자 레벨. v0.1.0은 L1 fallback. */
  level?: NoteAuthorLevel;
  size?: number;
}

export function NoteAuthorAvatar({ letter, level = 'L1', size = 32 }: Props) {
  const gradient = noteAuthorAvatarGradient[level];
  const radius = size / 2;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: withAlpha(brand.gold, 0.3),
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <LinearGradient
        colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
        start={gradient.start}
        end={gradient.end}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Text
        allowFontScaling={false}
        className="font-playfair"
        style={{
          fontSize: 13,
          lineHeight: 15.6,
          fontWeight: '700',
          color: brand.cream,
        }}
      >
        {letter.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
