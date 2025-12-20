/**
 * Badge - Componente para mostrar niveles de riesgo
 * 
 * Patrón de diseño: Strategy Pattern
 * - Diferentes estrategias visuales para cada nivel de riesgo
 * - Fácil extensión a nuevos niveles sin modificar código existente
 * 
 * Características:
 * - Colores del sistema de semáforo (definidos en globals.css)
 * - Iconos contextuales para reforzar significado
 * - Accesibilidad con aria-labels
 * - Variantes de tamaño
 * 
 * @component
 * @example
 * ```tsx
 * <Badge variant="high">Alto Riesgo</Badge>
 * <Badge variant="medium" size="sm">Medio</Badge>
 * ```
 */

import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

type BadgeVariant = "high" | "medium" | "low" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  size?: BadgeSize;
  className?: string;
}

/**
 * Mapeo de variantes a estilos y componentes
 * Strategy Pattern: Cada variante tiene su estrategia visual
 */
const variantConfig = {
  high: {
    styles: "bg-alert-high-bg text-alert-high border-alert-high",
    icon: AlertCircle,
    label: "Alto riesgo",
  },
  medium: {
    styles: "bg-alert-medium-bg text-alert-medium border-alert-medium",
    icon: AlertTriangle,
    label: "Riesgo medio",
  },
  low: {
    styles: "bg-alert-low-bg text-alert-low border-alert-low",
    icon: CheckCircle,
    label: "Bajo riesgo",
  },
  info: {
    styles: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
    icon: AlertCircle,
    label: "Información",
  },
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

/**
 * Badge component para indicadores visuales
 * 
 * @param {BadgeVariant} variant - Tipo de badge (high, medium, low, info)
 * @param {ReactNode} children - Contenido del badge
 * @param {BadgeSize} size - Tamaño del badge
 * @param {string} className - Clases CSS adicionales
 */
export function Badge({
  variant,
  children,
  size = "md",
  className = "",
}: BadgeProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${config.styles}
        ${sizeStyles[size]}
        border rounded-full font-medium
        ${className}
      `}
      role="status"
      aria-label={config.label}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
