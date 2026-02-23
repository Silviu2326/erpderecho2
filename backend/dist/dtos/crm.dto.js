"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryContactoDto = exports.CreateContactoDto = exports.QueryNotaDto = exports.UpdateNotaDto = exports.CreateNotaDto = exports.QueryActividadDto = exports.UpdateActividadDto = exports.CreateActividadDto = exports.QueryPipelineDto = exports.QueryOportunidadDto = exports.UpdateOportunidadDto = exports.CreateOportunidadDto = exports.QueryLeadDto = exports.ConvertirLeadDto = exports.UpdateLeadDto = exports.CreateLeadDto = void 0;
const class_validator_1 = require("class-validator");
class CreateLeadDto {
}
exports.CreateLeadDto = CreateLeadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "empresa", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "origen", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['NUEVO', 'CONTACTADO', 'CUALIFICADO', 'CONVERTIDO', 'PERDIDO']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateLeadDto.prototype, "probabilidad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLeadDto.prototype, "expectedRevenue", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "clienteId", void 0);
class UpdateLeadDto {
}
exports.UpdateLeadDto = UpdateLeadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "empresa", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "origen", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['NUEVO', 'CONTACTADO', 'CUALIFICADO', 'CONVERTIDO', 'PERDIDO']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateLeadDto.prototype, "probabilidad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLeadDto.prototype, "expectedRevenue", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "clienteId", void 0);
class ConvertirLeadDto {
}
exports.ConvertirLeadDto = ConvertirLeadDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConvertirLeadDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConvertirLeadDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ConvertirLeadDto.prototype, "importe", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ConvertirLeadDto.prototype, "probabilidad", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConvertirLeadDto.prototype, "etapa", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConvertirLeadDto.prototype, "usuarioId", void 0);
class QueryLeadDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'createdAt';
        this.order = 'desc';
    }
}
exports.QueryLeadDto = QueryLeadDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryLeadDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryLeadDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeadDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeadDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeadDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['NUEVO', 'CONTACTADO', 'CUALIFICADO', 'CONVERTIDO', 'PERDIDO']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeadDto.prototype, "estado", void 0);
class CreateOportunidadDto {
}
exports.CreateOportunidadDto = CreateOportunidadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "leadId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['NUEVA', 'EN_PROCESO', 'GANADA', 'PERDIDA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateOportunidadDto.prototype, "probabilidad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateOportunidadDto.prototype, "importe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "etapa", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "usuarioId", void 0);
class UpdateOportunidadDto {
}
exports.UpdateOportunidadDto = UpdateOportunidadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "leadId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['NUEVA', 'EN_PROCESO', 'GANADA', 'PERDIDA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateOportunidadDto.prototype, "probabilidad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOportunidadDto.prototype, "importe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "etapa", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "usuarioId", void 0);
class QueryOportunidadDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'createdAt';
        this.order = 'desc';
    }
}
exports.QueryOportunidadDto = QueryOportunidadDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryOportunidadDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryOportunidadDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryOportunidadDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryOportunidadDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryOportunidadDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['NUEVA', 'EN_PROCESO', 'GANADA', 'PERDIDA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryOportunidadDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PROSPECTO', 'CALIFICACION', 'PROPUESTA', 'NEGOCIACION', 'CIERRE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryOportunidadDto.prototype, "etapa", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryOportunidadDto.prototype, "usuarioId", void 0);
class QueryPipelineDto {
}
exports.QueryPipelineDto = QueryPipelineDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPipelineDto.prototype, "usuarioId", void 0);
class CreateActividadDto {
}
exports.CreateActividadDto = CreateActividadDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "oportunidadId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['LLAMADA', 'EMAIL', 'REUNION', 'TAREA', 'NOTA']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateActividadDto.prototype, "completada", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActividadDto.prototype, "usuarioId", void 0);
class UpdateActividadDto {
}
exports.UpdateActividadDto = UpdateActividadDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActividadDto.prototype, "oportunidadId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['LLAMADA', 'EMAIL', 'REUNION', 'TAREA', 'NOTA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActividadDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActividadDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActividadDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateActividadDto.prototype, "completada", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateActividadDto.prototype, "usuarioId", void 0);
class QueryActividadDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'fecha';
        this.order = 'asc';
    }
}
exports.QueryActividadDto = QueryActividadDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryActividadDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryActividadDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryActividadDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryActividadDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryActividadDto.prototype, "oportunidadId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryActividadDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], QueryActividadDto.prototype, "completada", void 0);
class CreateNotaDto {
}
exports.CreateNotaDto = CreateNotaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNotaDto.prototype, "contenido", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotaDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotaDto.prototype, "oportunidadId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotaDto.prototype, "usuarioId", void 0);
class UpdateNotaDto {
}
exports.UpdateNotaDto = UpdateNotaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNotaDto.prototype, "contenido", void 0);
class QueryNotaDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryNotaDto = QueryNotaDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryNotaDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryNotaDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryNotaDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryNotaDto.prototype, "oportunidadId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryNotaDto.prototype, "usuarioId", void 0);
class CreateContactoDto {
}
exports.CreateContactoDto = CreateContactoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateContactoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactoDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactoDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactoDto.prototype, "cargo", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateContactoDto.prototype, "clienteId", void 0);
class QueryContactoDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryContactoDto = QueryContactoDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryContactoDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryContactoDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryContactoDto.prototype, "search", void 0);
//# sourceMappingURL=crm.dto.js.map