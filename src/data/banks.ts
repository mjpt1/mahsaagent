/**
 * Compact bank registry for Iran — card BIN prefixes + Sheba bank codes.
 * Logos: optional CDN path pattern (not required at runtime).
 */
export type BankInfo = {
  id: string;
  name: string;
  nameEn: string;
  shebaCode?: string;
  cardPrefixes: string[];
};

export const BANKS: BankInfo[] = [
  { id: "melli", name: "بانک ملی ایران", nameEn: "Bank Melli", shebaCode: "017", cardPrefixes: ["603799"] },
  { id: "sepah", name: "بانک سپه", nameEn: "Bank Sepah", shebaCode: "015", cardPrefixes: ["589210"] },
  { id: "saderat", name: "بانک صادرات", nameEn: "Bank Saderat", shebaCode: "019", cardPrefixes: ["603769"] },
  { id: "mellat", name: "بانک ملت", nameEn: "Bank Mellat", shebaCode: "012", cardPrefixes: ["610433"] },
  { id: "tejarat", name: "بانک تجارت", nameEn: "Tejarat Bank", shebaCode: "018", cardPrefixes: ["627353"] },
  { id: "refah", name: "بانک رفاه کارگران", nameEn: "Refah Bank", shebaCode: "013", cardPrefixes: ["589463"] },
  { id: "maskan", name: "بانک مسکن", nameEn: "Bank Maskan", shebaCode: "014", cardPrefixes: ["628023"] },
  { id: "keshavarzi", name: "بانک کشاورزی", nameEn: "Bank Keshavarzi", shebaCode: "016", cardPrefixes: ["603770"] },
  { id: "parsian", name: "بانک پارسیان", nameEn: "Parsian Bank", shebaCode: "054", cardPrefixes: ["622106", "639194", "627884"] },
  { id: "pasargad", name: "بانک پاسارگاد", nameEn: "Pasargad Bank", shebaCode: "057", cardPrefixes: ["502229", "639347"] },
  { id: "saman", name: "بانک سامان", nameEn: "Saman Bank", shebaCode: "056", cardPrefixes: ["621986"] },
  { id: "sina", name: "بانک سینا", nameEn: "Sina Bank", shebaCode: "058", cardPrefixes: ["639346"] },
  { id: "karafarin", name: "بانک کارآفرین", nameEn: "Karafarin Bank", shebaCode: "053", cardPrefixes: ["627488", "502910"] },
  { id: "eghtesad_novin", name: "بانک اقتصاد نوین", nameEn: "EN Bank", shebaCode: "055", cardPrefixes: ["627412"] },
  { id: "ansar", name: "بانک انصار", nameEn: "Ansar Bank", shebaCode: "063", cardPrefixes: ["627381"] },
  { id: "mehre_iran", name: "بانک مهر ایران", nameEn: "Mehr Iran", shebaCode: "060", cardPrefixes: ["606373"] },
  { id: "shahr", name: "بانک شهر", nameEn: "Shahr Bank", shebaCode: "061", cardPrefixes: ["502806", "504706"] },
  { id: "ayandeh", name: "بانک آینده", nameEn: "Ayandeh Bank", shebaCode: "062", cardPrefixes: ["636214"] },
  { id: "gardeshgari", name: "بانک گردشگری", nameEn: "Tourism Bank", shebaCode: "064", cardPrefixes: ["505416"] },
  { id: "hekmat", name: "بانک حکمت ایرانیان", nameEn: "Hekmat Bank", shebaCode: "065", cardPrefixes: ["636949"] },
  { id: "iran_zamin", name: "بانک ایران‌زمین", nameEn: "Iran Zamin", shebaCode: "069", cardPrefixes: ["505785"] },
  { id: "resalat", name: "بانک رسالت", nameEn: "Resalat Bank", shebaCode: "070", cardPrefixes: ["504172"] },
  { id: "kosar", name: "مؤسسه کوثر", nameEn: "Kosar", shebaCode: "073", cardPrefixes: ["505801"] },
  { id: "mehr_eqtesad", name: "مهر اقتصاد", nameEn: "Mehr Eqtesad", shebaCode: "079", cardPrefixes: ["639370"] },
  { id: "blubank", name: "بلو بانک", nameEn: "Blu Bank", cardPrefixes: ["62198619"] },
  { id: "post", name: "پست بانک", nameEn: "Post Bank", shebaCode: "021", cardPrefixes: ["627760"] },
  { id: "tosee_taavon", name: "بانک توسعه تعاون", nameEn: "Tose'e Ta'avon", shebaCode: "022", cardPrefixes: ["502908"] },
  { id: "tosee_saderat", name: "بانک توسعه صادرات", nameEn: "Export Development", shebaCode: "020", cardPrefixes: ["627648"] },
  { id: "sanat_madan", name: "بانک صنعت و معدن", nameEn: "Industry & Mine", shebaCode: "011", cardPrefixes: ["627961"] },
  { id: "middle_east", name: "بانک خاورمیانه", nameEn: "Middle East Bank", shebaCode: "078", cardPrefixes: ["505809"] },
  { id: "dey", name: "بانک دی", nameEn: "Dey Bank", shebaCode: "066", cardPrefixes: ["502938"] },
];

export function findBankByCard(card: string): BankInfo | null {
  const n = card.replace(/\D/g, "");
  const sorted = [...BANKS].sort(
    (a, b) =>
      Math.max(...b.cardPrefixes.map((p) => p.length)) -
      Math.max(...a.cardPrefixes.map((p) => p.length))
  );
  for (const b of sorted) {
    if (b.cardPrefixes.some((p) => n.startsWith(p))) return b;
  }
  return null;
}

export function findBankByShebaCode(code: string): BankInfo | null {
  const c = code.replace(/\D/g, "").padStart(3, "0");
  return BANKS.find((b) => b.shebaCode === c) ?? null;
}
