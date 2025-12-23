/**
 * Accordion Component - Componente desplegable reutilizable
 * 
 * Patrón: Controlled Component
 * - Permite controlar el estado abierto/cerrado desde el padre
 * - Animaciones suaves con Framer Motion
 * 
 * @component
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
  className = "",
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-border rounded-xl overflow-hidden ${className}`}>
      {/* Header clickeable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-background-card hover:bg-background-light transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <h4 className="font-semibold text-foreground text-left">
            {title}
          </h4>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-foreground-muted" />
        </motion.div>
      </button>

      {/* Contenido desplegable */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-background-card border-t border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
