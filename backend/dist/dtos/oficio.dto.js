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
exports.QueryLiquidacionDto = exports.UpdateLiquidacionDto = exports.CreateLiquidacionDto = exports.QueryGuardiaDto = exports.CreateGuardiaDto = exports.QueryTurnoDto = exports.UpdateTurnoDto = exports.CreateTurnoDto = exports.EstadoLiquidacionEnum = exports.TipoGuardiaEnum = exports.TipoTurnoEnum = exports.EstadoTurnoEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var EstadoTurnoEnum;
(function (EstadoTurnoEnum) {
    EstadoTurnoEnum["PENDIENTE"] = "PENDIENTE";
    EstadoTurnoEnum["ATENDIENDO"] = "ATENDIENDO";
    EstadoTurnoEnum["ATENDIDO"] = "ATENDIDO";
    EstadoTurnoEnum["CANCELADO"] = "CANCELADO";
})(EstadoTurnoEnum || (exports.EstadoTurnoEnum = EstadoTurnoEnum = {}));
var TipoTurnoEnum;
(function (TipoTurnoEnum) {
    TipoTurnoEnum["CONSULTA"] = "CONSULTA";
    TipoTurnoEnum["GESTION"] = "GESTION";
    TipoTurnoEnum["URGENCIA"] = "URGENCIA";
})(TipoTurnoEnum || (exports.TipoTurnoEnum = TipoTurnoEnum = {}));
var TipoGuardiaEnum;
(function (TipoGuardiaEnum) {
    TipoGuardiaEnum["PRESENCIAL"] = "PRESENCIAL";
    TipoGuardiaEnum["TELEFONICA"] = "TELEFONICA";
    TipoGuardiaEnum["MIXTA"] = "MIXTA";
})(TipoGuardiaEnum || (exports.TipoGuardiaEnum = TipoGuardiaEnum = {}));
var EstadoLiquidacionEnum;
(function (EstadoLiquidacionEnum) {
    EstadoLiquidacionEnum["PENDIENTE"] = "PENDIENTE";
    EstadoLiquidacionEnum["PAGADA"] = "PAGADA";
    EstadoLiquidacionEnum["ANULADA"] = "ANULADA";
})(EstadoLiquidacionEnum || (exports.EstadoLiquidacionEnum = EstadoLiquidacionEnum = {}));
class CreateTurnoDto {
}
exports.CreateTurnoDto = CreateTurnoDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTurnoDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoTurnoEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTurnoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTurnoDto.prototype, "centro", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTurnoDto.prototype, "usuarioId", void 0);
class UpdateTurnoDto {
}
exports.UpdateTurnoDto = UpdateTurnoDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTurnoDto.prototype, "fecha", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EstadoTurnoEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTurnoDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoTurnoEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTurnoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTurnoDto.prototype, "centro", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTurnoDto.prototype, "usuarioId", void 0);
class QueryTurnoDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'fecha';
        this.order = 'desc';
    }
}
exports.QueryTurnoDto = QueryTurnoDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryTurnoDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryTurnoDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTurnoDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTurnoDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTurnoDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTurnoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTurnoDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTurnoDto.prototype, "fecha_desde", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTurnoDto.prototype, "fecha_hasta", void 0);
class CreateGuardiaDto {
}
exports.CreateGuardiaDto = CreateGuardiaDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGuardiaDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGuardiaDto.prototype, "fechaFin", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoGuardiaEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGuardiaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuardiaDto.prototype, "centro", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuardiaDto.prototype, "usuarioId", void 0);
class QueryGuardiaDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'fechaInicio';
        this.order = 'desc';
    }
}
exports.QueryGuardiaDto = QueryGuardiaDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryGuardiaDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryGuardiaDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryGuardiaDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryGuardiaDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryGuardiaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryGuardiaDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryGuardiaDto.prototype, "fecha_desde", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryGuardiaDto.prototype, "fecha_hasta", void 0);
class CreateLiquidacionDto {
}
exports.CreateLiquidacionDto = CreateLiquidacionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLiquidacionDto.prototype, "importe", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLiquidacionDto.prototype, "turnoId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EstadoLiquidacionEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLiquidacionDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLiquidacionDto.prototype, "fechaLiquidacion", void 0);
class UpdateLiquidacionDto {
}
exports.UpdateLiquidacionDto = UpdateLiquidacionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateLiquidacionDto.prototype, "importe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EstadoLiquidacionEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLiquidacionDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLiquidacionDto.prototype, "fechaLiquidacion", void 0);
class QueryLiquidacionDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'createdAt';
        this.order = 'desc';
    }
}
exports.QueryLiquidacionDto = QueryLiquidacionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryLiquidacionDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryLiquidacionDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLiquidacionDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLiquidacionDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLiquidacionDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLiquidacionDto.prototype, "turnoId", void 0);
//# sourceMappingURL=oficio.dto.js.map