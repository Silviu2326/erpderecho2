import { authService } from './authService';
import type {
  Documento,
  CreateDocumentoData,
  UpdateDocumentoData,
  QueryDocumentosParams,
  PaginatedResponse,
} from '@/types/documento.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class DocumentoService {
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = authService.getAccessToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Error: ${response.status}`);
    }

    return data;
  }

  // Listar documentos con paginación y filtros
  async listarDocumentos(
    params: QueryDocumentosParams = {}
  ): Promise<PaginatedResponse<Documento>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.expediente_id) queryParams.append('expediente_id', params.expediente_id);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    return this.apiCall<PaginatedResponse<Documento>>(
      `/documentos${queryString ? `?${queryString}` : ''}`
    );
  }

  // Obtener documento por ID
  async obtenerDocumento(id: string): Promise<Documento> {
    const response = await this.apiCall<{ success: boolean; data: Documento }>(
      `/documentos/${id}`
    );
    return response.data;
  }

  // Subir documento
  async subirDocumento(
    file: File,
    data: CreateDocumentoData = {},
    onProgress?: (progress: number) => void
  ): Promise<Documento> {
    const token = authService.getAccessToken();

    const formData = new FormData();
    formData.append('file', file);
    if (data.nombre) formData.append('nombre', data.nombre);
    if (data.expedienteId) formData.append('expedienteId', data.expedienteId);
    formData.append('processOcr', data.processOcr !== false ? 'true' : 'false');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data);
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error?.message || 'Error al subir archivo'));
          } catch {
            reject(new Error('Error al subir archivo'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Error de red al subir archivo'));
      });

      xhr.open('POST', `${API_URL}/documentos`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  // Subir múltiples documentos
  async subirMultiplesDocumentos(
    files: File[],
    data: CreateDocumentoData = {}
  ): Promise<Documento[]> {
    const token = authService.getAccessToken();

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (data.expedienteId) formData.append('expedienteId', data.expedienteId);
    formData.append('processOcr', data.processOcr !== false ? 'true' : 'false');

    const response = await fetch(`${API_URL}/documentos/upload-multiple`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Error al subir archivos');
    }

    return result.data;
  }

  // Actualizar documento
  async actualizarDocumento(
    id: string,
    data: UpdateDocumentoData
  ): Promise<Documento> {
    const response = await this.apiCall<{ success: boolean; data: Documento }>(
      `/documentos/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  // Eliminar documento
  async eliminarDocumento(id: string): Promise<void> {
    await this.apiCall<{ success: boolean }>(`/documentos/${id}`, {
      method: 'DELETE',
    });
  }

  // Descargar documento
  async descargarDocumento(id: string, nombreArchivo?: string): Promise<void> {
    const token = authService.getAccessToken();

    const response = await fetch(`${API_URL}/documentos/${id}/descargar`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al descargar archivo');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo || 'documento';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Procesar OCR
  async procesarOcr(id: string): Promise<any> {
    const response = await this.apiCall<{ success: boolean; data: any }>(
      `/documentos/${id}/ocr`,
      {
        method: 'POST',
      }
    );
    return response.data;
  }

  // Buscar en contenido
  async buscarEnContenido(
    query: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<Documento>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.apiCall<PaginatedResponse<Documento>>(
      `/documentos/search/contenido?${queryParams.toString()}`
    );
  }

  // Utilidades
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType?: string): string {
    if (!mimeType) return 'File';
    if (mimeType.includes('pdf')) return 'FileText';
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'FileText';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'Table';
    return 'File';
  }

  canPreview(mimeType?: string): boolean {
    if (!mimeType) return false;
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.includes('text/')
    );
  }
}

export const documentoService = new DocumentoService();
export default documentoService;
