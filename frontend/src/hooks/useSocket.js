import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../lib/api'

let sharedSocket = null

function getSocket() {
  if (!sharedSocket) {
    sharedSocket = io(API_URL)
  }
  return sharedSocket
}

export function useSocket() {
  const socketRef = useRef(null)
  if (!socketRef.current) socketRef.current = getSocket()
  return socketRef.current
}

export function useSocketEvent(eventName, handler) {
  const socket = useSocket()
  useEffect(() => {
    socket.on(eventName, handler)
    return () => socket.off(eventName, handler)
  }, [socket, eventName, handler])
}
