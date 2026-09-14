import { useMemo, useState } from "react";
import { Check, Minus, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SmartImage } from "@/components/SmartImage";
import { useProducts } from "@/hooks/use-store-data";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  company: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter your mobile number so we can reach you")
    .max(30)
    .regex(/^[0-9+()\s-]{7,30}$/, "Enter a valid mobile number"),
  country: z.string().trim().min(2, "Enter your country").max(80),
  businessType: z.string().trim().min(2, "Select your business type").max(60),
  timeline: z.string().trim().min(2, "Select a delivery window").max(60),
  message: z.string().trim().max(1200).optional(),
});

const BUSINESS_TYPES = [
  "Retail store",
  "Interior designer",
  "Hospitality project",
  "Online shop",
  "Gallery / museum shop",
  "Distributor",
  "Other",
];

const TIMELINES = ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "Just exploring"];

type Selection = Record<string, number>;

export function WholesaleForm() {
  const { data: products } = useProducts();
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Selection>({});
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    businessType: "",
    timeline: "",
    message: "",
  });

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    const list = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : products;
    return list.slice(0, 12);
  }, [products, term]);

  const chosen = useMemo(
    () => products.filter((p) => selected[p.id]),
    [products, selected],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 50;
      return next;
    });
  }

  function setQty(id: string, qty: number) {
    setSelected((prev) => ({ ...prev, [id]: Math.max(1, Math.min(100000, qty)) }));
  }

  function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (chosen.length === 0) {
      toast.error("Attach at least one product you would like wholesale pricing for");
      return;
    }

    const d = parsed.data;
    const lines = [
      "*Wholesale enquiry — Vetastudio*",
      "",
      `Name: ${d.name}`,
      ...(d.company ? [`Business: ${d.company}`] : []),
      `Email: ${d.email}`,
      `Mobile: ${d.phone}`,
      `Country: ${d.country}`,
      `Buyer type: ${d.businessType}`,
      `Delivery window: ${d.timeline}`,
      "",
      "*Products of interest*",
      ...chosen.map(
        (p, i) => `${i + 1}. ${p.name} (${p.category}) — approx. ${selected[p.id]} units`,
      ),
      ...(d.message ? ["", "*Notes*", d.message] : []),
    ];

    window.open(whatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp with your enquiry");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
      <div className="min-w-0 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field
            label="Business name (optional)"
            value={form.company}
            onChange={(v) => setForm({ ...form, company: v })}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label="Mobile number"
            type="tel"
            placeholder="+233 20 000 0000"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            label="Country"
            value={form.country}
            onChange={(v) => setForm({ ...form, country: v })}
          />
          <Select
            label="Buyer type"
            options={BUSINESS_TYPES}
            value={form.businessType}
            onChange={(v) => setForm({ ...form, businessType: v })}
          />
          <Select
            label="Delivery window"
            options={TIMELINES}
            value={form.timeline}
            onChange={(v) => setForm({ ...form, timeline: v })}
          />
        </div>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Brief — colourways, sizes, branding, freight (optional)
          </span>
          <textarea
            rows={4}
            maxLength={1200}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="mt-2 w-full border border-border bg-background p-3 text-sm outline-none focus:border-gold"
          />
        </label>

        <div className="border border-border bg-background p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label-caps text-gold">Attach products</p>
              <h3 className="mt-1 font-serif text-xl">Pick the pieces you want priced</h3>
            </div>
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {chosen.length} selected
            </span>
          </div>

          <div className="relative mt-4">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search the catalogue"
              aria-label="Search products for your wholesale enquiry"
              className="h-11 w-full border border-border bg-transparent pl-9 pr-3 text-sm outline-none focus:border-gold"
            />
          </div>

          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
            {results.map((p) => {
              const active = Boolean(selected[p.id]);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-pressed={active}
                    className={cn(
                      "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border p-2 text-left transition-colors",
                      active ? "border-gold bg-gold/5" : "border-border hover:border-gold/60",
                    )}
                  >
                    <SmartImage src={p.primaryImage} alt="" ratio="1/1" className="h-14 w-14 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{p.name}</span>
                      <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {p.category}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                        active ? "border-gold bg-gold text-gold-foreground" : "border-border",
                      )}
                    >
                      {active ? <Check size={13} /> : <Plus size={13} />}
                    </span>
                  </button>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                No pieces match that search.
              </li>
            )}
          </ul>
        </div>

        <button
          type="button"
          onClick={submit}
          className="h-12 w-full bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90"
        >
          Send enquiry on WhatsApp
        </button>
        <p className="text-xs text-muted-foreground">
          Your enquiry opens in WhatsApp with every detail prefilled, so you only have to press send.
        </p>
      </div>

      <aside className="border border-border bg-background p-6 lg:sticky lg:top-28 lg:self-start">
        <p className="label-caps text-gold">Your enquiry</p>
        <h3 className="mt-2 font-serif text-2xl">Selected pieces</h3>
        {chosen.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing attached yet. Choose pieces on the left and set an indicative quantity for each.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {chosen.map((p) => (
              <li key={p.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                <SmartImage src={p.primaryImage} alt="" ratio="1/1" className="h-14 w-12 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm">{p.name}</p>
                  <div className="mt-2 inline-flex items-center border border-border">
                    <button
                      type="button"
                      aria-label={`Decrease quantity for ${p.name}`}
                      onClick={() => setQty(p.id, (selected[p.id] ?? 1) - 10)}
                      className="grid h-9 w-9 place-items-center"
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      value={selected[p.id] ?? 1}
                      onChange={(e) => setQty(p.id, Number(e.target.value.replace(/\D/g, "")) || 1)}
                      aria-label={`Quantity for ${p.name}`}
                      className="h-9 w-14 border-x border-border bg-transparent text-center text-sm outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Increase quantity for ${p.name}`}
                      onClick={() => setQty(p.id, (selected[p.id] ?? 1) + 10)}
                      className="grid h-9 w-9 place-items-center"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          Minimum trade order is 10 units across the catalogue. Quantities here are indicative — we
          confirm pricing, lead time and freight with the cooperative before you commit.
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
      />
    </label>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
