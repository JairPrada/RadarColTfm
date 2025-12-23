/**
 * ProcessSection - El proceso de detección de anomalías en 3 pasos
 *
 * Patrón de diseño: Timeline Pattern
 * - Muestra proceso secuencial simplificado
 * - Enfoque en la explicabilidad y transparencia
 *
 * Características:
 * - 3 pasos del proceso de análisis inteligente
 * - Layout responsivo con numeración clara
 * - Animaciones de entrada escalonadas
 * - Iconos contextuales sin revelar arquitectura
 *
 * @component
 */

"use client";

import { motion } from "framer-motion";
import { Database, Cpu, Brain } from "lucide-react";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

/**
 * URLs públicas de animaciones de LottieFiles
 * Usando animaciones de la galería pública de LottieFiles
 */
const LOTTIE_ANIMATIONS = {
  database:
    "https://lottie.host/ebbb66c9-34e7-4c20-9874-fa4c870869b0/Kreg1wzBWu.json", // Server/Database
  processing:
    "https://lottie.host/5c988a28-88fc-438b-9498-dc208654a613/lotC1GojYm.json", // AI/Analysis
  brain:
    "https://lottie.host/74e4cafa-b971-44c5-9b56-7800d159b8b2/2VYfXezOdZ.json", // Chat/Communication
};

/**
 * Hook para cargar animación desde URL
 */
function useLottieUrl(url: string) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, [url]);

  return data;
}

/**
 * Variants para animaciones orquestadas
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

/**
 * Proceso simplificado en 3 pasos con animaciones Lottie
 */
const steps = [
  {
    number: "01",
    lottieUrl: LOTTIE_ANIMATIONS.database,
    icon: Database,
    title: "Ingesta Inteligente",
    description:
      "Procesamiento masivo de más de 5 millones de registros históricos de SECOP. Consolidamos datos abiertos en tiempo real para un análisis exhaustivo.",
    highlight: "+5M contratos",
    color: "cyan" as const,
  },
  {
    number: "02",
    lottieUrl: LOTTIE_ANIMATIONS.processing,
    icon: Cpu,
    title: "Detección Multidimensional",
    description:
      "Nuestros algoritmos identifican patrones fuera de la norma en más de 50 indicadores clave. Detectamos desviaciones de comportamiento y anomalías operativas en milisegundos.",
    highlight: "+50 indicadores",
    color: "violet" as const,
  },
  {
    number: "03",
    lottieUrl: LOTTIE_ANIMATIONS.brain,
    icon: Brain,
    title: "IA Explicable",
    description:
      'No solo decimos "es anómalo". Explicamos el porqué en lenguaje natural. Combinamos análisis interpretable con inteligencia generativa para que auditores tomen decisiones informadas.',
    highlight: "Lenguaje natural",
    color: "cyan" as const,
  },
];

/**
 * ProcessSection - Proceso de detección
 */
export function ProcessSection() {
  return (
    <section className="relative py-24 px-4 bg-background-light">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Cómo Detectamos{" "}
            <span className="bg-linear-to-r from-accent-cyan to-accent-violet bg-clip-text text-transparent">
              Riesgos de Gestión
            </span>
          </h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Proceso automatizado que convierte datos abiertos en alertas
            tempranas, con explicaciones comprensibles para decisiones rápidas.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCyan = step.color === "cyan";
            const animationData = useLottieUrl(step.lottieUrl);

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative flex flex-col group"
              >
                {/* Number Badge */}
                <div className="absolute -top-6 left-0 w-14 h-14 rounded-full bg-accent-cyan/10 border-2 border-accent-cyan flex items-center justify-center font-mono font-bold text-accent-cyan text-lg z-10">
                  {step.number}
                </div>

                {/* Card */}
                <div className="h-full pt-12 p-8 rounded-2xl bg-background-card border border-border hover:border-accent-violet/50 transition-all duration-300 group-hover:shadow-xl">
                  {/* Lottie Animation with Fallback */}
                  <div className="mb-6 mx-auto w-32 h-32 flex items-center justify-center relative">
                    {animationData ? (
                      <Lottie
                        animationData={animationData}
                        loop={true}
                        autoplay={true}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <>
                        {/* Background Glow */}
                        <motion.div
                          className={`absolute inset-0 rounded-full blur-2xl ${
                            isCyan ? "bg-accent-cyan/20" : "bg-accent-violet/20"
                          }`}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        {/* Fallback Icon with Animation */}
                        <motion.div
                          animate={{
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Icon
                            className={`w-20 h-20 animate-pulse ${
                              isCyan ? "text-accent-cyan" : "text-accent-violet"
                            }`}
                          />
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-foreground-muted leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Highlight Badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30">
                    <span className="text-sm font-semibold text-accent-cyan">
                      {step.highlight}
                    </span>
                  </div>
                </div>

                {/* Connector Arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-0 left-full w-8 h-1 bg-linear-to-r from-accent-cyan to-accent-violet opacity-50 translate-y-6" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
