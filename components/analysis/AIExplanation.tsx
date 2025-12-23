/**
 * AIExplanation - Resumen ejecutivo del análisis de IA
 * 
 * Patrón de diseño: Presentation Component
 * - Muestra el resumen ejecutivo y metadata del análisis
 * - Los factores y recomendaciones ahora están en accordions separados
 * 
 * @component
 */

import { Brain, AlertTriangle } from "lucide-react";
import { ContractAnalysis } from "@/types/analysis";

interface AIExplanationProps {
  analysis: ContractAnalysis;
  className?: string;
}

/**
 * Componente de resumen ejecutivo del análisis de IA
 * 
 * @param {ContractAnalysis} analysis - Análisis completo del contrato
 * @param {string} className - Clases CSS adicionales
 */
export function AIExplanation({ analysis, className = "" }: AIExplanationProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con confianza del modelo */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent-violet/10 rounded-lg">
            <Brain className="w-6 h-6 text-accent-violet" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Análisis de IA
            </h3>
            <p className="text-sm text-foreground-muted">
              Modelo de Machine Learning especializado
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-foreground-muted">Confianza</div>
          <div className="text-2xl font-bold font-mono text-accent-cyan">
            {analysis.confianza}%
          </div>
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="p-4 bg-background-light rounded-lg border border-border">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-cyan" />
          Resumen Ejecutivo
        </h4>
        <p className="text-foreground-muted leading-relaxed">
          {analysis.resumenEjecutivo}
        </p>
      </div>

      {/* Metadata del análisis */}
      <div className="pt-4 border-t border-border">
        <div className="flex flex-wrap gap-4 text-xs text-foreground-muted">
          <div>
            <span className="font-medium">Fecha de análisis:</span>{" "}
            {analysis.fechaAnalisis.toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div>
            <span className="font-medium">Probabilidad base:</span>{" "}
            <span className="font-mono">{analysis.probabilidadBase}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
