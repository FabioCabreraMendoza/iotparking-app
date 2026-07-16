const ESTILO_POR_ESTADO = {
  disponible: 'bg-emerald-500/10 border-emerald-500 text-emerald-300',
  ocupado: 'bg-red-500/10 border-red-500 text-red-300',
  reservado: 'bg-blue-500/10 border-blue-500 text-blue-300',
}

const ETIQUETA_POR_ESTADO = {
  disponible: 'Disponible',
  ocupado: 'Ocupado',
  reservado: 'Reservado',
}

export default function ParkingGrid({ cajones, reservasBloqueadas, onReservar }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cajones.map((cajon) => (
        <div
          key={cajon.id}
          className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-colors ${ESTILO_POR_ESTADO[cajon.estado]}`}
        >
          <span className="text-2xl font-bold">{cajon.numero}</span>
          <span className="text-xs uppercase tracking-wide">{ETIQUETA_POR_ESTADO[cajon.estado]}</span>
          {cajon.estado === 'disponible' && (
            <button
              disabled={reservasBloqueadas}
              onClick={() => onReservar(cajon.numero)}
              className="mt-1 text-xs px-3 py-1 rounded-full bg-emerald-600 text-white disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-emerald-500 transition"
            >
              Reservar
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
