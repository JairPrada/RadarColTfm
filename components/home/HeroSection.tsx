/**
 * HeroSection - Sección principal del landing con animaciones cyberpunk
 * 
 * Patrón de diseño: Presentation Pattern + Variants Pattern (Framer Motion)
 * - Presentation Pattern: Componente enfocado en UI sin lógica de negocio
 * - Variants Pattern: Define estados de animación reutilizables y orquestados
 * 
 * Características:
 * - Animaciones de entrada escalonadas (stagger)
 * - Efectos de texto con fade in y slide up
 * - Grid background cyberpunk
 * - Responsive design
 * 
 * @component
 */

"use client";

import { motion } from "framer-motion";
import { Brain, Shield, TrendingUp, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { GlowButton } from "@/components/ui/GlowButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Variants para animaciones orquestadas
 * 
 * Concepto: Variants Pattern de Framer Motion
 * - Define estados de animación con nombres descriptivos
 * - Permite orquestación automática de animaciones hijas
 * - Facilita mantenimiento y reutilización
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Retraso entre cada hijo
      delayChildren: 0.2, // Retraso inicial antes de animar hijos
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
      ease: "easeOut" as const, // Predefined easing
    },
  },
};

/**
 * Features destacadas con iconos
 */
const features = [
  {
    icon: Brain,
    title: "IA Avanzada",
    description: "Algoritmos de machine learning detectan patrones ocultos",
  },
  {
    icon: Shield,
    title: "Análisis de Riesgo",
    description: "Sistema de semáforo para priorizar anomalías críticas",
  },
  {
    icon: TrendingUp,
    title: "Explicabilidad",
    description: "SHAP values muestran qué variables influyen en cada predicción",
  },
];

/**
 * HeroSection - Landing principal de RadarCol
 */
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Theme Toggle - Fixed position */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>
      
      {/* Grid Background Cyberpunk */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-background to-background" />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-block mb-6">
          <span className="flex items-center gap-2 px-4 py-2 bg-accent-violet/70 text-white border border-accent-violet/60 rounded-full text-sm font-mono z-50">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            Análisis Inteligente de Contratos Públicos
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Detecta Anomalías en{" "}
          <span className="bg-linear-to-r from-accent-cyan to-accent-violet bg-clip-text text-transparent">
            Contratos Públicos
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-foreground-muted mb-12 max-w-3xl mx-auto"
        >
          Plataforma inteligente que analiza millones de datos para identificar
          patrones sospechosos y proteger la transparencia en contratación pública.
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="mb-20">
          <Link href="/dashboard">
            <GlowButton variant="cyan" size="lg">
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Iniciar Análisis
              </span>
            </GlowButton>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-6 rounded-xl bg-background-card border border-border hover:border-accent-cyan/50 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 inline-block p-3 bg-accent-cyan/10 rounded-lg group-hover:bg-accent-cyan/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent-cyan" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
