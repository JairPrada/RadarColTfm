/**
 * DebugPanel Component - Panel de debugging para el dashboard
 *
 * Componente de desarrollo que proporciona información detallada
 * sobre el estado de la aplicación y diagnósticos del dashboard
 *
 * @component
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  X,
  Wifi,
  WifiOff,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Contract, ContractsApiResponse } from "@/types/contract";
import { runDashboardDiagnostics, checkApiHealth } from "@/utils/debugDashboard";

interface DebugPanelProps {
  contracts: Contract[];
  apiResponse: ContractsApiResponse | null;
  loading: boolean;
  error: string | null;
  filters: any;
  pagination: any;
}

export function DebugPanel({
  contracts,
  apiResponse,
  loading,
  error,
  filters,
  pagination,
}: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiHealthStatus, setApiHealthStatus] = useState<{
    checking: boolean;
    result: any;
  }>({ checking: false, result: null });

  const handleCheckApi = async () => {
    setApiHealthStatus({ checking: true, result: null });
    try {
      const result = await checkApiHealth();
      setApiHealthStatus({ checking: false, result });
    } catch (error) {
      setApiHealthStatus({
        checking: false,
        result: { reachable: false, error: "Error checking API" },
      });
    }
  };

  const handleFullDiagnostics = async () => {
    console.log("🔬 Ejecutando diagnósticos completos...");
    await runDashboardDiagnostics(contracts);
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Clock className="w-4 h-4 text-yellow-500" />;
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      {/* Botón de debug flotante */}
      <motion.button
        className="fixed bottom-4 right-4 z-50 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Abrir panel de debugging"
      >
        {isOpen ? <EyeOff className="w-6 h-6" /> : <Bug className="w-6 h-6" />}
      </motion.button>

      {/* Panel de debug */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l border-border shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold">Debug Dashboard</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-background-card rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-6">
                {/* Estado General */}
                <div className="bg-background-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Estado General
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Loading:</span>
                      <span className={loading ? "text-yellow-500" : "text-green-500"}>
                        {loading ? "Cargando..." : "Completo"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Error:</span>
                      {getStatusIcon(!error)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Contratos:</span>
                      <span className="font-mono">{contracts.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Response:</span>
                      {getStatusIcon(!!apiResponse)}
                    </div>
                  </div>
                </div>

                {/* API Health */}
                <div className="bg-background-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      {apiHealthStatus.result?.reachable ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      Estado del API
                    </h3>
                    <button
                      onClick={handleCheckApi}
                      disabled={apiHealthStatus.checking}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50"
                    >
                      {apiHealthStatus.checking ? "Verificando..." : "Verificar"}
                    </button>
                  </div>

                  {apiHealthStatus.result && (
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <span
                          className={`font-semibold ${
                            apiHealthStatus.result.reachable
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {apiHealthStatus.result.reachable
                            ? "Disponible"
                            : "No disponible"}
                        </span>
                      </div>
                      {apiHealthStatus.result.responseTime && (
                        <div className="flex justify-between">
                          <span>Tiempo de respuesta:</span>
                          <span className="font-mono">
                            {apiHealthStatus.result.responseTime}ms
                          </span>
                        </div>
                      )}
                      {apiHealthStatus.result.error && (
                        <div className="text-red-500 text-xs mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          {apiHealthStatus.result.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Distribución de Riesgo */}
                {contracts.length > 0 && (
                  <div className="bg-background-card border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Distribución de Riesgo</h3>
                    <div className="space-y-2">
                      {["high", "medium", "low"].map((level) => {
                        const count = contracts.filter(
                          (c) => c.nivelRiesgo === level
                        ).length;
                        const percentage =
                          contracts.length > 0
                            ? ((count / contracts.length) * 100).toFixed(1)
                            : "0";
                        return (
                          <div
                            key={level}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="capitalize">
                              {level === "high"
                                ? "Alto"
                                : level === "medium"
                                ? "Medio"
                                : "Bajo"}
                            </span>
                            <span className="font-mono">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                      Detalles del Error
                    </h3>
                    <pre className="text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                      {error}
                    </pre>
                  </div>
                )}

                {/* Raw Data */}
                <div className="bg-background-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Datos en Bruto</h3>
                  <div className="text-xs space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Filtros:</h4>
                      <pre className="bg-background p-2 rounded overflow-x-auto">
                        {JSON.stringify(filters, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Paginación:</h4>
                      <pre className="bg-background p-2 rounded overflow-x-auto">
                        {JSON.stringify(pagination, null, 2)}
                      </pre>
                    </div>
                    {apiResponse && (
                      <div>
                        <h4 className="font-medium mb-2">API Response (sample):</h4>
                        <pre className="bg-background p-2 rounded overflow-x-auto">
                          {JSON.stringify(
                            {
                              metadata: apiResponse.metadata,
                              totalContratosAnalizados:
                                apiResponse.totalContratosAnalizados,
                              contratosAltoRiesgo: apiResponse.contratosAltoRiesgo,
                              contratosCount: apiResponse.contratos?.length || 0,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-background-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Acciones de Debug</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleFullDiagnostics}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    >
                      Ejecutar Diagnósticos Completos
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Recargar Dashboard
                    </button>
                    <button
                      onClick={() =>
                        console.log("Dashboard State:", {
                          contracts,
                          apiResponse,
                          loading,
                          error,
                          filters,
                          pagination,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                    >
                      Log Estado a Consola
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}