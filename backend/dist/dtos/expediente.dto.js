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
exports.QueryActuacionDto = exports.CreateActuacionDto = exports.QueryExpedienteDto = exports.UpdateExpedienteDto = exports.CreateExpedienteDto = exports.EstadoExpedienteEnum = exports.TipoExpedienteEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoExpedienteEnum;
(function (TipoExpedienteEnum) {
    TipoExpedienteEnum["CIVIL"] = "CIVIL";
    TipoExpedienteEnum["PENAL"] = "PENAL";
    TipoExpedienteEnum["LABORAL"] = "LABORAL";
    TipoExpedienteEnum["CONTENCIOSO"] = "CONTENCIOSO";
    TipoExpedienteEnum["MERCANTIL"] = "MERCANTIL";
    TipoExpedienteEnum["FAMILIA"] = "FAMILIA";
    TipoExpedienteEnum["ADMINISTRATIVO"] = "ADMINISTRATIVO";
})(TipoExpedienteEnum || (exports.TipoExpedienteEnum = TipoExpedienteEnum = {}));
var EstadoExpedienteEnum;
(function (EstadoExpedienteEnum) {
    EstadoExpedienteEnum["ACTIVO"] = "ACTIVO";
    EstadoExpedienteEnum["CERRADO"] = "CERRADO";
    EstadoExpedienteEnum["ARCHIVADO"] = "ARCHIVADO";
    EstadoExpedienteEnum["SUSPENDIDO"] = "SUSPENDIDO";
})(EstadoExpedienteEnum || (exports.EstadoExpedienteEnum = EstadoExpedienteEnum = {}));
class CreateExpedienteDto {
}
exports.CreateExpedienteDto = CreateExpedienteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpedienteDto.prototype, "numeroExpediente", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoExpedienteEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpedienteDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EstadoExpedienteEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpedienteDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpedienteDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpedienteDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpedienteDto.prototype, "abogadoId", void 0);
class UpdateExpedienteDto {
}
exports.UpdateExpedienteDto = UpdateExpedienteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpedienteDto.prototype, "numeroExpediente", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoExpedienteEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpedienteDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EstadoExpedienteEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpedienteDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpedienteDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpedienteDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpedienteDto.prototype, "abogadoId", void 0);
class QueryExpedienteDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'createdAt';
        this.order = 'desc';
    }
}
exports.QueryExpedienteDto = QueryExpedienteDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryExpedienteDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryExpedienteDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "abogado_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "cliente_id", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "fecha_desde", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryExpedienteDto.prototype, "fecha_hasta", void 0);
class CreateActuacionDto {
}
exports.CreateActuacionDto = CreateActuacionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActuacionDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActuacionDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActuacionDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActuacionDto.prototype, "documento", void 0);
class QueryActuacionDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'fecha';
        this.order = 'desc';
    }
}
exports.QueryActuacionDto = QueryActuacionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryActuacionDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryActuacionDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryActuacionDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryActuacionDto.prototype, "order", void 0);
//# sourceMappingURL=expediente.dto.js.map