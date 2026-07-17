import { useState } from 'react'
import { IdCard, CreditCard, X, ShieldAlert } from 'lucide-react'
import { apiFetch } from '../lib/api'

export default function CardDetectedModal({ uid, onClose, onRegistered }) {
  const [nombre, setNombre] = useState('')
  const [placa, setPlaca] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await apiFetch('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({ uid, nombre, placa }),
      })
      onRegistered()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden animate-slide-up">
        {/* Glow effect behind modal */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 animate-pulse-slow">
            <CreditCard size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">¡Nueva Tarjeta Detectada!</h2>
          <p className="text-slate-400 text-sm">
            UID <span className="font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 mx-1">{uid}</span>
            no está registrado. Regístrate para acceder.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                required
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700/50 pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
              />
            </div>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                required
                placeholder="Placa del auto (ej. ABC-123)"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700/50 pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500 uppercase"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {enviando ? 'Registrando...' : 'Registrarme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
