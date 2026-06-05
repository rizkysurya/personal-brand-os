"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePortfolio, useServices } from "../../shared/store";

/* --- Placeholder content: shown until real Portfolio/Services exist in Convex,
   so the page never looks empty. The owner replaces these from /admin. --- */
type WorkCard = { title: string; category: string; cover?: string; slug?: string; tint: string };

const PLACEHOLDER_WORK: WorkCard[] = [
  { title: "Aurora — Brand Identity", category: "Branding", tint: "from-violet-500/40 to-fuchsia-500/30" },
  { title: "Pulse — Title Sequence", category: "Motion", tint: "from-cyan-400/40 to-violet-500/30" },
  { title: "Nebula — Social Campaign", category: "Graphic", tint: "from-fuchsia-500/40 to-indigo-500/30" },
  { title: "Drift — Logo Animation", category: "Motion", tint: "from-indigo-500/40 to-cyan-400/30" },
  { title: "Bloom — Packaging", category: "Graphic", tint: "from-purple-500/40 to-pink-500/30" },
  { title: "Vortex — Explainer Video", category: "Motion", tint: "from-sky-400/40 to-violet-600/30" },
];

const SKILLS = [
  "After Effects", "Cinema 4D", "Premiere Pro", "Photoshop", "Illustrator",
  "Figma", "Blender", "Motion Design", "Branding", "3D", "Compositing", "Storyboard",
];

type SvcCard = { name: string; description: string; bullets: string[]; priceLabel?: string; featured?: boolean };

const PLACEHOLDER_SERVICES: SvcCard[] = [
  { name: "Brand & Identity", description: "Logo, sistem visual, dan panduan brand yang konsisten di semua kanal.", bullets: ["Logo & logomark", "Brand guideline", "Warna & tipografi"], priceLabel: "Mulai 2.5jt" },
  { name: "Motion Graphics", description: "Animasi logo, title sequence, explainer, dan konten video yang hidup.", bullets: ["Logo animation", "Explainer / promo", "Title & lower-third"], priceLabel: "Mulai 3.5jt", featured: true },
  { name: "Social & Content", description: "Desain konten media sosial yang scroll-stopping dan tetap on-brand.", bullets: ["Feed & story", "Carousel & reels", "Template kit"], priceLabel: "Mulai 1.5jt" },
];

const STATS = [
  { value: "80+", label: "Proyek selesai" },
  { value: "40+", label: "Klien senang" },
  { value: "5 thn", label: "Pengalaman" },
  { value: "12+", label: "Tools dikuasai" },
];

const CATEGORIES = ["Semua", "Branding", "Motion", "Graphic"] as const;
type Category = (typeof CATEGORIES)[number];

/* Reveal each .studio-reveal block as it scrolls into view; a failsafe timer
   guarantees everything becomes visible even if the observer never fires. */
