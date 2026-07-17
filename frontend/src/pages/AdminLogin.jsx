import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck, User, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  if (isAuthenticated) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return
    setError(null)
    setCargando(true)
    try {
      await login(username, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-panel rounded-[2rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-indigo-900/20 border border-white/10">
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-fade-in">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Acceso Restringido</h1>
            <p className="text-sm text-slate-400 text-center">Ingresa tus credenciales para acceder al panel de administración.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-1">Usuario</label>
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900/50 border border-white/10 pl-11 pr-4 py-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900/50 border border-white/10 pl-11 pr-4 py-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 tracking-widest"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2 animate-fade-in">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 mt-4"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  Ingresar al Sistema <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
