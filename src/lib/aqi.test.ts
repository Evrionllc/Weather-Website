import { describe, expect, it } from 'vitest'
import { aqiFraction, categorizeUsAqi } from './aqi'

describe('categorizeUsAqi', () => {
  it('labels each US AQI band', () => {
    expect(categorizeUsAqi(25).label).toBe('Good')
    expect(categorizeUsAqi(75).label).toBe('Moderate')
    expect(categorizeUsAqi(125).label).toBe('Sensitive groups')
    expect(categorizeUsAqi(175).label).toBe('Unhealthy')
    expect(categorizeUsAqi(250).label).toBe('Very unhealthy')
    expect(categorizeUsAqi(400).label).toBe('Hazardous')
  })

  it('treats band edges inclusively at the upper bound', () => {
    expect(categorizeUsAqi(50).label).toBe('Good')
    expect(categorizeUsAqi(51).label).toBe('Moderate')
  })
})

describe('aqiFraction', () => {
  it('maps 0–300 onto 0–1 and clamps beyond', () => {
    expect(aqiFraction(0)).toBe(0)
    expect(aqiFraction(150)).toBeCloseTo(0.5)
    expect(aqiFraction(300)).toBe(1)
    expect(aqiFraction(500)).toBe(1)
  })
})
