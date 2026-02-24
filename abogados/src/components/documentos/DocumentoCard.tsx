import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Image, File, Table, Download, Trash2, Eye, 
  CheckCircle, Loader2, AlertCircle 
} from 'lucide-react';
import type { Documento, UploadProgress } from '@/types/documento.types';

interface DocumentoCardProps {
  documento?: Documento;
  uploadProgress?: UploadProgress;
  onDownload?: (doc: Documento) => void;
  onDelete?: (id: string) => void;
  onView?: (doc: Documento) => void;
  canDelete?: boolean;
}

export function DocumentoCard({
  documento,
  uploadProgress,
  onDownload,
  onDelete,
  onView,
  canDelete = true,
}: DocumentoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Si es un upload en progreso
  if (uploadProgress) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-4 bg-theme-secondary rounded-xl border border-theme"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-theme rounded-lg flex items-center justify-center flex-shrink-0">
            {uploadProgress.status === 'uploading' && <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />}
            {uploadProgress.status === 'processing' && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
            {uploadProgress.status === 'completed' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
            {uploadProgress.status === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
            {uploadProgress.status === 'pending' && <File className="w-6 h-6 text-theme-tertiary" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-theme-primary truncate">
              {uploadProgress.file.name}
            </p>
            <p className="text-sm text-theme-secondary">
              {formatFileSize(uploadProgress.file.size)}
            </p>
            
            {uploadProgress.status === 'uploading' && (
              <div className="mt-2">
                <div className="h-2 bg-theme rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-theme-tertiary mt-1">
                  {uploadProgress.progress}%
                </p>
              </div>
            )}

            {uploadProgress.status === 'processing' && (
              <p className="text-xs text-blue-500 mt-1">Procesando OCR...</p>
            )}

            {uploadProgress.error && (
              <p className="text-xs text-red-500 mt-1">{uploadProgress.error}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!documento) return null;

  const Icon = getFileIcon(documento.mimeType);
  const isImage = documento.mimeType?.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-4 bg-theme-secondary rounded-xl border border-theme hover:border-amber-500/30 transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail o Icono */}
        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-theme"
        onClick={() => onView?.(documento)}
        >
          {isImage && documento.thumbnailUrl ? (
            <img
              src={documento.thumbnailUrl}
              alt={documento.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon className="w-8 h-8 text-theme-tertiary" />
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p 
            className="font-medium text-theme-primary truncate cursor-pointer hover:text-amber-500"
            onClick={() => onView?.(documento)}
          >
            {documento.nombre}
          </p>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-theme rounded text-theme-secondary">
              {documento.tipo}
            </span>
            <span className="text-xs text-theme-tertiary">
              {formatFileSize(documento.tamano)}
            </span>
          </div>
          
          {documento.expediente && (
            <p className="text-xs text-theme-tertiary mt-1 truncate">
              Exp: {documento.expediente.numeroExpediente}
            </p>
          )}
        </div>
        
        {/* Acciones */}
        <div className={`
          flex items-center gap-1 transition-opacity
          ${isHovered ? 'opacity-100' : 'opacity-0 lg:opacity-0'}
        `}>
          <button
            onClick={() => onView?.(documento)}
            className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
            title="Ver"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDownload?.(documento)}
            className="p-2 text-theme-tertiary hover:text-amber-500 transition-colors"
            title="Descargar"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {canDelete && (
            <button
              onClick={() => onDelete?.(documento.id)}
              className="p-2 text-theme-tertiary hover:text-red-500 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Helpers
function getFileIcon(mimeType?: string): React.ElementType {
  if (!mimeType) return File;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return Table;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
