import { useEffect, useState } from 'react'
import { useData } from './lib/useData'
import { EventDashboard, type EventConfig } from './components/dashboards/EventDashboard'
import { tgsText, type Locale } from './lib/tgsI18n'
import type { JpData } from './lib/types'

type Tab = 'fuji' | 'capcom'

// "Two events, one week" — compares the two activations in the same Silver Week.
function CrossEventStrip({ data, locale, onPick }: { data: JpData | null; locale: Locale; onPick: (t: Tab) => void }) {
  const L = (en: string, ja: string) => (locale === 'ja' ? ja : en)
  const tgs = data?.event?.['makuhari_messe']
  const oda = data?.event?.['odaiba']
  if (!tgs || !oda) return null
  const xe = (data?.event as unknown as { _cross_event?: {
    zone_comention?: { shared_cross_zones?: string[] }
    akihabara_affinity?: { makuhari_messe?: number | null; odaiba?: number | null }
  } })?._cross_event
  const cards: { tab: Tab; label: string; venue: typeof tgs }[] = [
    { tab: 'capcom', label: L('CAPCOM × TGS', 'CAPCOM × TGS'), venue: tgs },
    { tab: 'fuji', label: L('Fuji TV × Odaiba', 'フジテレビ × お台場'), venue: oda },
  ]
  const fmtShare = (v: number | null | undefined) =>
    v == null ? '—' : `${Math.round(v * 1000) / 10}%`
  const akiTgs = xe?.akihabara_affinity?.makuhari_messe
  const akiOda = xe?.akihabara_affinity?.odaiba
  const shared = xe?.zone_comention?.shared_cross_zones ?? []
  return (
    <section className="vm-glass rounded-[var(--mn-radius-lg)] p-5 mb-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--mn-mist)]">{L('Two events, one week', '1週間に2つのイベント')}</div>
      <h2 className="font-display text-[17px] text-[var(--mn-heading)] mt-1">{L('Silver Week 2026 · Sep 16–23', 'シルバーウィーク2026 · 9月16〜23日')}</h2>
      <div className="grid gap-3 md:grid-cols-2 mt-3">
        {cards.map((c) => {
          const n = c.venue.normalization
          const ne = c.venue.natural_experiment
          const detected = n?.detected
          return (
            <button key={c.tab} type="button" onClick={() => onPick(c.tab)}
              className="text-left rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3 hover:border-[var(--mn-teal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[12px] text-[var(--mn-heading)]">{c.label}</span>
                <span className="shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em]"
                  style={{ background: 'var(--mn-wire)', color: detected ? 'var(--mn-volt)' : 'var(--mn-mist)' }}>
                  {n ? (detected ? L('Detected', '検出') : L('Within noise', 'ノイズ内')) : L('n/a', '—')}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[var(--mn-mist)]">
                <span className="font-mono text-[var(--mn-ice)]">{n?.relative_pct != null ? `${n.relative_pct > 0 ? '+' : ''}${n.relative_pct}%` : '—'}</span>
                <span>{L('normalized lift', '正規化リフト')}</span>
                {ne?.show_vs_canceled_lift != null && (
                  <><span className="font-mono text-[var(--mn-ice)]">{ne.show_vs_canceled_lift}×</span><span>{L('show vs canceled', 'ショー対中止')}</span></>
                )}
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--mn-mist)]">
        {L('Shared pull: ', '共通の回遊先：')}
        {shared.length ? shared.slice(0, 4).join(', ') : '—'}
        {(akiTgs != null || akiOda != null) && L(
          `  ·  Akihabara share of cross-visits — TGS ${fmtShare(akiTgs)}, Odaiba ${fmtShare(akiOda)}.`,
          `  ·  併訪に占める秋葉原 — TGS ${fmtShare(akiTgs)}、お台場 ${fmtShare(akiOda)}。`)}
      </p>
    </section>
  )
}

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'fuji', label: 'Fuji TV × Odaiba', sub: 'IP × visitation' },
  { id: 'capcom', label: 'CAPCOM × TGS', sub: 'gaming IP × event' },
]

const FUJI: EventConfig = {
  venueKey: 'odaiba',
  title: 'Fuji TV × Odaiba',
  eventLabel: 'Odaiba Drone Show · Sep 18–22 (Sep 20–21 canceled)',
  during: ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22'],
  framing:
    'The Odaiba Drone Show on the Fuji TV waterfront. The draw is character IP — Godzilla, Tokyo Revengers, Sonic, Persona — not a Fuji TV campaign (only 2 of 293 posts mention Fuji TV). Footfall before / during / after, who it drew, and where that audience goes next.',
  crossVisitNote: 'Where the Odaiba audience also spends time — candidate markets & venue types for activations and partnerships.',
  ja: {
    title: 'フジテレビ × お台場',
    eventLabel: 'お台場ドローンショー · 9月18〜22日（20〜21日は中止）',
    framing:
      'フジテレビ臨海部でのお台場ドローンショー。主役はキャラクターIP（ゴジラ、東京リベンジャーズ、ソニック、ペルソナ）で、フジテレビの企画ではありません（フジテレビ言及は293件中2件のみ）。前後の来訪、来訪者層、回遊先を見ます。',
    crossVisitNote: 'お台場の来訪者が他に時間を過ごす場所——企画や提携の候補。',
  },
}

