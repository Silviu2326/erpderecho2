export declare enum EstadoFacturaEnum {
    PENDIENTE = "PENDIENTE",
    PAGADA = "PAGADA",
    VENCIDA = "VENCIDA",
    ANULADA = "ANULADA"
}
export declare class LineaFacturaDto {
    id?: string;
    concepto: string;
    cantidad: number;
    precioUnitario: number;
    importe?: number;
}
export declare class CreateFacturaDto {
    numero: string;
    concepto: string;
    importeBase?: number;
    importeIVA?: number;
    estado?: EstadoFacturaEnum;
    fechaEmision?: string;
    fechaVencimiento?: string;
    clienteId?: string;
    expedienteId?: string;
    lineas?: LineaFacturaDto[];
}
export declare class UpdateFacturaDto {
    numero?: string;
    concepto?: string;
    importeBase?: number;
    importeIVA?: number;
    estado?: EstadoFacturaEnum;
    fechaEmision?: string;
    fechaVencimiento?: string;
    clienteId?: string;
    expedienteId?: string;
    lineas?: LineaFacturaDto[];
}
export declare class QueryFacturaDto {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    estado?: string;
    cliente_id?: string;
    expediente_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}
//# sourceMappingURL=factura.dto.d.ts.map