/**
 * MetaGrid — Section 4 wrapper: 2×2 grid (storage / acquiredAt / price / memo).
 *
 * 사양: design-spec cellar-detail.md §3-8.
 * 키스크린 원본: src/app/cellar/[id]/page.tsx line 242~263 verbatim.
 *
 * 구조:
 *   outer (mx-4 flex-row flex-wrap gap 10) — 각 MetaCard width 48% (gap 10 보정)
 *   4 fixed cards: storage / acquiredAt / price / memo
 *
 * status='consumed' 시 4번째 카드를 consumedAt으로 교체 가능 — 사양 §4-2 deviation.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MetaCard } from '@/components/cellar/meta-card';
import { currentLocale } from '@/lib/i18n';

interface Props {
  acquiredAt: string;
  consumedAt: string | null;
  storage: string | null;
  purchasePriceKrw: number | null;
  memo: string | null;
  status: 'cellared' | 'consumed';
}

// storage 라벨 분기 — keyscreen verbatim
function storageLabel(t: (k: string) => string, storage: string | null): string {
  if (!storage) return t('cellar.meta.storageCellar'); // default
  // storage 값은 lowercase 키 ("cellar", "fridge", "room", "offsite")
  switch (storage.toLowerCase()) {
    case 'cellar':
      return t('cellar.meta.storageCellar');
    case 'fridge':
      return t('cellar.meta.storageFridge');
    case 'room':
      return t('cellar.meta.storageRoom');
    case 'offsite':
      return t('cellar.meta.storageOffsite');
    default:
      // 사용자 자유입력 값은 그대로 표시
      return storage;
  }
}

export function MetaGrid({
  acquiredAt,
  consumedAt,
  storage,
  purchasePriceKrw,
  memo,
  status,
}: Props) {
  const { t } = useTranslation();

  // YYYY-MM-DD slice
  const acquiredAtDate = acquiredAt ? acquiredAt.slice(0, 10) : '—';

  // 가격 — ko: ₩1,180,000 / en: 1,180,000 KRW
  const isKo = currentLocale() === 'ko';
  const priceValue =
    typeof purchasePriceKrw === 'number'
      ? isKo
        ? `₩${purchasePriceKrw.toLocaleString()}`
        : `${purchasePriceKrw.toLocaleString()} ${t('cellar.meta.priceUnit')}`
      : '—';

  // 메모
  const memoValue = memo && memo.trim().length > 0 ? memo : t('cellar.meta.memoEmpty');

  // 4번째 카드: cellared = 메모, consumed = 음용일
  const fourthLabel =
    status === 'consumed' ? t('cellar.meta.consumedAt') : t('cellar.meta.memo');
  const fourthValue =
    status === 'consumed'
      ? consumedAt
        ? consumedAt.slice(0, 10)
        : '—'
      : memoValue;

  return (
    <View className="mx-4 flex-row flex-wrap" style={{ gap: 10 }}>
      <MetaCard label={t('cellar.meta.storage')} value={storageLabel(t, storage)} />
      <MetaCard label={t('cellar.meta.acquiredAt')} value={acquiredAtDate} />
      <MetaCard label={t('cellar.meta.price')} value={priceValue} />
      <MetaCard label={fourthLabel} value={fourthValue} />
    </View>
  );
}
