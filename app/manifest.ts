import type { MetadataRoute } from "next";
import { getCurrentShop } from "@/lib/shop";
import {
  JS_BARBEARIA_APP_NAME,
  JS_BARBEARIA_BACKGROUND_COLOR,
  JS_BARBEARIA_LOGO_PATH,
  JS_BARBEARIA_ICON_SIZE,
  JS_BARBEARIA_THEME_COLOR,
} from "@/lib/pwaAssets";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const shop = await getCurrentShop();
  const appName = JS_BARBEARIA_APP_NAME;

  return {
    name: appName,
    short_name: appName,
    description:
      shop.metadataDescription ||
      "Agende horários e acompanhe seus atendimentos da barbearia.",
    id: shop.primaryDomain ? `https://${shop.primaryDomain}/` : "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: JS_BARBEARIA_BACKGROUND_COLOR,
    theme_color: JS_BARBEARIA_THEME_COLOR,
    icons: [
      {
        src: JS_BARBEARIA_LOGO_PATH,
        sizes: JS_BARBEARIA_ICON_SIZE,
        type: "image/png",
      },
    ],
  };
}
