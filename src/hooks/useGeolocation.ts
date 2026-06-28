import { useCallback, useState } from 'react'
import { reverseGeocode } from '../api/weather'
import type { GeoLocation } from '../types/weather'

type Status = 'idle' | 'locating' | 'denied' | 'error' | 'success'

/**
 * Wraps the browser Geolocation API. Permission is only requested when the user
 * explicitly triggers `locate()`, never automatically, so the page loads without
 * a permission prompt.
 */
export function useGeolocation() {
  const [status, setStatus] = useState<Status>('idle')

  const locate = useCallback((): Promise<GeoLocation | null> => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      return Promise.resolve(null)
    }
    setStatus('locating')
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const place = await reverseGeocode(latitude, longitude)
          setStatus('success')
          resolve(place)
        },
        (err) => {
          setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
      )
    })
  }, [])

  return { status, locate }
}