function useScrollReveal(deps: React.DependencyList) {
  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".studio-reveal"));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const failsafe = window.setTimeout(() => els.forEach((el) => el.classList.add("in-view")), 1400);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function HomePage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const settings = useQuery(api.settings.get) as
    | { ownerName?: string; siteName?: string; tagline?: string; contactEmail?: string }
    | null
    | undefined;
  const portfolioRaw = usePortfolio();
  const servicesRaw = useServices();

  const work: WorkCard[] = React.useMemo(() => {
    const rows = portfolioRaw as unknown as Array<Record<string, unknown>>;
    if (rows && rows.length > 0) {
      return rows.slice(0, 6).map((p, i) => ({
        title: String(p.title ?? "Karya"),
        category: String(p.category ?? "Karya"),
        cover: typeof p.cover === "string" && p.cover ? p.cover : undefined,
        slug: typeof p.slug === "string" ? p.slug : "",
        tint: PLACEHOLDER_WORK[i % PLACEHOLDER_WORK.length].tint,
      }));
    }
    return PLACEHOLDER_WORK;
  }, [portfolioRaw]);

  const services: SvcCard[] = React.useMemo(() => {
    const rows = servicesRaw as unknown as Array<Record<string, unknown>>;
    if (rows && rows.length > 0) {
      return rows.slice(0, 3).map((s) => ({
        name: String(s.name ?? "Layanan"),
        description: String(s.description ?? ""),
        bullets: Array.isArray(s.bullets) ? (s.bullets as string[]).slice(0, 4) : [],
        priceLabel: typeof s.priceLabel === "string" ? s.priceLabel : undefined,
        featured: Boolean(s.featured),
      }));
    }
    return PLACEHOLDER_SERVICES;
  }, [servicesRaw]);

  const [filter, setFilter] = React.useState<Category>("Semua");
  const filteredWork =
    filter === "Semua" ? work : work.filter((w) => w.category.toLowerCase().includes(filter.toLowerCase()));

  useScrollReveal([mounted, work.length, services.length, filter]);

  if (!mounted) return null;

  const name = settings?.ownerName || settings?.siteName || "Studio Kamu";
  const tagline =
    settings?.tagline ||
    "Aku bantu brand & cerita tampil lewat desain grafis dan motion yang berani, rapi, dan berkesan.";
  const email = settings?.contactEmail;
  const contactHref = email ? `mailto:${email}` : "/contact";

  return (
    <div className="studio-root relative isolate">
      {/* ambient background */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="studio-blob -left-40 -top-40 h-[42rem] w-[42rem]" style={{ background: "radial-gradient(circle, #7c3aed, transparent 60%)" }} />
        <div className="studio-blob -right-32 top-32 h-[38rem] w-[38rem]" style={{ background: "radial-gradient(circle, #22d3ee, transparent 60%)", animationDelay: "-6s" }} />
        <div className="studio-blob left-1/3 top-[58%] h-[34rem] w-[34rem]" style={{ background: "radial-gradient(circle, #d946ef, transparent 60%)", animationDelay: "-11s", opacity: 0.32 }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            WebkitMaskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 100%)",
          }}
        />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28 md:pt-32">
        <span
          className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md"
          style={{ animationDelay: "0s" }}
        >
          <span className="pulse-dot inline-block size-1.5 rounded-full bg-emerald-400" />
          Tersedia untuk proyek freelance
        </span>

        <h1 className="reveal mt-6 max-w-4xl text-4xl font-bold leading-[1.05] text-white sm:text-6xl md:text-7xl" style={{ animationDelay: "0.06s" }}>
          Halo, aku {name}.{" "}
          <span className="text-gradient">Graphic &amp; Motion Designer.</span>
        </h1>

        <p className="reveal mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg" style={{ animationDelay: "0.12s" }}>
          {tagline}
        </p>

        <div className="reveal mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.18s" }}>
          <a href="#work" className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(139,92,246,0.85)] transition-transform hover:scale-[1.03]">
            Lihat Karya <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a href={contactHref} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10">
            Hubungi Saya
          </a>
        </div>

        <div className="reveal mt-14" style={{ animationDelay: "0.24s" }}>
          <div className="glass float-y mx-auto flex max-w-3xl items-center gap-5 rounded-2xl p-5 sm:p-6">
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-cyan-400 text-white shadow-lg sm:size-16">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 sm:size-7"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">Showreel 2026</div>
              <div className="mt-0.5 truncate text-xs text-white/55">Kompilasi motion &amp; branding terbaik — 90 detik</div>
            </div>
            <div className="ml-auto hidden items-end gap-1.5 sm:flex">
              {[40, 70, 100, 60, 85, 50, 90].map((h, i) => (
                <span key={i} className="w-1 rounded-full bg-linear-to-t from-violet-500 to-cyan-400" style={{ height: `${Math.round(h * 0.34)}px` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE (skills) ===== */}
      <section className="relative py-6">
        <div className="marquee py-3">
          <div className="marquee__track">
            {[...SKILLS, ...SKILLS].map((s, i) => (
              <span key={i} className="glass-soft whitespace-nowrap rounded-full px-5 py-2 text-sm text-white/70">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORK ===== */}
      <section id="work" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="studio-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/80">Portfolio</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Karya Pilihan</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  filter === c
                    ? "border-violet-400/50 bg-violet-500/20 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWork.map((w, i) => {
            const card = (
              <div className="work-card glass glow-hover group relative h-full overflow-hidden rounded-2xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {w.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.cover} alt={w.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className={`work-cover grid h-full w-full place-items-center bg-linear-to-br ${w.tint}`}>
                      <span className="text-6xl font-black text-white/15">{w.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/85 backdrop-blur-md">{w.category}</span>
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <h3 className="text-base font-semibold text-white">{w.title}</h3>
                  <span className="text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-violet-300">→</span>
                </div>
              </div>
            );
            return (
              <div key={i} className="studio-reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                {w.slug ? <Link href={`/portfolio/${w.slug}`}>{card}</Link> : card}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="glass studio-reveal grid gap-10 rounded-3xl p-8 md:grid-cols-5 md:p-12">
          <div className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/80">Tentang</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Desain yang bukan cuma cantik — tapi <span className="text-gradient">berfungsi</span>.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-white/65">
              Aku {name}, seorang Graphic &amp; Motion Designer. Buatku, desain hebat lahir dari ide yang jelas dan
              eksekusi yang rapi — dari identitas brand sampai animasi yang bikin pesanmu nempel.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {SKILLS.slice(0, 8).map((s) => (
                <span key={s} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">{s}</span>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="grid h-full grid-cols-2 gap-4">
              {STATS.map((st) => (
                <div key={st.label} className="glass-soft flex flex-col justify-center rounded-2xl p-5">
                  <div className="text-3xl font-bold text-white">{st.value}</div>
                  <div className="mt-1 text-xs text-white/55">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="studio-reveal text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300/80">Layanan</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Yang bisa aku bantu</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map((s, i) => (
            <div
              key={i}
              className={`studio-reveal glass glow-hover relative flex flex-col rounded-2xl p-7 ${s.featured ? "ring-1 ring-violet-400/40" : ""}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {s.featured ? (
                <span className="absolute -top-3 left-7 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white">Paling diminati</span>
              ) : null}
              <h3 className="text-xl font-semibold text-white">{s.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{s.description}</p>
              <ul className="mt-5 space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-white/75">
                    <span className="text-violet-300">✦</span> {b}
                  </li>
                ))}
              </ul>
              {s.priceLabel ? (
                <div className="mt-6 border-t border-white/10 pt-4 text-sm font-semibold text-white/90">{s.priceLabel}</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 pb-28 pt-10">
        <div className="studio-reveal glass relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-70" style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(139,92,246,0.35), transparent 70%)" }} />
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-5xl">
            Punya proyek? <span className="text-gradient">Yuk bikin sesuatu yang keren.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/65">Terbuka untuk kolaborasi branding, motion graphics, dan konten visual.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={contactHref} className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(139,92,246,0.85)] transition-transform hover:scale-[1.03]">
              {email ? "Email Saya" : "Hubungi Saya"}
            </a>
            <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10">
              Lihat Semua Karya
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
