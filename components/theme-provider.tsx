"use client"

/**
 * ThemeProvider - Wrapper para next-themes
 * 
 * Patrón de diseño: Provider Pattern
 * Proporciona contexto de tema a toda la aplicación permitiendo
 * cambio dinámico entre Light Mode y Dark Mode
 * 
 * @component
 */

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

/**
 * Componente proveedor de tema
 * 
 * Características:
 * - Sincronización automática con preferencias del sistema
 * - Persistencia en localStorage
 * - Transiciones suaves entre temas
 * - Prevención de flash de contenido sin estilo (FOUC)
 * 
 * @param {ThemeProviderProps} props - Propiedades del provider
 * @returns {JSX.Element} Provider configurado
 * 
 * @example
 * ```tsx
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
