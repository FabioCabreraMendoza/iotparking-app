import { CarFront, Ban, Clock } from 'lucide-react'

const ESTILO_POR_ESTADO = {
  disponible: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:bg-emerald-500/20',
  ocupado: 'bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  reservado: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
}

const ETIQUETA_POR_ESTADO = {
  disponible: 'Disponible',
  ocupado: 'Ocupado',
  reservado: 'Reservado',
}

const ICONO_POR_ESTADO = {
  disponible: (className) => <CarFront size={24} className={className} />,
  ocupado: (className) => <Ban size={24} className={className} />,
  reservado: (className) => <Clock size={24} className={className} />,
}

export default function ParkingGrid({ cajones, reservasBloqueadas, onReservar }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {cajones.map((cajon, index) => (
        <div
          key={cajon.id}
          className={`group rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm relative overflow-hidden ${ESTILO_POR_ESTADO[cajon.estado]} animate-slide-up`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {cajon.estado === 'disponible' && (
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          
          <div className="z-10 flex flex-col items-center gap-2">
            <span className="text-3xl font-black tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">{cajon.numero}</span>
            <div className="p-2 rounded-xl bg-white/5 backdrop-blur-md">
              {ICONO_POR_ESTADO[cajon.estado](`opacity-80 group-hover:opacity-100 transition-all ${
                cajon.estado === 'disponible' ? 'text-emerald-400 group-hover:scale-110' :
                cajon.estado === 'ocupado' ? 'text-red-400' : 'text-indigo-400'
              }`)}
            </div>
            <span className="text-[11px] font-medium uppercase tracking-widest mt-1 opacity-80">{ETIQUETA_POR_ESTADO[cajon.estado]}</span>
          </div>

          {cajon.estado === 'disponible' && (
            <button
              disabled={reservasBloqueadas}
              onClick={() => onReservar(cajon.numero)}
              className="z-10 mt-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all duration-300 w-full"
            >
              Reservar
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
