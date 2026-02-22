import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale, Send, CheckCircle, Phone, Mail, MapPin, Clock,
} from 'lucide-react';
import { crmService } from '@/services/crmService';

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', empresa: '', tipoServicio: '', mensaje: '',
  });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const tiposServicio = [
    'Derecho laboral', 'Derecho mercantil', 'Derecho de familia', 'Derecho penal',
    'Derecho civil', 'Derecho inmobiliario', 'Propiedad intelectual', 'Otro',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.tipoServicio) return;
    setEnviando(true);
    await crmService.createLead({
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      empresa: form.empresa || undefined,
      fuente: 'web',
      etapa: 'nuevo',
      valorEstimado: 0,
      probabilidad: 10,
      prioridad: 'media',
      abogadoAsignado: 'Sin asignar',
      tipoServicio: form.tipoServicio,
      notas: form.mensaje,
      fechaUltimoContacto: new Date().toISOString().split('T')[0],
    });
    setEnviando(false);
    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DERECHO Legal ERP</h1>
          <p className="text-slate-400 text-lg">Solicite una consulta con nuestro equipo de abogados</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {enviado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Solicitud enviada!</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Hemos recibido su consulta. Un abogado de nuestro equipo se pondrá en contacto
                  con usted en las próximas 24 horas hábiles.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 space-y-5"
              >
                <h2 className="text-xl font-bold text-white mb-4">Formulario de Contacto</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre completo *</label>
                    <input
                      type="text" required value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Su nombre"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                    <input
                      type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@ejemplo.com"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Teléfono</label>
                    <input
                      type="tel" value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="+34 600 000 000"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Empresa</label>
                    <input
                      type="text" value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      placeholder="Nombre de su empresa"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo de servicio *</label>
                  <select
                    required value={form.tipoServicio}
                    onChange={(e) => setForm({ ...form, tipoServicio: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent"
                  >
                    <option value="">Seleccione un área</option>
                    {tiposServicio.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción de su caso</label>
                  <textarea
                    rows={4} value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    placeholder="Describa brevemente su situación..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <button
                  type="submit" disabled={enviando}
                  className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Al enviar este formulario acepta nuestra política de privacidad. Sus datos se tratarán conforme al RGPD.
                </p>
              </motion.form>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
              <h3 className="text-lg font-bold text-white">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Teléfono</p>
                    <p className="text-sm text-slate-400">+34 91 123 45 67</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email</p>
                    <p className="text-sm text-slate-400">info@derechoerp.es</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Dirección</p>
                    <p className="text-sm text-slate-400">C/ Serrano 55, 28006 Madrid</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Horario</p>
                    <p className="text-sm text-slate-400">Lun - Vie: 9:00 - 19:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
              <p className="text-sm text-accent font-medium mb-2">Primera consulta gratuita</p>
              <p className="text-xs text-slate-400">
                Ofrecemos una primera valoración sin compromiso para evaluar su caso y
                orientarle sobre las mejores opciones legales disponibles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
