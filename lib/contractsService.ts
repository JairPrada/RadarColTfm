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
import { ContratoAnalisisApiResponse, ContractAnalysis, ApiAnalysisModel } from "@/types/analysis";
import { apiConfig } from "@/lib/env";
import { getMockContracts } from "@/data/mockContracts";
import { mockAnalyses } from "@/data/mockAnalysis";

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
  nivelesRiesgo?: ("high" | "medium" | "low")[]; // Filtro por nivel de riesgo (cliente)
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
  // Parsear monto: remover caracteres no numéricos excepto punto y guión
  const montoLimpio = apiContract.Monto.toString().replace(/[^0-9.-]/g, '');
  const monto = parseFloat(montoLimpio);
  
  return {
    id: apiContract.Contrato.Codigo,
    nombreContrato: apiContract.Contrato.Descripcion,
    entidad: apiContract.Entidad,
    monto: isNaN(monto) ? 0 : monto,
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
    
    console.log("🌐 Llamando al API:", {
      url,
      filters,
      limit,
      baseUrl: apiConfig.baseUrl
    });
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Configuración para evitar problemas de CORS en desarrollo
      cache: "no-cache",
    });

    console.log("📡 Respuesta del servidor:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error del servidor:", errorText);
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}\nDetalle: ${errorText}`);
    }

    const apiResponse: ContractsApiResponse = await response.json();
    console.log("✅ Datos recibidos del API:", {
      totalContratos: apiResponse.totalContratosAnalizados,
      contratosLength: apiResponse.contratos?.length || 0,
      primerosContratos: apiResponse.contratos?.slice(0, 2) || []
    });
    
    // Validación básica de la respuesta
    if (!apiResponse.contratos || !Array.isArray(apiResponse.contratos)) {
      console.error("❌ Estructura de respuesta inválida:", apiResponse);
      throw new Error("Respuesta del API inválida: falta el array de contratos");
    }

    // Validar que los contratos tengan la estructura esperada
    const validContracts = apiResponse.contratos.filter(contract => {
      const isValid = contract?.Contrato?.Codigo && 
                     contract?.Entidad && 
                     contract?.Monto !== undefined &&
                     contract?.NivelRiesgo &&
                     contract?.Anomalia !== undefined;
      if (!isValid) {
        console.warn("⚠️ Contrato inválido filtrado:", contract);
      }
      return isValid;
    });

    console.log("🔍 Contratos validados:", {
      original: apiResponse.contratos.length,
      validos: validContracts.length,
      filtrados: apiResponse.contratos.length - validContracts.length
    });

    // Transforma los contratos al formato interno
    const contracts = validContracts.map(transformApiContract);

    console.log("🔄 Contratos transformados:", {
      cantidad: contracts.length,
      ejemplo: contracts[0] || null
    });

    return {
      apiResponse: {
        ...apiResponse,
        contratos: validContracts
      },
      contracts,
    };
  } catch (error) {
    // Log del error para debugging
    console.error("💥 Error fetching contracts:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: `${apiConfig.baseUrl}${apiConfig.endpoints.contratos}`,
      filters
    });
    
    // Re-lanzar el error con mensaje descriptivo
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`🚫 No se puede conectar al servidor API en ${apiConfig.baseUrl}

📋 INSTRUCCIONES:
1️⃣ Verifica que el servidor API esté ejecutándose en http://localhost:8000
2️⃣ Confirma que esté usando el puerto correcto
3️⃣ Prueba la URL manualmente: ${apiConfig.baseUrl}${apiConfig.endpoints.contratos}
4️⃣ Verifica la configuración NEXT_PUBLIC_API_BASE_URL en .env.local

💡 COMANDOS TÍPICOS:
• python -m uvicorn main:app --port 8000
• python app.py
• node server.js

🔧 Variables de entorno:
• NEXT_PUBLIC_API_BASE_URL=${apiConfig.baseUrl}`);
    }
    
    if (error instanceof Error && error.message.includes("HTTP")) {
      throw new Error(`❌ Error del servidor API (${error.message})

El servidor está ejecutándose pero devolvió un error.
Verifica los logs del servidor API para más detalles.

