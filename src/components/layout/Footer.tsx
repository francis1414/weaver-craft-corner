import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Leaf, ShieldCheck, Sprout } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { subscribeEmail } from "@/lib/store-api";

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export function Footer() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setPending(true);
    try {
      await subscribeEmail(parsed.data);
      toast.success("Welcome to the studio letter");
      setEmail("");
    } catch {
      toast.error("Could not subscribe right now");
    } finally {
      setPending(false);
    }
  }

  return (
    <footer className="mt-24 border-t border-border bg-stone/50">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Vetastudio</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Handwoven elephant grass baskets from the Bolgatanga cooperatives of Upper East
              Ghana. Fair-wage, carbon-neutral, made to outlive trends.
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Email address"
                maxLength={255}
                className="h-11 min-w-0 flex-1 border border-border bg-background px-3 text-sm outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={pending}
                className="h-11 shrink-0 bg-foreground px-5 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "…" : "Join"}
              </button>
            </form>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { to: "/shop", label: "All Baskets" },
              { to: "/shop", label: "Lampshades" },
              { to: "/shop", label: "Storage" },
              { to: "/shop", label: "Sale" },
            ]}
          />
          <FooterCol
            title="Studio"
            links={[
              { to: "/about", label: "Artisan Story" },
              { to: "/journal", label: "Journal" },
              { to: "/care", label: "Care & Reshaping" },
            ]}
          />
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-foreground">Certifications</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-sage" /> Fair-Wage Certified
              </li>
              <li className="flex items-center gap-2">
                <Leaf size={15} className="text-sage" /> Carbon-Neutral Shipping
              </li>
              <li className="flex items-center gap-2">
                <Sprout size={15} className="text-sage" /> 100% Veta Vera Grass
              </li>
            </ul>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex h-11 items-center gap-2 text-sm text-muted-foreground hover:text-gold"
            >
              <Instagram size={16} /> @vetastudio
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Vetastudio. All rights reserved.</span>
          <span>Woven in Bolgatanga, Ghana</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.2em] text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="transition-colors hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
