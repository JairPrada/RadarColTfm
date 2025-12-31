/**
 * ContractTable - Tabla de contratos con animaciones y diseño responsive
 *
 * Patrón de diseño: Presentation Component + Adapter Pattern
 * - Presentation: Componente enfocado en UI sin lógica de negocio
 * - Adapter: Transforma datos de Contract a formato visual
 *
 * Características:
 * - Responsive: Cards en mobile, tabla en desktop
 * - Animaciones de entrada con Framer Motion
 * - Click en fila navega al detalle
 * - Formato de moneda y fechas localizados
 * - Accesibilidad completa
 *
 * @component
 */

"use client";

import { motion } from "framer-motion";
import { Calendar, Building2, DollarSign, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Contract } from "@/types/contract";
import { Badge } from "@/components/ui/Badge";

export type SortField = 'id' | 'entidad' | 'monto' | 'fecha' | 'nivelRiesgo' | 'probabilidadAnomalia';
export type SortDirection = 'asc' | 'desc';

interface ContractTableProps {
  contracts: Contract[];
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

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
 * Formatea una fecha a formato corto español (dd/mm/yyyy)
 */
const formatDate = (date: Date | null): string => {
  if (!date) {
    return "N/A";
  }
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

/**
 * Mapeo de nivel de riesgo a texto español
 */
const riskLevelText = {
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
};

/**
 * Componente para encabezados de tabla ordenables
 */
interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSortField?: SortField;
  currentSortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  align?: 'left' | 'right';
}

function SortableHeader({
  field,
  label,
  currentSortField,
  currentSortDirection,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  const isActive = currentSortField === field;
  
  return (
    <th
      className={`px-6 py-4 text-${align} text-sm font-semibold text-foreground cursor-pointer hover:bg-accent-cyan/5 transition-colors select-none group`}
      onClick={() => onSort?.(field)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
        <span>{label}</span>
        <div className="w-4 h-4 flex items-center justify-center">
          {!isActive && (
            <ArrowUpDown className="w-4 h-4 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          {isActive && currentSortDirection === 'asc' && (
            <ArrowUp className="w-4 h-4 text-accent-cyan" />
          )}
          {isActive && currentSortDirection === 'desc' && (
            <ArrowDown className="w-4 h-4 text-accent-cyan" />
          )}
        </div>
      </div>
    </th>
  );
}

/**
 * Variantes de animación para la tabla
 * Optimizadas para cambio rápido de página
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Tabla principal de contratos
 *
 * @param {Contract[]} contracts - Lista de contratos a mostrar
 * @param {SortField} sortField - Campo actual de ordenamiento
 * @param {SortDirection} sortDirection - Dirección del ordenamiento
 * @param {Function} onSort - Callback para cambiar ordenamiento
 */
export function ContractTable({ contracts, sortField, sortDirection, onSort }: ContractTableProps) {
  // Caso: Sin contratos
  if (contracts.length === 0) {
    return (
      <div className="w-full px-6 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-4 text-foreground-muted">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-accent-cyan opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            No se encontraron resultados
          </h3>
          <p className="text-sm text-foreground-muted">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Vista Desktop: Tabla tradicional */}
      <div className="hidden lg:block overflow-x-auto">
        <motion.table
          className="w-full border-collapse"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <thead>
            <tr className="border-b border-border bg-background-light">
              <SortableHeader
                field="id"
                label="Contrato"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="entidad"
                label="Entidad"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="monto"
                label="Monto"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="fecha"
                label="Fecha"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="nivelRiesgo"
                label="Nivel de Riesgo"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                field="probabilidadAnomalia"
                label="Anomalía"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={onSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) => (
              <motion.tr
                key={contract.id}
                variants={rowVariants}
                className="border-b border-border hover:bg-accent-cyan/10 transition-all duration-200 cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <Link href={`/analysis/${contract.id}`} className="block">
                    <div className="font-medium text-foreground group-hover:text-accent-cyan transition-colors font-mono">
                      {contract.id}
                    </div>
                    <div className="text-sm text-foreground-muted group-hover:text-foreground mt-1 line-clamp-1 transition-colors">
                      {contract.nombreContrato}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-foreground-muted text-sm">
                    <Building2 className="w-4 h-4" />
                    <span className="line-clamp-2">{contract.entidad}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-foreground font-medium">
                    {formatCurrency(contract.monto)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-foreground-muted text-sm whitespace-nowrap">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="font-mono">
                      {formatDate(contract.fecha)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={contract.nivelRiesgo}>
                    {riskLevelText[contract.nivelRiesgo]}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono font-bold text-lg text-foreground">
                    {contract.probabilidadAnomalia}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>

      {/* Vista Mobile: Cards */}
      <motion.div
        className="lg:hidden space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {contracts.map((contract) => (
          <motion.div
            key={contract.id}
            variants={rowVariants}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={`/analysis/${contract.id}`}
              className="block p-4 bg-background-card border border-border rounded-lg hover:border-accent-cyan/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-accent-cyan mb-1">
                    {contract.id}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {contract.nombreContrato}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={contract.nivelRiesgo} size="sm">
                    {riskLevelText[contract.nivelRiesgo]}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{contract.entidad}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono font-medium text-foreground">
                    {formatCurrency(contract.monto)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{formatDate(contract.fecha)}</span>
                </div>
              </div>

              {/* Probability */}
              <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm text-foreground-muted">
                  Probabilidad de anomalía
                </span>
                <span className="font-mono font-bold text-lg text-accent-cyan">
                  {contract.probabilidadAnomalia}%
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
