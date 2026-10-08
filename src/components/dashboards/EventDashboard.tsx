import { useState } from 'react'
import type { EventVenue, Reference, SocialVenue } from '../../lib/types'
import { GlassPanel, SectionHeader, KpiTile, BarRow, DonutStat, FutureSlot, Empty, Kicker } from '../ui'
import { fmtLift, fmtFloat } from '../../lib/format'
import { TEAL, TEAL_LT, VOLT, MIST, WIRE } from '../../lib/palette'
import { seriesFrom, HallFootprintMap, EventPhaseChart, NormalizationPanel, TouristSplit, SocialStrip, ShowNightChart, ConversationInsights } from '../EventExtras'
import { TgsSocialExplorer } from '../TgsSocialExplorer'
import { tgsCopy, tgsGroup, tgsNumber, tgsText, tgsZone, type Locale } from '../../lib/tgsI18n'

export interface EventConfig {
  venueKey: string
  title: string
  eventLabel: string
  during: string[]
  framing: string
  crossVisitNote: string
  highlightZones?: string[]
  ja?: { title: string; eventLabel: string; framing: string; crossVisitNote: string }
}

export function EventDashboard({ cfg, v, reference, social, locale = 'en' }:
  { cfg: EventConfig; v: EventVenue | undefined; reference: Reference | null; social?: SocialVenue | null; locale?: Locale }) {
  const [footprint, setFootprint] = useState<'event' | 'campus'>('event')
  const [showExplorer, setShowExplorer] = useState(false)
  const isTgs = cfg.venueKey === 'makuhari_messe'
  const isOdaiba = cfg.venueKey === 'odaiba'
  const t = (key: keyof typeof tgsCopy.en, values?: Record<string, string | number>) => tgsText(locale, key, values)
  const cc = (locale === 'ja' && cfg.ja) ? cfg.ja : cfg
  if (!v) return <Empty note={`${isTgs ? t('title') : cc.title}: ${t('noEvent')}`} />

  const eventSeries = seriesFrom(v, 'event')
  const campusSeries = seriesFrom(v, 'campus')
  const touristSeries = seriesFrom(v, 'tourist')
  const chartSeries = footprint === 'campus' && campusSeries.length ? campusSeries : eventSeries
  const norm = v.normalization ?? null
  const hasCampus = campusSeries.length > 0
  const headlineLift = norm?.relative_pct != null
    ? `${norm.relative_pct > 0 ? '+' : ''}${norm.relative_pct}%`
    : fmtLift(v.during_vs_before_lift)
  const headlineSub = norm ? (norm.detected ? t('normalizedDetected') : t('normalizedNoise')) : t('dailyVisitorLift')
  const showSocial = !!social?.feed_posts && (isTgs || isOdaiba)
  const sep20 = social?.daily?.['2026-09-20']
  const sep19 = social?.daily?.['2026-09-19']
  const sep21 = social?.daily?.['2026-09-21']
  const sep22 = social?.daily?.['2026-09-22']
  const sep23 = social?.daily?.['2026-09-23']
  const cancelWindowPosts = (sep20?.posts ?? 0) + (sep21?.posts ?? 0)
  const highlightedZones = cfg.highlightZones?.map((zone) => tgsZone(zone, locale)) ?? []
  const percent = (part: number, whole: number) => whole ? tgsNumber(Math.round(part / whole * 1000) / 10, locale) : '—'
  const socialAnchor = isOdaiba ? 'odaiba-social' : 'tgs-social'
  const L = (en: string, ja: string) => (locale === 'ja' ? ja : en)
  const legacyFootprint = !v.footprint || v.footprint.startsWith('legacy')
  const topIp = social?.ip_topics?.[0]?.topic
  const ne = v.natural_experiment ?? null
  const postsByDay = social?.daily
    ? Object.fromEntries(Object.entries(social.daily).map(([d, x]) => [d, x.posts]))
    : undefined
  const hasProof = !!(v.halls?.length || norm || ne)
  const navItems = [
    { id: 'sec-verdict', label: L('Verdict', '結論') },
    { id: 'sec-footfall', label: L('Footfall', '来訪') },
    ...(showSocial ? [{ id: socialAnchor, label: L('Conversation', '会話') }] : []),
    ...(hasProof ? [{ id: 'sec-proof', label: L('Proof', '検証') }] : []),
    { id: 'sec-audience', label: L('Audience', '来訪者') },
  ]

  return (
    <div className="flex flex-col gap-4">
      <GlassPanel bright className="p-5">
        <Kicker>{isTgs ? t('eventLabel') : cc.eventLabel}</Kicker>
        <h2 className="font-display text-[22px] text-[var(--mn-heading)] mt-1">{isTgs ? t('title') : cc.title}</h2>
        <p className="text-[12px] text-[var(--mn-mist)] mt-1.5 max-w-3xl leading-relaxed">{isTgs ? t('framing') : cc.framing}</p>
        {showSocial && <a href={`#${socialAnchor}`} className="mt-2 inline-block text-[11px] font-semibold text-[var(--mn-teal)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">{t(isOdaiba ? 'odaibaJump' : 'jump', { count: tgsNumber(social.posts, locale) })}</a>}
        {/* Mobility KPIs are always visible; social KPIs are added alongside, never swapped in. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
          <KpiTile label={legacyFootprint ? t('campusDevices') : t('eventHallVisitors')} value={tgsNumber(v.visitors, locale)}
            sub={v.footprint_area_km2 ? `${v.footprint_area_km2} km² ${t('footprint')}` : undefined} />
          <KpiTile label={t('duringBaseline')} value={headlineLift} accent sub={headlineSub} />
          <KpiTile label={t('medianDwell')} value={`${fmtFloat(v.median_dwell_min)}m`} />
          {v.tourist_share_during != null ? (
            <KpiTile label={t('inboundShare')} value={`${Math.round(v.tourist_share_during * 100)}%`} sub={t('ofDuring')} />
          ) : (
            <KpiTile label={t('newVenue')} value={v.first_time_share == null ? '—' : `${Math.round(v.first_time_share * 100)}%`} sub={t('ofDuringWindow')} />
          )}
          {showSocial && <>
            <KpiTile label={isOdaiba ? t('odaibaSocialPosts') : t('socialPosts')} value={tgsNumber(social.posts, locale)}
              sub={L('conversation volume', '会話量')} />
            {topIp && <KpiTile label={L('Top IP / topic', '主要IP・話題')} value={topIp} />}
          </>}
        </div>
        {v.holiday_overlap_note && (
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--mn-mist)] border-l-2 border-[var(--mn-teal)] pl-2.5">
            {locale === 'ja' && v.holiday_overlap_note_ja ? v.holiday_overlap_note_ja : v.holiday_overlap_note}
          </p>
        )}
        {isTgs && !v.window && (
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--mn-mist)] border-l-2 border-[var(--mn-volt)] pl-2.5">
            {t('legacyWarning')}
          </p>
        )}
      </GlassPanel>

      <nav aria-label={L('Sections', 'セクション')}
        className="sticky top-[58px] z-[5] flex flex-wrap gap-1 rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)]/90 px-2 py-1.5 backdrop-blur-sm">
        {navItems.map((it) => (
          <a key={it.id} href={`#${it.id}`}
            className="rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--mn-mist)] hover:text-[var(--mn-heading)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">
            {it.label}
          </a>
        ))}
      </nav>

      <GlassPanel id="sec-verdict" className="p-5 scroll-mt-24">
        <SectionHeader kicker={L('Verdict', '結論')} title={L('Did it work, for whom, what next?', '効果は？誰に？次は？')} />
        <div className="grid gap-3 md:grid-cols-3">
          {(() => {
            const detected = norm?.detected
            const liftBadge = norm ? (detected ? { c: VOLT, t: L('Detected', '検出') } : { c: MIST, t: L('Within noise', 'ノイズ内') }) : { c: MIST, t: L('n/a', '—') }
            const neLift = ne?.show_vs_canceled_lift
            const neBadge = neLift == null ? { c: MIST, t: L('n/a', '—') } : neLift < 1 ? { c: TEAL_LT, t: L('Holiday-driven', '祝日要因') } : { c: VOLT, t: L('Show-driven', 'ショー要因') }
            const answers = [
              { q: L('Did offline visitation move?', '来訪は動いたか？'), badge: liftBadge,
                a: norm ? `${headlineLift} ${L('vs baseline', '対基準')} — ${detected ? L('outside the ±MDE noise floor', 'ノイズ下限を超える') : L('inside the ±MDE noise floor', 'ノイズ下限内')}. ${L('Normalized vs national DAU (campus footprint).', '全国DAUで正規化（キャンパス範囲）。')}` : L('Readout pending.', '集計待ち。') },
              { q: L('Was it the event or the holiday?', 'イベントか祝日か？'), badge: neBadge,
                a: neLift == null ? L('No show/canceled split available.', 'ショー／中止の比較不可。')
                  : neLift < 1 ? L(`Canceled nights drew ${neLift}× the show nights — footfall tracks Silver Week, not the activation.`, `中止日はショー日の${neLift}倍——来訪はシルバーウィークに連動。`)
                  : L(`Show nights drew ${neLift}× the canceled nights.`, `ショー日は中止日の${neLift}倍。`) },
              { q: L('What drove the conversation?', '会話を動かしたのは？'), badge: { c: TEAL, t: L('Top IP', '主要IP') },
                a: topIp ? (isOdaiba
                    ? L(`${topIp} led the posts. Only ${social?.fuji_tv_mentions ?? 0} of ${social?.posts ?? 0} mention Fuji TV — this is character IP on the Fuji TV waterfront, not a Fuji TV campaign.`, `投稿は「${topIp}」が中心。フジテレビ言及は${social?.posts ?? 0}件中${social?.fuji_tv_mentions ?? 0}件のみ——フジテレビ企画ではなくキャラIP。`)
                    : L(`${topIp} led the posts${social?.engagement_stats?.outlier ? '; engagement totals are skewed by one viral post (see below).' : '.'}`, `投稿は「${topIp}」が中心${social?.engagement_stats?.outlier ? '。合計は1件のバズ投稿に偏り（下記）。' : '。'}`))
                  : L('Social corpus pending.', 'ソーシャル待ち。') },
            ]
            return answers.map((ans, i) => (
              <div key={i} className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{ans.q}</h3>
                  <span className="shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em]" style={{ background: WIRE, color: ans.badge.c }}>{ans.badge.t}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--mn-mist)]">{ans.a}</p>
              </div>
            ))
          })()}
        </div>
      </GlassPanel>

      {showSocial && <GlassPanel className="p-5">
        <SectionHeader kicker={t('keyFindings')} title={t('keyFindings')} />
        <div className="grid gap-3 md:grid-cols-3">
          {isOdaiba ? <>
            <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
              <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{t('locationSignal')}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('odaibaNamedFinding', { count: tgsNumber(social.named_event_posts ?? 0, locale), total: tgsNumber(social.posts, locale), share: percent(social.named_event_posts ?? 0, social.posts) })}</p>
            </div>
            {sep23 && <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
              <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{t('peakSignal')}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('odaibaPeakFinding', { posts: tgsNumber(sep23.posts, locale), footfall: sep22?.footfall == null ? '—' : tgsNumber(sep22.footfall, locale) })}</p>
            </div>}
            <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
              <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{t('cancelSignal')}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('odaibaCancelFinding', { posts: tgsNumber(cancelWindowPosts, locale), share: percent(cancelWindowPosts, social.posts) })}</p>
            </div>
            <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3 md:col-span-3">
              <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{t('odaibaFujiMentions')}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('odaibaFujiFinding', { count: tgsNumber(social.fuji_tv_mentions ?? 0, locale) })}</p>
            </div>
          </> : <>
            <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
              <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{t('locationSignal')}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('locationFinding', { count: tgsNumber(social.capcom_venue_mentions ?? 0, locale), total: tgsNumber(social.capcom_posts ?? 0, locale), share: percent(social.capcom_venue_mentions ?? 0, social.capcom_posts ?? 0) })}</p>
            </div>
            {sep20?.footfall != null && sep19?.footfall != null && <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
              <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{t('peakSignal')}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('peakFinding', { posts: tgsNumber(sep20.posts, locale), current: tgsNumber(sep20.footfall, locale), previous: tgsNumber(sep19.footfall, locale) })}</p>
            </div>}
            {sep21 && <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
              <h3 className="font-semibold text-[12px] text-[var(--mn-heading)]">{t('cancelSignal')}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('cancelFinding', { posts: tgsNumber(sep21.posts, locale), share: percent(sep21.posts, social.posts) })}</p>
            </div>}
          </>}
        </div>
      </GlassPanel>}

      <div id="sec-footfall" className="grid lg:grid-cols-3 gap-4 scroll-mt-24">
        <GlassPanel className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <SectionHeader kicker={t('footfallKicker')} title={isTgs ? t('footfallTitle') : 'Did the activation move offline visitation?'} />
            {hasCampus && (
              <div className="flex shrink-0 rounded-[var(--mn-radius)] border border-[var(--mn-wire)] overflow-hidden text-[10px]">
                {(['event', 'campus'] as const).map((f) => (
                  <button key={f} onClick={() => setFootprint(f)} className="px-2.5 py-1 uppercase tracking-[0.1em]"
                    style={{ background: footprint === f ? 'var(--mn-callout-bg)' : 'transparent',
                             color: footprint === f ? 'var(--mn-heading)' : 'var(--mn-mist)' }}>
                    {f === 'event' ? t('eventHalls') : t('wholeCampus')}
                  </button>
                ))}
              </div>
            )}
          </div>
          <EventPhaseChart series={chartSeries} during={cfg.during} dayTags={v.day_tags} locale={locale} postsByDay={postsByDay}
            caption={isTgs && !v.window
              ? t('legacyChart')
              : `${t('phaseAverage')} — ${t('before')} ${fmtFloat(v.phase_avg_daily.before)} · ${t('during')} ${fmtFloat(v.phase_avg_daily.during)} · ${t('after')} ${fmtFloat(v.phase_avg_daily.after)}`
                + (hasCampus ? `  ·  ${t('campusLift')} ${fmtLift(v.during_vs_before_lift_campus)} / ${t('eventLift')} ${fmtLift(v.during_vs_before_lift)}` : '')} />
        </GlassPanel>
        <GlassPanel className="p-5">
          <SectionHeader kicker={t('audienceKicker')} title={t('newReturning')} />
          <DonutStat value={v.first_time_share}
            label={`${tgsNumber(v.first_time_at_venue, locale)} ${t('newVenue')}`}
            sub={`${tgsNumber(v.returning, locale)} ${t('returning')} · ${tgsNumber(v.during_visitors, locale)} ${t('duringWindow')}`} />
        </GlassPanel>
      </div>

      {social ? (
        <GlassPanel className="p-5 scroll-mt-24" id={social.feed_posts ? socialAnchor : undefined}>
          <SectionHeader kicker={t('socialKicker')}
            title={social.feed_posts ? t(isOdaiba ? 'odaibaSocialTitle' : 'socialTitle') : t('socialFallbackTitle')}
            sub={social.feed_posts ? t(isOdaiba ? 'odaibaSocialSub' : 'socialSub') : t('socialFallbackSub')} />
          {social.feed_posts ? (
            <>
              <ConversationInsights social={social} locale={locale} />
              <div className="mt-4 border-t border-[var(--mn-wire)] pt-3">
                <button type="button" onClick={() => setShowExplorer((s) => !s)}
                  className="text-[11px] font-semibold text-[var(--mn-teal)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]"
                  aria-expanded={showExplorer}>
                  {showExplorer ? L('Hide post explorer', '投稿エクスプローラーを隠す')
                    : L(`Browse ${social.posts} posts`, `${tgsNumber(social.posts, locale)}件の投稿を見る`)}
                </button>
                {showExplorer && <div className="mt-3"><TgsSocialExplorer social={social} locale={locale} /></div>}
              </div>
            </>
          ) : <SocialStrip social={social} />}
        </GlassPanel>
      ) : (
        <FutureSlot label={isTgs ? t('missingSocial') : isOdaiba ? t('odaibaMissingSocial') : 'Social buzz for this IP/event overlays on the footfall curve once scraped.'} />
      )}

      {hasProof && (
        <div id="sec-proof" className="grid lg:grid-cols-2 gap-4 scroll-mt-24">
          {ne && (ne.avg_devices_show != null || ne.avg_devices_canceled != null) ? (
            <GlassPanel className="p-5">
              <SectionHeader kicker={L('Proof · natural experiment', '検証・自然実験')}
                title={L('Show nights vs canceled nights', 'ショー日 対 中止日')}
                sub={L('Same holiday week: nights the show ran vs nights it was canceled.',
                       '同じ祝日週で、ショー実施日と中止日を比較。')} />
              <ShowNightChart ne={ne} locale={locale} />
            </GlassPanel>
          ) : v.halls?.length ? (
            <GlassPanel className="p-5">
              <SectionHeader kicker={t('hallKicker')} title={t('hallTitle')} sub={t('hallSub')} />
              <HallFootprintMap halls={v.halls} />
            </GlassPanel>
          ) : null}
          {norm ? (
            <GlassPanel className="p-5">
              <SectionHeader kicker={t('normKicker')} title={t('normTitle')} sub={t('normSub')} />
              <NormalizationPanel norm={norm} dayTags={v.day_tags} locale={locale} />
            </GlassPanel>
          ) : null}
        </div>
      )}

      {touristSeries.length > 0 && (
        <GlassPanel className="p-5">
          <SectionHeader kicker={t('touristKicker')} title={t('touristTitle')} sub={t('touristSub')} />
          <TouristSplit event={eventSeries} tourist={touristSeries} shareDuring={v.tourist_share_during} />
        </GlassPanel>
      )}

      <div id="sec-audience" className="grid lg:grid-cols-2 gap-4 scroll-mt-24">
        <GlassPanel className="p-5">
          <SectionHeader kicker={t('originKicker')} title={t('originTitle')} sub={t('originCoverage', { count: tgsNumber(v.home_origin_coverage, locale) })} />
          {v.home_origin_top_zones.length ? (
            <BarRow items={v.home_origin_top_zones.map((z) => ({ label: tgsZone(z.zone, locale), value: z.visitors }))} highlight={(l) => highlightedZones.includes(l)} />
          ) : <Empty note={t('noOrigins')} />}
        </GlassPanel>
        <GlassPanel className="p-5">
          <SectionHeader kicker={t('crossKicker')} title={t('crossTitle')} sub={isTgs ? t('crossSub') : cc.crossVisitNote} />
          <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{t('byArea')}</div>
          <BarRow items={v.cross_visit_zones.slice(0, 8).map((z) => ({ label: tgsZone(z.zone, locale), value: z.devices }))} highlight={(l) => highlightedZones.includes(l)} color={TEAL_LT} />
          <div className="mt-4 mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--mn-faint)]">{t('byVenueType')}</div>
          <BarRow items={v.cross_visit_poi_groups.slice(0, 7).map((g) => ({ label: tgsGroup(g.group, locale), value: g.visits }))} color={TEAL_LT} />
        </GlassPanel>
      </div>
      {reference?.caveats?.length ? (
        <p className="text-[11px] text-[var(--mn-faint)]">{t('panelCaveat')}</p>
      ) : null}
    </div>
  )
}
