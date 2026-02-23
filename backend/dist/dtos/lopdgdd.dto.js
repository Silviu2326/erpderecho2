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
exports.QueryBrechaDto = exports.CreateBrechaDto = exports.QueryDerechoARCOdto = exports.ProcesarDerechoARCOdto = exports.CreateDerechoARCOdto = exports.QueryConsentimientoDto = exports.CreateConsentimientoDto = void 0;
const class_validator_1 = require("class-validator");
class CreateConsentimientoDto {
}
exports.CreateConsentimientoDto = CreateConsentimientoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsentimientoDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsentimientoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateConsentimientoDto.prototype, "granted", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateConsentimientoDto.prototype, "fechaConsentimiento", void 0);
class QueryConsentimientoDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryConsentimientoDto = QueryConsentimientoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryConsentimientoDto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryConsentimientoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryConsentimientoDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryConsentimientoDto.prototype, "limit", void 0);
class CreateDerechoARCOdto {
}
exports.CreateDerechoARCOdto = CreateDerechoARCOdto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDerechoARCOdto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ACCESO', 'RECTIFICACION', 'SUPRESION', 'OPOSICION', 'PORTABILIDAD', 'LIMITACION']),
    __metadata("design:type", String)
], CreateDerechoARCOdto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDerechoARCOdto.prototype, "fechaSolicitud", void 0);
class ProcesarDerechoARCOdto {
}
exports.ProcesarDerechoARCOdto = ProcesarDerechoARCOdto;
__decorate([
    (0, class_validator_1.IsEnum)(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO']),
    __metadata("design:type", String)
], ProcesarDerechoARCOdto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcesarDerechoARCOdto.prototype, "fechaRespuesta", void 0);
class QueryDerechoARCOdto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryDerechoARCOdto = QueryDerechoARCOdto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryDerechoARCOdto.prototype, "clienteId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ACCESO', 'RECTIFICACION', 'SUPRESION', 'OPOSICION', 'PORTABILIDAD', 'LIMITACION']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryDerechoARCOdto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'RECHAZADO']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryDerechoARCOdto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryDerechoARCOdto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryDerechoARCOdto.prototype, "limit", void 0);
class CreateBrechaDto {
}
exports.CreateBrechaDto = CreateBrechaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBrechaDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBrechaDto.prototype, "fechaDeteccion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBrechaDto.prototype, "fechaNotificacionAepd", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['DETECTADA', 'INVESTIGANDO', 'CONTENIDA', 'NOTIFICADA', 'CERRADA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBrechaDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBrechaDto.prototype, "medidas", void 0);
class QueryBrechaDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.QueryBrechaDto = QueryBrechaDto;
__decorate([
    (0, class_validator_1.IsEnum)(['DETECTADA', 'INVESTIGANDO', 'CONTENIDA', 'NOTIFICADA', 'CERRADA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryBrechaDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryBrechaDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryBrechaDto.prototype, "limit", void 0);
//# sourceMappingURL=lopdgdd.dto.js.map