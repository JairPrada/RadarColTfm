/**
 * Dashboard Page - Vista principal de contratos analizados
 *
 * Patrón de diseño: Container/Presentation Pattern
 * - Esta página actúa como Container, proveyendo datos
 * - ContractTable es Presentation, solo renderiza
 *
 * Arquitectura: Client Component con animaciones
 * - Datos se cargan desde API usando useEffect
 * - Componentes animados con Framer Motion
 *
 * @page
 */

"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/ui/MainLayout";
import { ContractTable, FilterDrawer, type SortField, type SortDirection } from "@/components/dashboard";
import {
  AnimatedNumber,
  TablePagination,
} from "@/components/ui";
import {
  fetchContracts,
  getDashboardStats,
  formatLargeAmount,
  paginateData,
  type ContractFilters as FilterTypes,
  type PaginationResult,
} from "@/lib/contractsService";
import {
  runDashboardDiagnostics,
  logDashboardState,
  validateApiResponse
} from "@/utils/debugDashboard";
import { DebugPanel } from "@/components/debug/DebugPanel";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Percent,
  Filter,
  RefreshCw,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Contract, ContractsApiResponse } from "@/types/contract";
import Link from "next/link";

/**
 * Página del Dashboard - Ahora como Client Component con animaciones y filtros
 */
