import { describe, expect, it } from 'vitest'
import { runningScore, toCelsius, uvGuidance } from './insights'

describe('toCelsius', () => {
  it('passes celsius through unchanged', () => {
    expect(toCelsius(20, 'celsius')).toBe(20)
  })
  it('converts fahrenheit to celsius', () => {
    expect(toCelsius(32, 'fahrenheit')).toBeCloseTo(0)
    expect(toCelsius(212, 'fahrenheit')).toBeCloseTo(100)
  })
})

describe('runningScore', () => {
  const ideal = {
    apparentC: 11,
    humidity: 50,
    windKmh: 8,
    precipProbability: 0,
    uvIndex: 2,
  }

  it('rates calm, mild, dry conditions as Ideal with no detracting factors', () => {
    const result = runningScore(ideal)
    expect(result.score).toBe(100)
    expect(result.rating).toBe('Ideal')
    expect(result.factors).toHaveLength(0)
  })

  it('penalises heat, humidity, wind, rain and UV', () => {
    const harsh = runningScore({
      apparentC: 34,
      humidity: 95,
      windKmh: 45,
      precipProbability: 90,
      uvIndex: 10,
    })
    expect(harsh.score).toBeLessThan(40)
    expect(harsh.rating === 'Poor' || harsh.rating === 'Harsh').toBe(true)
    expect(harsh.factors).toContain('Heat stress')
    expect(harsh.factors).toContain('Rain likely')
  })

  it('flags cold conditions distinctly from heat', () => {
    const cold = runningScore({ ...ideal, apparentC: -8 })
    expect(cold.factors).toContain('Cold for running')
    expect(cold.score).toBeLessThan(100)
  })

  it('clamps the score to the 0–100 range', () => {
    const result = runningScore({
      apparentC: 50,
      humidity: 100,
      windKmh: 100,
      precipProbability: 100,
      uvIndex: 15,
    })
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

describe('uvGuidance', () => {
  it('returns Low with no burn time for small values', () => {
    const g = uvGuidance(1)
    expect(g.level).toBe('Low')
    expect(g.burnMinutes).toBeUndefined()
  })

  it('escalates level and shortens burn time as UV rises', () => {
    expect(uvGuidance(4).level).toBe('Moderate')
    expect(uvGuidance(7).level).toBe('High')
    expect(uvGuidance(9).level).toBe('Very high')
    expect(uvGuidance(12).level).toBe('Extreme')
    expect(uvGuidance(12).burnMinutes!).toBeLessThan(uvGuidance(7).burnMinutes!)
  })
})
