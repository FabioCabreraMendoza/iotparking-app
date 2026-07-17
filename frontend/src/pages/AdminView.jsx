import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, Clock, BarChart3, LogOut, PanelLeftClose } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/90 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Sistema de estacionamiento inteligente</div>
          <h1 className="text-xl font-bold text-white">Panel de Administrador</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuCompacto((value) => !value)}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            <PanelLeftClose size={16} /> {menuCompacto ? 'Expandir menú' : 'Compactar menú'}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[280px_1fr]">
        <aside className={`border-b border-slate-800 bg-slate-950/95 px-4 py-4 lg:border-b-0 lg:border-r lg:px-5 ${menuCompacto ? 'lg:w-[110px]' : ''}`}>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Menú interactivo</div>
          <div className="mt-4 space-y-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  tab === id
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-white shadow-lg shadow-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                <span className={menuCompacto ? 'lg:hidden' : ''}>{label}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="bg-slate-900/50 min-h-[calc(100vh-73px)] p-4 sm:p-6 lg:p-8">
          {tab === 'mapa' && <AdminMap token={token} />}
          {tab === 'usuarios' && <UsuariosAdmin token={token} />}
          {tab === 'reloj' && <SystemClockControl token={token} />}
          {tab === 'reportes' && (
            <div className="space-y-8">
              <ReportCharts token={token} />
              <PlateSearch token={token} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
