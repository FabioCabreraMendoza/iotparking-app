import { useState, useEffect } from 'react'
import { apiFetch, authHeaders } from '../lib/api'

export default function SystemClockControl({ token }) {
  const [systemTime, setSystemTime] = useState(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(null)

  useEffect(() => {
    apiFetch('/api/system/time')
      .then((d) => setSystemTime(d.systemTime))
      .catch(() => {})
  }, [])

  const handleSet = async (e) => {
    e.preventDefault()
    setError(null)
    setOk(null)
    try {
      const data = await apiFetch('/api/system/time', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ datetime: new Date(input).toISOString() }),
      })
      setSystemTime(data.systemTime)
      setOk('Reloj simulado actualizado')
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
      setOk('Reloj simulado reiniciado al tiempo real')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md">
      <p className="text-sm text-slate-400 mb-1">Hora actual del sistema (real o simulada):</p>
      <p className="font-mono text-lg mb-4">{systemTime ? new Date(systemTime).toLocaleString() : '—'}</p>

      <form onSubmit={handleSet} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Nueva fecha/hora simulada</label>
          <input
            type="datetime-local"
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Reiniciar a tiempo real
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {ok && <p className="text-emerald-400 text-xs mt-2">{ok}</p>}
      <p className="text-xs text-slate-500 mt-4">
        Este offset se aplica a las reservas y al historial de accesos generado por eventos reales
        (RFID), permitiendo generar y verificar datos historicos simulados sin esperar tiempo real.
      </p>
    </div>
  )
}
