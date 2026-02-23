"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./routes/auth"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const crm_1 = __importDefault(require("./routes/crm"));
const expedientes_1 = __importDefault(require("./routes/expedientes"));
const facturas_1 = __importDefault(require("./routes/facturas"));
const documentos_1 = __importDefault(require("./routes/documentos"));
const calendario_1 = __importDefault(require("./routes/calendario"));
const oficio_1 = __importDefault(require("./routes/oficio"));
const lopdgdd_1 = __importDefault(require("./routes/lopdgdd"));
const legislacion_1 = __importDefault(require("./routes/legislacion"));
const integraciones_1 = __importDefault(require("./routes/integraciones"));
const prediccion_1 = __importDefault(require("./routes/prediccion"));
const errorHandler_1 = require("./middleware/errorHandler");
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Configurar Swagger
(0, swagger_1.setupSwagger)(app);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/usuarios', usuarios_1.default);
app.use('/api/v1/clientes', clientes_1.default);
app.use('/api/v1/crm', crm_1.default);
app.use('/api/v1/expedientes', expedientes_1.default);
app.use('/api/v1/facturas', facturas_1.default);
app.use('/api/v1/documentos', documentos_1.default);
app.use('/api/v1/calendario', calendario_1.default);
app.use('/api/v1/oficio', oficio_1.default);
app.use('/api/v1/lopdgdd', lopdgdd_1.default);
app.use('/api/v1/legislacion', legislacion_1.default);
app.use('/api/v1/integraciones', integraciones_1.default);
app.use('/api/v1/prediccion', prediccion_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` }
    });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map