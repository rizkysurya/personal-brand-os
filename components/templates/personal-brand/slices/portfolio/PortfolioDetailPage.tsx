"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PortfolioDetailView,
  type PortfolioItem as SliceItem,
} from "@/features/portfolio-section";
import { usePortfolio, usePortfolioItem } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1600&q=70";

// Auto-thumbnail from a YouTube URL so video items need no manual cover.
function ytThumb(url?: string): string {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return yt ? `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` : "";
}

// Convert a YouTube/Vimeo URL into an embeddable player URL (no autoplay).
function toEmbed(url?: string): string {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

/**
 * Hybrid wrapper: case-study detail via canonical PortfolioDetailView
 * slice. Problem/Approach/Result populate the new `sections` field
 * (auto 3-col). "Mau hasil serupa?" CTA card + related rendered via
 * afterContent + related slots.
 */
export function PortfolioDetailPage({ slug }: { slug: string }) {
  const item = usePortfolioItem(slug);
  const all = usePortfolio();

  if (!item) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-sm text-muted-foreground">Case study tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`${PUBLIC_BASE}/portfolio`}><ArrowLeft className="size-4" /> Kembali</Link>
        </Button>
      </section>
    );
  }

  const related = all.filter((p) => p.id !== item.id && p.category === item.category).slice(0, 3);

  const sections = (
    [
      item.problem ? { id: "problem", heading: "Problem", body: item.problem } : null,
      item.approach ? { id: "approach", heading: "Approach", body: item.approach } : null,
      item.result ? { id: "result", heading: "Result", body: item.result } : null,
    ] as Array<{ id: string; heading: string; body: string } | null>
  ).filter(Boolean) as Array<{ id: string; heading: string; body: string }>;

  const sliceItem: SliceItem = {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.blurb,
    tags: [item.category],
    role: item.credit || undefined,
    cover: { src: item.cover || ytThumb(item.videoUrl) || FALLBACK_COVER, alt: item.title },
    sections: sections.length ? sections : undefined,
  };

  const relatedItems: SliceItem[] = related.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.blurb,
    tags: [r.category],
    role: r.credit || undefined,
    cover: { src: r.cover || ytThumb(r.videoUrl) || FALLBACK_COVER, alt: r.title },
  }));

  return (
    <PortfolioDetailView
      item={sliceItem}
      embedUrl={item.videoUrl ? toEmbed(item.videoUrl) : undefined}
      backHref={`${PUBLIC_BASE}/portfolio`}
      related={relatedItems}
      hrefForRelated={(r) => `${PUBLIC_BASE}/portfolio/${r.slug}`}
      afterContent={
        <Card className="border-border/60 bg-gradient-to-br from-card/80 to-muted/20">
          <CardContent className="flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Mau hasil serupa?</h3>
              <p className="text-sm text-muted-foreground">Mulai dari office hours 30 menit, gratis untuk first-timer.</p>
            </div>
            <Button asChild>
              <Link href={`${PUBLIC_BASE}/services`}>Lihat layanan <ArrowUpRight className="size-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      }
    />
  );
}
