// Event-dashboard visualizations added for the TGS/Odaiba readout upgrade:
// hall-level footprint map, phase chart with holiday+weather bands, the
// share/placebo/MDE normalization panel, the tourist-vs-domestic split, and the
// social strip. All inline-SVG, MessyNet tokens, dark-only, GitHub-Pages friendly.
import type { EventVenue, Hall, DayTag, Normalization, SocialVenue } from '../lib/types'
import { TEAL, TEAL_LT, TEAL_PALE, VOLT, MIST, FAINT, WIRE, DEEP, ICE, SES_RAMP } from '../lib/palette'
import { fmtInt, fmtDateShort } from '../lib/format'
import { tgsText, type Locale } from '../lib/tgsI18n'

type Pt = { date: string; value: number }

// Build date-keyed series arrays from the new daily_counts dicts, falling back to
// the old daily_visitors array so pre-upgrade exports still render.
export function seriesFrom(v: EventVenue, key: 'event' | 'campus' | 'tourist'): Pt[] {
  const dict = key === 'event' ? v.daily_counts
    : key === 'campus' ? v.daily_counts_campus : v.daily_counts_tourist
  if (dict) return Object.keys(dict).sort().map((d) => ({ date: d, value: dict[d] }))
  if (key === 'event' && v.daily_visitors) return v.daily_visitors.map((d) => ({ date: d.date, value: d.visitors }))
  return []
}

function rampColor(share: number, max: number): string {
  if (max <= 0) return SES_RAMP[0]
  const i = Math.min(SES_RAMP.length - 1, Math.round((share / max) * (SES_RAMP.length - 1)))
  return SES_RAMP[i]
}

