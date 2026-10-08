import type { ReactNode } from 'react'
import { TEAL, TEAL_LT, VOLT, MIST, WIRE, DEEP } from '../lib/palette'
import { fmtDateShort, fmtInt } from '../lib/format'

export function GlassPanel({ children, bright, className = '', id }: { children: ReactNode; bright?: boolean; className?: string; id?: string }) {
  return (
    <section id={id} className={`${bright ? 'vm-glass-bright' : 'vm-glass'} rounded-[var(--mn-radius-lg)] ${className}`}>
      {children}
    </section>
  )
}

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--mn-mist)]">{children}</div>
}

export function SectionHeader({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-4">
      {kicker && <Kicker>{kicker}</Kicker>}
      <h3 className="font-display text-[17px] text-[var(--mn-heading)] mt-1">{title}</h3>
      {sub && <p className="text-[12px] text-[var(--mn-mist)] mt-1 leading-relaxed">{sub}</p>}
    </div>
  )
}

export function KpiTile({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-night)] px-3.5 py-3">
      <div className="text-[9px] uppercase tracking-[0.16em] text-[var(--mn-faint)]">{label}</div>
      <div
        className="font-mono mt-1.5 text-[22px] leading-none"
        style={{ color: accent ? VOLT : 'var(--mn-heading)' }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-[var(--mn-mist)] mt-1.5">{sub}</div>}
    </div>
  )
}

