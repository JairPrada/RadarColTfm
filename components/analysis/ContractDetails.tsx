/**
 * ContractDetails - Información detallada del contrato
 * 
 * Patrón de diseño: Presentation Component
 * - Muestra datos del contrato de forma estructurada
 * - Diseño card-based con iconos contextuales
 * - Información formateada y legible
 * 
 * @component
 */

import { Calendar, Building2, DollarSign, FileText, User, TrendingUp } from "lucide-react";
import { Contract } from "@/types/contract";
import { Badge } from "@/components/ui/Badge";

interface ContractDetailsProps {
  contract: Contract;
  className?: string;
}

const riskLevelText = {
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
};

/**
 * Formatea un número a formato de moneda colombiana (COP)
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha a formato largo español
 */
const formatDate = (date: Date | null): string => {
  if (!date) {
    return "Fecha no disponible";
  }
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

/**
 * Componente de detalles del contrato
 * 
 * @param {Contract} contract - Información del contrato
 * @param {string} className - Clases CSS adicionales
 */
export function ContractDetails({ contract, className = "" }: ContractDetailsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con ID y Nivel de Riesgo */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-foreground-muted mb-1">ID del Contrato</div>
          <h2 className="text-2xl font-bold font-mono text-accent-cyan">{contract.id}</h2>
        </div>
        <Badge variant={contract.nivelRiesgo}>
          {riskLevelText[contract.nivelRiesgo]} Riesgo
        </Badge>
      </div>

      {/* Probabilidad de Anomalía */}
      <div className="p-6 bg-background-light rounded-xl border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-foreground-muted">Probabilidad de Anomalía</span>
          <TrendingUp className="w-5 h-5 text-accent-cyan" />
        </div>
        <div className="text-4xl font-bold font-mono text-foreground mb-2">
          {contract.probabilidadAnomalia}%
        </div>
        <div className="w-full bg-background-card rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              contract.nivelRiesgo === "high"
                ? "bg-alert-high"
                : contract.nivelRiesgo === "medium"
                ? "bg-alert-medium"
                : "bg-alert-low"
            }`}
            style={{ width: `${contract.probabilidadAnomalia}%` }}
          />
        </div>
      </div>

      {/* Información del Contrato */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Información del Contrato</h3>

        {/* Nombre del Contrato */}
        <div className="flex items-start gap-3 p-4 bg-background-light rounded-lg">
          <FileText className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-foreground-muted mb-1">Nombre del Contrato</div>
            <div className="text-foreground font-medium leading-snug">
              {contract.nombreContrato}
            </div>
          </div>
        </div>

        {/* Entidad */}
        <div className="flex items-start gap-3 p-4 bg-background-light rounded-lg">
          <Building2 className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-foreground-muted mb-1">Entidad Contratante</div>
            <div className="text-foreground font-medium">{contract.entidad}</div>
          </div>
        </div>

        {/* Monto */}
        <div className="flex items-start gap-3 p-4 bg-background-light rounded-lg">
          <DollarSign className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-foreground-muted mb-1">Monto del Contrato</div>
            <div className="text-foreground font-bold font-mono text-lg">
              {formatCurrency(contract.monto)}
            </div>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-start gap-3 p-4 bg-background-light rounded-lg">
          <Calendar className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-foreground-muted mb-1">Fecha de Firma</div>
            <div className="text-foreground font-medium">{formatDate(contract.fecha)}</div>
          </div>
        </div>

        {/* Contratista */}
        {contract.contratista && (
          <div className="flex items-start gap-3 p-4 bg-background-light rounded-lg">
            <User className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-foreground-muted mb-1">Contratista</div>
              <div className="text-foreground font-medium">{contract.contratista}</div>
            </div>
          </div>
        )}

        {/* Objeto (si existe) */}
        {contract.objeto && (
          <div className="p-4 bg-background-light rounded-lg">
            <div className="text-xs text-foreground-muted mb-2">Objeto del Contrato</div>
            <div className="text-foreground-muted text-sm leading-relaxed">
              {contract.objeto}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
