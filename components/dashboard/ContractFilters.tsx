/**
 * ContractFilters - Componente de filtros para la tabla de contratos
 * 
 * Patrón de diseño: Controlled Component Pattern
 * - Estado de filtros controlado por el componente padre
 * - Callbacks para notificar cambios al padre
 * 
 * Características:
 * - Filtros basados en la documentación de la API
 * - Validación de entrada según especificaciones de la API
 * - UI responsive con grid layout
 * - Reseteo de filtros individual y global
 * 
 * @component
 * @example
 * ```tsx
 * <ContractFilters
 *   filters={currentFilters}
 *   onFiltersChange={handleFiltersChange}
 *   isLoading={isLoadingContracts}
 * />
 * ```
 */

"use client";

import { useState } from "react";
import { Search, Calendar, DollarSign, FileText, Hash, RotateCcw, Shield } from "lucide-react";
import { ContractFilters as FilterTypes } from "@/lib/contractsService";
import type { RiskLevel } from "@/types/contract";

interface ContractFiltersProps {
  filters: FilterTypes;
  onFiltersChange: (filters: FilterTypes) => void;
  isLoading?: boolean;
  className?: string;
  hideHeader?: boolean;
}

/**
 * Formatea un número a formato de moneda colombiana
 */
const formatCurrencyValue = (value: number): string => {
  return new Intl.NumberFormat('es-CO').format(value);
};

/**
 * Convierte string de moneda formateado a número
 */
const parseCurrencyValue = (value: string): number => {
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
};

/**
 * Componente de filtros para contratos
 */
export function ContractFilters({
  filters,
  onFiltersChange,
  isLoading = false,
  className = "",
  hideHeader = false,
}: ContractFiltersProps) {
  // Estados locales para formateo de campos de moneda
  const [valorMinimoDisplay, setValorMinimoDisplay] = useState(
    filters.valorMinimo ? formatCurrencyValue(filters.valorMinimo) : ""
  );
  const [valorMaximoDisplay, setValorMaximoDisplay] = useState(
    filters.valorMaximo ? formatCurrencyValue(filters.valorMaximo) : ""
  );

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = <K extends keyof FilterTypes>(key: K, value: FilterTypes[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  /**
   * Resetea todos los filtros
   */
  const resetFilters = () => {
    setValorMinimoDisplay("");
    setValorMaximoDisplay("");
    onFiltersChange({});
  };

  /**
   * Maneja cambios en valor mínimo con formato de moneda
   */
  const handleValorMinimo = (value: string) => {
    const numericValue = parseCurrencyValue(value);
    setValorMinimoDisplay(value ? formatCurrencyValue(numericValue) : "");
    updateFilter("valorMinimo", numericValue || undefined);
  };

  /**
   * Maneja cambios en valor máximo con formato de moneda
   */
  const handleValorMaximo = (value: string) => {
    const numericValue = parseCurrencyValue(value);
    setValorMaximoDisplay(value ? formatCurrencyValue(numericValue) : "");
    updateFilter("valorMaximo", numericValue || undefined);
  };

  /**
   * Maneja cambios en checkboxes de nivel de riesgo
   */
  const handleRiskLevelToggle = (level: "high" | "medium" | "low") => {
    const currentLevels = filters.nivelesRiesgo || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    
    updateFilter("nivelesRiesgo", newLevels.length > 0 ? newLevels : undefined);
  };

  return (
    <div className={`bg-background-card border border-border rounded-xl p-6 ${className}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-accent-cyan" />
            <h3 className="font-semibold text-foreground">Filtros de Búsqueda</h3>
          </div>
          <button
            onClick={resetFilters}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* Filtros Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Búsqueda por Entidad */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground h-6">
            <FileText className="w-4 h-4 text-accent-cyan" />
            Entidad Contratante
          </label>
          <input
            type="text"
            placeholder="Mínimo 3 caracteres..."
            value={filters.nombreContrato || ""}
            onChange={(e) => updateFilter("nombreContrato", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background-light text-foreground placeholder-foreground-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors disabled:opacity-50"
            minLength={3}
          />
        </div>

        {/* ID del Contrato */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground h-6">
            <Hash className="w-4 h-4 text-accent-cyan" />
            ID del Contrato
          </label>
          <input
            type="text"
            placeholder="CO1.PCCNTR.1370606"
            value={filters.idContrato || ""}
            onChange={(e) => updateFilter("idContrato", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background-light text-foreground placeholder-foreground-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors disabled:opacity-50 font-mono text-sm"
          />
        </div>

        {/* Fecha Desde */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground h-6">
            <Calendar className="w-4 h-4 text-accent-cyan" />
            Fecha Desde
          </label>
          <input
            type="date"
            value={filters.fechaDesde || ""}
            onChange={(e) => updateFilter("fechaDesde", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background-light text-foreground focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors disabled:opacity-50"
          />
        </div>

        {/* Fecha Hasta */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground h-6">
            <Calendar className="w-4 h-4 text-accent-cyan" />
            Fecha Hasta
          </label>
          <input
            type="date"
            value={filters.fechaHasta || ""}
            onChange={(e) => updateFilter("fechaHasta", e.target.value || undefined)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background-light text-foreground focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors disabled:opacity-50"
          />
        </div>

        {/* Valor Mínimo */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground h-6">
            <DollarSign className="w-4 h-4 text-accent-cyan" />
            Valor Mínimo
          </label>
          <input
            type="text"
            placeholder="Ej: 1,000,000"
            value={valorMinimoDisplay}
            onChange={(e) => handleValorMinimo(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background-light text-foreground placeholder-foreground-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors disabled:opacity-50 font-mono"
          />
        </div>

        {/* Valor Máximo */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground h-6">
            <DollarSign className="w-4 h-4 text-accent-cyan" />
            Valor Máximo
          </label>
          <input
            type="text"
            placeholder="Ej: 100,000,000"
            value={valorMaximoDisplay}
            onChange={(e) => handleValorMaximo(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background-light text-foreground placeholder-foreground-muted focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-colors disabled:opacity-50 font-mono"
          />
        </div>

        {/* Nivel de Riesgo */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground h-6">
            <Shield className="w-4 h-4 text-accent-cyan" />
            Nivel de Riesgo
          </label>
          <div className="flex flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.nivelesRiesgo?.includes("high") || false}
                onChange={() => handleRiskLevelToggle("high")}
                disabled={isLoading}
                className="w-4 h-4 rounded border-border text-alert-high focus:ring-alert-high focus:ring-2 disabled:opacity-50"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                Alto
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.nivelesRiesgo?.includes("medium") || false}
                onChange={() => handleRiskLevelToggle("medium")}
                disabled={isLoading}
                className="w-4 h-4 rounded border-border text-alert-medium focus:ring-alert-medium focus:ring-2 disabled:opacity-50"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                Medio
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.nivelesRiesgo?.includes("low") || false}
                onChange={() => handleRiskLevelToggle("low")}
                disabled={isLoading}
                className="w-4 h-4 rounded border-border text-alert-low focus:ring-alert-low focus:ring-2 disabled:opacity-50"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                Bajo
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Search className="w-4 h-4" />
            <span>
              {Object.keys(filters).length} filtro{Object.keys(filters).length > 1 ? 's' : ''} activo{Object.keys(filters).length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}