export function BarRow({
  items,
  unit = '',
  highlight,
  color = TEAL,
}: {
  items: { label: string; value: number; sub?: string }[]
  unit?: string
  highlight?: (label: string) => boolean
  color?: string
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it) => {
        const hot = highlight?.(it.label)
        return (
          <div key={it.label} className="flex items-center gap-2">
            <div className="w-[38%] shrink-0 truncate text-[12px] text-[var(--mn-body)]" title={it.label}>
              {it.label}
            </div>
            <div className="relative h-[14px] flex-1 rounded-[3px]" style={{ background: WIRE }}>
              <div
                className="absolute inset-y-0 left-0 rounded-[3px]"
                style={{ width: `${(it.value / max) * 100}%`, background: hot ? VOLT : color }}
              />
            </div>
            <div className="w-[64px] shrink-0 text-right font-mono text-[11px]" style={{ color: hot ? VOLT : 'var(--mn-ice)' }}>
              {fmtInt(it.value)}
              {unit}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function PhaseTrendChart({
  series,
  during,
  caption,
}: {
  series: { date: string; value: number }[]
  during?: string[]
  caption?: string
}) {
  const W = 560
  const H = 170
  const PAD = { l: 34, r: 12, t: 14, b: 26 }
  const n = series.length
  const max = Math.max(1, ...series.map((s) => s.value))
  const x = (i: number) => PAD.l + (n <= 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (n - 1))
  const y = (v: number) => PAD.t + (1 - v / (max * 1.12)) * (H - PAD.t - PAD.b)
  const peak = series.reduce((p, s, i) => (s.value > series[p].value ? i : p), 0)
  const duringSet = new Set(during ?? [])
  const dIdx = series.map((s, i) => (duringSet.has(s.date) ? i : -1)).filter((i) => i >= 0)
  const path = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.value).toFixed(1)}`).join(' ')
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {dIdx.length > 0 && (
          <rect
            x={x(dIdx[0]) - (W - PAD.l - PAD.r) / (2 * (n - 1))}
            y={PAD.t}
            width={(x(dIdx[dIdx.length - 1]) - x(dIdx[0])) + (W - PAD.l - PAD.r) / (n - 1)}
            height={H - PAD.t - PAD.b}
            fill={DEEP}
            opacity={0.35}
          />
        )}
        {/* baseline */}
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={WIRE} strokeWidth={1} />
        <path d={path} fill="none" stroke={TEAL} strokeWidth={2} />
        {series.map((s, i) => (
          <g key={s.date}>
            <circle cx={x(i)} cy={y(s.value)} r={i === peak ? 4 : 2.5} fill={i === peak ? VOLT : TEAL_LT} />
            <text x={x(i)} y={H - PAD.b + 14} fontSize={9} fill={MIST} textAnchor="middle" fontFamily="JetBrains Mono">
              {fmtDateShort(s.date).replace('Sep ', '')}
            </text>
          </g>
        ))}
        <text x={PAD.l - 6} y={y(max) + 3} fontSize={9} fill={MIST} textAnchor="end" fontFamily="JetBrains Mono">
          {fmtInt(max)}
        </text>
      </svg>
      {caption && <div className="text-[11px] text-[var(--mn-mist)] mt-1">{caption}</div>}
      {dIdx.length > 0 && (
        <div className="text-[9px] uppercase tracking-[0.14em] text-[var(--mn-faint)] mt-1">
          <span style={{ color: DEEP, background: DEEP }} className="inline-block w-2.5 h-2.5 rounded-[2px] align-middle mr-1" />
          shaded = event window
        </div>
      )}
    </div>
  )
}

export function DonutStat({ value, label, sub }: { value: number | null; label: string; sub?: string }) {
  const pct = value ?? 0
  const R = 34
  const C = 2 * Math.PI * R
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 84 84" width={84} height={84}>
        <circle cx={42} cy={42} r={R} fill="none" stroke={WIRE} strokeWidth={10} />
        <circle
          cx={42}
          cy={42}
          r={R}
          fill="none"
          stroke={TEAL}
          strokeWidth={10}
          strokeDasharray={`${C * pct} ${C}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
        <text x={42} y={46} textAnchor="middle" fontSize={16} fill="var(--mn-heading)" fontFamily="JetBrains Mono">
          {value == null ? '—' : `${Math.round(pct * 100)}%`}
        </text>
      </svg>
      <div>
        <div className="text-[12px] text-[var(--mn-body)]">{label}</div>
        {sub && <div className="text-[10px] text-[var(--mn-mist)] mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export function FlowMatrix({ items, unit = '' }: { items: { from: string; to: string; n: number }[]; unit?: string }) {
  if (!items.length) return <Empty note="No transitions in window" />
  const max = Math.max(1, ...items.map((i) => i.n))
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((it, k) => (
        <div key={k} className="flex items-center gap-2 text-[12px]">
          <div className="w-[34%] truncate text-right text-[var(--mn-body)]" title={it.from}>{it.from}</div>
          <div className="text-[var(--mn-teal)]">→</div>
          <div className="w-[34%] truncate text-[var(--mn-body)]" title={it.to}>{it.to}</div>
          <div className="relative h-[12px] flex-1 rounded-[3px]" style={{ background: WIRE }}>
            <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${(it.n / max) * 100}%`, background: TEAL }} />
          </div>
          <div className="w-[48px] text-right font-mono text-[11px] text-[var(--mn-ice)]">{fmtInt(it.n)}{unit}</div>
        </div>
      ))}
    </div>
  )
}

export function StackedShare({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = Math.max(1, parts.reduce((s, p) => s + p.value, 0))
  return (
    <div>
      <div className="flex h-5 w-full overflow-hidden rounded-[4px]">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${p.value}`} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-1.5 text-[11px] text-[var(--mn-body)]">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: p.color }} />
            {p.label} <span className="font-mono text-[var(--mn-mist)]">{Math.round((p.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Empty({ note }: { note: string }) {
  return (
    <div className="rounded-[var(--mn-radius)] border border-dashed border-[var(--mn-wire)] px-4 py-6 text-center text-[12px] text-[var(--mn-faint)]">
      {note}
    </div>
  )
}

export function FutureSlot({ label }: { label: string }) {
  return (
    <div className="rounded-[var(--mn-radius)] border border-dashed border-[var(--mn-wire)] bg-[var(--mn-night)] px-4 py-5 opacity-70">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--mn-faint)]">Future overlay</div>
      <div className="text-[12px] text-[var(--mn-mist)] mt-1">{label}</div>
    </div>
  )
}

export function DataQualityBanner({ window: w, caveats, label = 'Data quality', locale = 'en' }: { window?: { first: string; last: string; days: number }; caveats?: string[]; label?: string; locale?: 'en' | 'ja' }) {
  const date = (value: string) => locale === 'ja'
    ? new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'Asia/Tokyo' }).format(new Date(`${value.slice(0, 10)}T12:00:00+09:00`))
    : value.slice(0, 10)
  return (
    <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-panel)] px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-1">
      <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--mn-teal)]">{label}</span>
      {w && (
        <span className="font-mono text-[11px] text-[var(--mn-ice)]">
          {date(w.first)} → {date(w.last)} · {locale === 'ja' ? `${w.days}日` : `${w.days}d`}
        </span>
      )}
      {(caveats ?? []).map((c, i) => (
        <span key={i} className="text-[11px] text-[var(--mn-mist)]">· {c}</span>
      ))}
    </div>
  )
}
