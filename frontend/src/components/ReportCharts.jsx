import { useEffect, useState, useCallback } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { apiFetch, authHeaders } from '../lib/api'
import { Activity, Users, Car, CalendarClock } from 'lucide-react'

const COLOR_ENTRADAS = '#34d399' // emerald-400
const COLOR_SALIDAS = '#a78bfa' // violet-400
const GRID_COLOR = '#334155' // slate-700
const AXIS_COLOR = '#94a3b8' // slate-400

const HORAS_LABEL = (h) => `${String(h).padStart(2, '0')}:00`

function StatTile({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Icon size={80} />
      </div>
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className={`p-2 rounded-xl bg-white/5 ${colorClass}`}>
          <Icon size={18} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      </div>
      <p className="text-3xl font-black tabular-nums tracking-tighter text-white relative z-10">{value}</p>
    </div>
  )
}

function ChartCard({ title, children, icon: Icon }) {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        {Icon && <Icon size={16} className="text-emerald-400" />}
        <h3 className="text-sm font-bold text-slate-200 tracking-wide">{title}</h3>
      </div>
      <div className="h-72">{children}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel rounded-xl p-3 border-white/10 shadow-2xl">
        <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportCharts({ token }) {
  const [resumen, setResumen] = useState(null)
  const [horasPico, setHorasPico] = useState([])
  const [diasPico, setDiasPico] = useState([])
  const [metricas, setMetricas] = useState([])
  const [periodo, setPeriodo] = useState('daily')
  const [error, setError] = useState(null)

  const cargar = useCallback(() => {
    const headers = authHeaders(token)
    Promise.all([
      apiFetch('/api/reportes/resumen', { headers }),
      apiFetch('/api/reportes/horas-pico', { headers }),
      apiFetch('/api/reportes/dias-pico', { headers }),
      apiFetch(`/api/reportes/metricas?periodo=${periodo}`, { headers }),
    ])
      .then(([r, hp, dp, m]) => {
        setResumen(r)
        setHorasPico(Array.from({ length: 24 }, (_, h) => ({
          hora: HORAS_LABEL(h),
          total: hp.find((x) => x.hora === h)?.total || 0,
        })))
        setDiasPico(dp.map((d) => ({ dia: d.nombre_dia, total: d.total })))
        setMetricas(
          m.map((row) => ({
            periodo: new Date(row.periodo).toLocaleDateString(),
            entradas: row.entradas,
            salidas: row.salidas,
          }))
        )
      })
      .catch((err) => setError(err.message))
  }, [token, periodo])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatTile label="Usuarios Totales" value={resumen.totalUsuarios} icon={Users} colorClass="text-blue-400" />
          <StatTile label="Libres Ahora" value={resumen.cajones.disponible} icon={Car} colorClass="text-emerald-400" />
          <StatTile label="Ocupados Ahora" value={resumen.cajones.ocupado} icon={Activity} colorClass="text-red-400" />
          <StatTile label="Reservas Activas" value={resumen.cajones.reservado} icon={CalendarClock} colorClass="text-indigo-400" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <ChartCard title="Horas Pico (Entradas por hora del día)" icon={Activity}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={horasPico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHora" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_ENTRADAS} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLOR_ENTRADAS} stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} opacity={0.5} />
              <XAxis dataKey="hora" tick={{ fill: AXIS_COLOR, fontSize: 10 }} interval={2} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="total" name="Entradas" fill="url(#colorHora)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Días Pico (Entradas por día de la semana)" icon={CalendarClock}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diasPico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} opacity={0.5} />
              <XAxis dataKey="dia" tick={{ fill: AXIS_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="total" name="Entradas" fill="url(#colorDia)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ChartCard
          title={
            <div className="flex items-center justify-between w-full">
              <span>Flujo de Accesos (Entradas vs Salidas)</span>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 font-medium transition-colors"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_ENTRADAS} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLOR_ENTRADAS} stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_SALIDAS} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLOR_SALIDAS} stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} opacity={0.5} />
              <XAxis dataKey="periodo" tick={{ fill: AXIS_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="entradas" name="Entradas" fill="url(#colorEntradas)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="salidas" name="Salidas" fill="url(#colorSalidas)" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
