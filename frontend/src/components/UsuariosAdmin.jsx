import { useEffect, useState, useCallback } from 'react'
import { Trash2, Search } from 'lucide-react'
import { apiFetch, authHeaders } from '../lib/api'

export default function UsuariosAdmin({ token }) {
  const [usuarios, setUsuarios] = useState([])
  const [placa, setPlaca] = useState('')
  const [error, setError] = useState(null)

  const cargar = useCallback(() => {
    const query = placa ? `?placa=${encodeURIComponent(placa)}` : ''
    apiFetch(`/api/usuarios${query}`, { headers: authHeaders(token) })
      .then(setUsuarios)
      .catch((err) => setError(err.message))
  }, [placa, token])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar este usuario?')) return
    try {
      await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE', headers: authHeaders(token) })
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Search size={16} className="text-slate-500" />
        <input
          placeholder="Buscar por placa..."
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-500 w-64"
        />
      </div>
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Placa</th>
              <th className="text-left px-3 py-2">RFID UID</th>
              <th className="text-left px-3 py-2">Registrado</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{u.nombre}</td>
                <td className="px-3 py-2 font-mono">{u.placa_auto}</td>
                <td className="px-3 py-2 font-mono text-slate-500">{u.rfid_uid}</td>
                <td className="px-3 py-2 text-slate-500">{new Date(u.fecha_registro).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  Sin usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
