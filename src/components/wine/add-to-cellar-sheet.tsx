import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { z } from 'zod';
import { PrimaryButton } from '@/components/shared/primary-button';
import { Toast } from '@/components/shared/toast';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/auth';
import { brand, dark, light } from '@/lib/design-tokens';

export interface CellarInitialValues {
  acquired_at: string;
  quantity: number;
  purchase_price_krw: number | null;
  storage: string | null;
}

interface BaseProps {
  visible: boolean;
  wineLwin: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Props =
  | (BaseProps & { mode?: 'add'; cellarItemId?: undefined; initial?: undefined })
  | (BaseProps & { mode: 'edit'; cellarItemId: string; initial: CellarInitialValues });

const todayIso = () => new Date().toISOString().slice(0, 10);

const FormSchema = z.object({
  acquired_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
    .refine((d) => new Date(d) <= new Date(), 'not future'),
  quantity: z.number().int().min(1),
  purchase_price_krw: z.number().int().min(0).optional().nullable(),
  storage: z.string().max(100).optional().nullable(),
});

export function AddToCellarSheet(props: Props) {
  const { visible, wineLwin, onClose, onSuccess } = props;
  const isEdit = props.mode === 'edit';
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const iconColor = scheme === 'light' ? light.text.primary : dark.text.primary;
  const placeholderColor = scheme === 'light' ? light.text.disabled : dark.text.disabled;

  const initialAcquired = isEdit ? props.initial.acquired_at : todayIso();
  const initialQuantity = isEdit ? String(props.initial.quantity) : '1';
  const initialPrice = isEdit && props.initial.purchase_price_krw !== null
    ? String(props.initial.purchase_price_krw)
    : '';
  const initialStorage = isEdit ? props.initial.storage ?? '' : '';

  const [acquiredAt, setAcquiredAt] = useState(initialAcquired);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [priceKrw, setPriceKrw] = useState(initialPrice);
  const [storage, setStorage] = useState(initialStorage);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Re-sync defaults when the sheet is opened with a different cellar item.
  useEffect(() => {
    if (!visible) return;
    setAcquiredAt(initialAcquired);
    setQuantity(initialQuantity);
    setPriceKrw(initialPrice);
    setStorage(initialStorage);
    setErrorMsg(null);
  }, [visible, initialAcquired, initialQuantity, initialPrice, initialStorage]);

  const resetAddDefaults = () => {
    setAcquiredAt(todayIso());
    setQuantity('1');
    setPriceKrw('');
    setStorage('');
    setErrorMsg(null);
  };

  const handleClose = () => {
    if (!isEdit) resetAddDefaults();
    onClose();
  };

  const submit = async () => {
    setErrorMsg(null);
    const qty = parseInt(quantity, 10);
    const price = priceKrw.trim() ? parseInt(priceKrw, 10) : null;
    const parsed = FormSchema.safeParse({
      acquired_at: acquiredAt,
      quantity: Number.isNaN(qty) ? 0 : qty,
      purchase_price_krw: price !== null && Number.isNaN(price) ? null : price,
      storage: storage.trim() ? storage.trim() : null,
    });
    if (!parsed.success) {
      setErrorMsg(t('cellar.add.failed'));
      return;
    }
    setSaving(true);
    try {
      const uid = await getCurrentUserId();
      if (!uid) throw new Error('no session');
      if (isEdit) {
        const { error } = await supabase
          .from('cellar_items')
          .update({
            acquired_at: parsed.data.acquired_at,
            quantity: parsed.data.quantity,
            purchase_price_krw: parsed.data.purchase_price_krw ?? null,
            storage: parsed.data.storage ?? null,
          })
          .eq('id', props.cellarItemId)
          .eq('user_id', uid);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cellar_items').insert({
          user_id: uid,
          wine_lwin: wineLwin,
          status: 'cellared',
          acquired_at: parsed.data.acquired_at,
          quantity: parsed.data.quantity,
          purchase_price_krw: parsed.data.purchase_price_krw ?? null,
          storage: parsed.data.storage ?? null,
        });
        if (error) throw error;
      }
      if (!isEdit) resetAddDefaults();
      onSuccess();
    } catch (err) {
      console.warn('[cellar add/edit] failed:', err);
      setErrorMsg(t('cellar.add.failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View
        className="flex-1 items-center justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      >
        <View
          className="w-full rounded-t-md bg-bg-deep dark:bg-bg-deep px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-playfair text-modal-title text-text-primary dark:text-text-primary">
              {isEdit ? t('cellar.detail.editTitle') : t('cellar.add.title')}
            </Text>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={12}
            >
              <X size={20} strokeWidth={2} color={iconColor} />
            </Pressable>
          </View>

          <View className="mt-4 gap-3">
            <Field
              label={t('cellar.add.acquiredAt')}
              value={acquiredAt}
              onChangeText={setAcquiredAt}
              placeholder="YYYY-MM-DD"
              placeholderColor={placeholderColor}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel={t('cellar.add.acquiredAt')}
            />
            <Field
              label={t('cellar.add.quantity')}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              placeholderColor={placeholderColor}
              keyboardType="number-pad"
              accessibilityLabel={t('cellar.add.quantity')}
            />
            <Field
              label={t('cellar.add.purchasePrice')}
              value={priceKrw}
              onChangeText={setPriceKrw}
              placeholder=""
              placeholderColor={placeholderColor}
              keyboardType="number-pad"
              accessibilityLabel={t('cellar.add.purchasePrice')}
            />
            <Field
              label={t('cellar.add.storage')}
              value={storage}
              onChangeText={setStorage}
              placeholder=""
              placeholderColor={placeholderColor}
              accessibilityLabel={t('cellar.add.storage')}
            />
          </View>

          {errorMsg ? (
            <View className="mt-4">
              <Toast message={errorMsg} tone="error" />
            </View>
          ) : null}

          <View className="mt-5">
            <PrimaryButton
              label={isEdit ? t('common.save') : t('cellar.add.submit')}
              size="lg"
              loading={saving}
              onPress={submit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  placeholderColor: string;
  keyboardType?: 'default' | 'number-pad' | 'numbers-and-punctuation';
  accessibilityLabel: string;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderColor,
  keyboardType = 'default',
  accessibilityLabel,
}: FieldProps) {
  return (
    <View>
      <Text className="font-inter text-card-meta text-text-secondary dark:text-text-secondary uppercase">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel}
        className="mt-1 h-11 rounded-sm bg-surface px-3 font-inter text-card-body text-text-primary dark:text-text-primary"
        style={{ borderWidth: 1, borderColor: brand.gold }}
      />
    </View>
  );
}
