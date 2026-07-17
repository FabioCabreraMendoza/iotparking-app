import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, Clock, BarChart3, LogOut, PanelLeftClose, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import AdminMap from '../components/AdminMap'
import UsuariosAdmin from '../components/UsuariosAdmin'
import SystemClockControl from '../components/SystemClockControl'
import ReportCharts from '../components/ReportCharts'
import PlateSearch from '../components/PlateSearch'

const TABS = [
  { id: 'mapa', label: 'Mapa en vivo', icon: LayoutGrid },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'reloj', label: 'Reloj simulado', icon: Clock },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
]

export default function AdminView() {
  const [tab, setTab] = useState('mapa')
  const [menuCompacto, setMenuCompacto] = useState(false)
  const { logout, token } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-slate-100 flex flex-col">
      <header className="border-b border-white/5 bg-slate-950/40 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400 font-semibold">Sistema de Control</div>
            <h1 className="text-lg font-bold text-white leading-tight">Panel de Administrador</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuCompacto((value) => !value)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <PanelLeftClose size={16} /> <span className="hidden sm:inline">{menuCompacto ? 'Expandir' : 'Compactar'}</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-[auto_1fr] relative">
        <aside className={`border-b border-white/5 bg-slate-950/40 backdrop-blur-xl px-4 py-6 lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-73px)] z-20 ${menuCompacto ? 'lg:w-[90px]' : 'lg:w-[280px]'} transition-all duration-300`}>
          <div className={`text-[10px] uppercase tracking-[0.24em] text-slate-500 font-semibold mb-4 px-2 ${menuCompacto ? 'hidden lg:block lg:text-center lg:px-0' : ''}`}>
            Menú Principal
          </div>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all whitespace-nowrap ${
                  tab === id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                } ${menuCompacto ? 'lg:justify-center lg:px-0' : ''}`}
                title={menuCompacto ? label : ''}
              >
                <Icon size={18} className={tab === id ? 'text-emerald-400' : ''} />
                <span className={menuCompacto ? 'lg:hidden' : ''}>{label}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="p-4 sm:p-6 lg:p-8 animate-fade-in relative z-10 overflow-x-hidden">
          {tab === 'mapa' && <AdminMap token={token} />}
          {tab === 'usuarios' && <UsuariosAdmin token={token} />}
          {tab === 'reloj' && <SystemClockControl token={token} />}
          {tab === 'reportes' && (
            <div className="space-y-8 animate-slide-up">
              <ReportCharts token={token} />
              <PlateSearch token={token} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
