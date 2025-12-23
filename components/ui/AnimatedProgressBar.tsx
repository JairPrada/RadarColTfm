/**
 * AnimatedProgressBar - Barra de progreso animada con efectos visuales
 * 
 * Patrón de diseño: Component Pattern + Animation Hook
 * - Componente reutilizable para mostrar progreso/porcentajes
 * - Animaciones suaves con Framer Motion
 * - Soporte para diferentes colores y tamaños
 * 
 * @component
 */

"use client";

import { motion } from "framer-motion";

interface AnimatedProgressBarProps {
  /** Valor del progreso (0-100) */
  value: number;
  /** Color de la barra (si se usa modo dinámico se ignora) */
  color?: "cyan" | "violet" | "red" | "green" | "yellow";
  /** Altura de la barra */
  height?: "sm" | "md" | "lg";
  /** Mostrar etiqueta con porcentaje */
  showLabel?: boolean;
  /** Duración de la animación */
  duration?: number;
  /** Retraso antes de la animación */
  delay?: number;
  /** Usar colores dinámicos basados en el porcentaje (0-30% verde, 30-70% amarillo, 70-100% rojo) */
  dynamic?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

const colorClasses = {
  cyan: {
    bg: "bg-accent-cyan",
    text: "text-accent-cyan",
    bgVar: "bg-accent-cyan",
  },
  violet: {
    bg: "bg-accent-violet",
    text: "text-accent-violet",
    bgVar: "bg-accent-violet",
  },
  red: {
    bg: "bg-[var(--progress-red)]",
    text: "text-[var(--progress-red)]",
    bgVar: "bg-[var(--progress-red)]",
  },
  green: {
    bg: "bg-[var(--progress-green)]",
    text: "text-[var(--progress-green)]",
    bgVar: "bg-[var(--progress-green)]",
  },
  yellow: {
    bg: "bg-[var(--alert-medium)]",
    text: "text-[var(--alert-medium)]",
    bgVar: "bg-[var(--alert-medium)]",
  },
};

/**
 * Determina el color dinámico basado en el porcentaje
 * 0-30%: Verde (Bajo)
 * 30-70%: Amarillo (Medio)
 * 70-100%: Rojo (Alto)
 */
function getDynamicColor(value: number): "green" | "yellow" | "red" {
  if (value <= 30) return "green";
  if (value <= 70) return "yellow";
  return "red";
}

const heightClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

/**
 * Barra de progreso animada
 */
export function AnimatedProgressBar({
  value,
  color = "cyan",
  height = "md",
  showLabel = false,
  duration = 1.5,
  delay = 0,
  dynamic = false,
  className = "",
}: AnimatedProgressBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  // Determinar color: si es dinámico, calcular basado en valor, sino usar el prop
  const finalColor = dynamic ? getDynamicColor(normalizedValue) : color;
  const colors = colorClasses[finalColor];
  const heightClass = heightClasses[height];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-foreground-muted">Progreso</span>
          <motion.span
            className={`text-sm font-bold ${colors.text}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + duration, duration: 0.3 }}
          >
            {normalizedValue.toFixed(1)}%
          </motion.span>
        </div>
      )}
      
      <div className={`w-full ${heightClass} bg-[var(--progress-bg)] rounded-full overflow-hidden`}>
        <motion.div
          className={`${heightClass} ${colors.bg} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedValue}%` }}
          transition={{
            duration: duration,
            delay: delay,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
}