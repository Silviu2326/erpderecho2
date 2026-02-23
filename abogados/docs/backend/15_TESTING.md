# Testing - Estrategia de Pruebas

## Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTRATEGIA DE TESTING                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │    UNIT     │───►│ INTEGRACIÓN │───►│     E2E     │  │
│   │   TESTS    │    │   TESTS    │    │   TESTS    │  │
│   └─────────────┘    └─────────────┘    └─────────────┘  │
│        │                  │                  │           │
│        ▼                  ▼                  ▼           │
│   ┌─────────────────────────────────────────────────────┐ │
│   │                   COVERAGE GOAL                    │ │
│   │              > 80% unit, > 70% total              │ │
│   └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Herramientas

| Tipo | Herramienta |
|------|-------------|
| Unit | Jest |
| Integración | Supertest |
| E2E | Playwright |
| Mocking | Jest Mocks |
| Coverage | Jest Coverage |
| Fixtures | Factory Bot |

---

## Estructura de Tests

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.service.spec.ts
│   │   └── auth.e2e.spec.ts
│   └── usuarios/
│       ├── usuarios.controller.spec.ts
│       └── usuarios.service.spec.ts
├── common/
│   └── __mocks__/
└── fixtures/
    ├── usuario.fixture.ts
    └── expediente.fixture.ts
```

---

## Unit Tests

### Ejemplo: AuthService

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let userRepo: MockType<Repository<User>>;
  let jwtService: MockType<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = { id: '1', email: 'test@test.com', password: 'hash' };
      userRepo.findOne.mockResolvedValue(user);
      
      const result = await service.validateUser('test@test.com', 'password');
      
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      
      const result = await service.validateUser('notfound@test.com', 'password');
      
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const user = { id: '1', email: 'test@test.com' };
      jwtService.sign.mockReturnValue('token');
      
      const result = await service.login(user);
      
      expect(result.access_token).toBe('token');
    });
  });
});
```

---

## Integration Tests

### Ejemplo: ExpedientesController

```typescript
// expediente.controller.spec.ts
describe('ExpedientesController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    jwtToken = await login(app, 'admin@test.com', 'password');
  });

  describe('GET /api/v1/expedientes', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/expedientes')
        .expect(401);
    });

    it('should return list of expedientes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/expedientes')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('POST /api/v1/expedientes', () => {
    it('should create expediente', () => {
      return request(app.getHttpServer())
        .post('/api/v1/expedientes')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          numero_expediente: 'TEST-001',
          tipo: 'civil',
          cliente_id: 'uuid',
          asunto: 'Test',
        })
        .expect(201);
    });
  });
});
```

---

## Cobertura

```json
// jest.config.js
{
  "coverageDirectory": "coverage",
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/main.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    },
    "src/modules/auth/**": {
      "branches": 80,
      "functions": 80,
      "lines": 80
    }
  }
}
```

---

## Fixtures

```typescript
// fixtures/usuario.fixture.ts
export const usuarioFixture = (overrides?: Partial<User>): User => ({
  id: 'uuid-1234',
  email: 'test@bufete.es',
  nombre: 'Juan',
  apellido1: 'García',
  rol: 'abogado',
  activo: true,
  created_at: new Date(),
  ...overrides,
});

export const createUsuarioMock = (overrides?: Partial<User>) => 
  jest.fn(() => Promise.resolve(usuarioFixture(overrides)));
```

---

## CI/CD

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Comandos

```bash
# Unit tests
npm test

# Unit tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```
