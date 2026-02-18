import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

import { RealtimeListener } from "@/components/notifications/realtime-listener";

export const metadata: Metadata = {
  title: "Communew. | Local Hobby Events in Berlin",
  description: "Discover and book local hobby events, workshops, and meetups in Berlin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSerif.variable} ${fontSans.variable} font-sans antialiased`} // Modified className
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