// ---- Hall-level footprint map (choropleth of the venue's halls by device share) ----
export function HallFootprintMap({ halls }: { halls: Hall[] }) {
  if (!halls?.length) return null
  const pts = halls.flatMap((h) => h.polygon)
  const minx = Math.min(...pts.map((p) => p[0])), maxx = Math.max(...pts.map((p) => p[0]))
  const miny = Math.min(...pts.map((p) => p[1])), maxy = Math.max(...pts.map((p) => p[1]))
  const W = 320, H = 220, PAD = 10
  const sx = (lng: number) => PAD + ((lng - minx) / (maxx - minx || 1)) * (W - 2 * PAD)
  const sy = (lat: number) => H - PAD - ((lat - miny) / (maxy - miny || 1)) * (H - 2 * PAD)
  const maxShare = Math.max(...halls.map((h) => h.share))
  const peak = halls.reduce((p, h, i) => (h.share > halls[p].share ? i : p), 0)
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Hall footprint map">
        {halls.map((h, i) => {
          const poly = h.polygon.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')
          const cx = h.polygon.reduce((s, p) => s + sx(p[0]), 0) / h.polygon.length
          const cy = h.polygon.reduce((s, p) => s + sy(p[1]), 0) / h.polygon.length
          return (
            <g key={h.state_id}>
              <polygon points={poly} fill={rampColor(h.share, maxShare)}
                stroke={i === peak ? VOLT : WIRE} strokeWidth={i === peak ? 2 : 1} fillOpacity={0.9} />
              <text x={cx} y={cy} fontSize={9} fill={ICE} textAnchor="middle" fontFamily="JetBrains Mono">
                {Math.round(h.share * 100)}%
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex flex-col gap-1">
        {halls.map((h, i) => (
          <div key={h.state_id} className="flex items-center gap-2 text-[11px]">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: rampColor(h.share, maxShare) }} />
            <span className="truncate text-[var(--mn-body)]" style={{ color: i === peak ? VOLT : undefined }}>{h.name}</span>
            <span className="ml-auto font-mono text-[var(--mn-mist)]">{fmtInt(h.devices)} · {Math.round(h.share * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Phase chart with event-window shading + holiday + weather bands ----
export function EventPhaseChart({ series, during, dayTags, caption, locale = 'en' }:
  { series: Pt[]; during: string[]; dayTags?: Record<string, DayTag>; caption?: string; locale?: Locale }) {
  const W = 560, H = 190, PAD = { l: 34, r: 12, t: 16, b: 40 }
  const n = series.length
  if (!n) return <div className="text-[12px] text-[var(--mn-faint)]">{tgsText(locale, 'noDailySeries')}</div>
  const max = Math.max(1, ...series.map((s) => s.value))
  const x = (i: number) => PAD.l + (n <= 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (n - 1))
  const y = (v: number) => PAD.t + (1 - v / (max * 1.12)) * (H - PAD.t - PAD.b)
  const duringSet = new Set(during)
  const dIdx = series.map((s, i) => (duringSet.has(s.date) ? i : -1)).filter((i) => i >= 0)
  const path = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.value).toFixed(1)}`).join(' ')
  const peak = series.reduce((p, s, i) => (s.value > series[p].value ? i : p), 0)
  const stepW = n > 1 ? (W - PAD.l - PAD.r) / (n - 1) : 0
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {dIdx.length > 0 && (
          <rect x={x(dIdx[0]) - stepW / 2} y={PAD.t} width={x(dIdx[dIdx.length - 1]) - x(dIdx[0]) + stepW}
            height={H - PAD.t - PAD.b} fill={DEEP} opacity={0.35} />
        )}
        {/* holiday markers */}
        {series.map((s, i) => {
          const t = dayTags?.[s.date]
          if (!t?.holiday) return null
          return <line key={`h${i}`} x1={x(i)} y1={PAD.t} x2={x(i)} y2={H - PAD.b} stroke={VOLT} strokeWidth={1} strokeDasharray="2 3" opacity={0.55} />
        })}
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={WIRE} strokeWidth={1} />
        <path d={path} fill="none" stroke={TEAL} strokeWidth={2} />
        {series.map((s, i) => {
          const t = dayTags?.[s.date]
          return (
            <g key={s.date}>
              <circle cx={x(i)} cy={y(s.value)} r={i === peak ? 4 : 2.5} fill={i === peak ? VOLT : TEAL_LT} />
              <text x={x(i)} y={H - PAD.b + 13} fontSize={9} fill={t?.weekend ? TEAL_PALE : MIST} textAnchor="middle" fontFamily="JetBrains Mono">
                {fmtDateShort(s.date).replace('Sep ', '')}
              </text>
              {t?.holiday && <text x={x(i)} y={H - PAD.b + 23} fontSize={7} fill={VOLT} textAnchor="middle" fontFamily="JetBrains Mono">{locale === 'ja' ? '祝' : 'hol'}</text>}
              {t?.weather && typeof t.weather.rain_mm === 'number' && t.weather.rain_mm >= 1 && (
                <text x={x(i)} y={y(s.value) - 7} fontSize={8} fill={TEAL_LT} textAnchor="middle">☂</text>
              )}
            </g>
          )
        })}
        <text x={PAD.l - 6} y={y(max) + 3} fontSize={9} fill={MIST} textAnchor="end" fontFamily="JetBrains Mono">{fmtInt(max)}</text>
      </svg>
      {caption && <div className="text-[11px] text-[var(--mn-mist)] mt-1">{caption}</div>}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[9px] uppercase tracking-[0.12em] text-[var(--mn-faint)]">
        <span><span style={{ background: DEEP }} className="inline-block w-2.5 h-2.5 rounded-[2px] align-middle mr-1" />{tgsText(locale, 'eventWindow')}</span>
        <span><span style={{ background: VOLT }} className="inline-block w-2.5 h-[2px] align-middle mr-1" />{tgsText(locale, 'publicHoliday')}</span>
        <span>☂ {tgsText(locale, 'rainDay')}</span>
      </div>
    </div>
  )
}

// ---- Normalization: verdict + MDE + makuhari-vs-controls share bars ----
export function NormalizationPanel({ norm }: { norm: Normalization }) {
  const venues = Object.keys(norm.share_series)
  const treat = venues[0]
  const during = new Set(norm.during_dates)
  const meanShare = (v: string) => {
    const s = norm.share_series[v]; const dd = Object.keys(s).filter((d) => during.has(d))
    return dd.length ? dd.reduce((a, d) => a + s[d], 0) / dd.length : 0
  }
  const rows = venues.map((v) => ({ v, share: meanShare(v), treat: v === treat }))
  const max = Math.max(1e-6, ...rows.map((r) => r.share))
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="rounded-[4px] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
          style={{ background: norm.detected ? DEEP : WIRE, color: norm.detected ? VOLT : MIST }}>
          {norm.detected ? 'Detected' : 'Within noise floor'}
        </span>
        <span className="font-mono text-[12px] text-[var(--mn-ice)]">
          {norm.relative_pct != null ? `${norm.relative_pct > 0 ? '+' : ''}${norm.relative_pct}% vs baseline` : `${norm.effect_pts.toFixed(3)} pts`}
        </span>
        <span className="ml-auto font-mono text-[11px] text-[var(--mn-mist)]">
          MDE ±{norm.mde_relative_pct != null ? `${norm.mde_relative_pct}%` : `${norm.mde_pts.toFixed(3)}pts`}
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--mn-mist)]">{norm.verdict}</p>
      <div className="mt-3 mb-1 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">During-window share of venue panel</div>
      <div className="flex flex-col gap-1">
        {rows.sort((a, b) => b.share - a.share).map((r) => (
          <div key={r.v} className="flex items-center gap-2 text-[11px]">
            <div className="w-[40%] truncate text-[var(--mn-body)]" style={{ color: r.treat ? VOLT : undefined }} title={r.v}>
              {r.v}{r.treat ? ' ◂ event' : ''}
            </div>
            <div className="relative h-[12px] flex-1 rounded-[3px]" style={{ background: WIRE }}>
              <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${(r.share / max) * 100}%`, background: r.treat ? VOLT : TEAL }} />
            </div>
            <div className="w-[52px] text-right font-mono text-[var(--mn-mist)]">{r.share.toFixed(2)}%</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-[var(--mn-faint)]">{norm.method}. Placebo n={norm.placebo_n}, SD {norm.placebo_sd_pts} pts.</p>
    </div>
  )
}

// ---- Tourist vs domestic daily split ----
export function TouristSplit({ event, tourist, shareDuring }:
  { event: Pt[]; tourist: Pt[]; shareDuring: number | null | undefined }) {
  const tMap = new Map(tourist.map((p) => [p.date, p.value]))
  const W = 560, H = 150, PAD = { l: 34, r: 12, t: 12, b: 26 }
  const n = event.length
  if (!n) return <div className="text-[12px] text-[var(--mn-faint)]">No series.</div>
  const max = Math.max(1, ...event.map((s) => s.value))
  const x = (i: number) => PAD.l + (n <= 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (n - 1))
  const y = (v: number) => PAD.t + (1 - v / (max * 1.12)) * (H - PAD.t - PAD.b)
  const stepW = n > 1 ? (W - PAD.l - PAD.r) / (n - 1) : 0
  return (
    <div>
      <div className="mb-2 font-mono text-[13px] text-[var(--mn-ice)]">
        {shareDuring != null ? `${Math.round(shareDuring * 100)}%` : '—'}
        <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">inbound-tourist share of during visitors</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={WIRE} strokeWidth={1} />
        {event.map((s, i) => {
          const tv = tMap.get(s.date) ?? 0
          const bx = x(i) - stepW * 0.3
          return (
            <g key={s.date}>
              <rect x={bx} y={y(s.value)} width={stepW * 0.6} height={H - PAD.b - y(s.value)} fill={TEAL} opacity={0.35} />
              <rect x={bx} y={y(tv)} width={stepW * 0.6} height={H - PAD.b - y(tv)} fill={VOLT} opacity={0.9} />
              <text x={x(i)} y={H - PAD.b + 13} fontSize={9} fill={MIST} textAnchor="middle" fontFamily="JetBrains Mono">
                {fmtDateShort(s.date).replace('Sep ', '')}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex gap-4 text-[9px] uppercase tracking-[0.12em] text-[var(--mn-faint)]">
        <span><span style={{ background: TEAL, opacity: 0.5 }} className="inline-block w-2.5 h-2.5 rounded-[2px] align-middle mr-1" />all visitors</span>
        <span><span style={{ background: VOLT }} className="inline-block w-2.5 h-2.5 rounded-[2px] align-middle mr-1" />inbound tourists (airport-origin)</span>
      </div>
    </div>
  )
}

// ---- Social strip: daily engagement bars + voice legend + top posts ----
const VOICE_COLOR: Record<string, string> = { official: VOLT, press_creator: TEAL_LT, visitor_fan: TEAL_PALE, unknown: FAINT }
export function SocialStrip({ social }: { social: SocialVenue }) {
  const dates = Object.keys(social.daily).sort()
  const maxEng = Math.max(1, ...dates.map((d) => social.daily[d].engagement))
  const W = 560, H = 120, PAD = { l: 8, r: 8, t: 10, b: 24 }
  const n = dates.length
  const bw = n ? (W - PAD.l - PAD.r) / n : 0
  const c = social.footfall_corr
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-mono text-[13px] text-[var(--mn-ice)]">{fmtInt(social.posts)} posts</span>
        <span className="font-mono text-[13px] text-[var(--mn-ice)]">{fmtInt(social.engagement)} engagement</span>
        <span className="text-[11px] text-[var(--mn-mist)]">
          footfall r = {c?.pearson_r == null ? '—' : c.pearson_r} (n={c?.n_days ?? 0}, directional)
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily engagement">
        {dates.map((d, i) => {
          const e = social.daily[d].engagement
          const h = (e / maxEng) * (H - PAD.t - PAD.b)
          return (
            <g key={d}>
              <rect x={PAD.l + i * bw + bw * 0.15} y={H - PAD.b - h} width={bw * 0.7} height={h} fill={TEAL} rx={1} />
              <text x={PAD.l + i * bw + bw / 2} y={H - PAD.b + 12} fontSize={8} fill={MIST} textAnchor="middle" fontFamily="JetBrains Mono">
                {fmtDateShort(d).replace('Sep ', '')}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {Object.entries(social.by_voice ?? {}).map(([v, s]) => (
          <div key={v} className="flex items-center gap-1.5 text-[11px] text-[var(--mn-body)]">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: VOICE_COLOR[v] ?? FAINT }} />
            {v.replace('_', ' ')} <span className="font-mono text-[var(--mn-mist)]">{s.posts}p · {fmtInt(s.engagement)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">Biggest posts</div>
        {(social.top_posts ?? []).slice(0, 5).map((p) => (
          <div key={p.post_id} className="flex items-center gap-2 text-[11px]">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: VOICE_COLOR[p.voice] ?? FAINT }} />
            <span className="w-[42px] shrink-0 font-mono text-[var(--mn-faint)]">{fmtDateShort(p.date).replace('Sep ', '')}</span>
            <span className="truncate text-[var(--mn-body)]" title={p.caption}>{p.caption || p.post_id}</span>
            <span className="ml-auto shrink-0 font-mono text-[var(--mn-mist)]">{fmtInt(p.engagement)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
