import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Fuentes principales para RadarCol
 * - Geist Sans: UI general
 * - Geist Mono: Datos numéricos y código
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Metadata de la aplicación RadarCol
 * Plataforma de detección de anomalías en contratos públicos mediante IA
 */
export const metadata: Metadata = {
  title: "RadarCol | Detección de Anomalías en Contratos Públicos",
  description: "Plataforma avanzada de análisis mediante IA para detectar anomalías y patrones sospechosos en contratos públicos. Visualiza riesgos, explora datos y toma decisiones informadas.",
  keywords: ["anomalías", "contratos públicos", "IA", "machine learning", "análisis de datos", "transparencia"],
  authors: [{ name: "RadarCol Team" }],
};

/**
 * Viewport configuration
 * Moved from metadata export per Next.js 14+ requirements
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
