import { useCallback } from "react";

import { useStore } from "@/context/StoreProvider";
import { useSettings } from "@/hooks/use-store-data";
import { formatMoney } from "@/lib/currency";

/** Formats USD base amounts into the shopper's selected currency. */
export function usePrice(): (usdAmount: number) => string {
  const { currency } = useStore();
  const settings = useSettings();
  return useCallback(
    (usdAmount: number) => formatMoney(usdAmount, currency, settings.currencyRates),
    [currency, settings.currencyRates],
  );
}