export default function DashboardPage() {
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [apiResponse, setApiResponse] = useState<ContractsApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterTypes>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [paginatedResult, setPaginatedResult] =
    useState<PaginationResult<Contract> | null>(null);
  const [sortField, setSortField] = useState<SortField | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  /**
   * Ordena los contratos según el campo y dirección especificados
   */
  const sortContracts = (contracts: Contract[], field?: SortField, direction: SortDirection = 'asc'): Contract[] => {
    if (!field) return contracts;

    return [...contracts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'entidad':
          aValue = a.entidad;
          bValue = b.entidad;
          break;
        case 'monto':
          aValue = a.monto;
          bValue = b.monto;
          break;
        case 'fecha':
          aValue = a.fecha ? a.fecha.getTime() : 0;
          bValue = b.fecha ? b.fecha.getTime() : 0;
          break;
        case 'nivelRiesgo':
          // Ordenar por prioridad: high > medium > low
          const riskOrder = { high: 3, medium: 2, low: 1 };
          aValue = riskOrder[a.nivelRiesgo];
          bValue = riskOrder[b.nivelRiesgo];
          break;
        case 'probabilidadAnomalia':
          aValue = a.probabilidadAnomalia;
          bValue = b.probabilidadAnomalia;
          break;
        default:
          return 0;
      }

      // Manejar valores null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? 1 : -1;
      if (bValue == null) return direction === 'asc' ? -1 : 1;

      // Comparación según el tipo
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue, 'es');
        return direction === 'asc' ? result : -result;
      }

      // Comparación numérica
      const result = aValue - bValue;
      return direction === 'asc' ? result : -result;
    });
  };

  /**
   * Maneja cambios en el ordenamiento
   */
  const handleSort = (field: SortField) => {
    console.log('🔄 Cambiando ordenamiento:', { field, currentField: sortField, currentDirection: sortDirection });
    
    if (sortField === field) {
      // Cambiar dirección si es el mismo campo
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, empezar con ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    async function loadContracts() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🚀 Iniciando carga de contratos con filtros:", filters);
        
        // Ejecutar diagnósticos iniciales
        await runDashboardDiagnostics();
        
        const { contracts, apiResponse } = await fetchContracts(filters);
        
        // Validar respuesta del API
        const validation = validateApiResponse(apiResponse);
        if (!validation.isValid) {
          console.warn("⚠️ Problemas con la respuesta del API:", validation.issues);
        }
        
        console.log("✅ Contratos recibidos de API:", {
          total: contracts.length,
          primerContrato: contracts[0],
          distribucionRiesgo: {
            alto: contracts.filter(c => c.nivelRiesgo === 'high').length,
            medio: contracts.filter(c => c.nivelRiesgo === 'medium').length,
            bajo: contracts.filter(c => c.nivelRiesgo === 'low').length
          }
        });

        // Filtrar por nivel de riesgo (lado del cliente)
        let filteredContracts = contracts;
        if (filters.nivelesRiesgo && filters.nivelesRiesgo.length > 0) {
          filteredContracts = contracts.filter(contract => 
            filters.nivelesRiesgo!.includes(contract.nivelRiesgo)
          );
          console.log("🔍 Contratos filtrados por nivel de riesgo:", {
            original: contracts.length,
            filtrado: filteredContracts.length,
            filtros: filters.nivelesRiesgo
          });
        }

        // Aplicar ordenamiento antes de paginar
        const sortedContracts = sortContracts(filteredContracts, sortField, sortDirection);

        setAllContracts(sortedContracts);
        setApiResponse(apiResponse);

        // Aplicar paginación inmediatamente después de cargar
        const currentPageSize = pagination.pageSize;
        const initialPagination = {
          page: 1,
          pageSize: currentPageSize,
          totalItems: sortedContracts.length,
        };
        setPagination(initialPagination);

        // Calcular resultado paginado inmediatamente
        const result = paginateData(sortedContracts, 1, currentPageSize);
        console.log("📄 Paginación inicial aplicada:", {
          totalContratos: sortedContracts.length,
          pageSize: currentPageSize,
          totalPages: result.totalPages,
          dataInPage: result.data.length,
        });
        setPaginatedResult(result);
        
        // Ejecutar diagnósticos finales con datos cargados
        await runDashboardDiagnostics(sortedContracts);
        
      } catch (error) {
        console.error("💥 Error loading contracts:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        setError(errorMessage);
        
        // Log del estado para debugging
        logDashboardState({
          loading: false,
          error: errorMessage,
          contracts: [],
          apiResponse: null,
          filters,
          pagination
        });
      } finally {
        setLoading(false);
      }
    }

    loadContracts();
  }, [filters, pagination.pageSize, sortField, sortDirection]); // Depende de filtros, pageSize y ordenamiento

  /**
   * Maneja cambios en los filtros (aplicados desde el drawer)
   */
  const handleApplyFilters = (newFilters: FilterTypes) => {
    console.log("Aplicando filtros:", newFilters);
    setFilters(newFilters);
  };

  /**
   * Maneja cambios de página
   */
  const handlePageChange = (newPage: number) => {
    console.log(
      "Cambiando a página:",
      newPage,
      "| Total contratos:",
      allContracts.length
    );

    if (allContracts.length === 0) {
      console.warn("No hay contratos para paginar");
      return;
    }

    // Capturar pageSize actual ANTES de setState para evitar stale closure
    const currentPageSize = pagination.pageSize;

    setPagination((prev) => ({ ...prev, page: newPage }));

    // Aplicar paginación con valores explícitos
    const result = paginateData(allContracts, newPage, currentPageSize);
    console.log("Paginación aplicada:", {
      page: newPage,
      pageSize: currentPageSize,
      totalPages: result.totalPages,
      dataLength: result.data.length,
    });
    setPaginatedResult(result);
  };

  /**
   * Maneja cambios de tamaño de página
   */
  const handlePageSizeChange = (newPageSize: number) => {
    console.log(
      "Cambiando tamaño de página:",
      newPageSize,
      "| Total contratos:",
      allContracts.length
    );

    if (allContracts.length === 0) {
      console.warn("No hay contratos para paginar");
      return;
    }

    // Resetear a página 1 cuando cambia el tamaño
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1,
    }));

    // Aplicar paginación con valores explícitos
    const result = paginateData(allContracts, 1, newPageSize);
    console.log("Paginación aplicada:", {
      page: 1,
      pageSize: newPageSize,
      totalPages: result.totalPages,
      dataLength: result.data.length,
    });
    setPaginatedResult(result);
  };

  /**
   * Cuenta filtros activos
   */
  const activeFiltersCount = Object.keys(filters).length;

  // Estado de carga
  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <motion.div
              className="inline-block w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h2 className="text-lg font-semibold text-foreground mt-4 mb-2">
              Cargando Dashboard...
            </h2>
            <p className="text-sm text-foreground-muted">
              Obteniendo datos del API de contratos
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Estado de error
  if (error || !apiResponse) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
            </motion.div>

            <h2 className="text-xl font-semibold text-foreground mb-3">
              No se pudieron cargar los contratos
            </h2>

            <p className="text-sm text-foreground-muted mb-6 max-w-md mx-auto">
              No se pudo conectar con el servidor. Por favor, intenta
              nuevamente.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan-glow transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-background-light border border-border text-foreground rounded-lg hover:bg-background-card transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Ir al Inicio
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Variables derivadas
  const currentContracts = paginatedResult?.data || [];
  const stats = apiResponse ? getDashboardStats(allContracts, apiResponse) : null;

  // Log simple del estado actual para debugging (sin useEffect para evitar problemas de hooks)
  console.log("🎯 Estado de renderizado:", {
    loading,
    error: !!error,
    allContracts: allContracts.length,
    paginatedResult: paginatedResult ? {
      page: paginatedResult.pagination.page,
      pageSize: paginatedResult.pagination.pageSize,
      totalItems: paginatedResult.pagination.totalItems,
      dataLength: paginatedResult.data.length
    } : null,
    currentContracts: currentContracts.length,
    stats: stats ? {
      total: stats.totalContratosAnalizados,
      altoRiesgo: stats.contratosAltoRiesgo,
      porcentajeRiesgo: stats.porcentajeAltoRiesgo
    } : null
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Dashboard de Análisis
          </h1>
          <p className="text-foreground-muted mb-2">
            Contratos públicos analizados por RadarCol
          </p>
          <motion.div
            className="text-sm text-foreground-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Fuente:{" "}
            <span className="text-accent-cyan font-medium">
              {apiResponse?.metadata.fuenteDatos || 'Cargando...'}
            </span>
            {(apiResponse?.metadata.camposSimulados?.length || 0) > 0 && (
              <span className="ml-4">
                • Campos simulados:{" "}
                {apiResponse?.metadata.camposSimulados?.join(", ")}
              </span>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
        >
          {/* Total Contratos */}
          <motion.div
            className="p-6 bg-background-card border border-border rounded-xl hover:bg-background-card/80 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-accent-cyan" />
              <AnimatedNumber
                value={stats?.totalContratosAnalizados || 0}
                duration={2}
                delay={0.2}
                className="text-2xl md:text-3xl font-bold font-mono"
              />
            </div>
            <div className="text-sm text-foreground-muted">
              Total Contratos Analizados
            </div>
          </motion.div>

          {/* Alto Riesgo */}
          <motion.div
            className="p-6 bg-background-card border border-border rounded-xl hover:bg-background-card/80 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle
                className="w-8 h-8  text-alert-high"
              />
              <AnimatedNumber
                value={stats?.contratosAltoRiesgo || 0}
                duration={2}
                delay={0.4}
                className="text-2xl md:text-3xl font-bold font-mono"
              />
            </div>
            <div className="text-sm text-foreground-muted">
              Contratos de Alto Riesgo
            </div>
          </motion.div>

          {/* Monto Total */}
          <motion.div
            className="p-6 bg-background-card border border-border rounded-xl hover:bg-background-card/80 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-accent-violet" />
              <AnimatedNumber
                value={stats?.montoTotalCOP || 0}
                duration={2.5}
                delay={0.6}
                formatter={(val) => formatLargeAmount(val)}
                className="text-2xl md:text-3xl font-bold font-mono text-foreground"
              />
            </div>
            <div className="text-sm text-foreground-muted">
              Monto Total en COP
            </div>
          </motion.div>

          {/* Porcentaje de Riesgo */}
          <motion.div
            className="p-6 bg-background-card border border-border rounded-xl hover:bg-background-card/80 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Percent className="w-8 h-8 text-accent-cyan" />
              <AnimatedNumber
                value={
                  stats ? 
                    (stats.contratosAltoRiesgo / stats.totalContratosAnalizados) * 100 
                    : 0
                }
                duration={2.5}
                delay={0.8}
                formatter={(val) => `${val.toFixed(1)}%`}
                className="text-2xl md:text-3xl font-bold font-mono"
              />
            </div>
            <div className="text-sm text-foreground-muted">
              Porcentaje Alto Riesgo
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section con Botón de Filtros */}
        <div className="mb-6 p-4 bg-background-card border border-border rounded-lg hover:bg-background-card/80 transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-foreground-muted">
                <BarChart3 className="w-4 h-4 text-accent-cyan" />
                Mostrando{" "}
                <AnimatedNumber
                  value={currentContracts.length}
                  duration={1.5}
                  delay={1}
                  className="font-mono font-bold text-accent-cyan"
                />{" "}
                contratos de{" "}
                <AnimatedNumber
                  value={stats?.totalContratosAnalizados || 0}
                  duration={2}
                  delay={1.2}
                  className="font-mono font-bold text-accent-cyan"
                />{" "}
                analizados
              </span>
              <span className="text-sm text-foreground-muted">
                • Anomalía promedio:{" "}
                <AnimatedNumber
                  value={stats?.avgAnomaly || 0}
                  duration={1.5}
                  delay={1.4}
                  formatter={(val) => `${val}%`}
                  className="font-mono font-bold text-accent-cyan"
                />
              </span>
            </div>

            {/* Botón de Filtros */}
            <motion.button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan-glow transition-colors font-medium relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <motion.span
                  className="absolute -top-2 -right-2 bg-alert-high text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {activeFiltersCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Table */}
        <motion.div
          className="bg-background-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-500 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          key={`table-${pagination.page}`}
        >
          <ContractTable 
            contracts={currentContracts} 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </motion.div>

        {/* Paginación */}
        {paginatedResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
          >
            <TablePagination
              pagination={paginatedResult.pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              totalPages={paginatedResult.totalPages}
              hasNextPage={paginatedResult.hasNextPage}
              hasPrevPage={paginatedResult.hasPrevPage}
            />
          </motion.div>
        )}

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          onApplyFilters={handleApplyFilters}
          isLoading={loading}
          activeFiltersCount={activeFiltersCount}
        />
      </div>
      
      {/* Debug Panel - Solo en desarrollo */}
      <DebugPanel
        contracts={allContracts}
        apiResponse={apiResponse}
        loading={loading}
        error={error}
        filters={filters}
        pagination={pagination}
      />
    </MainLayout>
  );
}
