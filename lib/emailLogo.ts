import { getShopAppUrl } from "@/lib/appUrl";

const TRANSPARENT_LOGO_DATA_URI = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

export function resolveEmailLogoUrl(
  logoPath: string | null | undefined,
  shop?: { primaryDomain?: string | null } | null
) {
  const appUrl = getShopAppUrl(shop);
  const hostname = new URL(appUrl).hostname.toLowerCase().replace(/^www\./, "");
  const value = logoPath?.trim();

  // The header asset is cropped to its monogram. Email uses the complete mark.
  if (hostname === "jsbarbearia.com" || value?.startsWith("/brands/js-barbearia/")) {
    return `${appUrl}/brands/js-barbearia/app-icon-512.png?v=20260924-full-logo`;
  }

  if (!value) return TRANSPARENT_LOGO_DATA_URI;
  if (/^https?:\/\//i.test(value)) return value;
  return `${appUrl}${value.startsWith("/") ? value : `/${value}`}`;
}
