import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRIP_NAME } from "@/lib/constants";
import { ParticipantProvider } from "@/lib/participant-context";
import { Header } from "@/components/header/Header";
import { IdentityGate } from "@/components/identity/IdentityGate";
import { BottomNav } from "@/components/nav/BottomNav";
import { SplashScreen } from "@/components/splash/SplashScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: TRIP_NAME,
  description: "Organizá el viaje a la playa con tus amigos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ParticipantProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
            {children}
          </main>
          <BottomNav />
          <IdentityGate />
          <SplashScreen />
        </ParticipantProvider>
      </body>
    </html>
  );
}
