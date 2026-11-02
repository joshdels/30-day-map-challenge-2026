import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joshua De Leon — 30 Day Map Challenge 2026",
  description: "Joshua De Leon’s thirty days of cartographic experiments for the 2026 challenge.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
