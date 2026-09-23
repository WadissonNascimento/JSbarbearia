import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isShopAdmin?: boolean;
      active?: boolean;
      shopId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    isShopAdmin?: boolean;
    active?: boolean;
    shopId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isShopAdmin?: boolean;
    active?: boolean;
    shopId?: string | null;
  }
}
