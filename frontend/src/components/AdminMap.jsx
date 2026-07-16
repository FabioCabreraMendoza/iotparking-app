import { useEffect, useState, useCallback } from 'react'
import { useSocketEvent } from '../hooks/useSocket'
import { apiFetch } from '../lib/api'

const ESTILO_POR_ESTADO = {
  disponible: 'bg-emerald-500/10 border-emerald-500 text-emerald-300',
  ocupado: 'bg-red-500/10 border-red-500 text-red-300',
  reservado: 'bg-blue-500/10 border-blue-500 text-blue-300',
}

export default function AdminMap() {
  const [cajones, setCajones] = useState([])

  useEffect(() => {
    apiFetch('/api/cajones').then(setCajones).catch(() => {})
  }, [])

  useSocketEvent('cajones_update', useCallback((data) => setCajones(data), []))

  const ala = (desde, hasta) => cajones.filter((c) => c.numero >= desde && c.numero <= hasta)

  const renderAla = (titulo, lista) => (
    <div>
      <h3 className="text-sm font-medium text-slate-400 mb-2">{titulo}</h3>
      <div className="grid grid-cols-5 gap-3">
        {lista.map((cajon) => (
          <div key={cajon.id} className={`rounded-xl border-2 p-4 text-center ${ESTILO_POR_ESTADO[cajon.estado]}`}>
            <div className="text-xl font-bold">{cajon.numero}</div>
            <div className="text-[10px] uppercase tracking-wide">{cajon.estado}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderAla('Ala izquierda — cajones 1 a 5', ala(1, 5))}
      {renderAla('Ala derecha — cajones 6 a 10', ala(6, 10))}
    </div>
  )
}
