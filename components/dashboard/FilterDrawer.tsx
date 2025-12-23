/**
 * FilterDrawer - Drawer/Modal para filtros de contratos
 * 
 * Patrón de diseño: Overlay Pattern con Portal
 * - Renderizado en portal para evitar z-index issues
 * - Estado controlado desde componente padre
 * - Animaciones con Framer Motion
 * 
 * Características:
 * - Responsive: full-screen en móvil, sidebar en desktop
 * - Backdrop con blur para contexto visual
 * - Animaciones suaves de entrada/salida
 * - Gestión de foco para accesibilidad
 * 
 * @component
 * @example
 * ```tsx
 * <FilterDrawer
 *   isOpen={isFilterDrawerOpen}
 *   onClose={() => setIsFilterDrawerOpen(false)}
 *   filters={filters}
 *   onFiltersChange={handleFiltersChange}
 *   isLoading={loading}
 * />
 * ```
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, RotateCcw } from "lucide-react";
import { ContractFilters } from "./ContractFilters";
import { ContractFilters as FilterTypes } from "@/lib/contractsService";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterTypes;
  onApplyFilters: (filters: FilterTypes) => void;
  isLoading?: boolean;
  activeFiltersCount?: number;
}

/**
 * Componente FilterDrawer
 */
export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  isLoading = false,
  activeFiltersCount = 0,
}: FilterDrawerProps) {
  // Estado local para filtros temporales (antes de aplicar)
  const [tempFilters, setTempFilters] = useState<FilterTypes>(filters);
  // Track si el drawer estaba abierto
  const [wasOpen, setWasOpen] = useState(false);

  // Sincronizar estado local cuando se abre el drawer
  if (isOpen && !wasOpen) {
    setTempFilters(filters);
    setWasOpen(true);
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  // Gestión de tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  /**
   * Resetea filtros temporales y cierra el drawer
   */
  const handleResetAndClose = () => {
    setTempFilters({});
    onApplyFilters({});
    onClose();
  };

  /**
   * Aplica los filtros temporales y cierra el drawer
   */
  const handleApplyFilters = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  /**
   * Limpia filtros temporales (sin aplicar)
   */
  const handleClearTempFilters = () => {
    setTempFilters({});
  };

  /**
   * Maneja el submit del formulario (Enter key)
   */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilters();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 w-full sm:w-96 lg:w-[448px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-background-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-cyan/10 rounded-lg">
                  <Filter className="w-5 h-5 text-accent-cyan" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Filtros de Búsqueda
                  </h2>
                  {activeFiltersCount > 0 && (
                    <p className="text-sm text-foreground-muted">
                      {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Botón Reset */}
                {activeFiltersCount > 0 && (
                  <motion.button
                    onClick={handleResetAndClose}
                    disabled={isLoading}
                    className="p-2 text-foreground-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Botón Close */}
                <motion.button
                  onClick={onClose}
                  className="p-2 text-foreground-muted hover:text-foreground hover:bg-background-card rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <ContractFilters
                filters={tempFilters}
                onFiltersChange={setTempFilters}
                isLoading={isLoading}
                className="border-none bg-transparent p-6"
                hideHeader={true}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-background-card">
              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan-glow transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  Aplicar Filtros
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleClearTempFilters}
                  className="px-4 py-2 bg-background-light border border-border text-foreground rounded-lg hover:bg-background-card transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  Limpiar
                </motion.button>
              </div>
            </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}