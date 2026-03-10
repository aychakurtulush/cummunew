import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { RealtimeListener } from "@/components/notifications/realtime-listener";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Communew. | Local Hobby Events in Berlin",
  description: "Discover and book local hobby events, workshops, and meetups in Berlin.",
  openGraph: {
    title: "Communew. | Local Hobby Events in Berlin",
    description: "Discover and book local hobby events, workshops, and meetups in Berlin.",
    url: "https://communew.vercel.app",
    siteName: "Communew.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Communew.",
    description: "Discover and book local hobby events, workshops, and meetups in Berlin.",
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${fontSerif.variable} ${fontSans.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <RealtimeListener />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
