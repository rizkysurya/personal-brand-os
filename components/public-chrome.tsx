"use client";

import { type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteShell } from "@/components/templates/_shared/ui/site-shell";
import { DEFAULT_SITE_CONFIG } from "@/components/templates/personal-brand/shared/site-config";
import { PUBLIC_NAV } from "@/components/templates/personal-brand/shared/nav-config";

/**
 * Public chrome (minimal nav + minimal footer). Brand name comes from Convex
 * `siteSettings` (admin Settings), falling back to template defaults. Footer is
 * trimmed to brand + socials + copyright (no link columns / template bio).
 */
export function PublicChrome({ children }: { children: ReactNode }) {
  const s = useQuery(api.settings.get);
  const brandName = s?.siteName || DEFAULT_SITE_CONFIG.brandName;
  const brand = {
    ...DEFAULT_SITE_CONFIG,
    brandName,
    brandLetter: brandName.charAt(0).toUpperCase() || DEFAULT_SITE_CONFIG.brandLetter,
    description: "",
    logoUrl: s?.logoUrl || "/logo.svg",
  };

  return (
    <SiteShell
      brand={brand}
      homeHref="/"
      navItems={PUBLIC_NAV}
      footerColumns={[]}
      copyrightHolder={brand.brandName}
    >
      {children}
    </SiteShell>
  );
}
