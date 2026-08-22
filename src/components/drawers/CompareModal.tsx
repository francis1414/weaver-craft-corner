import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import { SmartImage } from "@/components/SmartImage";
import { useStore } from "@/context/StoreProvider";
import { usePrice } from "@/hooks/use-price";

const ROWS: { label: string; value: (p: import("@/types").Product) => string }[] = [
  { label: "Price", value: () => "" },
  { label: "Dimensions", value: (p) => p.dimensions || "—" },
  { label: "Material", value: (p) => p.material || "Elephant grass" },
  { label: "Capacity", value: (p) => p.capacity || "—" },
  { label: "Handle", value: (p) => p.handle || "—" },
  { label: "Colours", value: (p) => p.color.join(", ") || "—" },
];

export function CompareModal() {
  const { drawer, closeDrawer, compare, clearCompare, toggleCompare } = useStore();
  const price = usePrice();
  const open = drawer === "compare";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            role="dialog"
            aria-label="Compare products"
            className="fixed inset-x-3 top-1/2 z-50 max-h-[85vh] -translate-y-1/2 overflow-auto bg-background p-5 md:inset-x-auto md:left-1/2 md:w-[min(960px,92vw)] md:-translate-x-1/2 md:p-8"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <h2 className="truncate font-serif text-2xl">Compare Pieces</h2>
              <div className="flex shrink-0 items-center gap-2">
                {compare.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCompare}
                    className="h-11 px-3 text-xs uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close compare"
                  className="grid h-11 w-11 place-items-center"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {compare.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Add up to four pieces to compare their weave, size and price.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="w-32" />
                      {compare.map((p) => (
                        <th key={p.id} className="p-3 align-top text-left">
                          <SmartImage src={p.primaryImage} alt={p.name} ratio="1/1" className="mb-2" />
                          <span className="block font-serif text-base font-normal">{p.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleCompare(p)}
                            className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.label} className="border-t border-border">
                        <th className="p-3 text-left text-xs font-normal uppercase tracking-[0.14em] text-muted-foreground">
                          {row.label}
                        </th>
                        {compare.map((p) => (
                          <td key={p.id} className="p-3 align-top">
                            {row.label === "Price" ? price(p.salePrice ?? p.price) : row.value(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
