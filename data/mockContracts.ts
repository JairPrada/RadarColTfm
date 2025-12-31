/**
 * Mock Contract Data
 * 
 * Datos de prueba realistas para el dashboard de RadarCol
 * Incluye contratos públicos ficticios con entidades colombianas
 * 
 * @module data/mockContracts
 */

import { Contract } from "@/types/contract";

/**
 * Lista de contratos ficticios para testing y demostración
 * 
 * Datos generados considerando:
 * - Entidades públicas colombianas reales
 * - Montos en COP (pesos colombianos)
 * - Distribución realista de niveles de riesgo
 * - Fechas recientes
 */
export const mockContracts: Contract[] = [
  {
    id: "CONT-2024-001",
    nombreContrato: "Adquisición de equipos médicos de alta complejidad",
    entidad: "Ministerio de Salud y Protección Social",
    monto: 4500000000, // $4.500M COP
    fecha: new Date("2024-11-15"),
    nivelRiesgo: "high",
    probabilidadAnomalia: 87,
    contratista: "MediEquip Solutions S.A.S.",
    objeto: "Suministro de equipos de diagnóstico y monitoreo",
  },
  {
    id: "CONT-2024-002",
    nombreContrato: "Construcción de vías terciarias rurales",
    entidad: "Alcaldía de Bogotá D.C.",
    monto: 8200000000, // $8.200M COP
    fecha: new Date("2024-10-22"),
    nivelRiesgo: "medium",
    probabilidadAnomalia: 64,
    contratista: "Constructora Vías del Sur Ltda.",
  },
  {
    id: "CONT-2024-003",
    nombreContrato: "Servicios de consultoría en transformación digital",
    entidad: "Ministerio de Tecnologías de la Información",
    monto: 1200000000, // $1.200M COP
    fecha: new Date("2024-12-01"),
    nivelRiesgo: "low",
    probabilidadAnomalia: 23,
    contratista: "TechConsult Colombia S.A.",
  },
  {
    id: "CONT-2024-004",
    nombreContrato: "Suministro de alimentación escolar",
    entidad: "Gobernación de Antioquia",
    monto: 3500000000, // $3.500M COP
    fecha: new Date("2024-09-10"),
    nivelRiesgo: "high",
    probabilidadAnomalia: 91,
    contratista: "Alimentos del Valle S.A.S.",
    objeto: "Provisión de alimentos para instituciones educativas",
  },
  {
    id: "CONT-2024-005",
    nombreContrato: "Mantenimiento de infraestructura hospitalaria",
    entidad: "Hospital Universitario San Ignacio",
    monto: 950000000, // $950M COP
    fecha: new Date("2024-11-28"),
    nivelRiesgo: "low",
    probabilidadAnomalia: 18,
    contratista: "Ingeniería y Obras S.A.",
  },
  {
    id: "CONT-2024-006",
    nombreContrato: "Implementación de sistema de gestión documental",
    entidad: "Contraloría General de la República",
    monto: 780000000, // $780M COP
    fecha: new Date("2024-10-05"),
    nivelRiesgo: "medium",
    probabilidadAnomalia: 58,
    contratista: "DocuSys Technologies Ltda.",
  },
  {
    id: "CONT-2024-007",
    nombreContrato: "Adquisición de mobiliario escolar",
    entidad: "Secretaría de Educación de Medellín",
    monto: 2100000000, // $2.100M COP
    fecha: new Date("2024-08-18"),
    nivelRiesgo: "high",
    probabilidadAnomalia: 79,
    contratista: "Muebles Escolares del Caribe S.A.",
  },
  {
    id: "CONT-2024-008",
    nombreContrato: "Servicios de vigilancia y seguridad privada",
    entidad: "Universidad Nacional de Colombia",
    monto: 650000000, // $650M COP
    fecha: new Date("2024-12-10"),
    nivelRiesgo: "low",
    probabilidadAnomalia: 15,
    contratista: "SegurCorp Colombia S.A.S.",
  },
  {
    id: "CONT-2024-009",
    nombreContrato: "Construcción de acueducto veredal",
    entidad: "Alcaldía de Cartagena",
    monto: 5600000000, // $5.600M COP
    fecha: new Date("2024-07-30"),
    nivelRiesgo: "medium",
    probabilidadAnomalia: 72,
    contratista: "Hidráulica Costa S.A.",
    objeto: "Infraestructura de agua potable zonas rurales",
  },
  {
    id: "CONT-2024-010",
    nombreContrato: "Suministro de medicamentos esenciales",
    entidad: "Secretaría Distrital de Salud",
    monto: 6800000000, // $6.800M COP
    fecha: new Date("2024-11-02"),
    nivelRiesgo: "high",
    probabilidadAnomalia: 85,
    contratista: "FarmaCorp Distribuciones S.A.",
  },
  {
    id: "CONT-2024-011",
    nombreContrato: "Mejoramiento de espacio público",
    entidad: "Instituto de Desarrollo Urbano",
    monto: 4200000000, // $4.200M COP
    fecha: new Date("2024-09-25"),
    nivelRiesgo: "low",
    probabilidadAnomalia: 28,
    contratista: "Urbanismo Moderno Ltda.",
  },
  {
    id: "CONT-2024-012",
    nombreContrato: "Licencias de software empresarial",
    entidad: "Ministerio de Hacienda",
    monto: 1800000000, // $1.800M COP
    fecha: new Date("2024-10-14"),
    nivelRiesgo: "medium",
    probabilidadAnomalia: 61,
    contratista: "SoftwareLic Colombia S.A.S.",
  },
];

/**
 * Función que simula la respuesta del API con datos mock
 * Útil para desarrollo y fallback cuando el API no está disponible
 */
export function getMockContracts(): {
  apiResponse: import('@/types/contract').ContractsApiResponse;
  contracts: Contract[];
} {
  const mockApiResponse = {
    metadata: {
      fuenteDatos: "datos.gov.co (SECOP II - Mock Data para desarrollo)",
      camposSimulados: ["probabilidadAnomalia", "nivelRiesgo"]
    },
    totalContratosAnalizados: mockContracts.length,
    contratosAltoRiesgo: mockContracts.filter(c => c.nivelRiesgo === 'high').length,
    montoTotalCOP: mockContracts.reduce((sum, contract) => sum + contract.monto, 0),
    contratos: mockContracts.map(contract => ({
      Contrato: {
        Codigo: contract.id,
        Descripcion: contract.nombreContrato
      },
      Entidad: contract.entidad,
      Monto: contract.monto.toString(),
      FechaInicio: contract.fecha?.toISOString() || null,
      NivelRiesgo: contract.nivelRiesgo === 'high' ? 'Alto' as const : 
                   contract.nivelRiesgo === 'medium' ? 'Medio' as const : 
                   'Bajo' as const,
      Anomalia: contract.probabilidadAnomalia
    }))
  };

  return {
    apiResponse: mockApiResponse,
    contracts: mockContracts
  };
}
