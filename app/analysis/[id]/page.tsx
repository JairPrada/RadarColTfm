/**
 * Analysis Page - Página de detalle de análisis de contrato
 * 
 * Patrón de diseño: Container Component + Two-Column Layout
 * - Container: Carga datos y los pasa a componentes de presentación
 * - Two-Column: Datos del contrato (izq) + Análisis IA (der)
 * 
 * Arquitectura: Dynamic Route (Next.js App Router)
 * - Ruta: /analysis/[id]
 * - Genera páginas dinámicamente basadas en ID de contrato
 * 
 * @page
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { MainLayout } from "@/components/ui/MainLayout";
import { ContractDetails } from "@/components/analysis/ContractDetails";
import { AIExplanation } from "@/components/analysis/AIExplanation";
import { ShapChart } from "@/components/analysis/ShapChart";
import { fetchContracts } from "@/lib/contractsService";
import { getAnalysisById } from "@/data/mockAnalysis";

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Página de análisis de contrato individual
 * 
 * @param {string} params.id - ID del contrato a analizar
 */
export default async function AnalysisPage({ params }: AnalysisPageProps) {
  try {
    // Await params (Next.js 15+)
    const { id } = await params;
    
    // Obtener contratos del API
    const { contracts } = await fetchContracts();
    
    // Buscar contrato por ID
    const contract = contracts.find((c) => c.id === id);
    
    // Si no existe, mostrar 404
    if (!contract) {
      notFound();
    }

  // Obtener análisis del contrato (ahora siempre devuelve un análisis personalizado)
  const analysis = getAnalysisById(id, contract);

  // Si no hay análisis disponible (caso excepcional), mostrar mensaje
  if (!analysis) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyan-glow transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Análisis no disponible
            </h1>
            <p className="text-foreground-muted">
              El análisis de IA para este contrato aún no está disponible.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyan-glow transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Análisis de Contrato
          </h1>
          <p className="text-foreground-muted">
            Detalle completo del análisis de IA y explicabilidad del modelo
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Detalles del Contrato */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ContractDetails contract={contract} />
            </div>
          </div>

          {/* Columna Derecha: Análisis de IA + SHAP Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Explicación de IA */}
            <div className="bg-background-card border border-border rounded-xl p-6">
              <AIExplanation analysis={analysis} />
            </div>

            {/* Gráfico SHAP */}
            <div className="bg-background-card border border-border rounded-xl p-6">
              <ShapChart shapValues={analysis.shapValues} />
            </div>

            {/* Nota explicativa sobre SHAP */}
            <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-accent-cyan" />
                ¿Qué son los valores SHAP?
              </h4>
              <p className="text-xs text-foreground-muted leading-relaxed">
                SHAP (SHapley Additive exPlanations) es una técnica de explicabilidad
                que muestra cómo cada variable del contrato contribuye a la predicción
                del modelo de IA. Los valores positivos indican que esa característica
                aumenta la probabilidad de anomalía, mientras que los valores negativos
                la disminuyen. Esto permite entender exactamente por qué el modelo
                asigna un nivel de riesgo específico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
  } catch (error) {
    // Manejo de errores - mostrar mensaje amigable al usuario
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Error al cargar el análisis
            </h2>
            <p className="text-foreground-muted mb-4">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyan-glow transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
}
