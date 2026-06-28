import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Pause, Play, Radar } from 'lucide-react'
import { fetchRadarFrames, radarTileUrl } from '../api/rainviewer'
import type { GeoLocation } from '../types/weather'
import { CardTitle } from './ui/Card'

interface RadarMapProps {
  location: GeoLocation
}

export function RadarMap({ location }: RadarMapProps) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const layersRef = useRef<L.TileLayer[]>([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  // Latest coords without forcing the init effect to re-run (which would tear
  // down the whole map and drop the radar layers on every location change).
  const coordsRef = useRef<[number, number]>([location.latitude, location.longitude])
  coordsRef.current = [location.latitude, location.longitude]

  const { data, isError } = useQuery({
    queryKey: ['radar'],
    queryFn: ({ signal }) => fetchRadarFrames(signal),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })

  // Initialise the Leaflet map once on mount.
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = L.map(mapEl.current, {
      center: coordsRef.current,
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Recenter and move the location marker when the active place changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView([location.latitude, location.longitude], map.getZoom())
    if (markerRef.current) markerRef.current.remove()
    markerRef.current = L.circleMarker([location.latitude, location.longitude], {
      radius: 6,
      color: '#fff',
      weight: 2,
      fillColor: '#6ea8fe',
      fillOpacity: 1,
    }).addTo(map)
  }, [location.latitude, location.longitude])

  // (Re)build radar tile layers whenever frames load.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !data) return

    layersRef.current.forEach((l) => l.remove())
    layersRef.current = data.frames.map((frame) =>
      L.tileLayer(radarTileUrl(data.host, frame), { opacity: 0, zIndex: 5 }).addTo(map),
    )
    setFrameIndex(data.frames.length - 1)

    return () => {
      layersRef.current.forEach((l) => l.remove())
      layersRef.current = []
    }
  }, [data])

  // Show only the active frame.
  useEffect(() => {
    layersRef.current.forEach((layer, i) => {
      layer.setOpacity(i === frameIndex ? 0.7 : 0)
    })
  }, [frameIndex])

  // Animation loop.
  useEffect(() => {
    if (!playing || !data || data.frames.length === 0) return
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % data.frames.length)
    }, 700)
    return () => clearInterval(id)
  }, [playing, data])

  const frames = data?.frames ?? []
  const activeTime = frames[frameIndex]
    ? new Date(frames[frameIndex].time * 1000).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <section className="card col-span-full overflow-hidden p-5" aria-label="Precipitation radar">
      <div className="mb-3 flex items-center justify-between">
        <CardTitle icon={<Radar size={14} />}>Precipitation radar</CardTitle>
        {frames.length > 0 && (
          <span className="text-xs text-muted tabular-nums">{activeTime}</span>
        )}
      </div>

      {isError ? (
        <p className="py-8 text-center text-sm text-muted">Radar is temporarily unavailable.</p>
      ) : (
        <>
          <div
            ref={mapEl}
            className="h-72 w-full overflow-hidden rounded-xl border border-border md:h-96"
          />

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause radar animation' : 'Play radar animation'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={Math.max(0, frames.length - 1)}
              value={frameIndex}
              onChange={(e) => {
                setPlaying(false)
                setFrameIndex(Number(e.target.value))
              }}
              aria-label="Radar frame"
              className="flex-1 accent-[var(--app-accent)]"
            />
          </div>

          <p className="mt-2 text-[11px] text-muted">
            Radar by{' '}
            <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer" className="underline">
              RainViewer
            </a>{' '}
            · Map ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
              OpenStreetMap
            </a>{' '}
            contributors
          </p>
        </>
      )}
    </section>
  )
}
