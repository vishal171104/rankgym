import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Anti-Gravity Gym",
  description: "Solo Leveling Physique Tracker",
  manifest: "/manifest.json", 
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import { HunterErrorBoundary } from "@/components/shared/hunter-error-boundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <HunterErrorBoundary>
          {children}
        </HunterErrorBoundary>
      </body>
    </html>
  );
}
