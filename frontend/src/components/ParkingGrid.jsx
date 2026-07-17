import { CarFront, Ban, Clock } from 'lucide-react'

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
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 md:w-1/2 lg:w-3/5 h-auto transition-all duration-500 hover:scale-105 pointer-events-none"
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

function ParkingSpot({ spot, position, reservasBloqueadas, onReservar }) {
  const isTop = position === 'top'
  const carRotation = isTop ? 180 : 0
  
  const borderClasses = isTop 
    ? "border-b-0 border-t-4 border-l-2 border-r-2" 
    : "border-t-0 border-b-4 border-l-2 border-r-2"

  const isDisponible = spot.estado === 'disponible'

  return (
    <div
      className={`relative w-full h-36 sm:h-44 md:h-56 transition-all duration-300 flex flex-col items-center justify-center group overflow-hidden
        ${borderClasses} 
        ${isDisponible ? 'border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-300/50 bg-slate-800/20'}
      `}
    >
      <div className={`absolute ${isTop ? 'top-3' : 'bottom-3'} text-xl md:text-3xl font-black ${isDisponible ? 'text-emerald-400 opacity-50 group-hover:opacity-100' : 'text-slate-500 opacity-40'} transition-opacity`}>
        {spot.numero}
      </div>
      
      <CarSVG estado={spot.estado} rotation={carRotation} />

      {/* Reservation Button overlay */}
      {isDisponible && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm z-20">
          <button
            disabled={reservasBloqueadas}
            onClick={() => onReservar(spot.numero)}
            className="text-xs md:text-sm font-bold px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 shadow-xl"
          >
            Reservar
          </button>
        </div>
      )}

      {/* Status Overlay when occupied/reserved */}
      {!isDisponible && (
        <div className={`absolute ${isTop ? 'bottom-2' : 'top-2'} text-[9px] md:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md border z-10 shadow-lg 
          ${spot.estado === 'ocupado' ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'}`
        }>
          {spot.estado === 'ocupado' ? 'Ocupado' : 'Reservado'}
        </div>
      )}
    </div>
  )
}

export default function ParkingGrid({ cajones, reservasBloqueadas, onReservar }) {
  const topRow = cajones.filter(c => c.numero >= 1 && c.numero <= 5).sort((a, b) => a.numero - b.numero)
  const bottomRow = cajones.filter(c => c.numero >= 6 && c.numero <= 10).sort((a, b) => a.numero - b.numero)

  return (
    <div className="flex-1 flex flex-col bg-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 border-[6px] border-slate-700 relative overflow-hidden shadow-2xl animate-fade-in w-full max-w-5xl mx-auto">
      {/* Top Row (Spots 1-5) */}
      <div className="grid grid-cols-5 gap-0">
        {topRow.map((spot) => (
          <ParkingSpot 
            key={spot.id} 
            spot={spot} 
            position="top"
            reservasBloqueadas={reservasBloqueadas}
            onReservar={onReservar}
          />
        ))}
      </div>

      {/* Central Aisle (Road) */}
      <div className="h-28 sm:h-36 md:h-44 w-full flex items-center justify-center relative bg-slate-800">
        {/* Road marking dashed line */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-1 border-t-4 border-dashed border-yellow-500/50"></div>
        </div>
        {/* Direction Arrows */}
        <div className="absolute left-1/4 text-yellow-500/30 text-5xl font-black rotate-180 pointer-events-none">➔</div>
        <div className="absolute right-1/4 text-yellow-500/30 text-5xl font-black pointer-events-none">➔</div>
      </div>

      {/* Bottom Row (Spots 6-10) */}
      <div className="grid grid-cols-5 gap-0">
        {bottomRow.map((spot) => (
          <ParkingSpot 
            key={spot.id} 
            spot={spot} 
            position="bottom"
            reservasBloqueadas={reservasBloqueadas}
            onReservar={onReservar}
          />
        ))}
      </div>
    </div>
  )
}
