/** US AQI categorisation with plain-language health guidance. */

export interface AqiCategory {
  label: string
  /** Display color (hex) for the badge / gauge. */
  color: string
  advice: string
}

export function categorizeUsAqi(aqi: number): AqiCategory {
  if (aqi <= 50)
    return {
      label: 'Good',
      color: '#34d399',
      advice: 'Air quality is satisfactory and poses little or no risk.',
    }
  if (aqi <= 100)
    return {
      label: 'Moderate',
      color: '#fbbf24',
      advice: 'Acceptable, though unusually sensitive people may notice symptoms.',
    }
  if (aqi <= 150)
    return {
      label: 'Sensitive groups',
      color: '#fb923c',
      advice: 'Sensitive groups should limit prolonged outdoor exertion.',
    }
  if (aqi <= 200)
    return {
      label: 'Unhealthy',
      color: '#f87171',
      advice: 'Everyone may begin to feel effects; limit time outdoors.',
    }
  if (aqi <= 300)
    return {
      label: 'Very unhealthy',
      color: '#c084fc',
      advice: 'Health alert — avoid outdoor exertion where possible.',
    }
  return {
    label: 'Hazardous',
    color: '#fb7185',
    advice: 'Emergency conditions. Stay indoors and keep activity low.',
  }
}

/** Fraction (0–1) of the AQI scale for a gauge, clamped at the 300 "very unhealthy" mark. */
export function aqiFraction(aqi: number): number {
  return Math.max(0, Math.min(1, aqi / 300))
}
