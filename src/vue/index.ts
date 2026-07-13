/**
 * Thin Vue 3 composables mirroring mahsaagent/react helpers.
 * Peer: vue >= 3 (optional).
 */
import { computed, ref, type Ref } from "vue";
import { getJalaliNow, detectBankInput } from "../react/core.js";
import { polishPersian } from "../lib/polish.js";
import { convertMoney, type MoneyUnit } from "../lib/currency.js";
import { officialAddressCascade } from "../lib/officialGeo.js";

export function useJalali(digits: "fa" | "en" = "fa") {
  return computed(() => getJalaliNow(digits));
}

export function useBankDetect(value: Ref<string> | string) {
  return computed(() => detectBankInput(typeof value === "string" ? value : value.value));
}

export function usePolish(text: Ref<string> | string) {
  return computed(() => polishPersian(typeof text === "string" ? text : text.value, { digits: "fa" }));
}

export function useMoney(
  amount: Ref<number | string> | number | string,
  from: MoneyUnit = "toman",
  to: MoneyUnit = "toman"
) {
  return computed(() => {
    const a = typeof amount === "object" && amount && "value" in amount ? amount.value : amount;
    return convertMoney(a as number | string, from, to);
  });
}

export function useAddressCascade(province: Ref<string>, county: Ref<string>) {
  return computed(() =>
    officialAddressCascade({
      ostan: province.value || undefined,
      shahrestan: county.value || undefined,
    })
  );
}

export function createJalaliRef(digits: "fa" | "en" = "fa") {
  return ref(getJalaliNow(digits));
}
