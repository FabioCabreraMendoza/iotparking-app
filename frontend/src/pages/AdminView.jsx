import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, Clock, BarChart3, LogOut } from 'lucide-react'
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
  const { logout, token } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Panel de Administrador</h1>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400">
          <LogOut size={16} /> Salir
        </button>
      </header>

      <nav className="flex gap-1 px-4 sm:px-8 pt-4 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm whitespace-nowrap ${
              tab === id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      <main className="bg-slate-900 min-h-[calc(100vh-8.5rem)] p-4 sm:p-8">
        {tab === 'mapa' && <AdminMap />}
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
  )
}
