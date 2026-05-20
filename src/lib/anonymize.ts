/**
 * 클라이언트 익명화 — v0.1.0 한정.
 * v0.2.0에서 Edge Function `anonymize-id`로 이전 (서버 salt 사용).
 *
 * 출처: specs/domain/policies/anonymization.md §3·§4
 * Pool: adjective 50 × noun 50 × number 100 = 250,000 조합
 *
 * 알고리즘: HMAC-SHA256(userId, salt) → 32 bytes
 *   byte[0] → adjective_index
 *   byte[1] → noun_index
 *   byte[2..3] → number (0~99)
 *
 * salt는 EXPO_PUBLIC_ANONYMIZATION_SALT_DEV (Constants.expoConfig.extra) — 개발용.
 * 결정론적: 같은 userId는 항상 같은 익명 ID.
 */
import { sha256 } from 'js-sha256';

export interface AnonymizedUser {
  ko: string;
  en: string;
}

// adjective pool — index가 동일 위치 (KO ↔ EN 1:1)
const ADJECTIVES_EN = [
  'velvety', 'crisp', 'oaky', 'bright', 'smoky',
  'silky', 'mellow', 'bold', 'jammy', 'buttery',
  'toasty', 'earthy', 'minerally', 'floral', 'spicy',
  'zesty', 'chewy', 'robust', 'elegant', 'complex',
  'balanced', 'aromatic', 'vibrant', 'rich', 'lush',
  'juicy', 'fruity', 'nutty', 'savory', 'gentle',
  'noble', 'humble', 'quiet', 'swift', 'steady',
  'merry', 'jolly', 'daring', 'curious', 'wise',
  'clever', 'nimble', 'cozy', 'warm', 'sunny',
  'breezy', 'misty', 'dewy', 'moonlit', 'starlit',
] as const;

const ADJECTIVES_KO = [
  '벨벳같은', '상쾌한', '오키한', '밝은', '스모키한',
  '실키한', '부드러운', '대담한', '잼같은', '버터같은',
  '토스티한', '흙내음의', '미네랄같은', '꽃향기의', '스파이시한',
  '산뜻한', '쫄깃한', '견고한', '우아한', '복잡한',
  '균형잡힌', '향기로운', '생기있는', '풍성한', '풍요로운',
  '과즙같은', '과일향의', '견과같은', '감칠맛의', '온화한',
  '고귀한', '소박한', '차분한', '날랜', '한결같은',
  '명랑한', '유쾌한', '용감한', '호기심많은', '현명한',
  '영리한', '민첩한', '아늑한', '따뜻한', '햇살같은',
  '산들바람의', '안개같은', '이슬같은', '달빛의', '별빛의',
] as const;

const NOUNS_EN = [
  'fox', 'owl', 'bear', 'otter', 'heron',
  'swallow', 'badger', 'lynx', 'hare', 'raven',
  'sparrow', 'squirrel', 'dolphin', 'whale', 'seal',
  'crane', 'falcon', 'salmon', 'trout', 'moth',
  'oak', 'cedar', 'juniper', 'willow', 'maple',
  'olive', 'fern', 'moss', 'ivy', 'clover',
  'harbor', 'meadow', 'river', 'valley', 'orchard',
  'vineyard', 'brook', 'cove', 'grove', 'ridge',
  'quartz', 'amber', 'opal', 'lantern', 'compass',
  'anchor', 'teapot', 'parchment', 'cellar', 'carafe',
] as const;

const NOUNS_KO = [
  '여우', '부엉이', '곰', '수달', '왜가리',
  '제비', '오소리', '스라소니', '산토끼', '까마귀',
  '참새', '다람쥐', '돌고래', '고래', '물범',
  '두루미', '매', '연어', '송어', '나방',
  '참나무', '삼나무', '노간주', '버드나무', '단풍나무',
  '올리브', '고사리', '이끼', '담쟁이', '클로버',
  '항구', '초원', '강', '계곡', '과수원',
  '포도밭', '시냇물', '작은만', '작은숲', '산등성이',
  '석영', '호박돌', '오팔', '등불', '나침반',
  '닻', '찻주전자', '양피지', '셀러', '카라프',
] as const;

if (ADJECTIVES_EN.length !== ADJECTIVES_KO.length) {
  throw new Error('adjective pool size mismatch');
}
if (NOUNS_EN.length !== NOUNS_KO.length) {
  throw new Error('noun pool size mismatch');
}

function hmacSha256Bytes(message: string, salt: string): number[] {
  const hmac = sha256.hmac.create(salt);
  hmac.update(message);
  return hmac.array();
}

export function anonymize(userId: string, salt: string): AnonymizedUser {
  if (!salt) {
    throw new Error('anonymize: salt is required (set EXPO_PUBLIC_ANONYMIZATION_SALT_DEV)');
  }
  const bytes = hmacSha256Bytes(userId, salt);
  const b0 = bytes[0] ?? 0;
  const b1 = bytes[1] ?? 0;
  const b2 = bytes[2] ?? 0;
  const b3 = bytes[3] ?? 0;

  const adjIdx = b0 % ADJECTIVES_EN.length;
  const nounIdx = b1 % NOUNS_EN.length;
  const num = (b2 * 256 + b3) % 100;
  const numStr = String(num).padStart(2, '0');

  return {
    en: `${ADJECTIVES_EN[adjIdx]}-${NOUNS_EN[nounIdx]}-${numStr}`,
    ko: `${ADJECTIVES_KO[adjIdx]}${NOUNS_KO[nounIdx]}-${numStr}`,
  };
}

export const _pools = {
  ADJECTIVES_EN, ADJECTIVES_KO, NOUNS_EN, NOUNS_KO,
} as const;

/**
 * profiles.anonymous_display(EN 형식 "adjective-noun-NN")를 KO 형식 "형용사명사-NN"으로 변환.
 * salt 없이 동작 — 풀 mirror만 사용. 매칭 실패 시 원본 그대로 반환.
 *
 * 사용 예 (WineNameDisplay 등에서 닉네임 노출 시):
 *   const display = currentLocale() === 'ko'
 *     ? localizeAnonymousDisplay(profile.anonymous_display)
 *     : profile.anonymous_display;
 */
export function localizeAnonymousDisplay(en: string): string {
  const m = en.match(/^([a-z]+)-([a-z]+)-(\d{2})$/);
  if (!m) return en;
  const adjIdx = ADJECTIVES_EN.indexOf(m[1] as (typeof ADJECTIVES_EN)[number]);
  const nounIdx = NOUNS_EN.indexOf(m[2] as (typeof NOUNS_EN)[number]);
  if (adjIdx < 0 || nounIdx < 0) return en;
  return `${ADJECTIVES_KO[adjIdx]}${NOUNS_KO[nounIdx]}-${m[3]}`;
}
