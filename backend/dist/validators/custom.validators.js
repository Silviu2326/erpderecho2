"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCIF = IsCIF;
exports.IsNIF = IsNIF;
exports.IsNumeroExpediente = IsNumeroExpediente;
exports.IsPhone = IsPhone;
exports.IsCP = IsCP;
const class_validator_1 = require("class-validator");
const CIF_REGEX = /^[A-Z]{1}[0-9]{8}$/;
const NIF_REGEX = /^[0-9]{8}[A-Z]$/i;
const NUMERO_EXPEDIENTE_REGEX = /^\d{4}\/\d{4,8}$/;
const PHONE_REGEX = /^\+?[0-9]{9,15}$/;
function IsCIF(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCIF',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'El CIF debe tener el formato correcto (una letra mayúscula seguida de 8 dígitos)',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return CIF_REGEX.test(value);
                },
            },
        });
    };
}
function IsNIF(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isNIF',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'El NIF debe tener el formato correcto (8 dígitos seguidos de una letra)',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return NIF_REGEX.test(value);
                },
            },
        });
    };
}
function IsNumeroExpediente(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isNumeroExpediente',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'El número de expediente debe tener el formato AAAA/NNNNNN',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return NUMERO_EXPEDIENTE_REGEX.test(value);
                },
            },
        });
    };
}
function IsPhone(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isPhone',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'El teléfono debe tener entre 9 y 15 dígitos, puede empezar con +',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return PHONE_REGEX.test(value);
                },
            },
        });
    };
}
function IsCP(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCP',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'El código postal debe tener 5 dígitos',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    return /^[0-9]{5}$/.test(value);
                },
            },
        });
    };
}
//# sourceMappingURL=custom.validators.js.map