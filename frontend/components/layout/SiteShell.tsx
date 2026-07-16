"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChatBox from "./ChatBox";
import Footer from "./Footer";
import Header from "./Header";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthReady } = useAuth();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isCheckoutRoute = pathname === "/checkout";

  useEffect(() => {
    if (
      isAuthReady &&
      user?.must_change_password &&
      !isAdminRoute &&
      pathname !== "/change-password"
    ) {
      router.replace("/change-password");
    }
  }, [isAuthReady, isAdminRoute, pathname, router, user?.must_change_password]);

  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="site-editorial contents">
      <Header />
      <main className="flex-grow">{children}</main>
      {!isCheckoutRoute && <Footer />}
      {!isCheckoutRoute && <ChatBox />}
    </div>
  );
}
