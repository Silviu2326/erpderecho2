import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ActividadTratamiento } from './ActividadesTratamiento';

interface RAT_ExportButtonProps {
  actividades: ActividadTratamiento[];
  filename?: string;
}

export function RAT_ExportButton({ 
  actividades, 
  filename = 'registro-actividades-tratamiento' 
}: RAT_ExportButtonProps) {
  const handleExport = () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalActividades: actividades.length,
        regulation: 'RGPD/LOPDGDD Art. 30'
      },
      actividades: actividades.map(actividad => ({
        ...actividad,
        fechaExport: new Date().toISOString()
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      leftIcon={Download}
    >
      Exportar JSON
    </Button>
  );
}

export default RAT_ExportButton;
