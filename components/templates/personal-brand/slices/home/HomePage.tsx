"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePortfolio, useServices } from "../../shared/store";

/* --- Defaults: shown when a homeConfig field is empty. Tuned for a Motion
   Graphic Designer CV (Rizky Surya Pratama). The owner overrides any from
   /admin (Tampilan Beranda / Settings / Services / Portfolio). --- */
type WorkCard = { title: string; category: string; cover?: string; slug?: string; tint: string };

const PLACEHOLDER_WORK: WorkCard[] = [
  { title: "Financial Explainer Video", category: "Motion", tint: "from-indigo-500/40 to-sky-400/30" },
  { title: "2D Character Animation", category: "Animation", tint: "from-blue-500/40 to-cyan-400/30" },
  { title: "Lottie & GIF Animation", category: "Motion", tint: "from-sky-500/40 to-indigo-400/30" },
  { title: "Educational Motion Graphics", category: "Motion", tint: "from-cyan-400/40 to-blue-500/30" },
  { title: "Brand Identity in Motion", category: "Animation", tint: "from-indigo-400/40 to-blue-600/30" },
  { title: "Banner & Flyer Design", category: "Print", tint: "from-sky-400/40 to-indigo-500/30" },
];

const DEFAULT_SKILLS = [
  "After Effects", "Adobe Animate", "Lottie Files", "GIF Animation", "Illustrator",
  "Photoshop", "Premiere Pro", "Sound Design", "Color Grading", "2D Animation",
  "Storyboarding", "Brand Identity",
];

type SvcCard = { name: string; description: string; bullets: string[]; priceLabel?: string; featured?: boolean };

const PLACEHOLDER_SERVICES: SvcCard[] = [
  { name: "Motion Graphics", description: "Explainer videos and 2D animation that turn complex topics into clear, compelling motion — from script and storyboard to polished, on-brand delivery.", bullets: ["Explainer videos", "2D character & motion animation", "Sound design & delivery"], featured: true },
  { name: "GIF & Lottie", description: "Lightweight animated assets — GIFs and Lottie files — for web, app, and social.", bullets: ["Lottie production", "Animated GIFs", "Optimized for web & app"] },
  { name: "Print Design", description: "Production-ready print design — banners, flyers, and promotional materials.", bullets: ["Banners & flyers", "Print-ready files", "Consistent branding"] },
];

const DEFAULT_STATS: Array<{ value: string; label: string }> = [
  { value: "6+", label: "Years of experience" },
  { value: "50+", label: "Projects delivered" },
  { value: "40%", label: "Avg. engagement lift" },
  { value: "9", label: "Tools mastered" },
];

const DEFAULT_EXPERIENCE = [
  { period: "Nov 2025 – Present", role: "Motion Graphic Designer", place: "Tuntun Sekuritas Indonesia", description: "Creating educational motion graphics that simplify complex financial and investment topics into engaging, easy-to-understand visuals — managing production end to end, from research and storyboarding to final rendering." },
  { period: "Aug 2025 – Nov 2025", role: "Motion Graphic Designer (Project-Based)", place: "PT Teknologi Legal Bersama (Hukummu)", description: "Produced instructional “How to Use” videos for a newly launched website — animating and editing from scripts, screen recordings, and references, with text animations and visual cues that improve user understanding." },
  { period: "Feb 2021 – Aug 2025", role: "Graphic Designer & Animator", place: "Zeus Animation", description: "Core animator turning storyboards into 2D explainer videos, animated GIFs, and Lottie animations in Adobe Animate and After Effects, finished in Premiere Pro. Delivered 50+ projects and helped define the studio’s signature style." },
  { period: "Jul 2020 – Feb 2021", role: "Graphic Designer (Freelance)", place: "Freelance", description: "Freelance print design for SME clients — banners, brochures, and flyers — supporting their branding and promotion with high-quality, print-ready results." },
  { period: "Jul 2019 – Jul 2020", role: "Graphic Designer", place: "CV Mitra Utama Digital Printing", description: "Designed retail and promotional print materials, prepared production-ready files to printing specs, and ran pre-print quality control to cut errors." },
];

