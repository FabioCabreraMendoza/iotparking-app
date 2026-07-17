import { useEffect, useMemo, useState, useCallback } from 'react'
import { CarFront, DoorOpen, MapPinned, RefreshCw, AlertTriangle, ShieldCheck, Clock } from 'lucide-react'
import { useSocketEvent } from '../hooks/useSocket'
import { apiFetch, authHeaders } from '../lib/api'

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

// SVG Car Icon component matching colors based on state
function CarSVG({ estado, rotation }) {
  const isOccupied = estado === 'ocupado'
  const isReserved = estado === 'reservado'
  if (!isOccupied && !isReserved) return null

  // Colors: red for occupied, blue/indigo for reserved
  const bodyColor = isOccupied ? '#ef4444' : '#6366f1'
  const roofColor = isOccupied ? '#b91c1c' : '#4338ca'
  const windowColor = '#1e293b'

  return (
    <svg 
      viewBox="0 0 100 200" 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-auto transition-all duration-500 hover:scale-105"
      style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
    >
      <g stroke="#0f172a" strokeWidth="2" strokeLinejoin="round">
        {/* Wheels */}
        <rect x="15" y="25" width="10" height="30" rx="3" fill="#000" />
        <rect x="75" y="25" width="10" height="30" rx="3" fill="#000" />
        <rect x="15" y="145" width="10" height="30" rx="3" fill="#000" />
        <rect x="75" y="145" width="10" height="30" rx="3" fill="#000" />
        
        {/* Car Body */}
        <rect x="20" y="15" width="60" height="170" rx="15" fill={bodyColor} />
        
        {/* Roof */}
        <rect x="25" y="55" width="50" height="90" rx="10" fill={roofColor} />
        
        {/* Windshield (Front) */}
        <path d="M 30 55 L 70 55 L 80 80 L 20 80 Z" fill={windowColor} />
        
        {/* Rear Window */}
        <path d="M 30 145 L 70 145 L 80 120 L 20 120 Z" fill={windowColor} />

        {/* Headlights */}
        <circle cx="35" cy="20" r="5" fill="#facc15" />
        <circle cx="65" cy="20" r="5" fill="#facc15" />
        
        {/* Taillights */}
        <rect x="25" y="180" width="15" height="5" rx="2" fill="#ef4444" />
        <rect x="60" y="180" width="15" height="5" rx="2" fill="#ef4444" />
      </g>
    </svg>
  )
}

function ParkingSpot({ spot, selected, onClick, position }) {
  // position: 'top' (spots 1-5, cars face down) or 'bottom' (spots 6-10, cars face up)
  const isTop = position === 'top'
  const carRotation = isTop ? 180 : 0
  
  const borderClasses = isTop 
    ? "border-b-0 border-t-4 border-l-2 border-r-2" 
    : "border-t-0 border-b-4 border-l-2 border-r-2"

  return (
    <button
      onClick={onClick}
      className={`relative w-full h-32 sm:h-40 md:h-48 transition-all duration-300 flex items-center justify-center
        ${borderClasses} 
        ${selected ? 'border-emerald-400 bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.3)] z-10' : 'border-slate-300 bg-slate-800/20 hover:bg-slate-700/40'}
      `}
    >
      <div className={`absolute ${isTop ? 'top-2' : 'bottom-2'} text-xl font-bold ${selected ? 'text-emerald-400' : 'text-slate-500'}`}>
        {spot.numero}
      </div>
      
      <CarSVG estado={spot.estado} rotation={carRotation} />

      {/* State Badge on hover/select */}
      {(selected || spot.estado !== 'disponible') && (
        <div className={`absolute ${isTop ? '-bottom-3' : '-top-3'} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md border z-20 shadow-lg 
          ${spot.estado === 'disponible' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 
            spot.estado === 'ocupado' ? 'bg-red-500/20 border-red-500/50 text-red-300' : 
            'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'}`
        }>
          {spot.vehiculo?.placa || spot.estado}
        </div>
      )}
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

  const selected = useMemo(() => cajones.find((cajon) => cajon.id === selectedId) || cajones[0] || null, [cajones, selectedId])

  const topRow = cajones.filter(c => c.numero >= 1 && c.numero <= 5).sort((a, b) => a.numero - b.numero)
  const bottomRow = cajones.filter(c => c.numero >= 6 && c.numero <= 10).sort((a, b) => a.numero - b.numero)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        
        {/* Main Map Area */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
                <MapPinned size={14} /> Top-Down View
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Mapa del Estacionamiento</h2>
            </div>
            <button
              type="button"
              onClick={cargar}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-slate-700 hover:shadow-lg"
            >
              <RefreshCw size={16} /> <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 flex items-center gap-3 animate-slide-up">
              <AlertTriangle size={20} className="text-red-400" />
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex-1 rounded-2xl border border-white/5 bg-slate-900/40 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
              <RefreshCw size={32} className="animate-spin text-emerald-500" />
              <p className="font-medium tracking-wide">Cargando sensores espaciales...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-slate-800 rounded-2xl p-4 sm:p-8 border-4 border-slate-700 relative overflow-hidden shadow-2xl">
              {/* Top Row (Spots 1-5) */}
              <div className="grid grid-cols-5 gap-0">
                {topRow.map((spot) => (
                  <ParkingSpot 
                    key={spot.id} 
                    spot={spot} 
                    selected={spot.id === selected?.id} 
                    onClick={() => setSelectedId(spot.id)}
                    position="top"
                  />
                ))}
              </div>

              {/* Central Aisle (Road) */}
              <div className="h-24 sm:h-32 w-full flex items-center justify-center relative">
                {/* Road marking dashed line */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 border-t-4 border-dashed border-yellow-500/50"></div>
                </div>
                {/* Direction Arrows */}
                <div className="absolute left-1/4 text-yellow-500/30 text-4xl font-black rotate-180">➔</div>
                <div className="absolute right-1/4 text-yellow-500/30 text-4xl font-black">➔</div>
              </div>

              {/* Bottom Row (Spots 6-10) */}
              <div className="grid grid-cols-5 gap-0">
                {bottomRow.map((spot) => (
                  <ParkingSpot 
                    key={spot.id} 
                    spot={spot} 
                    selected={spot.id === selected?.id} 
                    onClick={() => setSelectedId(spot.id)}
                    position="bottom"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Inspector */}
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
