import { getJson } from './client'

/**
 * RainViewer free public radar API. Returns recent past frames plus short-term
 * nowcast frames. Usage requires visible attribution (see RadarMap). Verify the
 * current RainViewer API terms before relying on this in production.
 *   Docs: https://www.rainviewer.com/api.html
 */
const RAINVIEWER_URL = 'https://api.rainviewer.com/public/weather-maps.json'

export interface RadarFrame {
  /** Unix seconds. */
  time: number
  /** Path fragment appended to host to build the tile URL template. */
  path: string
}

export interface RadarData {
  host: string
  frames: RadarFrame[]
}

interface RainViewerResponse {
  host: string
  radar: {
    past: RadarFrame[]
    nowcast: RadarFrame[]
  }
}

export async function fetchRadarFrames(signal?: AbortSignal): Promise<RadarData> {
  const data = await getJson<RainViewerResponse>(RAINVIEWER_URL, signal)
  // Combine past + nowcast into one timeline.
  const frames = [...(data.radar?.past ?? []), ...(data.radar?.nowcast ?? [])]
  return { host: data.host, frames }
}

/** Build a Leaflet-compatible tile URL template for a single radar frame. */
export function radarTileUrl(host: string, frame: RadarFrame): string {
  // 256px tiles, color scheme 2 (universal blue→red), smooth + snow flags (1_1).
  return `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`
}
