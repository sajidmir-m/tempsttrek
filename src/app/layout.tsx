

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { ToastProvider } from "@/components/ui/Toast";
import SupabaseAuthRecovery from "@/components/auth/SupabaseAuthRecovery";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import StructuredData from "./structured-data";
import { SITE_BRAND } from "@/lib/site-contact";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE_BRAND.shortName} - Kashmir | Tour Packages & Off-Beat Travel`,
  description: SITE_BRAND.description,
  keywords:
    `Kashmir tours, Srinagar travel, ${SITE_BRAND.shortName}, Kashmir packages, Kashmir cab rental, off beat Kashmir`,
  authors: [{ name: SITE_BRAND.legalName }],
  creator: SITE_BRAND.legalName,
  publisher: SITE_BRAND.legalName,
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "32x32" },
      { url: "/logo.png", type: "image/png", sizes: "192x192" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: getSiteUrl(),
    siteName: SITE_BRAND.shortName,
    title: `${SITE_BRAND.shortName} - Kashmir | Tour Packages & Off-Beat Travel`,
    description: SITE_BRAND.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_BRAND.shortName} - Kashmir Travel`,
    description: SITE_BRAND.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="16x16" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <GoogleAnalytics />
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ToastProvider>
          <SupabaseAuthRecovery />
          <ConditionalLayout>{children}</ConditionalLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
