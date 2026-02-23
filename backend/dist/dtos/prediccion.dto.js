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
exports.QueryTendenciaDto = exports.QueryCasosSimilaresDto = exports.QueryPrediccionDto = exports.CreatePrediccionDto = exports.TipoPrediccionEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoPrediccionEnum;
(function (TipoPrediccionEnum) {
    TipoPrediccionEnum["RESULTADO"] = "RESULTADO";
    TipoPrediccionEnum["DURACION"] = "DURACION";
    TipoPrediccionEnum["COSTES"] = "COSTES";
    TipoPrediccionEnum["EXITO"] = "EXITO";
    TipoPrediccionEnum["RIESGO_PRESCRIPCION"] = "RIESGO_PRESCRIPCION";
})(TipoPrediccionEnum || (exports.TipoPrediccionEnum = TipoPrediccionEnum = {}));
class CreatePrediccionDto {
}
exports.CreatePrediccionDto = CreatePrediccionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePrediccionDto.prototype, "expedienteId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoPrediccionEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePrediccionDto.prototype, "tipoPrediccion", void 0);
class QueryPrediccionDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sort = 'createdAt';
        this.order = 'desc';
    }
}
exports.QueryPrediccionDto = QueryPrediccionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryPrediccionDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryPrediccionDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPrediccionDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPrediccionDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPrediccionDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryPrediccionDto.prototype, "expediente_id", void 0);
class QueryCasosSimilaresDto {
    constructor() {
        this.limite = 5;
    }
}
exports.QueryCasosSimilaresDto = QueryCasosSimilaresDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QueryCasosSimilaresDto.prototype, "expedienteId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], QueryCasosSimilaresDto.prototype, "limite", void 0);
class QueryTendenciaDto {
    constructor() {
        this.meses = 12;
    }
}
exports.QueryTendenciaDto = QueryTendenciaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryTendenciaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryTendenciaDto.prototype, "meses", void 0);
//# sourceMappingURL=prediccion.dto.js.map