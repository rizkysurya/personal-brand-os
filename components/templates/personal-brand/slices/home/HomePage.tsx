"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePortfolio, useServices } from "../../shared/store";

/* --- Defaults: shown when a homeConfig field is empty. Tuned for a graphic /
   visual designer CV (Randy Fahmi). The owner overrides any from /admin. --- */
type WorkCard = { title: string; category: string; cover?: string; slug?: string; tint: string };

const PLACEHOLDER_WORK: WorkCard[] = [
  { title: "Social Media Campaign", category: "Graphic", tint: "from-amber-400/40 to-orange-500/30" },
  { title: "Brand Identity", category: "Branding", tint: "from-violet-500/40 to-fuchsia-500/30" },
  { title: "Brochure & Billboard", category: "Graphic", tint: "from-orange-400/40 to-pink-500/30" },
  { title: "Product Photography", category: "Photo", tint: "from-cyan-400/40 to-violet-500/30" },
  { title: "Promo Video", category: "Video", tint: "from-indigo-500/40 to-cyan-400/30" },
  { title: "Company Profile", category: "Video", tint: "from-sky-400/40 to-violet-600/30" },
];

const DEFAULT_SKILLS = [
  "Premiere Pro", "Illustrator", "Photoshop", "Lightroom", "After Effects",
  "Canva", "CapCut", "Figma", "Graphic Design", "Photography", "Videography", "Branding",
];

type SvcCard = { name: string; description: string; bullets: string[]; priceLabel?: string; featured?: boolean };

const PLACEHOLDER_SERVICES: SvcCard[] = [
  { name: "Graphic Design", description: "Sosial media, brosur, billboard, & identitas visual yang bercerita.", bullets: ["Social media design", "Brosur & billboard", "Branding & logo"], featured: true },
  { name: "Photographer", description: "Foto produk, acara, & potret yang rapi dan berkarakter.", bullets: ["Produk & katalog", "Event", "Portrait"] },
  { name: "Videographer", description: "Produksi video dari konsep sampai jadi.", bullets: ["Shooting", "Company profile", "Konten sosial"] },
  { name: "Video & Photo Editor", description: "Editing video & foto yang bersih dan nendang.", bullets: ["Video editing", "Color grading", "Retouch foto"] },
];

const DEFAULT_STATS: Array<{ value: string; label: string }> = [
  { value: "9+", label: "Tahun pengalaman" },
  { value: "50+", label: "Proyek selesai" },
  { value: "8", label: "Software dikuasai" },
  { value: "4", label: "Bidang keahlian" },
];

const DEFAULT_EXPERIENCE = [
  { period: "2018 – Sekarang", role: "IT & Graphic Design (Freelance)", place: "Freelance" },
  { period: "Agu 2022 – Jun 2024", role: "Graphic Design & Content Creator", place: "PT Sepokat Menjala Berkat" },
  { period: "Okt 2020 – Agu 2021", role: "Graphic Design", place: "Jember Vini Zoo" },
  { period: "Mei 2019 – Sep 2020", role: "IT Supervisor & Graphic Design", place: "Swiss Hotel Kemayoran, Jakarta" },
  { period: "Mei 2016 – Mei 2017", role: "IT Staff", place: "PT Hayuda Teknologi Indonesia" },
];

const DEFAULT_EDUCATION = [
  { year: "2015", title: "Teknik Informatika (D3)", place: "Universitas Muhammadiyah Jember" },
];

const CATEGORIES = ["Semua", "Graphic", "Photo", "Video"] as const;
type Category = (typeof CATEGORIES)[number];

const GRADIENT_BTN =
  "group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[var(--accent-1)] to-[var(--accent-2)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_-14px_rgba(0,0,0,0.6)] transition-transform hover:scale-[1.03]";
const GLASS_BTN =
  "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10";
const EYEBROW = "text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-1)]";

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