const CAPCOM: EventConfig = {
  venueKey: 'makuhari_messe',
  title: 'CAPCOM × Tokyo Game Show',
  eventLabel: 'Tokyo Game Show 2026 · Makuhari Messe · Sep 17–20 (Sep 21 venue day canceled)',
  during: ['2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
  framing:
    'Gaming IP × event visitation. Who attended TGS, where they travelled from (incl. inbound via airports), and where else they spend time — the IP × retail × tourism angle.',
  crossVisitNote: 'Akihabara, airports, theme parks & retail in the mix — the gaming/otaku + tourism signal for IP collaborations.',
  highlightZones: ['Akihabara', 'Narita Airport', 'Haneda Airport', 'Tokyo Disney Resort / Maihama'],
}

export function App() {
  const [tab, setTab] = useState<Tab>(() => {
    const value = new URLSearchParams(window.location.search).get('tab')
    return TABS.some((item) => item.id === value) ? value as Tab : 'fuji'
  })
  const [locale, setLocale] = useState<Locale>(() => {
    const value = new URLSearchParams(window.location.search).get('lang')
    if (value === 'en' || value === 'ja') return value
    try { return window.localStorage.getItem('tgs-locale') === 'ja' ? 'ja' : 'en' } catch { return 'en' }
  })
  const { data, loading } = useData()
  useEffect(() => {
    document.documentElement.lang = locale
    try { window.localStorage.setItem('tgs-locale', locale) } catch { /* private browsing */ }
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    url.searchParams.set('lang', locale)
    window.history.replaceState(null, '', url)
  }, [tab, locale])

  return (
    <div className="vm-page-bg min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--mn-wire)] bg-[var(--mn-abyss)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--mn-radius)] bg-[var(--mn-teal)] font-display text-[15px] text-[var(--mn-logo-ink)]">
              MN
            </div>
            <div>
              <div className="font-display text-[15px] leading-none text-[var(--mn-heading)]">MessyNet</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--mn-mist)]">{tgsText(locale, 'japanMobility')}</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="rounded-[var(--mn-radius-btn)] border px-3 py-1.5 text-left"
                style={{
                  borderColor: tab === t.id ? 'var(--mn-teal)' : 'var(--mn-wire)',
                  background: tab === t.id ? 'var(--mn-callout-bg)' : 'transparent',
                }}
              >
                <div className="text-[12px]" style={{ color: tab === t.id ? 'var(--mn-heading)' : 'var(--mn-body)' }}>{locale === 'ja' ? ({ fuji: 'フジテレビ × お台場', capcom: 'CAPCOM × TGS' } as Record<Tab, string>)[t.id] : t.label}</div>
                <div className="text-[9px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{locale === 'ja' ? ({ fuji: 'IP × 来訪', capcom: 'ゲームIP × イベント' } as Record<Tab, string>)[t.id] : t.sub}</div>
              </button>
            ))}
          </nav>
          {<div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--mn-mist)]" role="group" aria-label={tgsText(locale, 'language')}>
            <span className="mr-1">{tgsText(locale, 'language')}</span>
            {(['en', 'ja'] as const).map((lang) => <button key={lang} type="button" onClick={() => setLocale(lang)} aria-pressed={locale === lang}
              className={`rounded-[var(--mn-radius-btn)] border px-2.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)] ${locale === lang ? 'border-[var(--mn-teal)] bg-[var(--mn-callout-bg)] text-[var(--mn-heading)]' : 'border-[var(--mn-wire)] text-[var(--mn-mist)] hover:text-[var(--mn-heading)]'}`}>
              {lang === 'en' ? 'English' : '日本語'}
            </button>)}
          </div>}
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-5 lg:px-8">
        {loading ? (
          <div className="py-24 text-center text-[13px] text-[var(--mn-mist)]">{locale === 'ja' ? '日本の移動データを読み込み中…' : 'Loading Japan mobility data…'}</div>
        ) : (
          <>
            <CrossEventStrip data={data} locale={locale} onPick={setTab} />
            {tab === 'fuji' && <EventDashboard cfg={FUJI} v={data?.event?.[FUJI.venueKey]} reference={data?.reference ?? null} social={data?.social?.[FUJI.venueKey] ?? null} locale={locale} />}
            {tab === 'capcom' && <EventDashboard cfg={CAPCOM} v={data?.event?.[CAPCOM.venueKey]} reference={data?.reference ?? null} social={data?.social?.[CAPCOM.venueKey] ?? null} locale={locale} />}
          </>
        )}
        <footer className="mt-8 border-t border-[var(--mn-wire)] pt-4 text-[10px] text-[var(--mn-faint)]">
          {locale === 'ja'
            ? 'MessyNet · Signal in the Dark — 日本の移動パネル、2026年9月16〜23日（23日は日本時間08:59まで）。パネル推計であり、全数調査ではありません。'
            : 'MessyNet · Signal in the Dark — Japan mobility panel, Sep 16–23 2026 (Sep 23 partial through 08:59 JST). Panel estimates, not census; patterns over absolute counts.'}
        </footer>
      </main>
    </div>
  )
}
