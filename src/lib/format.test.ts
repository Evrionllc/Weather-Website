import { describe, expect, it } from 'vitest'
import {
  formatDuration,
  formatHour,
  formatTemp,
  parseLocalIso,
  windDirection,
} from './format'
import type { UnitPrefs } from '../types/weather'

const c24: UnitPrefs = { temperature: 'celsius', wind: 'kmh', time: '24h' }
const f12: UnitPrefs = { temperature: 'fahrenheit', wind: 'mph', time: '12h' }

describe('formatTemp', () => {
  it('rounds and adds a degree sign', () => {
    expect(formatTemp(20.4)).toBe('20°')
    expect(formatTemp(20.6)).toBe('21°')
  })
  it('includes the unit when asked', () => {
    expect(formatTemp(20, true, c24)).toBe('20°C')
    expect(formatTemp(68, true, f12)).toBe('68°F')
  })
})

describe('windDirection', () => {
  it('maps bearings to compass points', () => {
    expect(windDirection(0)).toBe('N')
    expect(windDirection(90)).toBe('E')
    expect(windDirection(180)).toBe('S')
    expect(windDirection(270)).toBe('W')
    expect(windDirection(360)).toBe('N')
  })
})

describe('formatHour', () => {
  it('formats 24h and 12h clocks', () => {
    expect(formatHour('2026-06-25T14:00', c24)).toBe('14:00')
    expect(formatHour('2026-06-25T14:00', f12)).toBe('2PM')
    expect(formatHour('2026-06-25T00:00', f12)).toBe('12AM')
  })
})

describe('formatDuration', () => {
  it('renders seconds as hours and minutes', () => {
    expect(formatDuration(3600)).toBe('1h 0m')
    expect(formatDuration(3600 * 8 + 60 * 30)).toBe('8h 30m')
  })
})

describe('parseLocalIso', () => {
  it('parses wall-clock time without timezone shifting', () => {
    const d = parseLocalIso('2026-06-25T14:30')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(5) // June (0-indexed)
    expect(d.getDate()).toBe(25)
    expect(d.getHours()).toBe(14)
    expect(d.getMinutes()).toBe(30)
  })
})
