// Event-dashboard visualizations added for the TGS/Odaiba readout upgrade:
// hall-level footprint map, phase chart with holiday+weather bands, the
// share/placebo/MDE normalization panel, the tourist-vs-domestic split, and the
// social strip. All inline-SVG, MessyNet tokens, dark-only, GitHub-Pages friendly.
import type { EventVenue, Hall, DayTag, Normalization, NaturalExperiment, SocialVenue } from '../lib/types'
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

// ---- Normalization: verdict + MDE; control-venue bars, or a DAU-share sparkline ----
function NormBadge({ norm, locale }: { norm: Normalization; locale: Locale }) {
  const L = (en: string, ja: string) => (locale === 'ja' ? ja : en)
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-[4px] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
        style={{ background: norm.detected ? DEEP : WIRE, color: norm.detected ? VOLT : MIST }}>
        {norm.detected ? L('Detected', '検出') : L('Within noise floor', 'ノイズ内')}
      </span>
      <span className="font-mono text-[12px] text-[var(--mn-ice)]">
        {norm.relative_pct != null ? `${norm.relative_pct > 0 ? '+' : ''}${norm.relative_pct}% ${L('vs baseline', '対基準')}` : `${norm.effect_pts.toFixed(2)}`}
      </span>
      <span className="ml-auto font-mono text-[11px] text-[var(--mn-mist)]">
        MDE ±{norm.mde_relative_pct != null ? `${norm.mde_relative_pct}%` : `${norm.mde_pts.toFixed(2)}`}
      </span>
    </div>
  )
}

