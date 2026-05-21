/**
 * AddMyPriceSheet zod schema (wine-prices §5-3).
 *
 * 폼 입력값 검증 — price (KRW 정수), storeId (STORES 중 1), purchasedAt (YYYY-MM-DD).
 * 에러 메시지는 i18n key 문자열로 보존 (실제 번역은 호출처에서 t() 적용).
 *
 * v0.1.0 mock 단계 (§10 F): submit 은 mock toast 만 — 실제 supabase insert 는 v0.2.0.
 */
import { z } from 'zod';

export const addPriceSchema = z.object({
  // 숫자만 string 입력 받음 → integer transform.
  price: z
    .string()
    .min(1, 'priceRequired')
    .refine((v) => /^\d+$/.test(v), 'priceFormat')
    .transform((v) => parseInt(v, 10))
    .refine((n) => n >= 100 && n <= 100_000_000, 'priceRange'),
  storeId: z.string().min(1, 'storeRequired'),
  purchasedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateFormat'),
});

export type AddPriceForm = z.infer<typeof addPriceSchema>;

/** zod 에러를 첫 i18n key 로 압축. */
export function firstAddPriceError(
  err: z.ZodError,
): { field: string; messageKey: string } {
  const issue = err.issues[0];
  if (!issue) return { field: '', messageKey: 'priceRequired' };
  const field = String(issue.path[0] ?? '');
  return { field, messageKey: issue.message };
}
