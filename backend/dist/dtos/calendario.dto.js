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
exports.QueryCalendarioDto = exports.QueryEventoDto = exports.UpdateEventoDto = exports.CreateEventoDto = exports.TipoEventoEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoEventoEnum;
(function (TipoEventoEnum) {
    TipoEventoEnum["AUDIENCIA"] = "AUDIENCIA";
    TipoEventoEnum["PLAZO"] = "PLAZO";
    TipoEventoEnum["TAREA"] = "TAREA";
    TipoEventoEnum["CITACION"] = "CITACION";
    TipoEventoEnum["NOTIFICACION"] = "NOTIFICACION";
    TipoEventoEnum["OTRO"] = "OTRO";
})(TipoEventoEnum || (exports.TipoEventoEnum = TipoEventoEnum = {}));
class CreateEventoDto {
}
exports.CreateEventoDto = CreateEventoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventoDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventoDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventoDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventoDto.prototype, "fechaFin", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoEventoEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventoDto.prototype, "expedienteId", void 0);
class UpdateEventoDto {
}
exports.UpdateEventoDto = UpdateEventoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEventoDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEventoDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEventoDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEventoDto.prototype, "fechaFin", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoEventoEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEventoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEventoDto.prototype, "expedienteId", void 0);
class QueryEventoDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'fechaInicio';
        this.order = 'asc';
    }
}
exports.QueryEventoDto = QueryEventoDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryEventoDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryEventoDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryEventoDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryEventoDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryEventoDto.prototype, "expediente_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoEventoEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryEventoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryEventoDto.prototype, "fecha_desde", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryEventoDto.prototype, "fecha_hasta", void 0);
class QueryCalendarioDto {
}
exports.QueryCalendarioDto = QueryCalendarioDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryCalendarioDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryCalendarioDto.prototype, "anio", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCalendarioDto.prototype, "fecha_desde", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryCalendarioDto.prototype, "fecha_hasta", void 0);
//# sourceMappingURL=calendario.dto.js.map