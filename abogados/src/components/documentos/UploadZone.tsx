import { useState, useCallback } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // en MB
  disabled?: boolean;
}

export function UploadZone({
  onFilesSelected,
  multiple = true,
  accept,
  maxSize = 25,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) => {
        if (file.size > maxSize * 1024 * 1024) {
          return false;
        }
        return true;
      });

      onFilesSelected(validFiles);
    },
    [disabled, maxSize, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = Array.from(e.target.files || []);
      onFilesSelected(files);
    },
    [disabled, onFilesSelected]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all
        ${isDragging 
          ? 'border-amber-500 bg-amber-500/10' 
          : 'border-theme-tertiary hover:border-amber-500/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        onChange={handleFileInput}
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="space-y-3">
        <div className="flex justify-center">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${isDragging ? 'bg-amber-500 text-white' : 'bg-theme-secondary text-theme-tertiary'}
          `}>
            <Upload className="w-8 h-8" />
          </div>
        </div>
        
        <p className="text-theme-primary font-medium">
          {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
        </p>
        
        <p className="text-theme-secondary text-sm">
          o haz clic para seleccionar
        </p>
        
        <p className="text-theme-tertiary text-xs">
          Máximo {maxSize}MB por archivo
        </p>
      </div>
    </div>
  );
}
