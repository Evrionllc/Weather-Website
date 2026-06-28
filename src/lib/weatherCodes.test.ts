import { describe, expect, it } from 'vitest'
import { Moon, Sun } from 'lucide-react'
import { describeCode, getCodeInfo, iconForCode } from './weatherCodes'

describe('getCodeInfo', () => {
  it('maps known WMO codes to a label and sky kind', () => {
    expect(getCodeInfo(0)).toEqual({ label: 'Clear sky', kind: 'clear' })
    expect(getCodeInfo(95).kind).toBe('thunder')
    expect(getCodeInfo(71).kind).toBe('snow')
  })

  it('falls back gracefully for unknown codes', () => {
    expect(describeCode(1234)).toBe('Unknown')
  })
})

describe('iconForCode', () => {
  it('chooses day/night variants for clear sky', () => {
    expect(iconForCode(0, true)).toBe(Sun)
    expect(iconForCode(0, false)).toBe(Moon)
  })
})
