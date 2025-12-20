/**
 * MainLayout - Layout base para la aplicación RadarCol
 * 
 * Patrón de diseño: Composite Pattern
 * Proporciona una estructura consistente para todas las páginas,
 * permitiendo composición flexible de elementos (header, footer, sidebar, etc.)
 * 
 * @component
 */

import { ReactNode } from "react";
import Link from "next/link";
import { Home, LayoutDashboard } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * Layout principal de la aplicación
 * 
 * @param {ReactNode} children - Contenido de la página
 * @param {boolean} showHeader - Mostrar header (por defecto: true)
 * @param {boolean} showFooter - Mostrar footer (por defecto: true)
 * @param {string} className - Clases CSS adicionales para el container
 * 
 * @example
 * ```tsx
 * <MainLayout>
 *   <YourPageContent />
 * </MainLayout>
 * ```
 */
export function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
  className = "",
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHeader && (
        <header className="sticky top-0 z-50 border-b border-border bg-background-light/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-bold text-accent-cyan">
                  Radar<span className="text-accent-violet">Col</span>
                </h1>
              </Link>
              
              {/* Navegación básica */}
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Inicio</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </nav>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 container mx-auto px-4 py-8 ${className}`}>
        {children}
      </main>

      {showFooter && (
        <footer className="border-t border-border bg-background-light py-6">
          <div className="container mx-auto px-4 text-center text-sm text-foreground-muted">
            <p>&copy; {new Date().getFullYear()} RadarCol. Detección inteligente de anomalías.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
