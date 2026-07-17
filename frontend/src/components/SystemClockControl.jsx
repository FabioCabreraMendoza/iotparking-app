import { useState, useEffect } from 'react'
import { Clock, RefreshCcw, History, AlertCircle, CheckCircle2 } from 'lucide-react'
import { apiFetch, authHeaders } from '../lib/api'

export default function SystemClockControl({ token }) {
  const [systemTime, setSystemTime] = useState(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(null)

  const fetchTime = () => {
    apiFetch('/api/system/time')
      .then((d) => setSystemTime(d.systemTime))
      .catch(() => {})
  }

  useEffect(() => {
    fetchTime()
    const interval = setInterval(fetchTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSet = async (e) => {
    e.preventDefault()
    if (!input) return
    setError(null)
    setOk(null)
    try {
      const data = await apiFetch('/api/system/time', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ datetime: new Date(input).toISOString() }),
      })
      setSystemTime(data.systemTime)
      setOk('Reloj simulado actualizado exitosamente')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReset = async () => {
    setError(null)
    setOk(null)
    try {
      const data = await apiFetch('/api/system/time/reset', { method: 'POST', headers: authHeaders(token) })
      setSystemTime(data.systemTime)
      setInput('')
      setOk('Reloj del sistema restaurado al tiempo real')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl animate-slide-up">
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <History size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Máquina del Tiempo</h2>
          <p className="text-sm text-slate-400">Simula saltos temporales para probar reglas de reservas y reportes.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 relative z-10">
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center">
          <Clock size={32} className="text-indigo-400 mb-3" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Hora Actual del Sistema</p>
          <p className="font-mono text-xl sm:text-2xl font-bold text-slate-200 tracking-tight">
            {systemTime ? new Date(systemTime).toLocaleString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric', 
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            }) : '---'}
          </p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSet} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Nueva fecha y hora (Simulada)</label>
              <input
                type="datetime-local"
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={16} /> Restaurar Real
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 hover:-translate-y-0.5 transition-all"
              >
                Viajar en el Tiempo
              </button>
            </div>
          </form>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2 animate-fade-in">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              {error}
            </div>
          )}
          {ok && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              {ok}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
        <p className="text-xs leading-relaxed text-slate-500">
          <strong className="text-slate-400">Nota técnica:</strong> Este desfase temporal se aplica a las reglas de negocio (ej. expiración de reservas) y al historial de eventos (ej. registros de entrada/salida RFID). Es una herramienta exclusiva para validar escenarios como "fin de mes" u "horas pico" sin tener que esperar en tiempo real.
        </p>
      </div>
    </div>
  )
}