🔗 URL: ${apiConfig.baseUrl}${apiConfig.endpoints.contratos}`);
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
    // Porcentaje calculado
    porcentajeAltoRiesgo: apiResponse.totalContratosAnalizados > 0 
      ? (apiResponse.contratosAltoRiesgo / apiResponse.totalContratosAnalizados) * 100
      : 0
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

/**
 * Transforma el análisis del API al formato interno
 * 
 * @param apiAnalysis - Análisis del API
 * @returns Análisis en formato interno con Date objects
 */
function transformApiAnalysis(apiAnalysis: ApiAnalysisModel): ContractAnalysis {
  return {
    contractId: apiAnalysis.contractId,
    resumenEjecutivo: apiAnalysis.resumenEjecutivo,
    factoresPrincipales: apiAnalysis.factoresPrincipales,
    recomendaciones: apiAnalysis.recomendaciones,
    shapValues: apiAnalysis.shapValues.map(shap => ({
      variable: shap.variable,
      value: shap.value,
      description: shap.description,
      actualValue: shap.actualValue,
    })),
    probabilidadBase: apiAnalysis.probabilidadBase,
    confianza: apiAnalysis.confianza,
    fechaAnalisis: new Date(apiAnalysis.fechaAnalisis),
  };
}

/**
 * Obtiene un análisis mock para un contrato específico
 * Utilizado como fallback cuando el API no está disponible
 */
function getMockAnalysisForContract(contractId: string): { contract: Contract; analysis: ContractAnalysis } {
  const mockData = getMockContracts();
  const contract = mockData.contracts.find(c => c.id === contractId);
  
  if (!contract) {
    // Si no existe el contrato, usar el primero disponible
    const firstContract = mockData.contracts[0];
    const firstAnalysis = Object.values(mockAnalyses)[0];
    
    return {
      contract: { ...firstContract, id: contractId },
      analysis: { ...firstAnalysis, contractId }
    };
  }
  
  const analysis = mockAnalyses[contractId] || Object.values(mockAnalyses)[0];
  
  return {
    contract,
    analysis: { ...analysis, contractId }
  };
}

/**
 * Obtiene el análisis detallado de un contrato específico desde el API
 * 
 * @param contractId - ID del contrato a analizar
 * @returns Promise con el contrato y su análisis
 * @throws Error si la llamada al API falla o el contrato no existe
 */
export async function fetchContractAnalysis(contractId: string): Promise<{
  contract: Contract;
  analysis: ContractAnalysis;
}> {
  try {
    const url = `${apiConfig.baseUrl}${apiConfig.endpoints.analisisContrato(contractId)}`;
    
    console.log('🔍 [API] Obteniendo análisis para contrato:', contractId);
    console.log('🔍 [API] URL:', url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    });
    
    console.log('✅ [API] Status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Contrato con ID "${contractId}" no encontrado`);
      }
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const apiResponse: ContratoAnalisisApiResponse = await response.json();
    
    console.log('📦 [API] Respuesta completa del API:', JSON.stringify(apiResponse, null, 2));
    console.log('📦 [API] Análisis recibido:', {
      contractId: apiResponse.contract.id,
      nivelRiesgo: apiResponse.contract.nivelRiesgo,
      anomalia: apiResponse.contract.anomalia,
      shapValues: apiResponse.analysis.shapValues?.length || 0,
      hasAnalysis: !!apiResponse.analysis,
      analysisKeys: Object.keys(apiResponse.analysis || {})
    });
    
    // Validación básica de la respuesta
    if (!apiResponse.contract || !apiResponse.analysis) {
      throw new Error("Respuesta del API inválida: faltan datos del contrato o análisis");
    }

    // Transforma el contrato al formato interno
    const monto = parseFloat(apiResponse.contract.monto.toString().replace(/[^0-9.-]/g, ''));
    
    const contract: Contract = {
      id: apiResponse.contract.codigo, // Usar código como ID
      nombreContrato: apiResponse.contract.descripcion,
      entidad: apiResponse.contract.entidad,
      monto: isNaN(monto) ? 0 : monto, // Parsear string numérico a number, 0 si inválido
      fecha: apiResponse.contract.fechaInicio ? new Date(apiResponse.contract.fechaInicio) : null,
      nivelRiesgo: apiResponse.contract.nivelRiesgo === "Alto" ? "high" : apiResponse.contract.nivelRiesgo === "Medio" ? "medium" : "low",
      probabilidadAnomalia: apiResponse.contract.anomalia,
    };
    
    console.log('🔄 [API] Contrato transformado:', {
      id: contract.id,
      monto: contract.monto,
      montoOriginal: apiResponse.contract.monto,
      nivelRiesgo: contract.nivelRiesgo
    });

    // Transforma el análisis al formato interno
    const analysis = transformApiAnalysis(apiResponse.analysis);

    return {
      contract,
      analysis,
    };
  } catch (error) {
    console.error("❌ [API] Error obteniendo análisis:", error);
    console.error("❌ [API] Tipo de error:", error instanceof TypeError ? 'TypeError (CORS/Network)' : error instanceof Error ? error.constructor.name : typeof error);
    
    // Usar datos mock como fallback cuando el API falla
    console.warn("⚠️ [API] Usando datos mock como fallback");
    return getMockAnalysisForContract(contractId);
  }
}