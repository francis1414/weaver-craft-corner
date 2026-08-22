import type { CurrencyCode } from "@/types";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$", label: "USD $" },
  { code: "EUR", symbol: "€", label: "EUR €" },
  { code: "GBP", symbol: "£", label: "GBP £" },
  { code: "GHS", symbol: "₵", label: "GHS ₵" },
  { code: "CAD", symbol: "C$", label: "CAD C$" },
];

export const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  GHS: 15.4,
  CAD: 1.36,
};

export function symbolFor(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function convert(
  usdAmount: number,
  code: CurrencyCode,
  rates: Record<CurrencyCode, number> = DEFAULT_RATES,
): number {
  const rate = rates[code] ?? DEFAULT_RATES[code] ?? 1;
  return usdAmount * rate;
}

export function formatMoney(
  usdAmount: number,
  code: CurrencyCode = "USD",
  rates: Record<CurrencyCode, number> = DEFAULT_RATES,
): string {
  const value = convert(usdAmount, code, rates);
  const fractionDigits = value >= 1000 || code === "GHS" ? 0 : 2;
  return `${symbolFor(code)}${value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function formatUsd(amount: number): string {
  return formatMoney(amount, "USD");
}
