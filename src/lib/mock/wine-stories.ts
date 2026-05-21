/**
 * Wine Stories — keyscreen src/lib/mock/wine-stories.ts shape 동등 포팅.
 *
 * v0.1.0 mock 단계 — Step 1 §10 결정 A: supabase 마이그레이션 없이 정적 모듈.
 * v0.2.0 에서 `wine_stories` 테이블 + seed.sql 로 이관 예정.
 *
 * keyscreen 의 wineId(슬러그 형식)는 RN 측 LWIN 기반 라우팅에 직접 매핑되지 않으므로,
 * v0.1.0 화면은 wineLwin 으로 lookup. 본 mock 모듈은 12 예시 entries 중 1개를
 * fallback 으로 제공해 화면 시각 검증 가능 상태를 보장한다 (실제 LWIN-매핑은 향후 작업).
 *
 * shape 은 keyscreen WineStory 와 동등 — ko/en LocalizedString 양쪽 채움.
 */
import type { LocalizedString } from '@/components/shared/locale-text';

export type WineStory = {
  id: string;
  wineLwin: string; // LWIN-기반 RN 라우팅 키
  wineryName: LocalizedString;
  foundedYear: number;
  location: LocalizedString;
  history: LocalizedString;
  funFact: LocalizedString;
  philosophy: LocalizedString | null;
  vineyardArea: string | null;
  producerPhotoUrl: string | null;
  /**
   * keyscreen wines.ts 의 grapes(LocalizedString[]) 가 wines_localized VIEW 에 없으므로
   * mock 측에서 fallback 으로 제공. Step 1 §10 결정 E: string[] 단순화 — locale 무관 단일 표기.
   * Meta grid §3-7 #3 "주요 품종" cell 에서 slice(0,2).join(', ').
   */
  grapes: string[];
  /** Meta grid §3-7 #4 "평균 시판가" 표시값 (KRW). */
  averagePriceKrw: number;
};

