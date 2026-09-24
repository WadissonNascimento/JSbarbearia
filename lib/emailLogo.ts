import { getShopAppUrl } from "@/lib/appUrl";

const TRANSPARENT_LOGO_DATA_URI = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

export function resolveEmailLogoUrl(
  logoPath: string | null | undefined,
  shop?: { primaryDomain?: string | null } | null
) {
  const appUrl = getShopAppUrl(shop);
  const hostname = new URL(appUrl).hostname.toLowerCase().replace(/^www\./, "");
  const value = logoPath?.trim();

  // Use the complete transparent mark, without the installed-app icon background.
  if (hostname === "jsbarbearia.com" || value?.startsWith("/brands/js-barbearia/")) {
    return `${appUrl}/brands/js-barbearia/logo-header-transparent.png?v=email-transparent-20260924`;
  }

  if (!value) return TRANSPARENT_LOGO_DATA_URI;
  if (/^https?:\/\//i.test(value)) return value;
  return `${appUrl}${value.startsWith("/") ? value : `/${value}`}`;
}
