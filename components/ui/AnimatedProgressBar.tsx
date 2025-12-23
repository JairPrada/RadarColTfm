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
  /** Color de la barra */
  color?: "cyan" | "violet" | "red" | "green";
  /** Altura de la barra */
  height?: "sm" | "md" | "lg";
  /** Mostrar etiqueta con porcentaje */
  showLabel?: boolean;
  /** Duración de la animación */
  duration?: number;
  /** Retraso antes de la animación */
  delay?: number;
  /** Clases CSS adicionales */
  className?: string;
}

const colorClasses = {
  cyan: {
    bg: "bg-accent-cyan",
    text: "text-accent-cyan",
  },
  violet: {
    bg: "bg-accent-violet",
    text: "text-accent-violet",
  },
  red: {
    bg: "bg-red-500",
    text: "text-red-500",
  },
  green: {
    bg: "bg-green-500",
    text: "text-green-500",
  },
};

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
  className = "",
}: AnimatedProgressBarProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const colors = colorClasses[color];
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
      
      <div className={`w-full ${heightClass} bg-background-light rounded-full overflow-hidden`}>
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