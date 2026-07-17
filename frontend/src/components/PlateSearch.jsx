import { useState } from 'react'
import { Search, CarFront, ShieldAlert, History } from 'lucide-react'
import { apiFetch, authHeaders } from '../lib/api'

export default function PlateSearch({ token }) {
  const [placa, setPlaca] = useState('')
  const [resultados, setResultados] = useState([])
  const [error, setError] = useState(null)
  const [buscado, setBuscado] = useState(false)
  const [cargando, setCargando] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!placa.trim()) return
    
    setError(null)
    setCargando(true)
    try {
      const data = await apiFetch(`/api/historial?placa=${encodeURIComponent(placa)}`, {
        headers: authHeaders(token),
      })
      setResultados(data)
      setBuscado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
        <CarFront size={14} /> Historial de Tránsito
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">Rastreo por Placa</h2>
      <p className="text-sm text-slate-400 mb-6">Consulta los registros históricos de entradas y salidas de un vehículo específico.</p>
      
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <input
            required
            placeholder="Introduce la placa (Ej. ABC-123)"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            className="w-full rounded-2xl bg-slate-900/50 border border-white/10 pl-11 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 uppercase tracking-widest font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-indigo-500 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 min-w-[140px]"
        >
          {cargando ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Buscando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={16} /> Rastrear
            </span>
          )}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 flex items-center gap-3 animate-slide-up">
          <ShieldAlert size={20} className="text-red-400" />
          {error}
        </div>
      )}

      {buscado && (
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900/30 backdrop-blur-md animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/80 border-b border-white/10 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Tipo de Evento</th>
                  <th className="px-6 py-4">Fecha y Hora del Registro</th>
                  <th className="px-6 py-4 text-right">Identificador (UID)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {resultados.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase border ${
                        r.evento === 'ENTRADA' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {r.evento === 'ENTRADA' ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                        {r.evento}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {new Date(r.timestamp).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono text-slate-500 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-800">
                        {r.rfid_uid}
                      </span>
                    </td>
                  </tr>
                ))}
                {resultados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <History size={32} className="text-slate-600 opacity-50" />
                        <p>No se encontraron registros históricos para la placa <strong>{placa}</strong>.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