const DEFAULT_SKILL_GROUPS = [
  { label: "Motion & Animation", items: "After Effects · Adobe Animate · Lottie · GIF Animation" },
  { label: "Design", items: "Illustrator · Photoshop" },
  { label: "Post-Production", items: "Premiere Pro · Sound Design · Color Grading" },
  { label: "Specializations", items: "Explainer Videos · 2D Animation · Visual Storytelling · Brand Identity" },
];

const CATEGORIES = ["All", "Motion", "Animation", "Print"] as const;
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

/** Fire `true` once the element scrolls into view (for triggering count-ups). */
function useInView<T extends HTMLElement = HTMLDivElement>() {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/** Animated count-up that preserves a non-numeric prefix/suffix (e.g. "6+", "40%"). */
function CountUp({ value, run }: { value: string; run: boolean }) {
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  const target = m ? parseInt(m[2], 10) : 0;
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!run || !target) return;
    let raf = 0;
    let start = 0;
    const dur = 1100;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);
  if (!m) return <>{value}</>;
  return <>{m[1]}{n}{m[3]}</>;
}

/** Big stat band with on-scroll count-up. */
function StatsBand({ stats }: { stats: Array<{ value: string; label: string }> }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <section className="relative mx-auto max-w-[90rem] px-6 py-12">
      <div ref={ref} className="studio-reveal glass glow-border relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(80% 130% at 50% 0%, color-mix(in oklab, var(--accent-1) 22%, transparent), transparent 70%)" }} />
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((st, i) => (
            <div key={i} className="text-left">
              <div className="text-4xl font-bold leading-none sm:text-5xl md:text-6xl">
                <span className="text-gradient"><CountUp value={st.value} run={inView} /></span>
              </div>
              <div className="mt-3 text-xs uppercase tracking-wider text-white/50 sm:text-sm">{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Tab-switcher services panel (runlayer-style Build/Mix/Run). */
function ServiceTabs({ services, eyebrow, title }: { services: SvcCard[]; eyebrow: string; title: string }) {
  const [active, setActive] = React.useState(0);
  const svc = services[active] ?? services[0];
  if (!svc) return null;
  return (
    <section id="services" className="relative mx-auto max-w-[90rem] scroll-mt-24 px-6 py-20">
      <div className="studio-reveal">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">{title}</h2>
      </div>
      <div className="studio-reveal mt-12 grid gap-6 md:grid-cols-12">
        <div className="flex gap-3 overflow-x-auto pb-2 md:col-span-4 md:flex-col md:overflow-visible md:pb-0">
          {services.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`group flex shrink-0 items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all ${
                i === active
                  ? "border-[color:var(--accent-1)] bg-white/[0.06]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${i === active ? "text-white" : "text-white/45"}`}
                style={i === active ? { background: "linear-gradient(135deg, var(--accent-1), var(--accent-2))" } : { background: "rgba(255,255,255,0.05)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`whitespace-nowrap text-sm font-semibold ${i === active ? "text-white" : "text-white/60"}`}>{s.name}</span>
            </button>
          ))}
        </div>
        <div key={active} className="service-panel glass glow-border relative overflow-hidden rounded-3xl p-8 sm:p-10 md:col-span-8">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-30" style={{ background: "radial-gradient(circle, var(--accent-1), transparent 65%)" }} />
          <h3 className="text-2xl font-bold text-white sm:text-3xl">{svc.name}</h3>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">{svc.description}</p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {svc.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80">
                <span className="text-[var(--accent-2)]">✦</span> {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Decorative gradient bubbles: gentle idle drift + cursor-parallax (desktop). */
function SphereField() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    let raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      for (const el of items) {
        const d = Number(el.dataset.depth) || 30;
        el.style.transform = `translate3d(${(cx * d).toFixed(2)}px, ${(cy * d).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  const S = [
    { pos: "left-[6%] top-[15%]", size: "h-24 w-24", depth: 50, delay: "-1s", op: 0.8 },
    { pos: "right-[9%] top-[9%]", size: "h-16 w-16", depth: 34, delay: "-4s", op: 0.55 },
    { pos: "left-[80%] top-[40%]", size: "h-28 w-28", depth: 62, delay: "-7s", op: 0.8 },
    { pos: "left-[10%] top-[66%]", size: "h-20 w-20", depth: 40, delay: "-3s", op: 0.5 },
    { pos: "left-[68%] top-[83%]", size: "h-24 w-24", depth: 56, delay: "-9s", op: 0.55 },
    { pos: "left-[42%] top-[26%]", size: "h-14 w-14", depth: 30, delay: "-2s", op: 0.5 },
    { pos: "right-[22%] top-[56%]", size: "h-20 w-20", depth: 46, delay: "-6s", op: 0.6 },
    { pos: "left-[26%] top-[90%]", size: "h-16 w-16", depth: 38, delay: "-5s", op: 0.5 },
    { pos: "right-[36%] top-[74%]", size: "h-12 w-12", depth: 28, delay: "-8s", op: 0.45 },
  ];
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {S.map((s, i) => (
        <div key={i} data-depth={s.depth} className={`absolute ${s.pos} will-change-transform`}>
          <div className={`sphere ${s.size}`} style={{ animationDelay: s.delay, opacity: s.op }} />
        </div>
      ))}
    </div>
  );
}

const DEFAULT_ORDER = ["marquee", "about", "services", "resume", "work", "contact"];
// Dynamic, runlayer-style flow. Owner re-toggles any from /admin (Tampilan Beranda).
const DEFAULT_ENABLED: Record<string, boolean> = {
  marquee: true,
  about: true,
  services: true,
  resume: true,
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
        title: String(p.title ?? "Project"),
        category: String(p.category ?? "Work"),
        cover: typeof p.cover === "string" && p.cover ? p.cover : undefined,
        slug: typeof p.slug === "string" ? p.slug : "",
        tint: PLACEHOLDER_WORK[i % PLACEHOLDER_WORK.length].tint,
      }));
    }
    return PLACEHOLDER_WORK;
  }, [portfolioRaw]);

  const services: SvcCard[] = React.useMemo(() => {
    const rows = (servicesRaw as unknown as Array<Record<string, unknown>>) ?? [];
    // Ignore the template's seeded demo cards (Consulting / Design Sprint /
    // Monthly Retainer) so the CV-matched defaults show until real services
    // are added in /admin → Services.
    const real = rows.filter((s) => {
      const name = String(s.name ?? "").trim().toLowerCase();
      const desc = String(s.description ?? "").trim().toLowerCase();
      const isDemo =
        desc.startsWith("demo service") ||
        ["consulting", "design sprint", "monthly retainer"].includes(name);
      return !isDemo;
    });
    if (real.length > 0) {
      return real.slice(0, 4).map((s) => ({
        name: String(s.name ?? "Service"),
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
  const skillGroups = DEFAULT_SKILL_GROUPS;
  const experience: Array<{ role: string; period: string; place: string; description?: string }> =
    cfg?.experience && cfg.experience.length > 0 ? cfg.experience : DEFAULT_EXPERIENCE;

  const [filter, setFilter] = React.useState<Category>("All");
  const [reelOpen, setReelOpen] = React.useState(false);
  const filteredWork =
    filter === "All" ? work : work.filter((w) => w.category.toLowerCase().includes(filter.toLowerCase()));

  useScrollReveal([mounted, work.length, services.length, filter, cfg]);

  if (!mounted) return null;

  const ownerName = settings?.ownerName || settings?.siteName || "Rizky Surya Pratama";
  const name = cfg?.heroName || ownerName;
  const email = settings?.contactEmail;
  const contactHref = email ? `mailto:${email}` : "/contact";
  const accent = cfg?.accent || "#5456f6";
  const accent2 = cfg?.accent2 || "#7fc4e0";
  const showreelUrl = cfg?.showreelUrl || "";
  const cvUrl = cfg?.cvUrl || "";

  const C = {
    heroEyebrow: cfg?.heroEyebrow || "Motion Graphic Designer · Open to opportunities",
    heroHighlight: cfg?.heroHighlight || "Motion Graphic Designer",
    heroSubtext:
      cfg?.heroSubtext ||
      settings?.tagline ||
      "I turn complex ideas into clear, compelling motion — explainer videos, 2D animation, and educational content — with 6+ years across studio, in-house, and freelance work.",
    heroPrimaryLabel: cfg?.heroPrimaryLabel || "View Work",
    heroPrimaryHref: cfg?.heroPrimaryHref || "#work",
    heroSecondaryLabel: cfg?.heroSecondaryLabel || "Get in Touch",
    heroSecondaryHref: cfg?.heroSecondaryHref || contactHref,
    showreelTitle: cfg?.showreelTitle || "Showreel",
    showreelSubtitle: cfg?.showreelSubtitle || "A reel of selected motion work",
    workEyebrow: cfg?.workEyebrow || "Portfolio",
    workTitle: cfg?.workTitle || "Selected Work",
    aboutEyebrow: cfg?.aboutEyebrow || "About",
    aboutTitle: cfg?.aboutTitle || "Turning complex ideas into clear, compelling motion.",
    aboutBody:
      cfg?.aboutBody ||
      `I am a Motion Graphic Designer with 6+ years of experience creating engaging visual content across agency, in-house, and freelance environments. Specialized in explainer videos, 2D animation, GIF and Lottie file production, and educational motion graphics. Skilled in translating complex topics into clear, compelling visual stories — with a strong focus on smooth, polished motion and consistent brand identity. Experienced in managing end-to-end production: from research and storyboarding to final rendering and delivery. Outside of animation, I also work independently on print design projects such as banners and flyers, taking full responsibility from layout to final design.`,
    servicesEyebrow: cfg?.servicesEyebrow || "Services",
    servicesTitle: cfg?.servicesTitle || "What I do",
    contactTitle: cfg?.contactTitle || "Let's work together.",
    contactSubtext: cfg?.contactSubtext || "Available for motion graphics, explainer videos, animation, and design projects. Let's talk.",
    contactPrimaryLabel: cfg?.contactPrimaryLabel || (email ? "Email Me" : "Get in Touch"),
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
      <section className="relative overflow-hidden py-10">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Tools &amp; software I work with</p>
        <div className="marquee">
          <div className="marquee__track">
            {[...skills, ...skills].map((s, i) => (
              <span key={i} className="glass-soft mx-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm text-white/70">{s}</span>
            ))}
          </div>
        </div>
      </section>
    ),
    stats: () => <StatsBand stats={stats} />,
    about: () => (
      <section id="about" className="relative mx-auto max-w-[90rem] scroll-mt-24 px-6 py-20">
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <div className="studio-reveal md:col-span-7">
            <p className={EYEBROW}>{C.aboutEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{C.aboutTitle}</h2>
            <p className="mt-6 max-w-xl whitespace-pre-line text-base leading-relaxed text-white/65 sm:text-lg">{C.aboutBody}</p>
          </div>
          <div className="studio-reveal md:col-span-5" style={{ transitionDelay: "80ms" }}>
            <div className="glass rounded-3xl p-7 sm:p-8">
              <div className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-2)]">Toolbox</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition-colors hover:border-white/25 hover:text-white">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    resume: () => (
      <section id="resume" className="relative mx-auto max-w-4xl scroll-mt-24 px-6 py-20">
        <div className="studio-reveal">
          <p className={EYEBROW}>Career</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">Experience &amp; Skills</h2>
        </div>
        <div className="mt-12 space-y-6">
          <div className="studio-reveal glass rounded-3xl p-8 sm:p-10">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Work Experience</h3>
            <ul className="mt-8 space-y-8">
              {experience.map((e, i) => (
                <li key={i} className="relative border-l-2 border-white/10 pl-6">
                  <span className="absolute -left-[7px] top-1.5 size-3.5 rounded-full ring-4 ring-black/30" style={{ background: "var(--accent-1)" }} />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="text-lg font-semibold text-white sm:text-xl">{e.role}</h4>
                    <span className="text-sm text-white/45">{e.period}</span>
                  </div>
                  <div className="mt-0.5 text-base font-medium text-[var(--accent-2)]">{e.place}</div>
                  {e.description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">{e.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="studio-reveal glass rounded-3xl p-8 sm:p-10" style={{ transitionDelay: "80ms" }}>
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Technical Skills</h3>
            <div className="mt-8 grid gap-7 sm:grid-cols-2">
              {skillGroups.map((g, i) => (
                <div key={i} className="relative border-l-2 border-white/10 pl-6">
                  <span className="absolute -left-[7px] top-1.5 size-3.5 rounded-full ring-4 ring-black/30" style={{ background: "var(--accent-2)" }} />
                  <div className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-2)]">{g.label}</div>
                  <div className="mt-1.5 text-base leading-relaxed text-white/75">{g.items}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    services: () => <ServiceTabs services={services} eyebrow={C.servicesEyebrow} title={C.servicesTitle} />,
    work: () => (
      <section id="work" className="relative mx-auto max-w-[90rem] scroll-mt-24 px-6 py-20">
        <div className="studio-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={EYEBROW}>{C.workEyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">{C.workTitle}</h2>
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
      <section id="contact" className="relative mx-auto max-w-[90rem] scroll-mt-24 px-6 pb-28 pt-10">
        <div className="studio-reveal glass glow-border relative overflow-hidden rounded-3xl px-8 py-16 sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-70" style={{ background: "radial-gradient(70% 90% at 0% 0%, color-mix(in oklab, var(--accent-1) 35%, transparent), transparent 70%)" }} />
          <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-5xl">{C.contactTitle}</h2>
          <p className="mt-4 max-w-md text-white/65">{C.contactSubtext}</p>
          <div className="mt-8 flex flex-wrap gap-3">
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
        {/* Dark gradient base */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(135% 95% at 50% -15%, #10162e 0%, #0a0c1c 36%, #070810 68%, #050509 100%)" }} />

        {/* Large, heavily-blurred dark navy/indigo blobs that merge into one fluid cloud.
            Every colour is pre-mixed toward near-black + low opacity so they tint, never illuminate. */}
        <div className="studio-blob -left-48 -top-44 h-[46rem] w-[46rem]" style={{ filter: "blur(95px) saturate(1.3)", opacity: 0.8, background: "radial-gradient(circle at 38% 34%, color-mix(in oklab, var(--accent-1) 90%, #11183c), transparent 64%)" }} />
        <div className="studio-blob -right-56 -top-32 h-[42rem] w-[42rem]" style={{ filter: "blur(105px) saturate(1.3)", opacity: 0.7, animationDelay: "-5s", background: "radial-gradient(circle at 60% 40%, color-mix(in oklab, #4f8ae0 86%, #111a3a), transparent 66%)" }} />
        <div className="studio-blob left-[18%] top-[42%] h-[40rem] w-[40rem]" style={{ filter: "blur(115px) saturate(1.25)", opacity: 0.6, animationDelay: "-10s", background: "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent-2) 76%, #111a3c), transparent 68%)" }} />
        <div className="studio-blob -right-32 bottom-[-14%] h-[44rem] w-[44rem]" style={{ filter: "blur(100px) saturate(1.3)", opacity: 0.74, animationDelay: "-7s", background: "radial-gradient(circle at 44% 46%, color-mix(in oklab, var(--accent-1) 86%, #0f1638), transparent 65%)" }} />
        <div className="studio-blob left-[-10%] bottom-[-18%] h-[38rem] w-[38rem]" style={{ filter: "blur(115px) saturate(1.25)", opacity: 0.58, animationDelay: "-13s", background: "radial-gradient(circle at 56% 50%, color-mix(in oklab, #4f8ae0 74%, #111838), transparent 67%)" }} />

        {/* Veil — fuses the blobs into one continuous organic cloud (no hard edges) */}
        <div className="studio-veil" style={{ opacity: 0.72, background: "radial-gradient(58% 50% at 30% 22%, color-mix(in oklab, var(--accent-1) 34%, transparent), transparent 70%), radial-gradient(54% 48% at 74% 64%, color-mix(in oklab, var(--accent-2) 26%, transparent), transparent 72%), radial-gradient(60% 55% at 50% 100%, color-mix(in oklab, #4f8ae0 24%, transparent), transparent 70%)" }} />

        {/* Two thin, dim ring outlines (reference accent) */}
        <div className="studio-ring left-[8%] top-[14%] h-[20rem] w-[20rem]" />
        <div className="studio-ring right-[10%] bottom-[16%] h-[28rem] w-[28rem]" />

        {/* Readability guard — darkens the heading zone + a faint full-field vignette so white text stays clear regardless of blob drift */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,6,12,0.28) 0%, rgba(5,6,12,0.05) 24%, transparent 46%), radial-gradient(125% 95% at 50% 26%, transparent 64%, rgba(5,6,12,0.12) 100%)" }} />

        {/* Film grain — subtle texture so the gradient never looks flat/plain + kills banding */}
        <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "220px 220px" }} />

        {/* Floating glossy spheres — kept (cursor-parallax) */}
        <SphereField />
      </div>

      {/* HERO — left-aligned, runlayer-style, with a liquid-glass showcase orb */}
      <section className="hero-parallax relative mx-auto grid min-h-[68vh] max-w-[90rem] grid-cols-1 items-center gap-12 px-6 pb-14 pt-20 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md" style={{ animationDelay: "0s" }}>
            <span className="pulse-dot inline-block size-1.5 rounded-full bg-emerald-400" />
            {C.heroEyebrow}
          </span>

          <p className="reveal mt-8 text-lg font-medium text-[var(--accent-1)] sm:text-xl" style={{ animationDelay: "0.05s" }}>
            Hi, I&apos;m 👋
          </p>
          <h1 className="reveal mt-1 text-5xl font-bold leading-[1.02] text-white sm:text-6xl md:text-7xl" style={{ animationDelay: "0.1s" }}>
            {name}
          </h1>
          <h2 className="reveal mt-3 text-2xl font-bold leading-[1.15] sm:text-3xl" style={{ animationDelay: "0.16s" }}>
            <span className="text-gradient-animate">{C.heroHighlight}</span>
          </h2>

          <div className="reveal mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.22s" }}>
            <a href={C.heroPrimaryHref} className={GRADIENT_BTN}>
              {C.heroPrimaryLabel} <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            {cvUrl ? (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className={GLASS_BTN}>↓ Download CV</a>
            ) : null}
            {showreelUrl ? (
              <button type="button" onClick={() => setReelOpen(true)} className={GLASS_BTN}>▶ Watch Showreel</button>
            ) : null}
          </div>
        </div>

        {/* right: liquid-glass framed portrait photo */}
        <div className="reveal relative hidden md:col-span-5 md:block" style={{ animationDelay: "0.2s" }}>
          <div className="glass glow-border float-y relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/foto.jpg" alt={name} className="h-full w-full object-cover object-[center_22%]" />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(5,8,18,0.6) 100%)" }} />
          </div>
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
              ✕ Close
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
