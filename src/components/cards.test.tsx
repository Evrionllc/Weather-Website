import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CurrentConditions } from './CurrentConditions'
import { DailyForecast } from './DailyForecast'
import { HourlyForecast } from './HourlyForecast'
import { AirQualityCard } from './AirQualityCard'
import { SunMoonCard } from './SunMoonCard'
import { InsightsCard } from './InsightsCard'
import { mockAirQuality, mockForecast, mockLocation } from '../test/mockForecast'
import type { UnitPrefs } from '../types/weather'

const prefs: UnitPrefs = { temperature: 'celsius', wind: 'kmh', time: '24h' }

// These smoke tests catch runtime render errors (Framer Motion, Recharts, SVG
// math) that type-checking and linting can't.
describe('dashboard cards render without crashing', () => {
  it('renders current conditions with temperature and place', () => {
    render(
      <CurrentConditions
        forecast={mockForecast}
        location={mockLocation}
        prefs={prefs}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />,
    )
    expect(screen.getByText('21°')).toBeInTheDocument()
    expect(screen.getByText(/Testville/)).toBeInTheDocument()
  })

  it('renders the hourly forecast', () => {
    render(<HourlyForecast forecast={mockForecast} prefs={prefs} />)
    expect(screen.getByText('Next 24 hours')).toBeInTheDocument()
  })

  it('renders the 10-day forecast with Today/Tomorrow labels', () => {
    render(<DailyForecast forecast={mockForecast} prefs={prefs} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
  })

  it('renders air quality with AQI value and category', () => {
    render(<AirQualityCard data={mockAirQuality} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Good')).toBeInTheDocument()
  })

  it('renders sun & moon card', () => {
    render(<SunMoonCard forecast={mockForecast} prefs={prefs} />)
    expect(screen.getByText('Day length')).toBeInTheDocument()
  })

  it('renders the derived insights card with a run score', () => {
    render(<InsightsCard forecast={mockForecast} prefs={prefs} />)
    expect(screen.getByText('Run conditions')).toBeInTheDocument()
    // UV 5 → Moderate guidance line.
    expect(screen.getByText(/Moderate/)).toBeInTheDocument()
  })
})
