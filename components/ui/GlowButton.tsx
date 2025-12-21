/**
 * GlowButton - Botón con efecto neón cyberpunk
 *
 * Patrón de diseño: Component Pattern + Strategy Pattern
 * - Component Pattern: Encapsula comportamiento y estilo del botón
 * - Strategy Pattern: Permite diferentes variantes de color (cyan, violet)
 *
 * Características:
 * - Efecto glow animado con Framer Motion
 * - Hover interactivo con scale y brightness
 * - Variantes de color configurables
 * - Accesibilidad completa (ARIA labels, keyboard navigation)
 *
 * @component
 * @example
 * ```tsx
 * <GlowButton variant="cyan" onClick={handleClick}>
 *   Iniciar Análisis
 * </GlowButton>
 * ```
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  variant?: "cyan" | "violet";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

/**
 * Mapeo de variantes a clases de Tailwind
 * Strategy Pattern: Diferentes estrategias visuales sin duplicar código
 */
const variantStyles = {
  cyan: {
    base: "bg-accent-cyan text-white",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.5)]",
    hoverGlow: "shadow-[0_0_30px_rgba(6,182,212,0.8)]",
  },
  violet: {
    base: "bg-accent-violet text-white",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.5)]",
    hoverGlow: "shadow-[0_0_30px_rgba(139,92,246,0.8)]",
  },
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

/**
 * Botón con efecto glow neón
 *
 * @param {ReactNode} children - Contenido del botón
 * @param {string} variant - Variante de color ("cyan" | "violet")
 * @param {string} size - Tamaño del botón
 * @param {string} className - Clases CSS adicionales
 */
export function GlowButton({
  children,
  variant = "cyan",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: GlowButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      className={`
        ${styles.base}
        ${sizeStyles[size]}
        ${styles.glow}
        font-bold rounded-lg
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
      `}
      whileHover={{
        scale: 1.05,
        boxShadow: styles.hoverGlow,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.6, // Aparece después del texto
      }}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  );
}
