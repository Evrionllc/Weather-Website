import type { UnitPrefs } from '../types/weather'

/** Round and append the degree symbol (units are requested from the API directly). */
export function formatTemp(value: number, withUnit = false, prefs?: UnitPrefs): string {
  const rounded = Math.round(value)
  if (!withUnit) return `${rounded}°`
  const suffix = prefs?.temperature === 'fahrenheit' ? 'F' : 'C'
  return `${rounded}°${suffix}`
}

export function formatWind(value: number, prefs: UnitPrefs): string {
  return `${Math.round(value)} ${prefs.wind === 'mph' ? 'mph' : 'km/h'}`
}

const DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

/** Compass label for a meteorological wind bearing (degrees the wind blows *from*). */
export function windDirection(degrees: number): string {
  const index = Math.round(((degrees % 360) / 22.5)) % 16
  return DIRECTIONS[index]
}

/**
 * Format an ISO time string from Open-Meteo. The API already returns local time
 * for the requested timezone, so we deliberately parse without applying the
 * browser's offset again.
 */
export function formatHour(iso: string, prefs: UnitPrefs): string {
  const d = parseLocalIso(iso)
  if (prefs.time === '24h') {
    return `${String(d.getHours()).padStart(2, '0')}:00`
  }
  const h = d.getHours()
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}${period}`
}

export function formatClock(iso: string, prefs: UnitPrefs): string {
  const d = parseLocalIso(iso)
  const mins = String(d.getMinutes()).padStart(2, '0')
  if (prefs.time === '24h') {
    return `${String(d.getHours()).padStart(2, '0')}:${mins}`
  }
  const h = d.getHours()
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mins} ${period}`
}

export function formatDayLabel(iso: string, index: number): string {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  const d = parseLocalIso(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m}m`
}

/**
 * Parse an Open-Meteo local ISO timestamp ("2026-06-25T14:00") as wall-clock
 * time, ignoring the host timezone so the displayed hour matches the location.
 */
export function parseLocalIso(iso: string): Date {
  const [datePart, timePart = '00:00'] = iso.split('T')
  const [y, mo, da] = datePart.split('-').map(Number)
  const [h, mi] = timePart.split(':').map(Number)
  return new Date(y, (mo ?? 1) - 1, da ?? 1, h ?? 0, mi ?? 0)
}
