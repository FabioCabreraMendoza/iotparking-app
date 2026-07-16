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

const COLOR_ENTRADAS = '#3987e5' // categorical slot 1 (blue)
const COLOR_SALIDAS = '#008300' // categorical slot 2 (green)
const GRID_COLOR = '#334155' // slate-700
const AXIS_COLOR = '#94a3b8' // slate-400

const HORAS_LABEL = (h) => `${String(h).padStart(2, '0')}:00`

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  )
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
      {error && <p className="text-red-400 text-xs">{error}</p>}

      {resumen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Usuarios registrados" value={resumen.totalUsuarios} />
          <StatTile label="Disponibles" value={resumen.cajones.disponible} />
          <StatTile label="Ocupados" value={resumen.cajones.ocupado} />
          <StatTile label="Reservados" value={resumen.cajones.reservado} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <ChartCard title="Horas pico (entradas por hora del dia)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={horasPico}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="hora" tick={{ fill: AXIS_COLOR, fontSize: 11 }} interval={2} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="total" name="Entradas" fill={COLOR_ENTRADAS} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Dias pico (entradas por dia de la semana)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={diasPico}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: AXIS_COLOR, fontSize: 11 }} />
              <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="total" name="Entradas" fill={COLOR_ENTRADAS} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title={
          <div className="flex items-center justify-between">
            <span>Metricas de ocupacion (entradas vs salidas)</span>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs outline-none"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metricas}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="periodo" tick={{ fill: AXIS_COLOR, fontSize: 11 }} />
            <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
            <Bar dataKey="entradas" name="Entradas" fill={COLOR_ENTRADAS} radius={[4, 4, 0, 0]} />
            <Bar dataKey="salidas" name="Salidas" fill={COLOR_SALIDAS} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
