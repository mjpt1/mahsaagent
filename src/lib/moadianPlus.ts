import {
  buildMoadianInvoice,
  buildSampleMoadianInvoice,
  computeMoadianLine,
  type MoadianInvoice,
  type MoadianInvoiceBodyItem,
  type MoadianInvoiceHeader,
} from "../moadian/index.js";

const HEADER_FIELDS: Record<
  keyof MoadianInvoiceHeader,
  { labelFa: string; required?: boolean; hint?: string }
> = {
  taxid: { labelFa: "شماره مالیاتی صورتحساب", hint: "پس از صدور از سامانه" },
  indatim: { labelFa: "تاریخ و زمان صدور", required: true, hint: "ISO یا شمسی" },
  inty: { labelFa: "نوع صورتحساب", required: true, hint: "۱=فروش، ۲=برگشت، …" },
  inp: { labelFa: "الگوی صورتحساب", required: true },
  inso: { labelFa: "موضوع صورتحساب", required: true },
  tins: { labelFa: "شماره اقتصادی فروشنده", required: true },
  tinb: { labelFa: "شماره اقتصادی خریدار" },
  tob: { labelFa: "نوع شخص خریدار" },
  setm: { labelFa: "روش تسویه" },
};

const BODY_FIELDS: Record<keyof MoadianInvoiceBodyItem, { labelFa: string; required?: boolean }> = {
  sstid: { labelFa: "شناسه کالا/خدمت", required: true },
  sstt: { labelFa: "شرح کالا/خدمت", required: true },
  am: { labelFa: "تعداد/مقدار", required: true },
  fee: { labelFa: "مبلغ واحد", required: true },
  prdis: { labelFa: "مبلغ قبل از تخفیف", required: true },
  dis: { labelFa: "تخفیف", required: true },
  adis: { labelFa: "مبلغ بعد از تخفیف", required: true },
  vra: { labelFa: "نرخ مالیات", required: true },
  vam: { labelFa: "مبلغ مالیات", required: true },
  tsstam: { labelFa: "مبلغ کل", required: true },
};

export function validateMoadianInvoiceDetailed(invoice: MoadianInvoice) {
  const { payload, warnings, mathErrors, totals } = buildMoadianInvoice(invoice);
  const fieldErrors: Array<{ path: string; messageFa: string }> = [];

  for (const [key, meta] of Object.entries(HEADER_FIELDS) as Array<
    [keyof MoadianInvoiceHeader, (typeof HEADER_FIELDS)[keyof MoadianInvoiceHeader]]
  >) {
    if (meta.required && (payload.header[key] == null || payload.header[key] === "")) {
      fieldErrors.push({ path: `header.${key}`, messageFa: `${meta.labelFa} الزامی است` });
    }
  }

  if (!payload.body?.length) {
    fieldErrors.push({ path: "body", messageFa: "حداقل یک ردیف کالا/خدمت لازم است" });
  }

  for (const [i, row] of (payload.body ?? []).entries()) {
    for (const [key, meta] of Object.entries(BODY_FIELDS) as Array<
      [keyof MoadianInvoiceBodyItem, (typeof BODY_FIELDS)[keyof MoadianInvoiceBodyItem]]
    >) {
      const val = row[key];
      if (meta.required && (val == null || val === "")) {
        fieldErrors.push({
          path: `body[${i}].${key}`,
          messageFa: `${meta.labelFa} در ردیف ${i + 1} الزامی است`,
        });
      }
    }
    if (row.vra != null && row.vra !== 0 && row.vra !== 9 && row.vra !== 10) {
      fieldErrors.push({
        path: `body[${i}].vra`,
        messageFa: "نرخ VAT معمولاً ۰، ۹ یا ۱۰ است — با بخشنامه فعلی تطبیق دهید",
      });
    }
  }

  for (const m of mathErrors) {
    fieldErrors.push({ path: "math", messageFa: m });
  }

  return {
    valid: fieldErrors.length === 0 && warnings.length === 0,
    warnings,
    mathErrors,
    fieldErrors,
    totals,
    payload,
  };
}

export function explainMoadianField(path: string) {
  const headerMatch = path.match(/^header\.(\w+)$/);
  if (headerMatch) {
    const key = headerMatch[1] as keyof MoadianInvoiceHeader;
    const meta = HEADER_FIELDS[key];
    if (meta) return { path, ...meta, section: "header" as const };
  }
  const bodyMatch = path.match(/^body\[(\d+)\]\.(\w+)$/);
  if (bodyMatch) {
    const key = bodyMatch[2] as keyof MoadianInvoiceBodyItem;
    const meta = BODY_FIELDS[key];
    if (meta) return { path, ...meta, section: "body" as const, row: Number(bodyMatch[1]) };
  }
  return { path, labelFa: "فیلد ناشناخته", hint: "مستندات API v2 مودیان را ببینید" };
}

export function moadianFieldCatalog() {
  return {
    header: Object.entries(HEADER_FIELDS).map(([key, v]) => ({ key, ...v })),
    body: Object.entries(BODY_FIELDS).map(([key, v]) => ({ key, ...v })),
  };
}

export function summarizeMoadianInvoice(invoice: MoadianInvoice) {
  const v = validateMoadianInvoiceDetailed(invoice);
  return {
    seller: invoice.header.tins ?? null,
    buyer: invoice.header.tinb ?? null,
    lineCount: invoice.body?.length ?? 0,
    totals: v.totals,
    valid: v.valid,
    issueCount: v.fieldErrors.length,
    warnings: v.warnings,
    mathErrors: v.mathErrors,
  };
}

export { buildSampleMoadianInvoice, computeMoadianLine };
