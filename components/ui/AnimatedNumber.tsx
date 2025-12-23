/**
 * AnimatedNumber - Componente para animar números con efectos de contador
 * 
 * Patrón de diseño: Component Pattern + Animation Hook
 * - Separa la lógica de animación de números del componente
 * - Reutilizable para cualquier número que necesite animación
 * - Soporte para formatos personalizados
 * 
 * @component
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedNumberProps {
  /** Valor final del número */
  value: number;
  /** Duración de la animación en segundos */
  duration?: number;
  /** Función de formateo personalizada */
  formatter?: (value: number) => string;
  /** Clases CSS adicionales */
  className?: string;
  /** Retraso antes de iniciar la animación */
  delay?: number;
}

/**
 * Hook personalizado para animar números
 */
function useAnimatedNumber(targetValue: number, duration: number = 1.5, delay: number = 0) {
  const [currentValue, setCurrentValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (targetValue === 0) {
      setCurrentValue(0);
      return;
    }

    const timer = setTimeout(() => {
      setHasStarted(true);
      let startTime: number;
      let startValue = 0;

      const animateValue = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);

        // Easing function: easeOutQuart
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        
        const newValue = startValue + (targetValue - startValue) * easedProgress;
        setCurrentValue(newValue);

        if (progress < 1) {
          requestAnimationFrame(animateValue);
        } else {
          setCurrentValue(targetValue);
        }
      };

      requestAnimationFrame(animateValue);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [targetValue, duration, delay]);

  return Math.round(currentValue);
}

/**
 * Componente de número animado
 */
export function AnimatedNumber({
  value,
  duration = 1.5,
  formatter = (val) => val.toLocaleString('es-CO'),
  className = "",
  delay = 0,
}: AnimatedNumberProps) {
  const animatedValue = useAnimatedNumber(value, duration, delay);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        type: "spring",
        stiffness: 100,
        damping: 10
      }}
    >
      {formatter(animatedValue)}
    </motion.span>
  );
}