import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import clientesRoutes from './routes/clientes';
import crmRoutes from './routes/crm';
import expedientesRoutes from './routes/expedientes';
import facturasRoutes from './routes/facturas';
import documentosRoutes from './routes/documentos';
import calendarioRoutes from './routes/calendario';
import oficioRoutes from './routes/oficio';
import lopdgddRoutes from './routes/lopdgdd';
import legislacionRoutes from './routes/legislacion';
import integracionesRoutes from './routes/integraciones';
import prediccionRoutes from './routes/prediccion';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Configurar Swagger
setupSwagger(app);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/usuarios', usuariosRoutes);
app.use('/api/v1/clientes', clientesRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/expedientes', expedientesRoutes);
app.use('/api/v1/facturas', facturasRoutes);
app.use('/api/v1/documentos', documentosRoutes);
app.use('/api/v1/calendario', calendarioRoutes);
app.use('/api/v1/oficio', oficioRoutes);
app.use('/api/v1/lopdgdd', lopdgddRoutes);
app.use('/api/v1/legislacion', legislacionRoutes);
app.use('/api/v1/integraciones', integracionesRoutes);
app.use('/api/v1/prediccion', prediccionRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` }
  });
});

app.use(errorHandler);

export default app;
