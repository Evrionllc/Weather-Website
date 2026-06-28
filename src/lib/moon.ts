/**
 * Moon phase, computed locally since Open-Meteo doesn't provide it. Uses the
 * mean synodic month against a known reference new moon. Accurate to well within
 * a day for display purposes — not for astronomical use.
 */

const SYNODIC_MONTH = 29.530588853 // days
// Reference new moon: 2000-01-06 18:14 UTC (Julian-ish epoch in ms).
const REFERENCE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000

export interface MoonPhase {
  /** 0–1 fraction through the cycle (0 = new, 0.5 = full). */
  fraction: number
  /** Illuminated fraction of the disk, 0–1. */
  illumination: number
  label: string
  emoji: string
}

export function moonPhase(date: Date = new Date()): MoonPhase {
  const days = date.getTime() / 86400000 - REFERENCE_NEW_MOON
  const fraction = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2
  const { label, emoji } = phaseName(fraction)
  return { fraction, illumination, label, emoji }
}

function phaseName(fraction: number): { label: string; emoji: string } {
  const phases: Array<{ label: string; emoji: string }> = [
    { label: 'New moon', emoji: '🌑' },
    { label: 'Waxing crescent', emoji: '🌒' },
    { label: 'First quarter', emoji: '🌓' },
    { label: 'Waxing gibbous', emoji: '🌔' },
    { label: 'Full moon', emoji: '🌕' },
    { label: 'Waning gibbous', emoji: '🌖' },
    { label: 'Last quarter', emoji: '🌗' },
    { label: 'Waning crescent', emoji: '🌘' },
  ]
  // 8 segments, but the 4 "exact" phases occupy a narrow band around their point.
  const index = Math.round(fraction * 8) % 8
  return phases[index]
}
