"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

const SECTION_DEFS = [
  { id: "marquee", label: "Marquee skill" },
  { id: "work", label: "Galeri Karya" },
  { id: "about", label: "Tentang" },
  { id: "services", label: "Layanan" },
  { id: "contact", label: "Kontak" },
];

const DEFAULT_ACCENT = "#8b5cf6";
const DEFAULT_ACCENT2 = "#22d3ee";

type Sec = { id: string; enabled: boolean; order: number };

const TEXT_KEYS = [
  "heroEyebrow", "heroName", "heroHighlight", "heroSubtext",
  "heroPrimaryLabel", "heroPrimaryHref", "heroSecondaryLabel", "heroSecondaryHref",
  "showreelTitle", "showreelSubtitle",
  "workEyebrow", "workTitle", "aboutEyebrow", "aboutTitle", "aboutBody",
  "servicesEyebrow", "servicesTitle", "contactTitle", "contactSubtext", "contactPrimaryLabel",
];

export default function AppearancePage() {
  const cfg = useQuery(api.homeConfig.get);
  const save = useMutation(api.homeConfig.upsert);

  const [form, setForm] = React.useState<Record<string, string>>({});
  const [skills, setSkills] = React.useState("");
  const [stats, setStats] = React.useState("");
  const [accent, setAccent] = React.useState(DEFAULT_ACCENT);
  const [accent2, setAccent2] = React.useState(DEFAULT_ACCENT2);
  const [sections, setSections] = React.useState<Sec[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (cfg === undefined || loaded) return;
    const next: Record<string, string> = {};
    for (const k of TEXT_KEYS) {
      const val = cfg ? (cfg as Record<string, unknown>)[k] : undefined;
      next[k] = typeof val === "string" ? val : "";
    }
    setForm(next);
    setSkills((cfg?.skills ?? []).join("\n"));
    setStats((cfg?.stats ?? []).map((s) => `${s.value} | ${s.label}`).join("\n"));
    setAccent(cfg?.accent ?? DEFAULT_ACCENT);
    setAccent2(cfg?.accent2 ?? DEFAULT_ACCENT2);
    const existing: Sec[] = cfg?.sections ?? [];
    setSections(
      SECTION_DEFS.map((d, i) => {
        const found = existing.find((s) => s.id === d.id);
        return { id: d.id, enabled: found ? found.enabled : true, order: found ? found.order : i + 1 };
      }),
    );
    setLoaded(true);
  }, [cfg, loaded]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSave() {
    setSaving(true);
    try {
      const skillsArr = skills.split("\n").map((s) => s.trim()).filter(Boolean);
      const statsArr = stats
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const idx = l.indexOf("|");
          if (idx === -1) return { value: l, label: "" };
          return { value: l.slice(0, idx).trim(), label: l.slice(idx + 1).trim() };
        });
      await save({
        heroEyebrow: form.heroEyebrow,
        heroName: form.heroName,
        heroHighlight: form.heroHighlight,
        heroSubtext: form.heroSubtext,
        heroPrimaryLabel: form.heroPrimaryLabel,
        heroPrimaryHref: form.heroPrimaryHref,
        heroSecondaryLabel: form.heroSecondaryLabel,
        heroSecondaryHref: form.heroSecondaryHref,
        showreelTitle: form.showreelTitle,
        showreelSubtitle: form.showreelSubtitle,
        workEyebrow: form.workEyebrow,
        workTitle: form.workTitle,
        aboutEyebrow: form.aboutEyebrow,
        aboutTitle: form.aboutTitle,
        aboutBody: form.aboutBody,
        servicesEyebrow: form.servicesEyebrow,
        servicesTitle: form.servicesTitle,
        contactTitle: form.contactTitle,
        contactSubtext: form.contactSubtext,
        contactPrimaryLabel: form.contactPrimaryLabel,
        skills: skillsArr,
        stats: statsArr,
        accent,
        accent2,
        sections,
      });
      const { toast } = await import("sonner");
      toast.success("Tersimpan! Perubahan langsung tampil di beranda.");
    } catch {
      const { toast } = await import("sonner");
      toast.error("Gagal menyimpan. Pastikan kamu login sebagai admin, lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (cfg === undefined || !loaded) {
    return (
      <div className="grid h-40 place-items-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tampilan Beranda</h1>
        <p className="text-sm text-muted-foreground">
          Atur teks, skill, statistik, warna, &amp; seksi halaman depan. Tersimpan ke database, langsung tampil di situs.
        </p>
      </div>

      <Card className="border-border/60">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Hero (bagian paling atas)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldText label="Label kecil (eyebrow)" k="heroEyebrow" form={form} set={set} ph="Tersedia untuk proyek freelance" />
            <FieldText label="Nama (kosong = pakai nama pemilik)" k="heroName" form={form} set={set} ph="Nama kamu" />
            <FieldText label="Teks gradient" k="heroHighlight" form={form} set={set} ph="Graphic & Motion Designer." full />
            <FieldArea label="Sub-teks" k="heroSubtext" form={form} set={set} ph="Deskripsi singkat tentang kamu..." full />
            <FieldText label="Tombol 1 — teks" k="heroPrimaryLabel" form={form} set={set} ph="Lihat Karya" />
            <FieldText label="Tombol 1 — link" k="heroPrimaryHref" form={form} set={set} ph="#work" />
            <FieldText label="Tombol 2 — teks" k="heroSecondaryLabel" form={form} set={set} ph="Hubungi Saya" />
            <FieldText label="Tombol 2 — link" k="heroSecondaryHref" form={form} set={set} ph="/contact" />
            <FieldText label="Showreel — judul" k="showreelTitle" form={form} set={set} ph="Showreel 2026" />
            <FieldText label="Showreel — sub" k="showreelSubtitle" form={form} set={set} ph="Kompilasi terbaik — 90 detik" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Judul tiap seksi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldText label="Karya — label" k="workEyebrow" form={form} set={set} ph="Portfolio" />
            <FieldText label="Karya — judul" k="workTitle" form={form} set={set} ph="Karya Pilihan" />
            <FieldText label="Tentang — label" k="aboutEyebrow" form={form} set={set} ph="Tentang" />
            <FieldText label="Tentang — judul" k="aboutTitle" form={form} set={set} ph="Desain yang berfungsi" />
            <FieldArea label="Tentang — isi" k="aboutBody" form={form} set={set} ph="Cerita singkat tentang kamu..." full />
            <FieldText label="Layanan — label" k="servicesEyebrow" form={form} set={set} ph="Layanan" />
            <FieldText label="Layanan — judul" k="servicesTitle" form={form} set={set} ph="Yang bisa aku bantu" />
            <FieldText label="Kontak — judul" k="contactTitle" form={form} set={set} ph="Punya proyek?" />
            <FieldText label="Kontak — sub" k="contactSubtext" form={form} set={set} ph="Terbuka untuk kolaborasi..." />
            <FieldText label="Kontak — teks tombol" k="contactPrimaryLabel" form={form} set={set} ph="Email Saya" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Skill &amp; Statistik</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Skill — satu per baris</Label>
              <Textarea value={skills} onChange={(e) => setSkills(e.target.value)} rows={8} placeholder={"After Effects\nCinema 4D\nPremiere Pro"} />
            </div>
            <div className="space-y-1.5">
              <Label>Statistik — format: angka | keterangan</Label>
              <Textarea value={stats} onChange={(e) => setStats(e.target.value)} rows={8} placeholder={"80+ | Proyek selesai\n40+ | Klien senang"} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Warna tema</h2>
          <div className="flex flex-wrap items-end gap-6">
            <ColorField label="Warna utama" value={accent} onChange={setAccent} />
            <ColorField label="Warna kedua (glow)" value={accent2} onChange={setAccent2} />
            <button
              type="button"
              onClick={() => { setAccent(DEFAULT_ACCENT); setAccent2(DEFAULT_ACCENT2); }}
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              Reset ke ungu–cyan
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="space-y-3 p-6">
          <h2 className="text-base font-semibold">Seksi: tampil &amp; urutan</h2>
          {sections.map((s) => {
            const def = SECTION_DEFS.find((d) => d.id === s.id);
            return (
              <div key={s.id} className="flex items-center gap-4 rounded-lg border border-border/60 p-3">
                <Switch
                  checked={s.enabled}
                  onCheckedChange={(v) => setSections((arr) => arr.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)))}
                />
                <span className="flex-1 text-sm font-medium">{def?.label ?? s.id}</span>
                <Label className="text-xs text-muted-foreground">Urutan</Label>
                <Input
                  type="number"
                  className="w-20"
                  value={s.order}
                  onChange={(e) => setSections((arr) => arr.map((x) => (x.id === s.id ? { ...x, order: Number(e.target.value) } : x)))}
                />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">Hero selalu paling atas. Angka urutan kecil = tampil lebih dulu.</p>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 border-t border-border/60 bg-background/85 py-3 backdrop-blur">
        <span className="text-xs text-muted-foreground">Perubahan tersimpan ke database & langsung tampil di situs.</span>
        <Button onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            "Simpan perubahan"
          )}
        </Button>
      </div>
    </div>
  );
}

function FieldText({
  label, k, form, set, ph, full,
}: {
  label: string; k: string; form: Record<string, string>; set: (k: string, v: string) => void; ph?: string; full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      <Input value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} placeholder={ph} />
    </div>
  );
}

function FieldArea({
  label, k, form, set, ph, full,
}: {
  label: string; k: string; form: Record<string, string>; set: (k: string, v: string) => void; ph?: string; full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      <Textarea value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} placeholder={ph} rows={3} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 cursor-pointer rounded border border-border bg-transparent"
          aria-label={label}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="w-28 font-mono text-xs" />
      </div>
    </div>
  );
}
