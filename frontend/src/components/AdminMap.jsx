import { useEffect, useMemo, useState, useCallback } from 'react'
import { CarFront, DoorOpen, MapPinned, RefreshCw, AlertTriangle, ShieldCheck, Clock } from 'lucide-react'
import { useSocketEvent } from '../hooks/useSocket'
import { apiFetch, authHeaders } from '../lib/api'

const ESTILO_POR_ESTADO = {
  disponible: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400 group-hover:bg-emerald-500/20',
  ocupado: 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-400',
  reservado: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:border-indigo-400',
}

const ESTILO_ACCESO = {
  ingreso_confirmado: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
  pendiente_ingreso: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
  ocupado_no_identificado: 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
  salida_registrada: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  sin_ingreso: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
}

function Badge({ children, className = '' }) {
  return <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md ${className}`}>{children}</span>
}

function SpotCard({ spot, selected, onClick, index }) {
  const stateLabel =
    spot.estado === 'disponible' ? 'Disponible' : spot.estado === 'reservado' ? 'Reservado' : 'Ocupado'
  const accessLabel =
    spot.acceso.estado === 'ingreso_confirmado'
      ? 'Adentro'
      : spot.acceso.estado === 'pendiente_ingreso'
        ? 'Pendiente'
        : spot.acceso.estado === 'ocupado_no_identificado'
          ? 'No identif.'
          : spot.acceso.estado === 'salida_registrada'
            ? 'Salió'
            : 'Libre'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-4 text-left transition-all duration-300 backdrop-blur-md animate-slide-up relative overflow-hidden ${ESTILO_POR_ESTADO[spot.estado]} ${selected ? 'ring-2 ring-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02]' : 'hover:-translate-y-1'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
            <MapPinned size={12} /> Cajón {spot.numero}
          </div>
          <div className={`mt-2 text-xl font-bold tracking-tight ${
            spot.estado === 'disponible' ? 'text-emerald-400' :
            spot.estado === 'ocupado' ? 'text-red-400' : 'text-indigo-400'
          }`}>{stateLabel}</div>
        </div>
        <Badge className={ESTILO_ACCESO[spot.acceso.estado]}>{accessLabel}</Badge>
      </div>

      <div className="mt-4 space-y-2 relative z-10">
        <div className="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 backdrop-blur-sm group-hover:bg-slate-900/60 transition-colors">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Vehículo</div>
          <div className="text-sm font-bold text-slate-200 truncate">
            {spot.vehiculo?.placa || '---'}
          </div>
          <div className="text-xs text-slate-400 truncate mt-0.5">{spot.vehiculo?.nombre || 'Sin registrar'}</div>
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

  const renderAla = (titulo, lista, startIndex) => (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">{titulo}</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md">{lista.length} espacios</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {lista.map((spot, i) => (
          <SpotCard key={spot.id} spot={spot} index={startIndex + i} selected={spot.id === selected?.id} onClick={() => setSelectedId(spot.id)} />
        ))}
      </div>
    </section>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="glass-panel rounded-3xl p-6 lg:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
                <DoorOpen size={14} /> Vista en vivo
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Mapa del Estacionamiento</h2>
              <p className="mt-2 text-sm text-slate-400 max-w-lg">
                Monitorea el estado físico de los cajones, reservas activas y el flujo de vehículos en tiempo real.
              </p>
            </div>
            <button
              type="button"
              onClick={cargar}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-slate-700 hover:shadow-lg"
            >
              <RefreshCw size={16} /> Actualizar
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 flex items-center gap-3 animate-slide-up">
              <AlertTriangle size={20} className="text-red-400" />
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
              <RefreshCw size={32} className="animate-spin text-emerald-500" />
              <p className="font-medium tracking-wide">Cargando sensores espaciales...</p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Disponibles</div>
                  <div className="text-3xl font-black text-white">{cajones.filter((spot) => spot.estado === 'disponible').length}</div>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Ocupados</div>
                  <div className="text-3xl font-black text-white">{cajones.filter((spot) => spot.estado === 'ocupado').length}</div>
                </div>
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Reservados</div>
                  <div className="text-3xl font-black text-white">{cajones.filter((spot) => spot.estado === 'reservado').length}</div>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">Adentro</div>
                  <div className="text-3xl font-black text-white">{cajones.filter((spot) => spot.acceso?.ingresoRegistrado).length}</div>
                </div>
              </div>

              <div className="space-y-8">
                {renderAla('Ala Izquierda — 1 a 5', ala(1, 5), 0)}
                {renderAla('Ala Derecha — 6 a 10', ala(6, 10), 5)}
              </div>
            </div>
          )}
        </div>

        <aside className="glass-panel rounded-3xl p-6 lg:p-8 sticky top-[100px] h-fit">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">
            <CarFront size={14} /> Inspector de Cajón
          </div>
          
          {selected ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-4xl font-black tracking-tighter text-white">Cajón {selected.numero}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        selected.estado === 'disponible' ? 'bg-emerald-400' : selected.estado === 'ocupado' ? 'bg-red-400' : 'bg-indigo-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        selected.estado === 'disponible' ? 'bg-emerald-500' : selected.estado === 'ocupado' ? 'bg-red-500' : 'bg-indigo-500'
                      }`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-300 capitalize">{selected.estado}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  <ShieldCheck size={14} /> Vehículo Asignado
                </div>
                <div className="text-2xl font-bold tracking-tight text-white">{selected.vehiculo?.placa || 'N/A'}</div>
                <p className="text-sm font-medium text-slate-400 mt-1">{selected.vehiculo?.nombre || 'Desconocido'}</p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">UID Tarjeta</p>
                  <p className="font-mono text-xs text-slate-300 bg-slate-900/50 px-2 py-1 rounded inline-block">
                    {selected.vehiculo?.rfidUid || 'Sin lectura'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  <DoorOpen size={14} /> Control de Acceso
                </div>
                <Badge className={ESTILO_ACCESO[selected.acceso?.estado || 'sin_ingreso']}>
                  {selected.acceso?.estado === 'ingreso_confirmado' ? 'Ingreso Confirmado' : 
                   selected.acceso?.estado === 'pendiente_ingreso' ? 'En Puerta' : 
                   selected.acceso?.estado === 'ocupado_no_identificado' ? 'Intruso/No Identif.' : 
                   selected.acceso?.estado === 'salida_registrada' ? 'Salió' : 'Libre'}
                </Badge>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Servo Barrera:</span>
                    <span className="font-medium text-slate-300">{selected.acceso?.ingresoRegistrado ? 'Abierta (Ingreso)' : 'Cerrada / En espera'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Último Evento:</span>
                    <span className="font-medium text-slate-300">{selected.acceso?.ultimoMovimiento || '--'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  <Clock size={14} /> Estado de Reserva
                </div>
                <div className="text-sm font-semibold text-slate-200 capitalize">{selected.reserva?.estado || 'Sin reserva activa'}</div>
                {selected.reserva?.fechaInicio && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs flex justify-between">
                      <span className="text-slate-500">Inicio:</span>
                      <span className="text-slate-300">{new Date(selected.reserva.fechaInicio).toLocaleTimeString()}</span>
                    </div>
                    {selected.reserva?.fechaFin && (
                      <div className="text-xs flex justify-between">
                        <span className="text-slate-500">Expira:</span>
                        <span className="text-slate-300">{new Date(selected.reserva.fechaFin).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center backdrop-blur-md">
              <MapPinned size={32} className="mx-auto text-slate-600 mb-4" />
              <p className="text-sm font-medium text-slate-400">
                Selecciona un cajón en el mapa para ver sus detalles, propietario y bitácora de acceso.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
