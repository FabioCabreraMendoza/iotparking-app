import { useEffect, useState, useCallback } from 'react'
import ParkingGrid from '../components/ParkingGrid'
import CardDetectedModal from '../components/CardDetectedModal'
import { useSocketEvent } from '../hooks/useSocket'
import { apiFetch } from '../lib/api'

export default function UserView() {
  const [cajones, setCajones] = useState([])
  const [reservaStatus, setReservaStatus] = useState({ activas: 0, max: 5, bloqueado: false })
  const [pendingUid, setPendingUid] = useState(null)
  const [error, setError] = useState(null)

  const refreshReservaStatus = useCallback(() => {
    apiFetch('/api/reservas/status').then(setReservaStatus).catch(() => {})
  }, [])

  useEffect(() => {
    apiFetch('/api/cajones').then(setCajones).catch(() => {})
    refreshReservaStatus()
  }, [refreshReservaStatus])

  useSocketEvent('cajones_update', useCallback((data) => setCajones(data), []))
  useSocketEvent(
    'new_card_detected',
    useCallback(({ uid }) => setPendingUid(uid), [])
  )

  const handleReservar = async (numero) => {
    setError(null)
    try {
      await apiFetch('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({ cajonNumero: numero }),
      })
      refreshReservaStatus()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <header className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Estacionamiento Inteligente</h1>
        <p className="text-slate-400 text-sm mt-1">
          {reservaStatus.activas}/{reservaStatus.max} cajones reservados
          {reservaStatus.bloqueado && ' — límite de reservas alcanzado'}
        </p>
      </header>

      {error && (
        <div className="max-w-4xl mx-auto mb-4 rounded-lg bg-red-950 border border-red-800 text-red-200 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <ParkingGrid cajones={cajones} reservasBloqueadas={reservaStatus.bloqueado} onReservar={handleReservar} />
      </main>

      {pendingUid && (
        <CardDetectedModal
          uid={pendingUid}
          onClose={() => setPendingUid(null)}
          onRegistered={() => setPendingUid(null)}
        />
      )}
    </div>
  )
}
