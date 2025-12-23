/**
 * Contratos API Service
 * 
 * Servicio para gestionar las llamadas al API de contratos
 * Patrón de diseño: Service Layer Pattern
 * - Abstrae la lógica de comunicación con el API
 * - Transforma datos del API al formato interno
 * - Manejo centralizado de errores
 * 
 * @module lib/contractsService
 */

import { ContractsApiResponse, ApiContract, Contract } from "@/types/contract";
import { apiConfig } from "@/lib/env";

/**
 * Interfaz para filtros de contratos basada en la API
 * Nota: limit se maneja ahora por paginación separada
 */
export interface ContractFilters {
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string; // YYYY-MM-DD
  valorMinimo?: number; // Mínimo: 0
  valorMaximo?: number; // Mínimo: 0
  nombreContrato?: string; // Mínimo 3 caracteres
  idContrato?: string; // ID específico
}

/**
 * Interfaz para configuración de paginación
 */
export interface PaginationConfig {
  page: number; // Página actual (1-based)
  pageSize: number; // Elementos por página (10, 25, 50, 100)
  totalItems: number; // Total de elementos
}

/**
 * Resultado de paginación con metadatos
 */
export interface PaginationResult<T> {
  data: T[]; // Datos de la página actual
  pagination: PaginationConfig;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

/**
 * Convierte el nivel de riesgo de la API al formato interno
 */
function normalizeRiskLevel(apiLevel: "Alto" | "Medio" | "Bajo"): "high" | "medium" | "low" {
  switch (apiLevel) {
    case "Alto":
      return "high";
    case "Medio":
      return "medium";
    case "Bajo":
      return "low";
    default:
      return "low";
  }
}

/**
 * Transforma un contrato del API al formato interno
 */
function transformApiContract(apiContract: ApiContract): Contract {
  return {
    id: apiContract.Contrato.Codigo,
    nombreContrato: apiContract.Contrato.Descripcion,
    entidad: apiContract.Entidad,
    monto: parseInt(apiContract.Monto, 10),
    fecha: apiContract.FechaInicio ? new Date(apiContract.FechaInicio) : null,
    nivelRiesgo: normalizeRiskLevel(apiContract.NivelRiesgo),
    probabilidadAnomalia: apiContract.Anomalia,
  };
}

/**
 * Construye query parameters para la API basado en filtros
 * Nota: limit se maneja por separado en la paginación
 */
function buildQueryParams(filters?: ContractFilters, limit?: number): string {
  const params = new URLSearchParams();
  
  // Agregar límite si se especifica (para obtener todos los datos)
  if (limit !== undefined) {
    params.append("limit", Math.min(Math.max(limit, 1), 100).toString());
  }
  
  if (filters?.fechaDesde) {
    params.append("fecha_desde", filters.fechaDesde);
  }
  
  if (filters?.fechaHasta) {
    params.append("fecha_hasta", filters.fechaHasta);
  }
  
  if (filters?.valorMinimo !== undefined && filters.valorMinimo >= 0) {
    params.append("valor_minimo", filters.valorMinimo.toString());
  }
  
  if (filters?.valorMaximo !== undefined && filters.valorMaximo >= 0) {
    params.append("valor_maximo", filters.valorMaximo.toString());
  }
  
  if (filters?.nombreContrato && filters.nombreContrato.length >= 3) {
    params.append("nombre_contrato", filters.nombreContrato);
  }
  
  if (filters?.idContrato) {
    params.append("id_contrato", filters.idContrato);
  }
  
  return params.toString() ? `?${params.toString()}` : "";
}

/**
 * Obtiene contratos desde la API con filtros opcionales
 * 
 * @param filters - Filtros opcionales para la consulta
 * @param limit - Límite de contratos a obtener (opcional, por defecto sin límite)
 * @returns Promise con la respuesta completa de la API y contratos transformados
 * @throws Error si la llamada al API falla
 */
export async function fetchContracts(filters?: ContractFilters, limit?: number): Promise<{
  apiResponse: ContractsApiResponse;
  contracts: Contract[];
}> {
  try {
    const queryParams = buildQueryParams(filters, limit);
    const url = `${apiConfig.baseUrl}${apiConfig.endpoints.contratos}${queryParams}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Configuración para evitar problemas de CORS en desarrollo
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const apiResponse: ContractsApiResponse = await response.json();
    
    // Validación básica de la respuesta
    if (!apiResponse.contratos || !Array.isArray(apiResponse.contratos)) {
      throw new Error("Respuesta del API inválida: falta el array de contratos");
    }

    // Transforma los contratos al formato interno
    const contracts = apiResponse.contratos.map(transformApiContract);

    return {
      apiResponse,
      contracts,
    };
  } catch (error) {
    // Log del error para debugging
    console.error("Error fetching contracts:", error);
    
    // Re-lanza el error con mensaje más descriptivo
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`🚫 No se puede conectar al servidor API en ${apiConfig.baseUrl}

📋 INSTRUCCIONES:
1️⃣ Verifica que el servidor API esté ejecutándose
2️⃣ Confirma que esté usando el puerto 8000
3️⃣ Prueba la URL manualmente: ${apiConfig.baseUrl}${apiConfig.endpoints.contratos}

💡 COMANDOS TÍPICOS:
• python -m uvicorn main:app --port 8000
• python app.py
• node server.js

🔧 Si el API usa otro puerto, configura NEXT_PUBLIC_API_BASE_URL en .env.local`);
    }
    
    if (error instanceof Error && error.message.includes("HTTP")) {
      throw new Error(`❌ Error del servidor API (${error.message})

El servidor está ejecutándose pero devolvió un error.
Verifica los logs del servidor API para más detalles.`);
    }
    
    throw error instanceof Error ? error : new Error("Error desconocido al obtener contratos");
  }
}

/**
 * Hook personalizado para obtener estadísticas del dashboard
 */
export function getDashboardStats(contracts: Contract[], apiResponse: ContractsApiResponse) {
  const total = contracts.length;
  const highRisk = contracts.filter((c) => c.nivelRiesgo === "high").length;
  const totalAmount = contracts.reduce((sum, c) => sum + c.monto, 0);
  const avgAnomaly = contracts.length > 0 
    ? contracts.reduce((sum, c) => sum + c.probabilidadAnomalia, 0) / contracts.length 
    : 0;

  return {
    total,
    highRisk,
    totalAmount,
    avgAnomaly: Math.round(avgAnomaly),
    // Estadísticas adicionales de la API
    totalContratosAnalizados: apiResponse.totalContratosAnalizados,
    contratosAltoRiesgo: apiResponse.contratosAltoRiesgo,
    montoTotalCOP: apiResponse.montoTotalCOP,
  };
}

/**
 * Pagina una lista de elementos
 */
export function paginateData<T>(
  data: T[], 
  page: number, 
  pageSize: number
): PaginationResult<T> {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  console.log('📄 paginateData llamado:', {
    totalItems,
    page,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    resultLength: paginatedData.length
  });

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      totalItems,
    },
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalPages,
  };
}

/**
 * Formatea monto grande a billones/millones
 */
export function formatLargeAmount(amount: number): string {
  if (amount >= 1e12) {
    return `$${(amount / 1e12).toFixed(1)}T`;
  }
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  }
  return `$${(amount / 1e6).toFixed(0)}M`;
}