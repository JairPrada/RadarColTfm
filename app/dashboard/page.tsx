/**
 * Dashboard Page - Vista principal de contratos analizados
 * 
 * Patrón de diseño: Container/Presentation Pattern
 * - Esta página actúa como Container, proveyendo datos
 * - ContractTable es Presentation, solo renderiza
 * 
 * Arquitectura: Server Component (Next.js)
 * - Datos se cargan en el servidor
 * - Solo componentes interactivos usan 'use client'
 * 
 * @page
 */

import { MainLayout } from "@/components/ui/MainLayout";
import { ContractTable } from "@/components/dashboard/ContractTable";
import { mockContracts } from "@/data/mockContracts";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";

/**
 * Calcula estadísticas del dashboard
 */
function getDashboardStats() {
  const total = mockContracts.length;
  const highRisk = mockContracts.filter((c) => c.nivelRiesgo === "high").length;
  const totalAmount = mockContracts.reduce((sum, c) => sum + c.monto, 0);
  const avgAnomaly =
    mockContracts.reduce((sum, c) => sum + c.probabilidadAnomalia, 0) / total;

  return {
    total,
    highRisk,
    totalAmount,
    avgAnomaly: Math.round(avgAnomaly),
  };
}

/**
 * Formatea monto grande a billones/millones
 */
function formatLargeAmount(amount: number): string {
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  }
  return `$${(amount / 1e6).toFixed(0)}M`;
}

/**
 * Página del Dashboard
 */
export default function DashboardPage() {
  const stats = getDashboardStats();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Dashboard de Análisis
          </h1>
          <p className="text-foreground-muted">
            Contratos públicos analizados por RadarCol
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Contratos */}
          <div className="p-6 bg-background-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-accent-cyan" />
              <span className="text-2xl md:text-3xl font-bold font-mono text-foreground">
                {stats.total}
              </span>
            </div>
            <div className="text-sm text-foreground-muted">
              Total Contratos Analizados
            </div>
          </div>

          {/* Alto Riesgo */}
          <div className="p-6 bg-background-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-alert-high" />
              <span className="text-2xl md:text-3xl font-bold font-mono text-alert-high">
                {stats.highRisk}
              </span>
            </div>
            <div className="text-sm text-foreground-muted">
              Contratos de Alto Riesgo
            </div>
          </div>

          {/* Monto Total */}
          <div className="p-6 bg-background-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-accent-violet" />
              <span className="text-2xl md:text-3xl font-bold font-mono text-foreground">
                {formatLargeAmount(stats.totalAmount)}
              </span>
            </div>
            <div className="text-sm text-foreground-muted">
              Monto Total en COP
            </div>
          </div>
        </div>

        {/* Filters Section (Placeholder para futuro) */}
        <div className="mb-6 p-4 bg-background-card border border-border rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-foreground-muted">
              📊 Mostrando {stats.total} contratos
            </span>
            <span className="text-sm text-foreground-muted">
              • Anomalía promedio: <span className="font-mono font-bold text-accent-cyan">{stats.avgAnomaly}%</span>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-background-card border border-border rounded-xl overflow-hidden">
          <ContractTable contracts={mockContracts} />
        </div>
      </div>
    </MainLayout>
  );
}
