import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, Instagram, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { subscribeEmail } from "@/lib/store-api";
import { Button } from "@/components/ui/button";

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
    <footer className="mt-24 bg-foreground text-background">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-16 md:px-8 md:pt-20">
        <section className="grid gap-8 border border-gold/40 p-7 md:p-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="label-caps inline-flex items-center gap-2 text-gold"><Sparkles size={14} /> Join our collector circle</p>
            <h2 className="mt-4 font-serif text-2xl md:text-3xl">Authentic Craft Stories & Exclusive Releases</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-background/60">Subscribe to receive private weaver stories from Bolgatanga, early preview access to limited seasonal basket drops, and complimentary care guides.</p>
          </div>
          <form onSubmit={handleSubscribe} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="relative min-w-0">
              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-background/50" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address…" aria-label="Email address" maxLength={255} className="h-14 w-full min-w-0 border border-gold/35 bg-transparent pl-11 pr-4 text-sm text-background outline-none placeholder:text-background/45 focus:border-gold" />
            </label>
            <Button type="submit" disabled={pending} className="h-14 rounded-none bg-gold px-8 label-caps text-gold-foreground hover:bg-gold-deep">{pending ? "…" : "Subscribe →"}</Button>
            <p className="text-xs text-background/45 sm:col-span-2">We respect your privacy. Unsubscribe at any time with one click.</p>
          </form>
        </section>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.65fr_0.8fr_0.8fr_1fr]">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Vetastudio</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-background/55">
              Vetastudio celebrates authentic handmade craftsmanship from Ghana, presenting traditional Bolgatanga basket weaving as contemporary, globally desirable fibre art and luxury home décor.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-background/55">
              <li className="flex items-center gap-3"><MapPin size={16} className="shrink-0 text-gold" /> St Louis USA and Bolgatanga Ghana</li>
              <li className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-gold" /> hello@vetastudio.com</li>
              <li className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-gold" /> +233 20 008 4444</li>
            </ul>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { to: "/shop", label: "All Baskets" },
              { to: "/shop", label: "New Arrivals" },
              { to: "/shop", label: "Best Sellers" },
              { to: "/shop", label: "Custom Orders" },
            ]}
          />
          <FooterCol
            title="About"
            links={[
              { to: "/about", label: "Our Story" },
              { to: "/about", label: "Our Craft & Weaving" },
              { to: "/journal", label: "Journal & Stories" },
            ]}
          />
          <div>
            <h3 className="label-caps text-background">Help & Support</h3>
            <ul className="mt-5 space-y-3 text-sm text-background/60">
              <li><Link to="/care" className="text-gold transition-colors hover:text-background">Help & Support Center</Link></li>
              <li><Link to="/care" className="transition-colors hover:text-gold">Contact Us</Link></li>
              <li><Link to="/care" className="transition-colors hover:text-gold">Shipping & Returns</Link></li>
              <li><Link to="/care" className="transition-colors hover:text-gold">FAQ</Link></li>
            </ul>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex h-11 items-center gap-2 text-sm text-background/60 hover:text-gold"
            >
              <Instagram size={16} /> @vetastudio
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-background/10 pt-6 text-xs text-background/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Vetastudio. All rights reserved.</span>
          <span>Woven in Bolgatanga, Ghana</span>
        </div>
      </div>
      <Button type="button" size="icon" variant="outline" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-20 right-5 z-30 h-12 w-12 rounded-full border-background/25 bg-foreground text-background shadow-lift hover:bg-gold hover:text-gold-foreground md:bottom-7 md:right-7"><ArrowUp size={18} /></Button>
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
      <h3 className="label-caps text-background">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-background/60">
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
