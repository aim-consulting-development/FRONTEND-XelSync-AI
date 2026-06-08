import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XelSync AI | Automatización Inteligente Aduanera",
  description: "Plataforma premium con IA para el control y cumplimiento de pedimentos aduanales, anexos 24 y 30. Extracción automatizada y alertas SLA en tiempo real.",
  keywords: ["Aduanas", "Comercio Exterior", "IA", "Pedimentos", "Anexo 24", "Anexo 30", "XelSync"],
  icons: {
    icon: '/images/XelSyncLogo4.png',
    shortcut: '/images/XelSyncLogo4.png',
    apple: '/images/XelSyncLogo4.png',
  },
  openGraph: {
    title: "XelSync AI | Dashboard",
    description: "Plataforma líder en cumplimiento aduanero impulsada por Inteligencia Artificial.",
    url: "https://xelsync.com",
    siteName: "XelSync AI",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4f6' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-950 dark:to-slate-900 selection:bg-blue-600 selection:text-white transition-colors duration-500">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
