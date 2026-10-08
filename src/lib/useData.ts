import { useEffect, useState } from 'react'
import type { JpData } from './types'

async function getJson<T>(name: string): Promise<T | null> {
  try {
    const url = new URL(`${import.meta.env.BASE_URL}data/${name}.json`, window.location.href).href
    const r = await fetch(url)
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

// Loads all dashboard feeds in parallel; any missing file degrades to null so the
// app renders empty states rather than failing (data lands incrementally).
export function useData(): { data: JpData | null; loading: boolean } {
  const [data, setData] = useState<JpData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    Promise.all([
      getJson<JpData['event']>('jp_event_readout'),
      getJson<JpData['reference']>('jp_reference'),
      getJson<JpData['venues']>('jp_venues'),
      getJson<JpData['social']>('jp_social_readout'),
    ]).then(([event, reference, venues, social]) => {
      if (!alive) return
      // Public demo exposes event tabs only; retail/tourism feeds stay off the host.
      setData({ event, retail: null, tourism: null, odArcs: null, reference, venues, social })
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])
  return { data, loading }
}
