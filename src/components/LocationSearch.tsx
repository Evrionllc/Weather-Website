import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, MapPin, Navigation, Search, Star, X } from 'lucide-react'
import { searchLocations } from '../api/weather'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useGeolocation } from '../hooks/useGeolocation'
import type { GeoLocation } from '../types/weather'

interface LocationSearchProps {
  active: GeoLocation | null
  favorites: GeoLocation[]
  onSelect: (location: GeoLocation) => void
  onToggleFavorite: (location: GeoLocation) => void
}

function locationLabel(loc: GeoLocation): string {
  return [loc.name, loc.admin1, loc.country].filter(Boolean).join(', ')
}

export function LocationSearch({ active, favorites, onSelect, onToggleFavorite }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const debounced = useDebouncedValue(query, 350)
  const { status, locate } = useGeolocation()
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['geocode', debounced],
    queryFn: ({ signal }) => searchLocations(debounced, signal),
    enabled: debounced.trim().length >= 2,
    staleTime: 60 * 60 * 1000,
  })

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function choose(loc: GeoLocation) {
    onSelect(loc)
    setQuery('')
    setOpen(false)
  }

  async function useMyLocation() {
    const loc = await locate()
    if (loc) choose(loc)
  }

  const isFavorite = (loc: GeoLocation) => favorites.some((f) => f.id === loc.id)
  const showDropdown = open && (query.trim().length >= 2 || favorites.length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={active ? locationLabel(active) : 'Search city…'}
            aria-label="Search for a city"
            className="w-full rounded-full border border-border bg-surface py-2.5 pr-9 pl-10 text-fg placeholder:text-muted focus:border-accent"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-fg"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={status === 'locating'}
          aria-label="Use my location"
          title="Use my location"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-accent hover:bg-surface-2 disabled:opacity-60"
        >
          {status === 'locating' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Navigation size={18} />
          )}
        </button>
      </div>

      {status === 'denied' && (
        <p className="mt-2 text-xs text-amber-400">
          Location permission denied — search for a city instead.
        </p>
      )}

      {showDropdown && (
        <div className="card absolute z-50 mt-2 max-h-80 w-full overflow-auto p-1.5 shadow-2xl">
          {query.trim().length < 2 && favorites.length > 0 && (
            <p className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted uppercase">
              Saved
            </p>
          )}
          {query.trim().length >= 2 && results.length === 0 && !isFetching && (
            <p className="px-3 py-3 text-sm text-muted">No matches for “{query}”.</p>
          )}
          {isFetching && (
            <p className="flex items-center gap-2 px-3 py-3 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" /> Searching…
            </p>
          )}

          {(query.trim().length >= 2 ? results : favorites).map((loc) => (
            <div
              key={loc.id}
              className="flex items-center gap-1 rounded-lg hover:bg-surface-2"
            >
              <button
                type="button"
                onClick={() => choose(loc)}
                className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
              >
                <MapPin size={15} className="shrink-0 text-muted" />
                <span className="truncate text-fg">{locationLabel(loc)}</span>
              </button>
              <button
                type="button"
                aria-label={isFavorite(loc) ? 'Remove favorite' : 'Save favorite'}
                onClick={() => onToggleFavorite(loc)}
                className="px-2 py-2 text-muted hover:text-amber-400"
              >
                <Star
                  size={15}
                  fill={isFavorite(loc) ? 'currentColor' : 'none'}
                  className={isFavorite(loc) ? 'text-amber-400' : ''}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
