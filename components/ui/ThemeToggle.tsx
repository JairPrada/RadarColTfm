"use client"

/**
 * ThemeToggle - Componente para cambiar entre Light y Dark Mode
 * 
 * Patrón de diseño: Strategy Pattern
 * Cambia dinámicamente entre estrategias de visualización (light/dark)
 * basándose en la selección del usuario
 * 
 * @component
 */

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

/**
 * Botón toggle para cambiar entre temas
 * 
 * Características:
 * - Animación suave de transición
 * - Iconos adaptativos (Sol/Luna)
 * - Tooltip descriptivo
 * - Estados de hover y active con efectos glow
 * - Accesible por teclado
 * 
 * @returns {JSX.Element} Botón de toggle de tema
 * 
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevenir hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-background-light border border-border" />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 rounded-lg bg-background-light border border-border hover:border-accent-cyan transition-all duration-300 flex items-center justify-center group overflow-hidden"
      aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
      title={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
    >
      {/* Efecto glow de fondo en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-accent-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Ícono de Sol (Light Mode) */}
      <Sun
        className={`absolute w-5 h-5 text-accent-cyan transition-all duration-500 ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      
      {/* Ícono de Luna (Dark Mode) */}
      <Moon
        className={`absolute w-5 h-5 text-accent-violet transition-all duration-500 ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  )
}
