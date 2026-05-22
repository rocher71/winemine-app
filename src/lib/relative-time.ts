/**
 * relativeTime — 키스크린 notification-row.tsx line 24~35 verbatim 포팅.
 *
 * 사양: _workspace/design-specs/notifications.md §5-5.
 *
 * 의존 없는 순수 함수. ISO 8601 timestamp → ko/en 짧은 상대 표현.
 *   <1min: ko `방금` / en `now`
 *   <60min: ko `{N}분` / en `{N}m`
 *   <24hr: ko `{N}시간` / en `{N}h`
 *   <30day: ko `{N}일` / en `{N}d`
 *   else: ko `{N}달` / en `{N}mo`
 *
 * v0.2.0 후속: i18next `Intl.RelativeTimeFormat` 검토 (locale 추가 시).
 */
export type RelativeLocale = 'ko' | 'en';

export function relativeTime(iso: string, locale: RelativeLocale): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return locale === 'en' ? 'now' : '방금';
  if (min < 60) return locale === 'en' ? `${min}m` : `${min}분`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return locale === 'en' ? `${hr}h` : `${hr}시간`;
  const day = Math.floor(hr / 24);
  if (day < 30) return locale === 'en' ? `${day}d` : `${day}일`;
  const mon = Math.floor(day / 30);
  return locale === 'en' ? `${mon}mo` : `${mon}달`;
}
