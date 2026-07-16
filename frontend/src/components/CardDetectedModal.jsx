import { useState } from 'react'
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-1">¡Tarjeta detectada en la puerta!</h2>
        <p className="text-slate-400 text-sm mb-4">
          UID <span className="font-mono">{uid}</span> no esta registrado. Ingresa tu nombre y placa
          para registrarte y abrir la barrera.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <input
            required
            placeholder="Placa del auto"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-60"
            >
              {enviando ? 'Registrando...' : 'Registrarme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
