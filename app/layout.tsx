import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laits Review",
  description: "Laits Review - Customer Feedback Filter",
  manifest: "/manifest.json",
  themeColor: "#0a1628",
  icons: {
    icon: "/icon-pwa.png",
    apple: "/icon-pwa.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Laits Review",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${leagueSpartan.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-navy-950 bg-grid">{children}</body>
    </html>
  );
}
