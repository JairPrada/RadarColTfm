/**
 * AIExplanation - Explicación textual generada por IA
 * 
 * Patrón de diseño: Presentation Component
 * - Muestra el análisis textual del modelo de IA
 * - Estructura clara: resumen → factores → recomendaciones
 * - Diseño legible con iconos y jerarquía visual
 * 
 * @component
 */

import { Brain, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { ContractAnalysis } from "@/types/analysis";

interface AIExplanationProps {
  analysis: ContractAnalysis;
  className?: string;
}

/**
 * Componente de explicación textual del análisis de IA
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

      {/* Factores Principales */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-alert-medium" />
          Factores Principales Identificados
        </h4>
        <ul className="space-y-2">
          {analysis.factoresPrincipales.map((factor, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-background-light rounded-lg border border-border hover:border-accent-cyan/30 transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-accent-cyan/10 text-accent-cyan rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <span className="text-foreground-muted text-sm">{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recomendaciones */}
      <div>
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-alert-medium" />
          Recomendaciones de Acción
        </h4>
        <ul className="space-y-2">
          {analysis.recomendaciones.map((recomendacion, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-accent-violet/5 rounded-lg border border-accent-violet/20"
            >
              <span className="text-accent-violet mt-0.5">→</span>
              <span className="text-foreground-muted text-sm">{recomendacion}</span>
            </li>
          ))}
        </ul>
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
