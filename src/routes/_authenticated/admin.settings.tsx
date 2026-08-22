import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSettings } from "@/hooks/use-store-data";
import { MOCK_SETTINGS } from "@/lib/mock-data";
import { upsertSingleton } from "@/lib/store-api";
import type { CurrencyCode, StoreSettings } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "GBP", "GHS", "CAD"];

function AdminSettings() {
  const { data, isLoading } = useAdminSettings();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<StoreSettings>(MOCK_SETTINGS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function save() {
    setBusy(true);
    try {
      await upsertSingleton("store_settings", {
        currency_rates: form.currencyRates,
        tax_rate: form.taxRate,
        shipping_domestic: form.shippingDomestic,
        shipping_international: form.shippingInternational,
        free_shipping_threshold: form.freeShippingThreshold,
        announcement: form.announcement,
        support_email: form.supportEmail,
        support_phone: form.supportPhone,
        updated_at: new Date().toISOString(),
      });
      toast.success("Store settings saved");
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading settings…</p>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Store settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Currency rates, tax, shipping tiers, announcement bar and customer care details.
          </p>
        </div>
        <Button onClick={save} disabled={busy}>
          Save settings
        </Button>
      </header>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Announcement bar</h2>
        <Textarea
          className="mt-3"
          rows={2}
          value={form.announcement}
          onChange={(e) => setForm({ ...form, announcement: e.target.value })}
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Currency exchange rates</h2>
        <p className="mt-1 text-sm text-muted-foreground">Relative to 1 USD.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CURRENCIES.map((code) => (
            <div key={code} className="space-y-2">
              <Label>{code}</Label>
              <Input
                type="number"
                step="0.0001"
                value={form.currencyRates[code] ?? 1}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currencyRates: {
                      ...form.currencyRates,
                      [code]: Number(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Tax &amp; shipping</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Tax rate (e.g. 0.05)</Label>
            <Input
              type="number"
              step="0.001"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Domestic shipping</Label>
            <Input
              type="number"
              step="0.01"
              value={form.shippingDomestic}
              onChange={(e) => setForm({ ...form, shippingDomestic: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>International shipping</Label>
            <Input
              type="number"
              step="0.01"
              value={form.shippingInternational}
              onChange={(e) =>
                setForm({ ...form, shippingInternational: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Free shipping threshold</Label>
            <Input
              type="number"
              step="1"
              value={form.freeShippingThreshold}
              onChange={(e) =>
                setForm({ ...form, freeShippingThreshold: Number(e.target.value) })
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Customer care</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Support email</Label>
            <Input
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Support phone</Label>
            <Input
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
