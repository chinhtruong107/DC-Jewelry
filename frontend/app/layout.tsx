import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SiteShell from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Đức Chính Jewelry - Trang sức cao cấp",
  description:
    "Đức Chính Jewelry tuyển chọn trang sức cao cấp với tinh thần chế tác tinh xảo, sang trọng và trường tồn.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <SiteShell>{children}</SiteShell>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