export const WINE_STORIES: WineStory[] = [
  {
    id: 'ws_bdx-margaux',
    wineLwin: '1011196',
    wineryName: { ko: '샤또 마고', en: 'Château Margaux' },
    foundedYear: 1572,
    location: {
      ko: '프랑스, 보르도, 메독, 마고',
      en: 'France, Bordeaux, Médoc, Margaux',
    },
    history: {
      ko: '12세기 라모르 영주의 토지로 기록된 떼루아는 16세기 후반 레스토낙 가문이 와이너리로 정비하며 오늘의 형태를 갖추기 시작했다. 18세기 베르틴 영주가 카베르네 소비뇽을 도입하며 좌안 보르도의 현대적 블렌딩이 자리잡았다.\n\n1855년 메독 1등급 분류에서 4개 1er Grand Cru Classé 중 하나로 지정되었고, 토마스 제퍼슨이 1784년 방문 후 "최고의 보르도"라고 적어둔 와인이기도 하다. 1980년대 멘첼로풀로스 가문의 인수와 오프닐 컨설팅 이후 일관된 품질이 재정립되었다.\n\n2017년 와이너리 옆 노먼 포스터 설계의 새 양조장이 완공되어 정밀한 빈야드 구획별 양조가 가능해졌다. 현재 코린느 멘첼로풀로스가 운영하며, 그녀의 딸 알렉산드라가 차세대 디렉터로 합류했다.',
      en: 'The terroir was recorded as the land of Lord Lamothe in the 12th century, but the estate took its current shape only in the late 16th century when the Lestonnac family organized it as a winery. In the 18th century, Lord Berlon introduced Cabernet Sauvignon, anchoring the modern blending style of the Left Bank.\n\nIn the 1855 Médoc classification it was one of four First Growths, and Thomas Jefferson, after his 1784 visit, wrote of it as the finest of Bordeaux. After the Mentzelopoulos family acquired it in the 1980s, consulting from Émile Peynaud and later Paul Pontallier re-established consistent excellence.\n\nA new Norman Foster-designed cellar opened in 2017, enabling parcel-by-parcel vinification. The estate is now led by Corinne Mentzelopoulos, with her daughter Alexandra joining as the next-generation director.',
    },
    funFact: {
      ko: '토마스 제퍼슨이 1784년 방문 후 메모장에 적은 와인 — 그의 손글씨가 남아 있는 유일한 프랑스 와인이다.',
      en: 'After his 1784 visit, Thomas Jefferson wrote about this wine in his journal — the only French wine for which his handwriting survives.',
    },
    producerPhotoUrl: null,
    vineyardArea: '85 ha',
    philosophy: {
      ko: '"섬세함은 거친 추출로는 만들어지지 않는다." — 빈티지마다 그랑 뱅(Château Margaux)·세컨드(Pavillon Rouge)·서드(Margaux du Château Margaux)로 엄격히 선별하며, 빈야드의 약 38%만 1등급 라벨에 들어간다.',
      en: '"Finesse is never built by coarse extraction." Each vintage is rigorously divided into the Grand Vin (Château Margaux), the second wine (Pavillon Rouge), and a third — only about 38% of the vineyard reaches the first-label bottle.',
    },
    grapes: ['Cabernet Sauvignon', 'Merlot'],
    averagePriceKrw: 1_200_000,
  },
  {
    id: 'ws_bgy-romanee-st-vivant',
    wineLwin: '1009345',
    wineryName: {
      ko: '도멘 드 라 로마네 콩티',
      en: 'Domaine de la Romanée-Conti',
    },
    foundedYear: 1232,
    location: {
      ko: '프랑스, 부르고뉴, 꼬뜨 드 뉘, 본 로마네',
      en: 'France, Burgundy, Côte de Nuits, Vosne-Romanée',
    },
    history: {
      ko: '1232년 시토회 수도원이 본 로마네의 토지를 일군 기록이 남아 있다. 1631년 크로낭부르 가문이 매입하며 단일 소유 빈야드의 전통이 시작되었다.\n\n1760년 콩티 공이 라 로마네 빈야드(현 Romanée-Conti)를 매입하면서 도멘 이름의 절반을 부여했다. 프랑스 혁명 후 국가에 압수되었다가 시민에게 매각되었고, 1869년 자크 마리 뒤보 블로셰가 매입하며 현재 운영 가문의 시조가 되었다.\n\n2009년 부르고뉴 클리마(climats)의 유네스코 등재 신청 시 도멘의 8개 그랑 크뤼가 핵심 자산으로 인용되었다. 현재 빈야드 매니저 베르나르 노블레와 양조 책임 오베르 드 빌렌이 운영한다.',
      en: "Records from 1232 show the Cistercian monks tilling lands at Vosne-Romanée. In 1631, the Croonembourg family purchased the vineyards, beginning the tradition of monopole stewardship.\n\nIn 1760, the Prince de Conti acquired the La Romanée vineyard (today's Romanée-Conti), giving the Domaine half of its name. After the Revolution, the estate was confiscated and resold; in 1869, Jacques-Marie Duvault-Blochet acquired it, founding the family line that runs the estate today.\n\nWhen Burgundy's climats were inscribed on the UNESCO World Heritage list, the Domaine's eight Grands Crus were cited as core assets. The estate is run today by vineyard director Bernard Noblet and winemaking head Aubert de Villaine.",
    },
    funFact: {
      ko: '도멘의 8개 그랑 크뤼 합계 면적은 25 ha에 불과하며, 연간 총 생산량은 약 7,000~8,000케이스로 보르도 1등급 한 곳의 1/15 수준이다.',
      en: "The Domaine's eight Grands Crus total only 25 ha; annual output of 7,000–8,000 cases is about one-fifteenth of a single Bordeaux First Growth.",
    },
    producerPhotoUrl: null,
    vineyardArea: '25 ha',
    philosophy: {
      ko: '"피노 누아는 와인메이커가 만드는 게 아니라 토양이 만드는 것이다." 신축 오크 사용 100%이지만 항상 같은 토노니에 쿠퍼리지에서 공급. 발효는 야생 효모, 청징 없이 병입.',
      en: '"Pinot Noir is made not by the winemaker but by the soil." 100% new oak — but always from the same François Frères/Tonnellerie cooperage. Native-yeast fermentation, no fining or filtration before bottling.',
    },
    grapes: ['Pinot Noir'],
    averagePriceKrw: 8_500_000,
  },
];

const STORIES_BY_LWIN: Record<string, WineStory> = WINE_STORIES.reduce<
  Record<string, WineStory>
>((acc, s) => {
  acc[s.wineLwin] = s;
  return acc;
}, {});

/**
 * LWIN 기반 lookup. 매칭 없으면 null.
 *
 * v0.1.0 mock 단계 — 매칭 entry 가 없는 LWIN 은 정상 empty state 분기 (§2-3).
 */
export function getWineStoryByLwin(lwin: string | null | undefined): WineStory | null {
  if (!lwin) return null;
  return STORIES_BY_LWIN[lwin] ?? null;
}
