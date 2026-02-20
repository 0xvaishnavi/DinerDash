import type { Metadata } from "next";
import { Baloo_2, Quicksand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { GlobalNavbar } from "@/components/game/GlobalNavbar";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Diner Dash",
  description: "Event-driven restaurant simulation starter template",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} ${baloo.variable} antialiased`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_25%_20%,#ffe9c1_0%,transparent_35%),radial-gradient(circle_at_75%_10%,#ffd7b8_0%,transparent_30%),var(--background)]">
          <GlobalNavbar />
          <div className="pt-24 sm:pt-28 md:pt-32">{children}</div>
          <footer className="py-6 text-center text-sm text-amber-950/50">
            Made with &hearts; by{" "}
            <a
              href="https://github.com/0xvaishnavi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-950/70 underline decoration-amber-400 underline-offset-2 transition hover:text-amber-950"
            >
              @0xvaishnavi
            </a>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
