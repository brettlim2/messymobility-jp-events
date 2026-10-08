import { useEffect, useState } from 'react'
import { useData } from './lib/useData'
import { DataQualityBanner } from './components/ui'
import { EventDashboard, type EventConfig } from './components/dashboards/EventDashboard'
import { tgsText, type Locale } from './lib/tgsI18n'

type Tab = 'fuji' | 'capcom'

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'fuji', label: 'Fuji TV × Odaiba', sub: 'IP × visitation' },
  { id: 'capcom', label: 'CAPCOM × TGS', sub: 'gaming IP × event' },
]

const FUJI: EventConfig = {
  venueKey: 'odaiba',
  title: 'Fuji TV × Odaiba',
  eventLabel: 'Odaiba Drone Show · Sep 18–22',
  during: ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22'],
  framing:
    'Connect online interest in Fuji TV content/IP with real-world visitation to the Odaiba waterfront. Footfall before / during / after the in-window activation, who it drew, and where that audience goes next.',
  crossVisitNote: 'Where the Odaiba audience also spends time — candidate markets & venue types for activations and partnerships.',
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
    document.documentElement.lang = tab === 'capcom' ? locale : 'en'
    try { window.localStorage.setItem('tgs-locale', locale) } catch { /* private browsing */ }
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    if (tab === 'capcom') url.searchParams.set('lang', locale)
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
              <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--mn-mist)]">{tab === 'capcom' ? tgsText(locale, 'japanMobility') : 'Japan Mobility'}</div>
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
                <div className="text-[12px]" style={{ color: tab === t.id ? 'var(--mn-heading)' : 'var(--mn-body)' }}>{tab === 'capcom' && locale === 'ja' ? ({ fuji: 'フジテレビ × お台場', capcom: 'CAPCOM × TGS' } as Record<Tab, string>)[t.id] : t.label}</div>
                <div className="text-[9px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{tab === 'capcom' && locale === 'ja' ? ({ fuji: 'IP × 来訪', capcom: 'ゲームIP × イベント' } as Record<Tab, string>)[t.id] : t.sub}</div>
              </button>
            ))}
          </nav>
          {tab === 'capcom' && <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--mn-mist)]" role="group" aria-label={tgsText(locale, 'language')}>
            <span className="mr-1">{tgsText(locale, 'language')}</span>
            {(['en', 'ja'] as const).map((lang) => <button key={lang} type="button" onClick={() => setLocale(lang)} aria-pressed={locale === lang}
              className={`rounded-[var(--mn-radius-btn)] border px-2.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)] ${locale === lang ? 'border-[var(--mn-teal)] bg-[var(--mn-callout-bg)] text-[var(--mn-heading)]' : 'border-[var(--mn-wire)] text-[var(--mn-mist)] hover:text-[var(--mn-heading)]'}`}>
              {lang === 'en' ? 'English' : '日本語'}
            </button>)}
          </div>}
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-5 lg:px-8">
        <div className="mb-4">
          <DataQualityBanner window={data?.reference?.window}
            label={tab === 'capcom' ? tgsText(locale, 'dataQuality') : undefined}
            locale={tab === 'capcom' ? locale : 'en'}
            caveats={tab === 'capcom' && locale === 'ja'
              ? ['国籍情報は一部のローミング／外国通信事業者の端末に限られます。', '会場の対象範囲は概略の多角形です。']
              : data?.reference?.caveats?.slice(1)} />
        </div>
        {loading ? (
          <div className="py-24 text-center text-[13px] text-[var(--mn-mist)]">{tab === 'capcom' && locale === 'ja' ? '日本の移動データを読み込み中…' : 'Loading Japan mobility data…'}</div>
        ) : (
          <>
            {tab === 'fuji' && <EventDashboard cfg={FUJI} v={data?.event?.[FUJI.venueKey]} reference={data?.reference ?? null} social={data?.social?.[FUJI.venueKey] ?? null} />}
            {tab === 'capcom' && <EventDashboard cfg={CAPCOM} v={data?.event?.[CAPCOM.venueKey]} reference={data?.reference ?? null} social={data?.social?.[CAPCOM.venueKey] ?? null} locale={locale} />}
          </>
        )}
        <footer className="mt-8 border-t border-[var(--mn-wire)] pt-4 text-[10px] text-[var(--mn-faint)]">
          {tab === 'capcom' && locale === 'ja'
            ? 'MessyNet · 日本の移動パネル（Factori）、2026年9月16〜23日（23日は日本時間08:59まで）。パネル推計であり、全数調査ではありません。'
            : tab === 'capcom'
              ? 'MessyNet · Signal in the Dark — Japan mobility panel (Factori), Sep 16–23 2026 (Sep 23 partial through 08:59 JST). Panel estimates, not census; patterns over absolute counts.'
              : 'MessyNet · Signal in the Dark — Japan mobility panel (Factori), week of Sep 16–22 2026. Panel estimates, not census; patterns over absolute counts.'}
        </footer>
      </main>
    </div>
  )
}
