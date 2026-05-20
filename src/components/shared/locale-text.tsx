import { Text, type TextProps } from 'react-native';
import { currentLocale } from '@/lib/i18n';

export interface LocalizedString {
  ko: string;
  en: string;
}

interface LocaleTextProps extends TextProps {
  value: LocalizedString;
}

export function LocaleText({ value, ...rest }: LocaleTextProps) {
  const locale = currentLocale();
  const text = value[locale] ?? value.en;
  return <Text {...rest}>{text}</Text>;
}
