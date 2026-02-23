import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const CIF_REGEX = /^[A-Z]{1}[0-9]{8}$/;
const NIF_REGEX = /^[0-9]{8}[A-Z]$/i;
const NUMERO_EXPEDIENTE_REGEX = /^\d{4}\/\d{4,8}$/;
const PHONE_REGEX = /^\+?[0-9]{9,15}$/;

export function IsCIF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCIF',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'El CIF debe tener el formato correcto (una letra mayúscula seguida de 8 dígitos)',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return CIF_REGEX.test(value);
        },
      },
    });
  };
}

export function IsNIF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNIF',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'El NIF debe tener el formato correcto (8 dígitos seguidos de una letra)',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return NIF_REGEX.test(value);
        },
      },
    });
  };
}

export function IsNumeroExpediente(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNumeroExpediente',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'El número de expediente debe tener el formato AAAA/NNNNNN',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return NUMERO_EXPEDIENTE_REGEX.test(value);
        },
      },
    });
  };
}

export function IsPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'El teléfono debe tener entre 9 y 15 dígitos, puede empezar con +',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return PHONE_REGEX.test(value);
        },
      },
    });
  };
}

export function IsCP(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCP',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'El código postal debe tener 5 dígitos',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return /^[0-9]{5}$/.test(value);
        },
      },
    });
  };
}