const DEFAULT_ORDER = ["marquee", "about", "resume", "services", "work", "contact"];
// CV-style portfolio: About + Experience + Services + Work + Contact on by
// default. Marquee off. Owner re-toggles any from /admin (Tampilan Beranda).
const DEFAULT_ENABLED: Record<string, boolean> = {
  marquee: false,
  about: true,
  resume: true,
  services: true,
  work: true,
  contact: true,
};

/** Convert a YouTube/Vimeo watch URL into an autoplay embed URL. */
function toEmbed(url: string): string {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return url;
}

export function HomePage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const settings = useQuery(api.settings.get) as
    | { ownerName?: string; siteName?: string; tagline?: string; contactEmail?: string }
    | null
    | undefined;
  const cfg = useQuery(api.homeConfig.get);
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
      return rows.slice(0, 4).map((s) => ({
        name: String(s.name ?? "Layanan"),
        description: String(s.description ?? ""),
        bullets: Array.isArray(s.bullets) ? (s.bullets as string[]).slice(0, 4) : [],
        priceLabel: typeof s.priceLabel === "string" ? s.priceLabel : undefined,
        featured: Boolean(s.featured),
      }));
    }
    return PLACEHOLDER_SERVICES;
  }, [servicesRaw]);

  const skills = cfg?.skills && cfg.skills.length > 0 ? cfg.skills : DEFAULT_SKILLS;
  const stats = cfg?.stats && cfg.stats.length > 0 ? cfg.stats : DEFAULT_STATS;
  const education = cfg?.education && cfg.education.length > 0 ? cfg.education : DEFAULT_EDUCATION;
  const experience = cfg?.experience && cfg.experience.length > 0 ? cfg.experience : DEFAULT_EXPERIENCE;

  const [filter, setFilter] = React.useState<Category>("Semua");
  const [reelOpen, setReelOpen] = React.useState(false);
  const filteredWork =
    filter === "Semua" ? work : work.filter((w) => w.category.toLowerCase().includes(filter.toLowerCase()));

  useScrollReveal([mounted, work.length, services.length, filter, cfg]);

  if (!mounted) return null;

  const ownerName = settings?.ownerName || settings?.siteName || "Nama Kamu";
  const name = cfg?.heroName || ownerName;
  const email = settings?.contactEmail;
  const contactHref = email ? `mailto:${email}` : "/contact";
  const accent = cfg?.accent || "#8b5cf6";
  const accent2 = cfg?.accent2 || "#22d3ee";
  const showreelUrl = cfg?.showreelUrl || "";
  const cvUrl = cfg?.cvUrl || "";

  const C = {
    heroEyebrow: cfg?.heroEyebrow || "Creative Visual · Terbuka untuk peluang baru",
    heroHighlight: cfg?.heroHighlight || "Graphic Designer & Visual Creator",
    heroSubtext:
      cfg?.heroSubtext ||
      settings?.tagline ||
      "Graphic designer & IT otodidak dengan 9+ tahun pengalaman — bikin visual yang bukan cuma enak dilihat, tapi bercerita.",
    heroPrimaryLabel: cfg?.heroPrimaryLabel || "Lihat Karya",
    heroPrimaryHref: cfg?.heroPrimaryHref || "#work",
    heroSecondaryLabel: cfg?.heroSecondaryLabel || "Hubungi Saya",
    heroSecondaryHref: cfg?.heroSecondaryHref || contactHref,
    showreelTitle: cfg?.showreelTitle || "Showreel",
    showreelSubtitle: cfg?.showreelSubtitle || "Kompilasi karya terbaik",
    workEyebrow: cfg?.workEyebrow || "Portfolio",
    workTitle: cfg?.workTitle || "Karya Pilihan",
    aboutEyebrow: cfg?.aboutEyebrow || "Hello",
    aboutTitle: cfg?.aboutTitle || "Visual yang bukan cuma cantik — tapi bercerita.",
    aboutBody:
      cfg?.aboutBody ||
      `Aku ${name}, graphic designer & IT otodidak dengan pengalaman lebih dari 9 tahun. Aku suka bikin visual yang nggak cuma enak dilihat — tapi bercerita. Dari konten media sosial sampai brosur dan billboard, aku senang mewujudkan ide jadi nyata. Aku juga mengeksplorasi fotografi dan videografi untuk menambah kedalaman karyaku. Buatku, desain itu soal menghubungkan ide dengan orang lewat cara yang kreatif.`,
    servicesEyebrow: cfg?.servicesEyebrow || "Keahlian",
    servicesTitle: cfg?.servicesTitle || "Yang bisa aku bantu",
    contactTitle: cfg?.contactTitle || "Let's work together.",
    contactSubtext: cfg?.contactSubtext || "Terbuka untuk pekerjaan, proyek desain, foto, & video. Yuk ngobrol.",
    contactPrimaryLabel: cfg?.contactPrimaryLabel || (email ? "Email Saya" : "Hubungi Saya"),
  };

  const sectionCfg = cfg?.sections ?? [];
  const orderedSections = DEFAULT_ORDER.map((id, i) => {
    const f = sectionCfg.find((s) => s.id === id);
    return { id, enabled: f ? f.enabled : (DEFAULT_ENABLED[id] ?? true), order: f ? f.order : i + 1 };
  })
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const renderers: Record<string, () => React.ReactNode> = {
    marquee: () => (
      <section className="relative py-6">
        <div className="marquee py-3">
          <div className="marquee__track">
            {[...skills, ...skills].map((s, i) => (
              <span key={i} className="glass-soft whitespace-nowrap rounded-full px-5 py-2 text-sm text-white/70">{s}</span>
            ))}
          </div>
        </div>
      </section>
    ),
    about: () => (
      <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="glass studio-reveal grid gap-10 rounded-3xl p-8 md:grid-cols-5 md:p-12">
          <div className="md:col-span-3">
            <p className={EYEBROW}>{C.aboutEyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{C.aboutTitle}</h2>
            <p className="mt-5 max-w-xl whitespace-pre-line leading-relaxed text-white/65">{C.aboutBody}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {skills.slice(0, 10).map((s) => (
                <span key={s} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">{s}</span>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="grid h-full grid-cols-2 gap-4">
              {stats.map((st, i) => (
                <div key={i} className="glass-soft flex flex-col justify-center rounded-2xl p-5">
                  <div className="text-3xl font-bold text-white">{st.value}</div>
                  <div className="mt-1 text-xs text-white/55">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    resume: () => (
      <section id="resume" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="studio-reveal text-center">
          <p className={EYEBROW}>Perjalanan</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Pengalaman &amp; Pendidikan</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="studio-reveal glass rounded-2xl p-7">
            <h3 className="text-lg font-semibold text-white">Pengalaman Kerja</h3>
            <ul className="mt-5 space-y-5">
              {experience.map((e, i) => (
                <li key={i} className="relative border-l border-white/10 pl-5">
                  <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full" style={{ background: "var(--accent-1)" }} />
                  <div className="text-sm font-semibold text-white">{e.role}</div>
                  <div className="text-sm text-white/60">{e.place}</div>
                  <div className="mt-0.5 text-xs text-white/40">{e.period}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="studio-reveal glass rounded-2xl p-7" style={{ transitionDelay: "80ms" }}>
            <h3 className="text-lg font-semibold text-white">Pendidikan</h3>
            <ul className="mt-5 space-y-5">
              {education.map((e, i) => (
                <li key={i} className="relative border-l border-white/10 pl-5">
                  <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full" style={{ background: "var(--accent-2)" }} />
                  <div className="text-sm font-semibold text-white">{e.title}</div>
                  <div className="text-sm text-white/60">{e.place}</div>
                  <div className="mt-0.5 text-xs text-white/40">{e.year}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ),
    services: () => (
      <section id="services" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="studio-reveal text-center">
          <p className={EYEBROW}>{C.servicesEyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{C.servicesTitle}</h2>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {services.map((s, i) => (
            <div
              key={i}
              className="studio-reveal glass glow-hover relative flex w-full flex-col rounded-2xl p-6 sm:w-80"
              style={{ transitionDelay: `${i * 70}ms`, ...(s.featured ? { boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--accent-1) 45%, transparent)" } : {}) }}
            >
              <h3 className="text-lg font-semibold text-white">{s.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{s.description}</p>
              <ul className="mt-5 space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-white/75">
                    <span className="text-[var(--accent-1)]">✦</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    ),
    work: () => (
      <section id="work" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
        <div className="studio-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={EYEBROW}>{C.workEyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{C.workTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  filter === c
                    ? "border-white/40 bg-white/10 text-white"
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
                  <span className="text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-[var(--accent-1)]">→</span>
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
    ),
    contact: () => (
      <section id="contact" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 pb-28 pt-10">
        <div className="studio-reveal glass relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-70" style={{ background: "radial-gradient(60% 80% at 50% 0%, color-mix(in oklab, var(--accent-1) 35%, transparent), transparent 70%)" }} />
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-5xl">{C.contactTitle}</h2>
          <p className="mx-auto mt-4 max-w-md text-white/65">{C.contactSubtext}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={contactHref} className={GRADIENT_BTN.replace("px-6", "px-7")}>{C.contactPrimaryLabel}</a>
            {cvUrl ? (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className={GLASS_BTN.replace("px-6", "px-7")}>↓ Download CV</a>
            ) : null}
          </div>
        </div>
      </section>
    ),
  };

  return (
    <div className="studio-root relative isolate" style={{ "--accent-1": accent, "--accent-2": accent2 } as React.CSSProperties}>
      {/* ambient background */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="studio-blob -left-40 -top-40 h-[42rem] w-[42rem]" style={{ background: "radial-gradient(circle, var(--accent-1), transparent 60%)" }} />
        <div className="studio-blob -right-32 top-32 h-[38rem] w-[38rem]" style={{ background: "radial-gradient(circle, var(--accent-2), transparent 60%)", animationDelay: "-6s" }} />
        <div className="studio-blob left-1/3 top-[58%] h-[34rem] w-[34rem]" style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent-1) 60%, #d946ef), transparent 60%)", animationDelay: "-11s", opacity: 0.3 }} />
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

      {/* HERO — minimalist, photo-less, portfolio-focused */}
      <section className="hero-parallax relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-6 pb-20 pt-24 text-center sm:pt-28">
        <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md" style={{ animationDelay: "0s" }}>
          <span className="pulse-dot inline-block size-1.5 rounded-full bg-emerald-400" />
          {C.heroEyebrow}
        </span>

        <p className="reveal mt-8 text-lg font-medium text-[var(--accent-1)] sm:text-xl" style={{ animationDelay: "0.05s" }}>
          Halo, aku 👋
        </p>
        <h1 className="reveal mt-1 text-5xl font-bold leading-[1.02] text-white sm:text-7xl md:text-8xl" style={{ animationDelay: "0.1s" }}>
          {name}
        </h1>
        <h2 className="reveal mt-2 text-3xl font-bold leading-[1.06] sm:text-5xl md:text-6xl" style={{ animationDelay: "0.16s" }}>
          <span className="text-gradient">{C.heroHighlight}</span>
        </h2>

        <p className="reveal mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg" style={{ animationDelay: "0.22s" }}>
          {C.heroSubtext}
        </p>

        <div className="reveal mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.28s" }}>
          <a href={C.heroPrimaryHref} className={GRADIENT_BTN}>
            {C.heroPrimaryLabel} <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          {cvUrl ? (
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className={GLASS_BTN}>↓ Download CV</a>
          ) : null}
          {showreelUrl ? (
            <button type="button" onClick={() => setReelOpen(true)} className={GLASS_BTN}>▶ Lihat Showreel</button>
          ) : null}
        </div>
      </section>

      {/* Reorderable / toggleable sections */}
      {orderedSections.map((s) => (
        <React.Fragment key={s.id}>{renderers[s.id]?.()}</React.Fragment>
      ))}

      {reelOpen && showreelUrl ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setReelOpen(false)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setReelOpen(false)} className="absolute -top-9 right-0 text-sm text-white/70 transition-colors hover:text-white">
              ✕ Tutup
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              <iframe src={toEmbed(showreelUrl)} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Showreel" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
