import { useEffect, useState, useCallback } from 'react'
import { Trash2, Search, Users, ShieldAlert } from 'lucide-react'
import { apiFetch, authHeaders } from '../lib/api'

export default function UsuariosAdmin({ token }) {
  const [usuarios, setUsuarios] = useState([])
  const [placa, setPlaca] = useState('')
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(null)

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
    if (!window.confirm('¿Borrar este usuario de forma permanente?')) return
    setIsDeleting(id)
    try {
      await apiFetch(`/api/usuarios/${id}`, { method: 'DELETE', headers: authHeaders(token) })
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
              <Users size={14} /> Control de Acceso
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Directorio de Usuarios</h2>
            <p className="mt-1 text-sm text-slate-400">Gestiona los conductores registrados y sus credenciales RFID.</p>
          </div>
          
          <div className="relative group w-full md:w-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            <input
              placeholder="Buscar por placa (Ej. ABC-123)"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="w-full md:w-80 rounded-2xl bg-slate-900/50 border border-white/10 pl-11 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 flex items-center gap-3 animate-slide-up relative z-10">
            <ShieldAlert size={20} className="text-red-400" />
            {error}
          </div>
        )}

        <div className="relative z-10 rounded-2xl border border-white/10 overflow-hidden bg-slate-900/30 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/80 border-b border-white/10 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Conductor</th>
                  <th className="px-6 py-4">Placa</th>
                  <th className="px-6 py-4">Tarjeta RFID</th>
                  <th className="px-6 py-4">Fecha Registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{u.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-indigo-300 font-medium tracking-wider">
                        {u.placa_auto}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
                        {u.rfid_uid}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(u.fecha_registro).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(u.id)} 
                        disabled={isDeleting === u.id}
                        className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/80 transition-all disabled:opacity-50"
                        title="Borrar usuario"
                      >
                        <Trash2 size={18} className={isDeleting === u.id ? 'animate-pulse' : ''} />
                      </button>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users size={32} className="text-slate-600 opacity-50" />
                        <p>No se encontraron usuarios registrados.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
