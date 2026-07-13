/** 31 provinces of Iran with capitals (Persian). */
export type Province = {
  id: number;
  name: string;
  nameEn: string;
  capital: string;
  capitalEn: string;
};

export const PROVINCES: Province[] = [
  { id: 1, name: "آذربایجان شرقی", nameEn: "East Azerbaijan", capital: "تبریز", capitalEn: "Tabriz" },
  { id: 2, name: "آذربایجان غربی", nameEn: "West Azerbaijan", capital: "ارومیه", capitalEn: "Urmia" },
  { id: 3, name: "اردبیل", nameEn: "Ardabil", capital: "اردبیل", capitalEn: "Ardabil" },
  { id: 4, name: "اصفهان", nameEn: "Isfahan", capital: "اصفهان", capitalEn: "Isfahan" },
  { id: 5, name: "البرز", nameEn: "Alborz", capital: "کرج", capitalEn: "Karaj" },
  { id: 6, name: "ایلام", nameEn: "Ilam", capital: "ایلام", capitalEn: "Ilam" },
  { id: 7, name: "بوشهر", nameEn: "Bushehr", capital: "بوشهر", capitalEn: "Bushehr" },
  { id: 8, name: "تهران", nameEn: "Tehran", capital: "تهران", capitalEn: "Tehran" },
  { id: 9, name: "چهارمحال و بختیاری", nameEn: "Chaharmahal and Bakhtiari", capital: "شهرکرد", capitalEn: "Shahrekord" },
  { id: 10, name: "خراسان جنوبی", nameEn: "South Khorasan", capital: "بیرجند", capitalEn: "Birjand" },
  { id: 11, name: "خراسان رضوی", nameEn: "Razavi Khorasan", capital: "مشهد", capitalEn: "Mashhad" },
  { id: 12, name: "خراسان شمالی", nameEn: "North Khorasan", capital: "بجنورد", capitalEn: "Bojnurd" },
  { id: 13, name: "خوزستان", nameEn: "Khuzestan", capital: "اهواز", capitalEn: "Ahvaz" },
  { id: 14, name: "زنجان", nameEn: "Zanjan", capital: "زنجان", capitalEn: "Zanjan" },
  { id: 15, name: "سمنان", nameEn: "Semnan", capital: "سمنان", capitalEn: "Semnan" },
  { id: 16, name: "سیستان و بلوچستان", nameEn: "Sistan and Baluchestan", capital: "زاهدان", capitalEn: "Zahedan" },
  { id: 17, name: "فارس", nameEn: "Fars", capital: "شیراز", capitalEn: "Shiraz" },
  { id: 18, name: "قزوین", nameEn: "Qazvin", capital: "قزوین", capitalEn: "Qazvin" },
  { id: 19, name: "قم", nameEn: "Qom", capital: "قم", capitalEn: "Qom" },
  { id: 20, name: "کردستان", nameEn: "Kurdistan", capital: "سنندج", capitalEn: "Sanandaj" },
  { id: 21, name: "کرمان", nameEn: "Kerman", capital: "کرمان", capitalEn: "Kerman" },
  { id: 22, name: "کرمانشاه", nameEn: "Kermanshah", capital: "کرمانشاه", capitalEn: "Kermanshah" },
  { id: 23, name: "کهگیلویه و بویراحمد", nameEn: "Kohgiluyeh and Boyer-Ahmad", capital: "یاسوج", capitalEn: "Yasuj" },
  { id: 24, name: "گلستان", nameEn: "Golestan", capital: "گرگان", capitalEn: "Gorgan" },
  { id: 25, name: "گیلان", nameEn: "Gilan", capital: "رشت", capitalEn: "Rasht" },
  { id: 26, name: "لرستان", nameEn: "Lorestan", capital: "خرم‌آباد", capitalEn: "Khorramabad" },
  { id: 27, name: "مازندران", nameEn: "Mazandaran", capital: "ساری", capitalEn: "Sari" },
  { id: 28, name: "مرکزی", nameEn: "Markazi", capital: "اراک", capitalEn: "Arak" },
  { id: 29, name: "هرمزگان", nameEn: "Hormozgan", capital: "بندرعباس", capitalEn: "Bandar Abbas" },
  { id: 30, name: "همدان", nameEn: "Hamadan", capital: "همدان", capitalEn: "Hamadan" },
  { id: 31, name: "یزد", nameEn: "Yazd", capital: "یزد", capitalEn: "Yazd" },
];

export function findProvinces(query: string): Province[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...PROVINCES];
  return PROVINCES.filter(
    (p) =>
      p.name.includes(query.trim()) ||
      p.capital.includes(query.trim()) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.capitalEn.toLowerCase().includes(q)
  );
}
