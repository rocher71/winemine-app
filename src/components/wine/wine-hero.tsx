import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wine } from 'lucide-react-native';
import { WineNameDisplay } from '@/components/shared/wine-name-display';
import { getDefaultBottleColor, parseLwinVintage } from '@/lib/lwin';
import { bottleGradientEnd, brand, type TypeCanonical } from '@/lib/design-tokens';

interface Props {
  lwin: string;
  display_name: string;
  name_ko: string | null;
  bottle_color: string | null;
  type_canonical: string | null;
  vintage: number | null;
}

const TYPE_CANONICAL: ReadonlySet<TypeCanonical> = new Set([
  'red',
  'white',
  'rose',
  'sparkling',
  'fortified',
  'dessert',
]);

function asTypeCanonical(value: string | null | undefined): TypeCanonical | null {
  if (value && TYPE_CANONICAL.has(value as TypeCanonical)) return value as TypeCanonical;
  return null;
}

export function WineHero({
  lwin,
  display_name,
  name_ko,
  bottle_color,
  type_canonical,
  vintage,
}: Props) {
  const startColor = bottle_color ?? getDefaultBottleColor(asTypeCanonical(type_canonical));
  const resolvedVintage = vintage ?? parseLwinVintage(lwin);

  return (
    <LinearGradient
      colors={[startColor, bottleGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.8]}
      style={{ height: 320, paddingHorizontal: 24, paddingVertical: 32, justifyContent: 'flex-end' }}
    >
      <View className="items-center" style={{ flex: 1, justifyContent: 'center' }}>
        <Wine size={64} strokeWidth={1.5} color={brand.cream} />
      </View>
      <View>
        <WineNameDisplay
          lwin={lwin}
          name_ko={name_ko}
          display_name={display_name}
          size="title"
        />
        {resolvedVintage ? (
          <Text className="font-inter text-card-meta text-cream mt-2">{resolvedVintage}</Text>
        ) : null}
      </View>
    </LinearGradient>
  );
}
