import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0c0d11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://atp-strength.vercel.app"),
  title: "NEURO//STRENGTH - ATP Zen Engine",
  description: "Motor Zen de Autoconfiguración Neuromuscular de Élite para Fuerza Máxima, Potencia Olímpica y Resíntesis de ATP.",
  applicationName: "NEURO//STRENGTH",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEURO//STRENGTH",
  },
  openGraph: {
    title: "NEURO//STRENGTH - ATP Zen Engine",
    description: "Motor Zen de Autoconfiguración Neuromuscular de Élite para Fuerza Máxima, Potencia Olímpica y Resíntesis de ATP.",
    url: "https://atp-strength.vercel.app",
    siteName: "NEURO//STRENGTH",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEURO//STRENGTH - ATP Zen Engine",
    description: "Motor Zen de Autoconfiguración Neuromuscular de Élite para Fuerza Máxima, Potencia Olímpica y Resíntesis de ATP.",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-192.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased selection:bg-pink-500 selection:text-white relative">
        {children}
      </body>
    </html>
  );
}
