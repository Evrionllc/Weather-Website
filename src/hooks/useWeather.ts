import { useQuery } from '@tanstack/react-query'
import { fetchAirQuality, fetchForecast } from '../api/weather'
import type { GeoLocation, UnitPrefs } from '../types/weather'

// Weather changes slowly; cache for 10 min and refetch in the background every 15.
const STALE_MS = 10 * 60 * 1000
const REFETCH_MS = 15 * 60 * 1000

export function useForecast(location: GeoLocation | null, units: UnitPrefs) {
  return useQuery({
    queryKey: ['forecast', location?.latitude, location?.longitude, units.temperature, units.wind],
    queryFn: ({ signal }) =>
      fetchForecast(location!.latitude, location!.longitude, units, signal),
    enabled: !!location,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    refetchOnWindowFocus: false,
  })
}

export function useAirQuality(location: GeoLocation | null) {
  return useQuery({
    queryKey: ['air-quality', location?.latitude, location?.longitude],
    queryFn: ({ signal }) => fetchAirQuality(location!.latitude, location!.longitude, signal),
    enabled: !!location,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    refetchOnWindowFocus: false,
  })
}
