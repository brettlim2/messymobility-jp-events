import type { ODArcs } from '../lib/types'
import { TEAL, TEAL_LT, VOLT, MIST, WIRE, FAINT } from '../lib/palette'
import { Empty } from './ui'

// Lightweight equirectangular arc map for Japan — no basemap tiles / tokens.
const LNG0 = 127, LNG1 = 146, LAT0 = 30.5, LAT1 = 46
const W = 560, H = 440

function proj(lng: number, lat: number): [number, number] {
  const x = ((lng - LNG0) / (LNG1 - LNG0)) * W
  const y = (1 - (lat - LAT0) / (LAT1 - LAT0)) * H
  return [x, y]
}

export function ODMap({ data }: { data: ODArcs | null }) {
  if (!data || !data.arcs?.length) return <Empty note="O→D arcs will render once jp_od_arcs.json lands" />
  const maxV = Math.max(1, ...data.arcs.map((a) => a.visitors))
  // dedupe destination labels (largest first)
  const destSeen = new Set<string>()
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Airport to destination flows">
      {/* graticule */}
      {[130, 135, 140, 145].map((lng) => {
        const [x] = proj(lng, LAT0)
        return <line key={`v${lng}`} x1={x} y1={0} x2={x} y2={H} stroke={WIRE} strokeWidth={0.5} opacity={0.5} />
      })}
      {[32, 35, 38, 41, 44].map((lat) => {
        const [, y] = proj(LNG0, lat)
        return <line key={`h${lat}`} x1={0} y1={y} x2={W} y2={y} stroke={WIRE} strokeWidth={0.5} opacity={0.5} />
      })}
      {/* arcs */}
      {[...data.arcs].sort((a, b) => a.visitors - b.visitors).map((a, i) => {
        const [x1, y1] = proj(a.from[0], a.from[1])
        const [x2, y2] = proj(a.to[0], a.to[1])
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.25
        const w = 0.6 + (a.visitors / maxV) * 3.4
        return (
          <path
            key={i}
            d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
            fill="none"
            stroke={TEAL}
            strokeWidth={w}
            opacity={0.25 + 0.5 * (a.visitors / maxV)}
          />
        )
      })}
      {/* destination dots + labels */}
      {[...data.arcs].sort((a, b) => b.visitors - a.visitors).map((a, i) => {
        const [x, y] = proj(a.to[0], a.to[1])
        const show = !destSeen.has(a.zone)
        if (show) destSeen.add(a.zone)
        return (
          <g key={`d${i}`}>
            <circle cx={x} cy={y} r={2.5} fill={TEAL_LT} />
            {show && (
              <text x={x + 4} y={y + 3} fontSize={8.5} fill={MIST} fontFamily="DM Sans">
                {a.zone}
              </text>
            )}
          </g>
        )
      })}
      {/* airports (origins) — the single volt signal per surface = the gateways */}
      {data.airports.map((ap) => {
        const [x, y] = proj(ap.lng, ap.lat)
        return (
          <g key={ap.id}>
            <circle cx={x} cy={y} r={4} fill={VOLT} />
            <text x={x + 5} y={y - 4} fontSize={9} fill={VOLT} fontFamily="JetBrains Mono">
              {ap.id}
            </text>
          </g>
        )
      })}
      <text x={6} y={H - 6} fontSize={8} fill={FAINT} fontFamily="JetBrains Mono">
        ● gateway airport  → onward destination (width = inbound visitors)
      </text>
    </svg>
  )
}
