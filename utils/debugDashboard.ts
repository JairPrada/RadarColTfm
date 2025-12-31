/**
 * Debug Utilities para Dashboard
 * 
 * Herramientas de debugging específicas para diagnosticar problemas del dashboard
 * Patrón: Debugging/Monitoring Pattern
 * - Centraliza funciones de diagnóstico
 * - Proporciona información detallada sobre el estado de la aplicación
 * - Facilita la resolución de problemas en producción
 * 
 * @module utils/debugDashboard
 */

import { Contract, ContractsApiResponse } from '@/types/contract';
import { apiConfig } from '@/lib/env';

/**
 * Información de diagnóstico del dashboard
 */
export interface DashboardDiagnostics {
  timestamp: string;
  environment: {
    nodeEnv: string;
    apiBaseUrl: string;
    isClient: boolean;
  };
  apiStatus: {
    reachable: boolean;
    responseTime?: number;
    error?: string;
  };
  dataStatus: {
    contracts: number;
    validContracts: number;
    riskLevels: Record<string, number>;
  };
}

/**
 * Verifica si el API está disponible
 */
export async function checkApiHealth(): Promise<{
  reachable: boolean;
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Verificando salud del API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.contratos}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        reachable: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    // Intentar parsear JSON para verificar que sea válido
    await response.json();
    
    console.log('✅ API disponible', { responseTime });
    return { reachable: true, responseTime };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    console.error('❌ API no disponible', { error: errorMessage, responseTime });
    return {
      reachable: false,
      responseTime,
      error: errorMessage
    };
  }
}

/**
 * Analiza el estado de los datos de contratos
 */
export function analyzeContractsData(contracts: Contract[]): {
  contracts: number;
  validContracts: number;
  riskLevels: Record<string, number>;
  issues: string[];
} {
  const issues: string[] = [];
  const riskLevels: Record<string, number> = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  let validContracts = 0;
  
  contracts.forEach((contract, index) => {
    let isValid = true;
    
    // Validar campos requeridos
    if (!contract.id) {
      issues.push(`Contrato ${index}: falta ID`);
      isValid = false;
    }
    
    if (!contract.nombreContrato) {
      issues.push(`Contrato ${index}: falta nombre`);
      isValid = false;
    }
    
    if (!contract.entidad) {
      issues.push(`Contrato ${index}: falta entidad`);
      isValid = false;
    }
    
    if (typeof contract.monto !== 'number' || contract.monto < 0) {
      issues.push(`Contrato ${index}: monto inválido (${contract.monto})`);
      isValid = false;
    }
    
    if (!['high', 'medium', 'low'].includes(contract.nivelRiesgo)) {
      issues.push(`Contrato ${index}: nivel de riesgo inválido (${contract.nivelRiesgo})`);
      isValid = false;
    }
    
    if (typeof contract.probabilidadAnomalia !== 'number' || 
        contract.probabilidadAnomalia < 0 || 
        contract.probabilidadAnomalia > 100) {
      issues.push(`Contrato ${index}: probabilidad de anomalía inválida (${contract.probabilidadAnomalia})`);
      isValid = false;
    }
    
    if (isValid) {
      validContracts++;
      riskLevels[contract.nivelRiesgo]++;
    }
  });
  
  return {
    contracts: contracts.length,
    validContracts,
    riskLevels,
    issues
  };
}

/**
 * Ejecuta diagnósticos completos del dashboard
 */
export async function runDashboardDiagnostics(contracts: Contract[] = []): Promise<DashboardDiagnostics> {
  console.log('🔬 Ejecutando diagnósticos del dashboard...');
  
  const timestamp = new Date().toISOString();
  const apiStatus = await checkApiHealth();
  const dataStatus = analyzeContractsData(contracts);
  
  const diagnostics: DashboardDiagnostics = {
    timestamp,
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      apiBaseUrl: apiConfig.baseUrl,
      isClient: typeof window !== 'undefined'
    },
    apiStatus,
    dataStatus
  };
  
  console.log('📊 Diagnósticos completos:', diagnostics);
  
  // Mostrar resumen en consola
  console.group('📋 Resumen de Diagnósticos');
  console.log('🌍 Entorno:', diagnostics.environment.nodeEnv);
  console.log('🔗 API URL:', diagnostics.environment.apiBaseUrl);
  console.log('📡 API disponible:', diagnostics.apiStatus.reachable ? '✅' : '❌');
  if (diagnostics.apiStatus.error) {
    console.log('❌ Error de API:', diagnostics.apiStatus.error);
  }
  console.log('📄 Contratos cargados:', diagnostics.dataStatus.contracts);
  console.log('✅ Contratos válidos:', diagnostics.dataStatus.validContracts);
  console.log('🚨 Distribución de riesgo:', diagnostics.dataStatus.riskLevels);
  console.groupEnd();
  
  return diagnostics;
}

/**
 * Muestra información de debugging en formato de tabla
 */
export function logDashboardState(state: {
  loading: boolean;
  error: string | null;
  contracts: Contract[];
  apiResponse: ContractsApiResponse | null;
  filters: any;
  pagination: any;
}) {
  console.group('🎯 Estado del Dashboard');
  
  console.table({
    'Estado de Carga': state.loading ? '⏳ Cargando' : '✅ Cargado',
    'Error': state.error || '✅ Sin errores',
    'Contratos Cargados': state.contracts.length,
    'Respuesta API': state.apiResponse ? '✅ Disponible' : '❌ No disponible',
    'Total API': state.apiResponse?.totalContratosAnalizados || 'N/A',
    'Filtros Activos': Object.keys(state.filters).length,
    'Página Actual': state.pagination.page,
    'Tamaño Página': state.pagination.pageSize
  });
  
  if (state.contracts.length > 0) {
    console.log('📊 Ejemplo de contrato:', state.contracts[0]);
  }
  
  if (state.error) {
    console.error('❌ Error detallado:', state.error);
  }
  
  console.groupEnd();
}

/**
 * Valida la estructura de datos del API
 */
export function validateApiResponse(data: any): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!data) {
    issues.push('Respuesta vacía o null');
    return { isValid: false, issues };
  }
  
  if (!data.metadata) {
    issues.push('Falta metadata');
  }
  
  if (typeof data.totalContratosAnalizados !== 'number') {
    issues.push('totalContratosAnalizados no es un número');
  }
  
  if (!Array.isArray(data.contratos)) {
    issues.push('contratos no es un array');
  } else {
    data.contratos.forEach((contrato: any, index: number) => {
      if (!contrato.Contrato?.Codigo) {
        issues.push(`Contrato ${index}: falta Codigo`);
      }
      if (!contrato.Entidad) {
        issues.push(`Contrato ${index}: falta Entidad`);
      }
      if (!contrato.NivelRiesgo || !['Alto', 'Medio', 'Bajo'].includes(contrato.NivelRiesgo)) {
        issues.push(`Contrato ${index}: NivelRiesgo inválido (${contrato.NivelRiesgo})`);
      }
    });
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}