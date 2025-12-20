/**
 * ShapChart - Gráfico de valores SHAP con Recharts
 * 
 * Patrón de diseño: Presentation Component + Strategy Pattern
 * - Presentation: Solo renderiza, recibe datos procesados
 * - Strategy: Colores diferentes para valores positivos/negativos
 * 
 * SHAP (SHapley Additive exPlanations):
 * - Técnica de explicabilidad para modelos de ML
 * - Muestra contribución de cada feature a la predicción
 * - Valores positivos (rojo) aumentan probabilidad de anomalía
 * - Valores negativos (verde) la disminuyen
 * 
 * @component
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { ShapValue } from "@/types/analysis";

interface ShapChartProps {
  shapValues: ShapValue[];
  className?: string;
}

interface TooltipPayload {
  payload: ShapValue;
}

/**
 * Tooltip personalizado para mostrar información detallada
 */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const value = data.value;
  const isPositive = value > 0;

  return (
    <div className="bg-background-card border border-border rounded-lg p-4 shadow-lg max-w-xs">
      <p className="font-semibold text-foreground mb-2">{data.description}</p>
      {data.actualValue && (
        <p className="text-sm text-foreground-muted mb-2">
          Valor: <span className="font-mono text-foreground">{data.actualValue}</span>
        </p>
      )}
      <p className="text-sm">
        <span className="text-foreground-muted">Impacto: </span>
        <span
          className={`font-bold font-mono ${
            isPositive ? "text-alert-high" : "text-alert-low"
          }`}
        >
          {isPositive ? "+" : ""}
          {value.toFixed(1)}%
        </span>
      </p>
      <p className="text-xs text-foreground-muted mt-1">
        {isPositive ? "↑ Aumenta probabilidad" : "↓ Reduce probabilidad"}
      </p>
    </div>
  );
}

/**
 * Gráfico de barras horizontales para SHAP values
 * 
 * @param {ShapValue[]} shapValues - Valores SHAP ordenados
 * @param {string} className - Clases CSS adicionales
 */
export function ShapChart({ shapValues, className = "" }: ShapChartProps) {
  // Ordenar por valor absoluto descendente (mayor impacto primero)
  const sortedData = [...shapValues].sort(
    (a, b) => Math.abs(b.value) - Math.abs(a.value)
  );

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Explicabilidad del Modelo (SHAP Values)
        </h3>
        <p className="text-sm text-foreground-muted">
          Impacto de cada variable en la probabilidad de anomalía. 
          <span className="text-alert-high ml-1">Rojo</span> aumenta riesgo,{" "}
          <span className="text-alert-low">verde</span> lo reduce.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          
          {/* Eje Y: Variables */}
          <YAxis
            type="category"
            dataKey="description"
            width={110}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          
          {/* Eje X: Valores SHAP */}
          <XAxis
            type="number"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            label={{
              value: "Impacto en probabilidad (%)",
              position: "insideBottom",
              offset: -5,
              style: { fill: "#94a3b8", fontSize: 12 },
            }}
          />
          
          {/* Línea de referencia en 0 */}
          <ReferenceLine
            x={0}
            stroke="#475569"
            strokeWidth={2}
            strokeDasharray="3 3"
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} />
          
          {/* Barras con colores condicionales */}
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value > 0 ? "#ef4444" : "#10b981"}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda explicativa */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-foreground-muted">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-alert-high rounded"></div>
          <span>Valor positivo: incrementa riesgo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-alert-low rounded"></div>
          <span>Valor negativo: reduce riesgo</span>
        </div>
      </div>
    </div>
  );
}
