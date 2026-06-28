import { describe, expect, it } from 'vitest'
import { moonPhase } from './moon'

describe('moonPhase', () => {
  it('keeps fraction and illumination within range', () => {
    for (let d = 0; d < 60; d += 3) {
      const phase = moonPhase(new Date(2026, 0, 1 + d))
      expect(phase.fraction).toBeGreaterThanOrEqual(0)
      expect(phase.fraction).toBeLessThan(1)
      expect(phase.illumination).toBeGreaterThanOrEqual(0)
      expect(phase.illumination).toBeLessThanOrEqual(1)
    }
  })

  it('reports a near-full moon at the cycle midpoint', () => {
    // 2026-01-03 is close to a full moon.
    const phase = moonPhase(new Date(Date.UTC(2026, 0, 3, 12)))
    expect(phase.illumination).toBeGreaterThan(0.9)
  })

  it('returns a human label and emoji', () => {
    const phase = moonPhase(new Date())
    expect(phase.label.length).toBeGreaterThan(0)
    expect(phase.emoji.length).toBeGreaterThan(0)
  })
})
