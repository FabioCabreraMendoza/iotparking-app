import { useState } from 'react'
import { Search } from 'lucide-react'
import { apiFetch, authHeaders } from '../lib/api'

export default function PlateSearch({ token }) {
  const [placa, setPlaca] = useState('')
  const [resultados, setResultados] = useState([])
  const [error, setError] = useState(null)
  const [buscado, setBuscado] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const data = await apiFetch(`/api/historial?placa=${encodeURIComponent(placa)}`, {
        headers: authHeaders(token),
      })
      setResultados(data)
      setBuscado(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Búsqueda por placa</h3>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          required
          placeholder="Placa del vehiculo"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-500 flex-1"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 flex items-center gap-1"
        >
          <Search size={14} /> Buscar
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      {buscado && (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="text-left px-3 py-2">Evento</th>
                <th className="text-left px-3 py-2">Fecha y hora</th>
                <th className="text-left px-3 py-2">RFID UID</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td
                    className={`px-3 py-2 font-medium ${r.evento === 'ENTRADA' ? 'text-emerald-400' : 'text-orange-400'}`}
                  >
                    {r.evento}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono text-slate-500">{r.rfid_uid}</td>
                </tr>
              ))}
              {resultados.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                    Sin resultados para esa placa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
