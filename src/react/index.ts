/**
 * Optional React hooks for Mahsaagent.
 * Peer dependency: react >= 18. Works without bundling React into the core package.
 */
import { useMemo, useState, useEffect } from "react";
import {
  getJalaliNow,
  detectBankInput,
  parseJalali,
  type JalaliState,
} from "./core.js";
import { convertMoney, formatMoneyFa, type MoneyUnit } from "../lib/currency.js";
import { polishPersian } from "../lib/polish.js";
import { addressCascade } from "../lib/address.js";

export function useJalali(digits: "fa" | "en" = "fa"): JalaliState {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    void tick;
    return getJalaliNow(digits);
  }, [digits, tick]);
}

export function useBankDetect(value: string) {
  return useMemo(() => detectBankInput(value), [value]);
}

export function useMoney(
  amount: number | string,
  from: MoneyUnit = "toman",
  to: MoneyUnit = "toman"
) {
  return useMemo(() => convertMoney(amount, from, to), [amount, from, to]);
}

export function usePolishPersian(
  text: string,
  options?: { digits?: "fa" | "en" | "keep"; zwnj?: boolean }
) {
  return useMemo(() => polishPersian(text, options), [text, options?.digits, options?.zwnj]);
}

export function useAddressCascade(input: {
  province?: string;
  county?: string;
  cityQuery?: string;
}) {
  return useMemo(
    () => addressCascade(input),
    [input.province, input.county, input.cityQuery]
  );
}

export function useJalaliInput(initial = "") {
  const [value, setValue] = useState(initial);
  const parts = useMemo(() => parseJalali(value), [value]);
  return { value, setValue, parts, valid: parts !== null };
}

export {
  getJalaliNow,
  detectBankInput,
  parseJalali,
  formatMoneyFa,
};
export { useBankSync, useJalaliDefault, useShebaAccountBridge } from "./forms.js";
export type { JalaliState, MoneyUnit };
export type { BankSyncState } from "./forms.js";
