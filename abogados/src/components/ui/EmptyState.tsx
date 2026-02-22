// Empty State Component
// Reusable empty states for all pages

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  suggestions 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 bg-theme-tertiary rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-theme-muted" />
      </div>
      
      <h3 className="text-xl font-semibold text-theme-primary mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-theme-secondary text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
        >
          {action.label}
        </button>
      )}
      
      {suggestions && suggestions.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-theme-muted mb-3">Sugerencias:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-3 py-1.5 text-sm bg-theme-tertiary text-theme-secondary rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
                onClick={action?.onClick}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Pre-defined empty states for common scenarios
export function EmptySearch() {
  return (
    <EmptyState
      icon={Search}
      title="No se encontraron resultados"
      description="Intenta con otros términos de búsqueda o modifica los filtros"
      suggestions={["Revisa la ortografía", "Usa términos más generales", "Elimina algunos filtros"]}
    />
  );
}

import { Search } from 'lucide-react';

export function EmptyList({ title = "No hay elementos", actionLabel, onAction }: { 
  title?: string; 
  actionLabel?: string; 
  onAction?: () => void;
}) {
  return (
    <EmptyState
      icon={EmptyListIcon}
      title={title}
      description="Parece que no hay nada aquí todavía"
      action={actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined}
    />
  );
}

import { FolderOpen, FileText, Users, Calendar, Bell, MessageSquare, Upload, Shield } from 'lucide-react';

// Specific empty states for pages
export function EmptyProveedores() {
  return (
    <EmptyState
      icon={Users}
      title="No hay proveedores"
      description="Añade tu primer proveedor para comenzar"
      action={{ label: "Añadir Proveedor", onClick: () => {} }}
      suggestions={["TechServicios S.L.", "Limpiezas Express", "Abogados Associates"]}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="No tienes notificaciones"
      description="Las notificaciones aparecerán aquí cuando existan actualizaciones"
    />
  );
}

export function EmptyDocumentos() {
  return (
    <EmptyState
      icon={FileText}
      title="No hay documentos"
      description="Sube tu primer documento para comenzar"
      action={{ label: "Subir Documento", onClick: () => {} }}
    />
  );
}

export function EmptyCalendar() {
  return (
    <EmptyState
      icon={Calendar}
      title="No hay eventos"
      description="No hay eventos programados para esta fecha"
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No hay mensajes"
      description="Inicia una conversación"
      action={{ label: "Nuevo Mensaje", onClick: () => {} }}
    />
  );
}

export function EmptyUploads() {
  return (
    <EmptyState
      icon={Upload}
      title="Arrastra archivos aquí"
      description="Sube documentos para procesarlos"
      action={{ label: "Seleccionar Archivos", onClick: () => {} }}
      suggestions={["Arrastra y suelta", "Click para buscar", "Máximo 10MB"]}
    />
  );
}

export function EmptyVerificar() {
  return (
    <EmptyState
      icon={Shield}
      title="Verifica documentos"
      description="Sube un documento de identidad para verificar su autenticidad"
      action={{ label: "Subir Documento", onClick: () => {} }}
      suggestions={["DNI español", "Pasaporte", "Permiso de conducir"]}
    />
  );
}

// Helper icon for EmptyList
function EmptyListIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 6h18"/>
      <path d="M3 12h18"/>
      <path d="M3 18h18"/>
    </svg>
  );
}

export default EmptyState;
