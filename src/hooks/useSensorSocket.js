
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSensorSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [vibration, setVibration] = useState(null)
  const [temperature, setTemperature] = useState(null)

  useEffect(() => {
    const url = 'http://localhost:6000'
    const socket = io(url, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('vibration-data', (data) => setVibration(data))
    socket.on('temperature-data', (data) => setTemperature(data))

    return () => {
      socket.close()
    }
  }, [])

  return { connected, vibration, temperature }
}
