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
import { Calendar, Building2, DollarSign } from "lucide-react";
import Link from "next/link";
import { Contract } from "@/types/contract";
import { Badge } from "@/components/ui/Badge";

interface ContractTableProps {
  contracts: Contract[];
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
 * Formatea una fecha a formato corto español
 */
const formatDate = (date: Date | null): string => {
  if (!date) {
    return "N/A";
  }
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
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
 * Variantes de animación para la tabla
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

/**
 * Tabla principal de contratos
 * 
 * @param {Contract[]} contracts - Lista de contratos a mostrar
 */
export function ContractTable({ contracts }: ContractTableProps) {
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Contrato
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Entidad
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Monto
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Nivel de Riesgo
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                Anomalía
              </th>
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
                  <Link
                    href={`/analysis/${contract.id}`}
                    className="block"
                  >
                    <div className="font-medium text-foreground group-hover:text-accent-cyan transition-colors">
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
                  <div className="flex items-center gap-2 text-foreground-muted text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(contract.fecha)}
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
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-accent-cyan mb-1">
                    {contract.id}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {contract.nombreContrato}
                  </h3>
                </div>
                <Badge variant={contract.nivelRiesgo} size="sm">
                  {riskLevelText[contract.nivelRiesgo]}
                </Badge>
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
