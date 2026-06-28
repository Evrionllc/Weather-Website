import type { TemperatureUnit } from '../types/weather'

/** Convert a temperature to Celsius so derived indices are unit-independent. */
export function toCelsius(value: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? ((value - 32) * 5) / 9 : value
}

/* ---------------------- Running-conditions score ------------------------- */

export interface RunningConditions {
  /** 0–100, higher is better. */
  score: number
  rating: 'Ideal' | 'Good' | 'Fair' | 'Poor' | 'Harsh'
  color: string
  /** Human-readable factors dragging the score down. */
  factors: string[]
}

export interface RunningInput {
  /** "Feels like" temperature in Celsius. */
  apparentC: number
  /** Relative humidity, %. */
  humidity: number
  /** Wind speed in km/h. */
  windKmh: number
  /** Precipitation probability, %. */
  precipProbability: number
  uvIndex: number
}

/**
 * A derived "is it a good time for a run?" index. Open-Meteo doesn't provide
 * this — it's computed from comfort research: an apparent temperature of roughly
 * 6–16°C is ideal for running, with penalties for humidity, wind, rain and UV.
 */
export function runningScore(input: RunningInput): RunningConditions {
  const { apparentC, humidity, windKmh, precipProbability, uvIndex } = input
  const factors: string[] = []
  let penalty = 0

  if (apparentC < 6) {
    penalty += Math.min(45, (6 - apparentC) * 2.2)
    factors.push('Cold for running')
  } else if (apparentC > 16) {
    penalty += Math.min(55, (apparentC - 16) * 3.2)
    factors.push('Heat stress')
  }

  if (humidity > 65) {
    penalty += Math.min(15, (humidity - 65) * 0.4)
    factors.push('High humidity')
  }

  if (windKmh > 18) {
    penalty += Math.min(20, (windKmh - 18) * 0.6)
    factors.push('Strong wind')
  }

  if (precipProbability > 0) {
    penalty += Math.min(30, precipProbability * 0.3)
    if (precipProbability >= 50) factors.push('Rain likely')
  }

  if (uvIndex > 6) {
    penalty += Math.min(12, (uvIndex - 6) * 2)
    if (uvIndex >= 8) factors.push('High UV')
  }

  const score = Math.round(Math.max(0, Math.min(100, 100 - penalty)))

  let rating: RunningConditions['rating']
  let color: string
  if (score >= 85) [rating, color] = ['Ideal', '#34d399']
  else if (score >= 70) [rating, color] = ['Good', '#a3e635']
  else if (score >= 50) [rating, color] = ['Fair', '#fbbf24']
  else if (score >= 30) [rating, color] = ['Poor', '#fb923c']
  else [rating, color] = ['Harsh', '#f87171']

  return { score, rating, color, factors }
}

/* ----------------------------- UV guidance ------------------------------- */

export interface UvGuidance {
  level: string
  color: string
  advice: string
  /** Rough minutes to skin reddening for fair/untanned skin, undefined when low. */
  burnMinutes?: number
}

export function uvGuidance(uv: number): UvGuidance {
  const rounded = Math.round(uv)
  if (rounded <= 2)
    return { level: 'Low', color: '#34d399', advice: 'No protection needed for most people.' }
  if (rounded <= 5)
    return {
      level: 'Moderate',
      color: '#fbbf24',
      advice: 'Seek shade near midday; sunscreen advised.',
      burnMinutes: 45,
    }
  if (rounded <= 7)
    return {
      level: 'High',
      color: '#fb923c',
      advice: 'Cover up and apply SPF 30+; limit midday sun.',
      burnMinutes: 30,
    }
  if (rounded <= 10)
    return {
      level: 'Very high',
      color: '#f87171',
      advice: 'Extra protection essential — burns happen fast.',
      burnMinutes: 15,
    }
  return {
    level: 'Extreme',
    color: '#c084fc',
    advice: 'Avoid the sun midday; unprotected skin burns in minutes.',
    burnMinutes: 10,
  }
}
