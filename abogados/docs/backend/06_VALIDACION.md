# 06 - Validación de Datos

## Visión General

Sistema de validación de datos utilizando class-validator y Zod para garantizar la integridad de los datos entrantes.

---

## Bibliotecas Utilizadas

| Biblioteca | Uso |
|------------|-----|
| class-validator | Validación con decorators (NestJS) |
| class-transformer | Transformación de datos |
| Zod | Validación schema-based |
| express-validator | Validación middleware Express |

---

## Validación con class-validator

### Decoradores Comunes

```typescript
import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumberString
} from 'class-validator';
import { Type } from 'class-transformer';
```

### Ejemplo: DTO de Expediente

```typescript
// create-expediente.dto.ts
export class CreateExpedienteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  numero_expediente: string;

  @IsEnum(TipoExpediente)
  tipo: TipoExpediente;

  @IsUUID()
  cliente_id: string;

  @IsUUID()
  @IsOptional()
  abogado_id?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;

  @IsDateString()
  fecha_apertura: string;

  @IsEnum(EstadoExpediente)
  @IsOptional()
  estado?: EstadoExpediente;
}
```

### DTOs Anidados

```typescript
// create-factura.dto.ts
export class LineaFacturaDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precio_unitario: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  iva_porcentaje?: number;
}

export class CreateFacturaDto {
  @IsUUID()
  cliente_id: string;

  @IsUUID()
  @IsOptional()
  expediente_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaFacturaDto)
  lineas: LineaFacturaDto[];

  @IsDateString()
  fecha_vencimiento: string;

  @IsEnum(TipoFactura)
  tipo: TipoFactura;
}
```

---

## Validación con Zod

### Schema de Cliente

```typescript
// schemas/cliente.schema.ts
import { z } from 'zod';

export const ClienteSchema = z.object({
  nif: z.string()
    .min(9, 'NIF debe tener 9 caracteres')
    .max(9, 'NIF debe tener 9 caracteres'),
  
  nombre: z.string()
    .min(2, 'Nombre muy corto')
    .max(200, 'Nombre muy largo'),
  
  razon_social: z.string()
    .max(200)
    .optional(),
  
  email: z.string()
    .email('Email inválido'),
  
  telefono: z.string()
    .regex(/^\+?[0-9]{9,15}$/, 'Teléfono inválido')
    .optional(),
  
  tipo: z.enum(['particular', 'empresa', 'autonomo']),
  
  direccion: z.object({
    calle: z.string().max(200),
    codigo_postal: z.string().max(10),
    ciudad: z.string().max(100),
    provincia: z.string().max(100),
    pais: z.string().default('ES')
  }).optional()
});

export type ClienteInput = z.infer<typeof ClienteSchema>;
```

### Uso de Zod en Controladores

```typescript
// cliente.controller.ts
@Post()
async create(@Body() body: unknown) {
  const result = ClienteSchema.safeParse(body);
  
  if (!result.success) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      details: result.error.flatten()
    });
  }
  
  return this.clienteService.create(result.data);
}
```

---

## Validación Personalizada

### Decorador Personalizado: NIF

```typescript
// decorators/is-nif.decorator.ts
import { 
  registerDecorator, 
  ValidationOptions, 
  ValidationArguments 
} from 'class-validator';

export function IsNIF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNIF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          
          const nifRegex = /^[0-9]{8}[A-Z]$/;
          const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
          
          return nifRegex.test(value) || nieRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser un NIF o NIE válido`;
        }
      }
    });
  };
}
```

### Validador Personalizado: Fecha Futura

```typescript
// decorators/is-future-date.decorator.ts
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return false;
          const date = new Date(value);
          return date > new Date();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser una fecha futura`;
        }
      }
    });
  };
}
```

---

## Pipe de Validación Global

### NestJS

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip properties no definidas en DTO
    forbidNonWhitelisted: true, // Lanzar error si propiedades extra
    transform: true,            // Transformar payloads a DTOs
    transformOptions: {
      enableImplicitConversion: true
    },
    stopAtFirstError: true,    // Detener en primer error
    validateCustomDecorators: true
  })
);
```

### Configuración de Errores

```typescript
// Exception filter para errores de validación
@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const errors = exception.validationErrors.map(err => ({
      field: err.property,
      errors: Object.values(err.constraints || {})
    }));
    
    response.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: errors
      }
    });
  }
}
```

---

## Sanitización

### Input Sanitization

```typescript
// decorators/sanitize.decorator.ts
import { sanitize as sanitizeHtml } from 'sanitize-html';

export function Sanitize() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalSetter = descriptor.set;
    
    descriptor.set = function(value: any) {
      if (typeof value === 'string') {
        value = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
      originalSetter?.call(this, value);
    };
    
    return descriptor;
  };
}
```

### Uso

```typescript
export class UpdateClienteDto {
  @Sanitize()
  @IsString()
  @IsOptional()
  notas?: string;
}
```

---

## Validación de Archivos

```typescript
// dto/upload.dto.ts
export class UploadFileDto {
  @IsFile()
  @MaxFileSize(10 * 1024 * 1024) // 10MB
  @AllowedMimeTypes(['application/pdf', 'image/png', 'image/jpeg'])
  file: Express.Multer.File;
}
```

---

## Mensajes de Error

### Traducción de Errores

```typescript
// messages/es.ts
export const validationMessages = {
  isNotEmpty: 'El campo $property es obligatorio',
  isEmail: 'El campo $property debe ser un email válido',
  isString: 'El campo $property debe ser una cadena de texto',
  minLength: 'El campo $property debe tener al menos $constraint1 caracteres',
  maxLength: 'El campo $property debe tener como máximo $constraint1 caracteres',
  isUUID: 'El campo $property debe ser un UUID válido',
  isEnum: 'El campo $property debe ser uno de: $constraint1'
};
```

---

## Best Practices

1. **Whitelist** - Solo permitir propiedades conocidas
2. **Transformación** - Convertir tipos automáticamente
3. **Mensajes claros** - Errores descriptivos en español
4. **Validación dual** - Backend + Frontend
5. **Límites estrictos** - Prevenir ataques de tamaño
6. **Logs de validación** - Registrar intentos fallidos
