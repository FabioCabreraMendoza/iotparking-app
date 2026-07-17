import { useEffect, useState, useCallback } from 'react'
import { CarFront, ShieldCheck, AlertCircle } from 'lucide-react'
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

  const libres = cajones.filter(c => c.estado === 'disponible').length
  const ocupados = cajones.filter(c => c.estado === 'ocupado').length

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-slate-100 p-4 sm:p-8 animate-fade-in">
      <header className="max-w-4xl mx-auto mb-10 pt-4">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <CarFront size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                IoT Parking
              </h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                Estacionamiento Inteligente
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-emerald-400">{libres}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Libres</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-red-400">{ocupados}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Ocupados</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 relative">
              {reservaStatus.bloqueado && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse-slow"></span>
              )}
              <div className="text-2xl font-bold text-indigo-400">
                {reservaStatus.activas}<span className="text-sm text-slate-500">/{reservaStatus.max}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Reservas</div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-4xl mx-auto mb-6 rounded-2xl bg-red-950/50 backdrop-blur-md border border-red-500/30 text-red-200 px-6 py-4 text-sm flex items-center gap-3 animate-slide-up">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {reservaStatus.bloqueado && (
        <div className="max-w-4xl mx-auto mb-6 rounded-2xl bg-amber-950/30 backdrop-blur-md border border-amber-500/30 text-amber-200 px-6 py-4 text-sm flex items-center gap-3 animate-slide-up">
          <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
          Límite del 50% de espacios reservados alcanzado. No se permiten nuevas reservas temporalmente.
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
