"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Brand, FooterColumn } from "../types/common";

/**
 * Shared public footer — a single compact row: brand mark on the left,
 * credit line on the right. (Props kept wide for caller compatibility; only
 * brand/homeHref/copyrightHolder are rendered.)
 */
export function SiteFooter({
  brand,
  homeHref,
  copyrightHolder,
}: {
  brand: Pick<Brand, "brandLetter" | "brandName" | "description" | "logoUrl">;
  homeHref: string;
  columns?: FooterColumn[];
  copyrightHolder?: string;
  tagline?: string;
  socials?: Array<{ Icon: unknown; href?: string }>;
  belowBrand?: ReactNode;
}) {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-6 py-6">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.brandName} className="h-7 w-auto max-w-[150px] object-contain" />
          ) : (
            <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">{brand.brandLetter}</span>
          )}
          <span>{brand.brandName}</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          {copyrightHolder ?? `© ${new Date().getFullYear()} ${brand.brandName}`}
        </p>
      </div>
    </footer>
  );
}
