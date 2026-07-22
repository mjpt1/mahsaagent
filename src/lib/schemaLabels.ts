const FIELD_LABELS: Record<string, { label: string; hint?: string; error?: string }> = {
  nationalId: { label: "کد ملی", hint: "۱۰ رقم", error: "کد ملی معتبر نیست" },
  national_id: { label: "کد ملی", hint: "۱۰ رقم", error: "کد ملی معتبر نیست" },
  codemeli: { label: "کد ملی", hint: "۱۰ رقم", error: "کد ملی معتبر نیست" },
  mobile: { label: "شماره موبایل", hint: "مثلاً ۰۹۱۲۳۴۵۶۷۸۹", error: "شماره موبایل معتبر نیست" },
  phone: { label: "شماره تماس", hint: "موبایل یا ثابت", error: "شماره تماس معتبر نیست" },
  sheba: { label: "شماره شبا", hint: "IR + ۲۴ رقم", error: "شماره شبا معتبر نیست" },
  iban: { label: "شماره شبا", hint: "IR + ۲۴ رقم", error: "شماره شبا معتبر نیست" },
  card: { label: "شماره کارت", hint: "۱۶ رقم", error: "شماره کارت معتبر نیست" },
  cardNumber: { label: "شماره کارت", hint: "۱۶ رقم", error: "شماره کارت معتبر نیست" },
  postalCode: { label: "کد پستی", hint: "۱۰ رقم بدون خط تیره", error: "کد پستی معتبر نیست" },
  postal_code: { label: "کد پستی", hint: "۱۰ رقم", error: "کد پستی معتبر نیست" },
  legalId: { label: "شناسه ملی شرکت", hint: "۱۱ رقم", error: "شناسه حقوقی معتبر نیست" },
  legal_id: { label: "شناسه ملی شرکت", hint: "۱۱ رقم", error: "شناسه حقوقی معتبر نیست" },
  birthDate: { label: "تاریخ تولد", hint: "شمسی یا میلادی", error: "تاریخ نامعتبر است" },
  jalaliDate: { label: "تاریخ شمسی", hint: "۱۴۰۵/۰۴/۲۲", error: "تاریخ شمسی نامعتبر است" },
  province: { label: "استان", hint: "مثلاً تهران", error: "استان را انتخاب کنید" },
  city: { label: "شهر", hint: "نام شهر", error: "شهر را انتخاب کنید" },
  address: { label: "آدرس", hint: "خیابان، پلاک، واحد", error: "آدرس را کامل کنید" },
  plate: { label: "پلاک خودرو", error: "پلاک معتبر نیست" },
  amount: { label: "مبلغ", hint: "به ریال یا تومان", error: "مبلغ نامعتبر است" },
  email: { label: "ایمیل", error: "ایمیل معتبر نیست" },
  password: { label: "رمز عبور", hint: "حداقل ۸ کاراکتر", error: "رمز عبور ضعیف است" },
  otp: { label: "کد تأیید", hint: "۶ رقم", error: "کد تأیید اشتباه است" },
  firstName: { label: "نام", error: "نام را وارد کنید" },
  lastName: { label: "نام خانوادگی", error: "نام خانوادگی را وارد کنید" },
  fullName: { label: "نام و نام خانوادگی", error: "نام کامل را وارد کنید" },
};

function camelToWords(s: string) {
  return s
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

export function labelForField(field: string) {
  const direct = FIELD_LABELS[field];
  if (direct) return { field, ...direct, source: "dictionary" as const };
  const lower = field.toLowerCase();
  const hit = Object.entries(FIELD_LABELS).find(([k]) => k.toLowerCase() === lower);
  if (hit) return { field, ...hit[1], source: "dictionary" as const };
  const guess = camelToWords(field);
  return {
    field,
    label: guess,
    hint: undefined,
    error: `${guess} نامعتبر است`,
    source: "inferred" as const,
  };
}

export function labelsForSchema(fields: string[]) {
  return fields.map((f) => labelForField(f));
}

export function listKnownFieldLabels() {
  return Object.entries(FIELD_LABELS).map(([field, v]) => ({ field, ...v }));
}
