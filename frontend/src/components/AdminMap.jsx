import { useEffect, useMemo, useState, useCallback } from 'react'
import { CarFront, DoorOpen, MapPinned, RefreshCw } from 'lucide-react'
import { useSocketEvent } from '../hooks/useSocket'
import { apiFetch, authHeaders } from '../lib/api'

const ESTILO_POR_ESTADO = {
  disponible: 'bg-emerald-500/10 border-emerald-500 text-emerald-300',
  ocupado: 'bg-red-500/10 border-red-500 text-red-300',
  reservado: 'bg-blue-500/10 border-blue-500 text-blue-300',
}

const ESTILO_ACCESO = {
  ingreso_confirmado: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  pendiente_ingreso: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  ocupado_no_identificado: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  salida_registrada: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  sin_ingreso: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
}

function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${className}`}>{children}</span>
}

function SpotCard({ spot, selected, onClick }) {
  const stateLabel =
    spot.estado === 'disponible' ? 'Disponible' : spot.estado === 'reservado' ? 'Reservado' : 'Ocupado'
  const accessLabel =
    spot.acceso.estado === 'ingreso_confirmado'
      ? 'Ingresó'
      : spot.acceso.estado === 'pendiente_ingreso'
        ? 'Pendiente de ingreso'
        : spot.acceso.estado === 'ocupado_no_identificado'
          ? 'Ocupado sin identificar'
          : spot.acceso.estado === 'salida_registrada'
            ? 'Salida registrada'
            : 'Sin ingreso'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${ESTILO_POR_ESTADO[spot.estado]} ${selected ? 'ring-2 ring-emerald-400/60 shadow-emerald-950/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <MapPinned size={12} /> Cajón {spot.numero}
          </div>
          <div className="mt-2 text-lg font-semibold text-white">{stateLabel}</div>
        </div>
        <Badge className={ESTILO_ACCESO[spot.acceso.estado]}>{accessLabel}</Badge>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Vehículo</div>
          <div className="mt-1 text-sm font-medium text-slate-100">
            {spot.vehiculo?.placa || 'No identificado'}
          </div>
          <div className="text-xs text-slate-400">{spot.vehiculo?.nombre || 'Sin conductor asociado'}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="border-white/10 bg-white/5 text-slate-200">{spot.estado}</Badge>
          <Badge className="border-white/10 bg-white/5 text-slate-200">{spot.reserva?.estado || 'sin reserva'}</Badge>
        </div>
      </div>
    </button>
  )
}

export default function AdminMap({ token }) {
  const [cajones, setCajones] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    setError(null)
    apiFetch('/api/cajones/overview', { headers: authHeaders(token) })
      .then((data) => {
        setCajones(data.spots || [])
        setSelectedId((current) => current || data.spots?.[0]?.id || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    cargar()
  }, [cargar])

  useSocketEvent(
    'cajones_update',
    useCallback((data) => {
      if (!Array.isArray(data)) return
      cargar()
    }, [cargar])
  )

  const ala = (desde, hasta) => cajones.filter((c) => c.numero >= desde && c.numero <= hasta)
  const selected = useMemo(() => cajones.find((cajon) => cajon.id === selectedId) || cajones[0] || null, [cajones, selectedId])

  const renderAla = (titulo, lista) => (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">{titulo}</h3>
        <span className="text-xs text-slate-500">{lista.length} espacios</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {lista.map((spot) => (
          <SpotCard key={spot.id} spot={spot} selected={spot.id === selected?.id} onClick={() => setSelectedId(spot.id)} />
        ))}
      </div>
    </section>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-black/20">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                <DoorOpen size={12} /> Vista simulada del estacionamiento
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white">Mapa interactivo del administrador</h2>
              <p className="mt-1 text-sm text-slate-400">
                Revisa el estado de cada cajón, el vehículo asociado y si el acceso ya fue confirmado por la barrera.
              </p>
            </div>
            <button
              type="button"
              onClick={cargar}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              <RefreshCw size={14} /> Actualizar vista
            </button>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-sm text-slate-400">
              Cargando mapa del estacionamiento...
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Disponibles</div>
                  <div className="mt-2 text-2xl font-bold text-white">{cajones.filter((spot) => spot.estado === 'disponible').length}</div>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-red-200/80">Ocupados</div>
                  <div className="mt-2 text-2xl font-bold text-white">{cajones.filter((spot) => spot.estado === 'ocupado').length}</div>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-blue-200/80">Reservados</div>
                  <div className="mt-2 text-2xl font-bold text-white">{cajones.filter((spot) => spot.estado === 'reservado').length}</div>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Ingresos confirmados</div>
                  <div className="mt-2 text-2xl font-bold text-white">{cajones.filter((spot) => spot.acceso?.ingresoRegistrado).length}</div>
                </div>
              </div>

              {renderAla('Ala izquierda — cajones 1 a 5', ala(1, 5))}
              {renderAla('Ala derecha — cajones 6 a 10', ala(6, 10))}
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            <CarFront size={12} /> Detalle del cajón
          </div>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-3xl font-bold text-white">Cajón {selected.numero}</div>
                <div className="mt-1 text-sm text-slate-400">Estado físico: {selected.estado}</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Vehículo asignado</div>
                <div className="mt-2 text-lg font-semibold text-white">{selected.vehiculo?.placa || 'No identificado'}</div>
                <p className="text-sm text-slate-400">{selected.vehiculo?.nombre || 'Sin conductor asociado'}</p>
                <p className="mt-2 text-xs text-slate-500">RFID: {selected.vehiculo?.rfidUid || 'Sin lectura'}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Acceso / servo</div>
                <Badge className={ESTILO_ACCESO[selected.acceso?.estado || 'sin_ingreso']}>
                  {selected.acceso?.estado === 'ingreso_confirmado'
                    ? 'Ingreso confirmado'
                    : selected.acceso?.estado === 'pendiente_ingreso'
                      ? 'Pendiente de entrada'
                      : selected.acceso?.estado === 'ocupado_no_identificado'
                        ? 'Vehículo sin identificar'
                        : selected.acceso?.estado === 'salida_registrada'
                          ? 'Salida registrada'
                          : 'Sin ingreso registrado'}
                </Badge>
                <div className="mt-3 text-sm text-slate-400">
                  Estado de servo estimado: <span className="text-white">{selected.acceso?.ingresoRegistrado ? 'barrera ya pasó a ingreso' : 'barrera sin confirmación de entrada'}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Último movimiento: {selected.acceso?.ultimoMovimiento || 'Sin eventos'}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Reserva</div>
                <div className="mt-2 text-sm text-slate-200">{selected.reserva?.estado || 'Sin reserva'}</div>
                <div className="text-xs text-slate-500">
                  {selected.reserva?.fechaInicio ? `Inicio: ${new Date(selected.reserva.fechaInicio).toLocaleString()}` : 'Sin inicio registrado'}
                </div>
                <div className="text-xs text-slate-500">
                  {selected.reserva?.fechaFin ? `Fin: ${new Date(selected.reserva.fechaFin).toLocaleString()}` : ''}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-400">
              Selecciona un cajón para ver el detalle del vehículo, la reserva y el estado del acceso.
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