export function NormalizationPanel({ norm, dayTags, locale = 'en' }:
  { norm: Normalization; dayTags?: Record<string, DayTag>; locale?: Locale }) {
  const L = (en: string, ja: string) => (locale === 'ja' ? ja : en)
  const during = new Set(norm.during_dates)
  // DAU basis (no control venues): sparkline of DAU share per 100k, during days accented.
  if (norm.basis === 'dau' || !norm.share_series) {
    const series = norm.dau_share_per_100k?.series ?? {}
    const dates = Object.keys(series).sort()
    const W = 520, H = 120, PAD = { l: 8, r: 8, t: 10, b: 22 }
    const n = dates.length
    const max = Math.max(1e-6, ...dates.map((d) => series[d]))
    const bw = n ? (W - PAD.l - PAD.r) / n : 0
    return (
      <div>
        <NormBadge norm={norm} locale={locale} />
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--mn-mist)]">{norm.verdict}</p>
        <div className="mt-3 mb-1 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">
          {L('Share of national daily-active devices (per 100k)', '全国DAU比（10万人あたり）')}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="DAU share">
          {dates.map((d, i) => {
            const h = (series[d] / max) * (H - PAD.t - PAD.b)
            const inDuring = during.has(d)
            const hol = dayTags?.[d]?.holiday
            return (
              <g key={d}>
                <rect x={PAD.l + i * bw + bw * 0.15} y={H - PAD.b - h} width={bw * 0.7} height={h}
                  fill={inDuring ? VOLT : TEAL} opacity={inDuring ? 0.95 : 0.6} rx={1} />
                <text x={PAD.l + i * bw + bw / 2} y={H - PAD.b + 11} fontSize={8}
                  fill={hol ? VOLT : MIST} textAnchor="middle" fontFamily="JetBrains Mono">
                  {fmtDateShort(d).replace('Sep ', '')}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="mt-1 flex gap-4 text-[9px] uppercase tracking-[0.12em] text-[var(--mn-faint)]">
          <span><span style={{ background: VOLT }} className="inline-block w-2.5 h-2.5 rounded-[2px] align-middle mr-1" />{L('during window', 'イベント期間')}</span>
          <span><span style={{ background: TEAL, opacity: 0.6 }} className="inline-block w-2.5 h-2.5 rounded-[2px] align-middle mr-1" />{L('other days', 'その他')}</span>
        </div>
      </div>
    )
  }
  // Control-venue basis (warehouse run): bars per panel venue.
  const venues = Object.keys(norm.share_series)
  const treat = venues[0]
  const meanShare = (vk: string) => {
    const s = norm.share_series![vk]; const dd = Object.keys(s).filter((d) => during.has(d))
    return dd.length ? dd.reduce((a, d) => a + s[d], 0) / dd.length : 0
  }
  const rows = venues.map((vk) => ({ v: vk, share: meanShare(vk), treat: vk === treat }))
  const max = Math.max(1e-6, ...rows.map((r) => r.share))
  return (
    <div>
      <NormBadge norm={norm} locale={locale} />
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--mn-mist)]">{norm.verdict}</p>
      <div className="mt-3 mb-1 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{L('During-window share of venue panel', 'イベント期間の会場パネル内シェア')}</div>
      <div className="flex flex-col gap-1">
        {rows.sort((a, b) => b.share - a.share).map((r) => (
          <div key={r.v} className="flex items-center gap-2 text-[11px]">
            <div className="w-[40%] truncate text-[var(--mn-body)]" style={{ color: r.treat ? VOLT : undefined }} title={r.v}>
              {r.v}{r.treat ? ' ◂' : ''}
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

// ---- Show-night natural experiment: show vs canceled vs baseline day averages ----
export function ShowNightChart({ ne, locale = 'en' }: { ne: NaturalExperiment; locale?: Locale }) {
  const L = (en: string, ja: string) => (locale === 'ja' ? ja : en)
  const bars = [
    { label: L('Show days', 'ショー日'), value: ne.avg_devices_show, color: VOLT },
    { label: L('Canceled', '中止日'), value: ne.avg_devices_canceled, color: TEAL_LT },
    { label: L('Baseline', '基準日'), value: ne.avg_devices_baseline, color: TEAL },
  ].filter((b) => b.value != null) as { label: string; value: number; color: string }[]
  const max = Math.max(1, ...bars.map((b) => b.value))
  const lift = ne.show_vs_canceled_lift
  return (
    <div>
      <div className="mb-3 font-mono text-[13px] text-[var(--mn-ice)]">
        {lift != null ? `${lift}×` : '—'}
        <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{L('show vs canceled nights', 'ショー対中止')}</span>
      </div>
      <div className="flex flex-col gap-2">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-[11px]">
            <div className="w-[26%] text-[var(--mn-body)]">{b.label}</div>
            <div className="relative h-[16px] flex-1 rounded-[3px]" style={{ background: WIRE }}>
              <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${(b.value / max) * 100}%`, background: b.color }} />
            </div>
            <div className="w-[56px] text-right font-mono text-[var(--mn-ice)]">{fmtInt(Math.round(b.value))}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-[var(--mn-faint)]">
        {lift != null && lift < 1
          ? L('Canceled nights drew MORE than show nights — footfall tracks the holiday, not the show.',
              '中止日の方がショー日より多い——来訪は祝日によるもので、ショーではありません。')
          : L('Day-total devices (campus box). Evening-hour contrast needs the warehouse.',
              '日合計端末数（キャンパス範囲）。時間帯別はウェアハウスが必要です。')}
      </p>
    </div>
  )
}

// ---- Conversation insights: IP topics, language mix, voice mix, concentration ----
const BAR_COLORS = [VOLT, TEAL, TEAL_LT, TEAL_PALE, DEEP, MIST]
export function ConversationInsights({ social, locale = 'en' }: { social: SocialVenue; locale?: Locale }) {
  const L = (en: string, ja: string) => (locale === 'ja' ? ja : en)
  const es = social.engagement_stats
  const ip = (social.ip_topics ?? []).slice(0, 6)
  const ipMax = Math.max(1, ...ip.map((t) => t.posts))
  const lang = social.language_mix ?? {}
  const langTotal = Object.values(lang).reduce((a, b) => a + b, 0) || 1
  const langParts = [
    { k: 'ja', label: L('Japanese', '日本語'), color: VOLT },
    { k: 'en', label: L('English', '英語'), color: TEAL_LT },
    { k: 'other', label: L('Other', 'その他'), color: MIST },
  ]
  const voice = social.voice_mix ?? {}
  const voiceTotal = Object.values(voice).reduce((a, b) => a + b, 0) || 1
  const voiceLabels: Record<string, string> = {
    official: L('Official', '公式'), press_creator: L('Press / creator', '報道・クリエイター'),
    visitor_fan: L('Visitor / fan', '来場者・ファン'),
  }
  return (
    <div className="flex flex-col gap-4">
      {es?.outlier && (
        <div className="rounded-[var(--mn-radius)] border-l-2 border-[var(--mn-volt)] bg-[var(--mn-abyss)] px-3 py-2 text-[11px] leading-relaxed text-[var(--mn-mist)]">
          {L(`One post is ${Math.round(es.top_post_share * 100)}% of all engagement — totals are skewed; median per post is ${es.median}.`,
             `1投稿が全エンゲージメントの${Math.round(es.top_post_share * 100)}%——合計は偏っています。投稿あたり中央値は${es.median}。`)}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{L('IP / topics (posts)', 'IP・話題（投稿数）')}</div>
          {ip.length ? ip.map((t) => (
            <div key={t.topic} className="flex items-center gap-2 text-[11px] mb-1">
              <div className="w-[42%] truncate text-[var(--mn-body)]" title={t.topic}>{t.topic}</div>
              <div className="relative h-[12px] flex-1 rounded-[3px]" style={{ background: WIRE }}>
                <div className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${(t.posts / ipMax) * 100}%`, background: TEAL }} />
              </div>
              <div className="w-[36px] text-right font-mono text-[var(--mn-mist)]">{t.posts}</div>
            </div>
          )) : <div className="text-[11px] text-[var(--mn-faint)]">—</div>}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{L('Language mix', '言語構成')}</div>
            <div className="flex h-4 w-full overflow-hidden rounded-[3px]">
              {langParts.map((p) => (lang[p.k] ? <div key={p.k} style={{ width: `${(lang[p.k] / langTotal) * 100}%`, background: p.color }} title={`${p.label}: ${lang[p.k]}`} /> : null))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--mn-body)]">
              {langParts.map((p) => (lang[p.k] ? <span key={p.k} className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: p.color }} />{p.label} <span className="font-mono text-[var(--mn-mist)]">{Math.round((lang[p.k] / langTotal) * 100)}%</span></span> : null))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{L('Voice mix', '発信者構成')}</div>
            <div className="flex h-4 w-full overflow-hidden rounded-[3px]">
              {Object.entries(voice).map(([k, n], i) => <div key={k} style={{ width: `${(n / voiceTotal) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} title={`${voiceLabels[k] ?? k}: ${n}`} />)}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--mn-body)]">
              {Object.entries(voice).map(([k, n], i) => <span key={k} className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} />{voiceLabels[k] ?? k} <span className="font-mono text-[var(--mn-mist)]">{Math.round((n / voiceTotal) * 100)}%</span></span>)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{L('Biggest posts (share of engagement)', '主要投稿（エンゲージメント比）')}</div>
        {[...(social.feed_posts ?? [])].sort((a, b) => b.engagement - a.engagement).slice(0, 5).map((p) => (
          <a key={p.post_id} href={p.source_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] hover:text-[var(--mn-heading)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: VOICE_COLOR[p.voice ?? 'unknown'] ?? FAINT }} />
            <span className="w-[42px] shrink-0 font-mono text-[var(--mn-faint)]">{fmtDateShort(p.date).replace('Sep ', '')}</span>
            <span className="truncate text-[var(--mn-body)]" title={p.caption}>{p.caption || p.post_id}</span>
            <span className="ml-auto shrink-0 font-mono text-[var(--mn-mist)]">{es?.total ? `${Math.round((p.engagement / es.total) * 100)}%` : fmtInt(p.engagement)}</span>
          </a>
        ))}
      </div>
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
