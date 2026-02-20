import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// M1 - Core Legal
import Expedientes from './pages/core/Expedientes'
import ExpedienteDetail from './pages/ExpedienteDetail'
import Calendario from './pages/core/Calendario'
import Audiencias from './pages/core/Audiencias'
import Prescripciones from './pages/core/Prescripciones'

// M2 - Gestión Documental
import Biblioteca from './pages/documentos/Biblioteca'
import Buscar from './pages/documentos/Buscar'
import OCR from './pages/documentos/OCR'

// M3 - Finanzas
import Facturacion from './pages/finanzas/Facturacion'
import Contabilidad from './pages/finanzas/Contabilidad'
import Gastos from './pages/finanzas/Gastos'
import Rentabilidad from './pages/finanzas/Rentabilidad'

// M4 - Cobranza
import CobranzaDashboard from './pages/cobranza/Dashboard'
import CobranzaProveedores from './pages/cobranza/Proveedores'
import CobranzaConfig from './pages/cobranza/Config'

// M5 - Tiempo & Tareas
import Tareas from './pages/tiempo/Tareas'
import Tiempo from './pages/tiempo/Tracking'
import TiempoInformes from './pages/tiempo/Informes'

// M6 - Comunicaciones
import Mensajes from './pages/comunicaciones/Mensajes'
import Juzgados from './pages/comunicaciones/Juzgados'
import Notificaciones from './pages/comunicaciones/Notificaciones'

// M7 - Portal Cliente
import PortalCliente from './pages/portal/PortalCliente'

// M8 - Firmas Digitales
import Firmas from './pages/firmas/Firmas'

// M9 - Informes & BI
import Informes from './pages/informes/Informes'

// M10 - Biblioteca Legal
import Legislacion from './pages/biblioteca/Legislacion'
import Plantillas from './pages/biblioteca/Plantillas'

// M11 - IA Legal
import IAChat from './pages/ia/Chat'
import IABusqueda from './pages/ia/Busqueda'
import IAGenerador from './pages/ia/Generador'

// M12 - Biblioteca Forense
import ForenseVerificar from './pages/forense/Verificar'
import ForenseInformes from './pages/forense/Informes'

// M13 - Integraciones
import Lexnet from './pages/integraciones/Lexnet'

// Admin
import Admin from './pages/admin/Admin'
import Configuracion from './pages/admin/Configuracion'
import Usuarios from './pages/admin/Usuarios'
import AdminClientes from './pages/admin/AdminClientes'

// Otros
import Clientes from './pages/Clientes'
import ClienteDetail from './pages/ClienteDetail'
import Bitacora from './pages/Bitacora'
import Conflictos from './pages/Conflictos'
import ConflictosPartesContrarias from './pages/ConflictosPartesContrarias'
import AnalisisConflictos from './pages/AnalisisConflictos'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* M1 - Core Legal */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/core/expedientes" element={<Expedientes />} />
        <Route path="/core/expedientes/:id" element={<ExpedienteDetail />} />
        <Route path="/core/calendario" element={<Calendario />} />
        <Route path="/core/audiencias" element={<Audiencias />} />
        <Route path="/core/prescripciones" element={<Prescripciones />} />

        {/* M2 - Gestión Documental */}
        <Route path="/documentos/biblioteca" element={<Biblioteca />} />
        <Route path="/documentos/buscar" element={<Buscar />} />
        <Route path="/documentos/ocr" element={<OCR />} />

        {/* M3 - Finanzas */}
        <Route path="/finanzas/facturacion" element={<Facturacion />} />
        <Route path="/finanzas/contabilidad" element={<Contabilidad />} />
        <Route path="/finanzas/gastos" element={<Gastos />} />
        <Route path="/finanzas/rentabilidad" element={<Rentabilidad />} />

        {/* M4 - Cobranza */}
        <Route path="/cobranza/dashboard" element={<CobranzaDashboard />} />
        <Route path="/cobranza/proveedores" element={<CobranzaProveedores />} />
        <Route path="/cobranza/config" element={<CobranzaConfig />} />

        {/* M5 - Tiempo & Tareas */}
        <Route path="/tiempo/tareas" element={<Tareas />} />
        <Route path="/tiempo/tracking" element={<Tiempo />} />
        <Route path="/tiempo/informes" element={<TiempoInformes />} />

        {/* M6 - Comunicaciones */}
        <Route path="/comunicaciones/mensajes" element={<Mensajes />} />
        <Route path="/comunicaciones/juzgados" element={<Juzgados />} />
        <Route path="/comunicaciones/notificaciones" element={<Notificaciones />} />

        {/* M7 - Portal Cliente */}
        <Route path="/portal" element={<PortalCliente />} />
        <Route path="/portal-cliente" element={<PortalCliente />} />

        {/* M8 - Firmas Digitales */}
        <Route path="/firmas" element={<Firmas />} />

        {/* M9 - Informes & BI */}
        <Route path="/informes" element={<Informes />} />

        {/* M10 - Biblioteca Legal */}
        <Route path="/biblioteca/legislacion" element={<Legislacion />} />
        <Route path="/biblioteca/plantillas" element={<Plantillas />} />

        {/* M11 - IA Legal */}
        <Route path="/ia/chat" element={<IAChat />} />
        <Route path="/ia/busqueda" element={<IABusqueda />} />
        <Route path="/ia/generador" element={<IAGenerador />} />

        {/* M12 - Biblioteca Forense */}
        <Route path="/forense/verificar" element={<ForenseVerificar />} />
        <Route path="/forense/informes" element={<ForenseInformes />} />

        {/* M13 - Integraciones */}
        <Route path="/integraciones/lexnet" element={<Lexnet />} />

        {/* Admin */}
        <Route path="/admin/config" element={<Configuracion />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/clientes" element={<AdminClientes />} />
        <Route path="/admin" element={<Admin />} />

        {/* Otros (compatibilidad) */}
        <Route path="/expedientes" element={<Expedientes />} />
        <Route path="/expedientes/:id" element={<ExpedienteDetail />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<ClienteDetail />} />
        <Route path="/mensajes" element={<Mensajes />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/tareas" element={<Tareas />} />
        <Route path="/audiencias" element={<Audiencias />} />
        <Route path="/cobranza" element={<CobranzaDashboard />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/plantillas" element={<Plantillas />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/bitacora" element={<Bitacora />} />
        <Route path="/proveedores" element={<CobranzaProveedores />} />
        <Route path="/contabilidad" element={<Contabilidad />} />
        <Route path="/tiempo" element={<Tiempo />} />
        <Route path="/prescripciones" element={<Prescripciones />} />
        <Route path="/conflictos/partes" element={<ConflictosPartesContrarias />} />
        <Route path="/conflictos" element={<Conflictos />} />
        <Route path="/conflictos/analisis" element={<AnalisisConflictos />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
