import { useMemo, useState } from 'react'
import type { SocialVenue, TgsSocialPost } from '../lib/types'
import { tgsCopy, tgsDate, tgsNumber, tgsText, type Locale } from '../lib/tgsI18n'

const isCapcom = (post: TgsSocialPost) => post.relevance === 'CAPCOM-linked TGS'
const isNamedEvent = (post: TgsSocialPost) => post.relevance === 'named event'
const isVenueLinked = (post: TgsSocialPost) => post.relevance === 'venue-linked drone show'
const canceledDays = (social: SocialVenue) => social.cancelled_days ?? (social.cancelled_day ? [social.cancelled_day] : [])

function DailyAlignment({ social, selectedDay, onDay, locale, odaiba }: {
  social: SocialVenue
  selectedDay: string
  onDay: (day: string) => void
  locale: Locale
  odaiba: boolean
}) {
  const t = (key: keyof typeof tgsCopy.en) => tgsText(locale, key)
  const days = Object.entries(social.daily).sort(([a], [b]) => a.localeCompare(b))
  const maxPosts = Math.max(1, ...days.map(([, d]) => d.posts))
  const maxFootfall = Math.max(1, ...days.map(([, d]) => d.footfall ?? 0))
  const accent = (values: SocialVenue['daily'][string]) =>
    odaiba ? (values.named_event_posts ?? 0) : (values.capcom_posts ?? 0)
  const canceled = canceledDays(social)
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--mn-mist)]">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--mn-teal)]" /> {odaiba ? t('odaibaAllPosts') : t('allTgs')}</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--mn-volt)]" /> {odaiba ? t('odaibaNamed') : t('capcomLinked')}</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--mn-mist)]" /> {social.footfall_label === 'Legacy campus-box devices' ? t('campusLegend') : t('eventLegend')}</span>
      </div>
      <div className="space-y-1.5">
        {days.map(([day, values]) => {
          const dayCanceled = canceled.includes(day)
          const partial = day === social.partial_footfall_day
          return (
            <button key={day} type="button" onClick={() => onDay(selectedDay === day ? '' : day)}
              aria-pressed={selectedDay === day}
              className={`grid w-full grid-cols-[62px_minmax(0,1fr)_52px] items-center gap-2 rounded-[var(--mn-radius-sm)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--mn-card)] ${selectedDay === day ? 'bg-[var(--mn-callout-bg)] ring-1 ring-[var(--mn-teal)]' : ''}`}>
              <span className="font-mono text-[11px] text-[var(--mn-body)]">{tgsDate(day, locale)}</span>
              <span className="flex flex-col gap-1">
                <span className="relative block h-2 rounded-sm bg-[var(--mn-wire)]" title={`${values.posts} posts; ${accent(values)} accent`}>
                  <span className="absolute inset-y-0 left-0 rounded-sm bg-[var(--mn-teal)]" style={{ width: `${100 * values.posts / maxPosts}%` }} />
                  <span className="absolute inset-y-0 left-0 rounded-sm bg-[var(--mn-volt)]" style={{ width: `${100 * accent(values) / maxPosts}%` }} />
                </span>
                <span className="block h-1.5 rounded-sm bg-[var(--mn-wire)]" title={values.footfall == null ? t('noMovement') : `${tgsNumber(values.footfall, locale)} ${t('movementDevices')}`}>
                  {values.footfall != null && <span className="block h-full rounded-sm bg-[var(--mn-mist)]" style={{ width: `${100 * values.footfall / maxFootfall}%` }} />}
                </span>
              </span>
              <span className="text-right font-mono text-[10px] text-[var(--mn-mist)]" aria-label={`${tgsNumber(values.posts, locale)} posts; ${values.footfall == null ? t('noMovement') : `${tgsNumber(values.footfall, locale)} ${t('movementDevices')}`}`}>
                {tgsNumber(values.posts, locale)}{locale === 'ja' ? '件' : 'p'}<br />{values.footfall == null ? '—' : `${tgsNumber(values.footfall, locale)}${locale === 'ja' ? '台' : 'v'}${partial ? '*' : ''}`}
              </span>
              {dayCanceled && <span className="col-span-3 text-[10px] text-[var(--mn-volt)]">{odaiba ? t('odaibaCanceledNotice') : t('canceledNotice')}</span>}
              {partial && <span className="col-span-3 text-[10px] text-[var(--mn-mist)]">{t('partialNotice')}</span>}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-[var(--mn-faint)]">
        {t('separateScales')}
      </p>
    </div>
  )
}

function PostCard({ post, locale, odaiba }: { post: TgsSocialPost; locale: Locale; odaiba: boolean }) {
  const t = (key: keyof typeof tgsCopy.en, values?: Record<string, string | number>) => tgsText(locale, key, values)
  const accent = odaiba ? isNamedEvent(post) : isCapcom(post)
  const time = post.posted_at_jst?.slice(11, 16)
  const canceled = odaiba ? (post.date === '2026-09-20' || post.date === '2026-09-21') : post.date === '2026-09-21'
  return (
    <article className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
        <span className="font-mono uppercase tracking-[0.1em] text-[var(--mn-teal)]">{post.platform}</span>
        <span className="text-[var(--mn-faint)]">·</span>
        <span className="min-w-0 truncate text-[var(--mn-body)]">{post.author}</span>
        <span className="ml-auto font-mono text-[var(--mn-mist)]">{tgsDate(post.date, locale)}{time ? ` · ${time} JST` : ` · ${t('sourceDay')}`}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] uppercase tracking-[0.08em]">
        {accent && <span className="rounded bg-[var(--mn-callout-bg)] px-1.5 py-0.5 text-[var(--mn-volt)]">{odaiba ? t('odaibaNamed') : t('capcomLinked')}</span>}
        {odaiba && isVenueLinked(post) && <span className="rounded bg-[var(--mn-card)] px-1.5 py-0.5 text-[var(--mn-teal)]">{t('odaibaVenueLinkedFilter')}</span>}
        {!odaiba && post.venue_mention && <span className="rounded bg-[var(--mn-card)] px-1.5 py-0.5 text-[var(--mn-teal)]">{t('makuhariMentioned')}</span>}
        {post.fuji_tv_mentioned && <span className="rounded bg-[var(--mn-card)] px-1.5 py-0.5 text-[var(--mn-heading)]">{t('odaibaFujiFilter')}</span>}
        {post.hall_mention && <span className="rounded bg-[var(--mn-card)] px-1.5 py-0.5 text-[var(--mn-body)]">{post.hall_mention}</span>}
        {canceled && <span className="rounded bg-[var(--mn-wire)] px-1.5 py-0.5 text-[var(--mn-volt)]">{t('onlineCanceled')}</span>}
      </div>
      <p lang={post.language === 'und' ? undefined : post.language} className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-relaxed text-[var(--mn-body)] line-clamp-5">{post.caption || t('noCaption')}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--mn-wire)] pt-2 text-[10px] text-[var(--mn-mist)]">
        <span>{tgsNumber(post.engagement, locale)} {t('engagement')}{post.plays != null ? ` · ${tgsNumber(post.plays, locale)} ${t('plays')}` : ''}</span>
        <a href={post.source_url} target="_blank" rel="noopener noreferrer"
          className="font-semibold text-[var(--mn-teal)] underline decoration-[var(--mn-wire)] underline-offset-2 hover:text-[var(--mn-teal-hover)]">
          {t('openOriginal', { platform: post.platform })}
        </a>
      </div>
    </article>
  )
}

type Phase = 'all' | 'lead' | 'show' | 'canceled' | 'after'
const phaseMatches = (date: string, phase: Phase, odaiba: boolean): boolean => {
  if (phase === 'all') return true
  if (odaiba) {
    return (phase === 'lead' && date <= '2026-09-17')
      || (phase === 'show' && (date === '2026-09-18' || date === '2026-09-19' || date === '2026-09-22'))
      || (phase === 'canceled' && (date === '2026-09-20' || date === '2026-09-21'))
      || (phase === 'after' && date >= '2026-09-23')
  }
  return (phase === 'lead' && date <= '2026-09-16')
    || (phase === 'show' && date >= '2026-09-17' && date <= '2026-09-20')
    || (phase === 'canceled' && date === '2026-09-21')
    || (phase === 'after' && date >= '2026-09-22')
}

export function TgsSocialExplorer({ social, locale }: { social: SocialVenue; locale: Locale }) {
  const odaiba = social.kind === 'odaiba'
  const t = (key: keyof typeof tgsCopy.en, values?: Record<string, string | number>) => tgsText(locale, key, values)
  const [selectedDay, setSelectedDay] = useState('')
  const [phase, setPhase] = useState<Phase>('all')
  const [platform, setPlatform] = useState('all')
  const [scope, setScope] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'engagement'>('newest')
  const [visible, setVisible] = useState(40)
  const posts = social.feed_posts ?? []
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    const matches = posts.filter((post) =>
      (!selectedDay || post.date === selectedDay) && phaseMatches(post.date, phase, odaiba) &&
      (platform === 'all' || post.platform === platform) &&
      (scope === 'all'
        || (scope === 'capcom' && isCapcom(post))
        || (scope === 'venue' && post.venue_mention)
        || (scope === 'capcom_venue' && isCapcom(post) && post.venue_mention)
        || (scope === 'named' && isNamedEvent(post))
        || (scope === 'venue_linked' && isVenueLinked(post))
        || (scope === 'fuji' && post.fuji_tv_mentioned)) &&
      (!q || `${post.author} ${post.caption}`.toLocaleLowerCase().includes(q)))
    return sort === 'engagement' ? [...matches].sort((a, b) => b.engagement - a.engagement) : matches
  }, [posts, selectedDay, phase, platform, scope, query, sort, odaiba])
  const changeDay = (day: string) => { setSelectedDay(day); setPhase('all'); setVisible(40) }
  const phaseButtons = odaiba
    ? ([['all', 'phaseAll'], ['lead', 'odaibaPhaseLead'], ['show', 'odaibaPhaseShow'], ['canceled', 'odaibaPhaseCanceled'], ['after', 'odaibaPhaseAfter']] as const)
    : ([['all', 'phaseAll'], ['lead', 'phaseLead'], ['show', 'phaseShow'], ['canceled', 'phaseCanceled'], ['after', 'phaseAfter']] as const)
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
        <DailyAlignment social={social} selectedDay={selectedDay} onDay={changeDay} locale={locale} odaiba={odaiba} />
        <div className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-abyss)] p-4">
          <div className="grid grid-cols-2 gap-3">
            <div><div className="font-display text-xl text-[var(--mn-heading)]">{tgsNumber(social.posts, locale)}</div><div className="text-[11px] text-[var(--mn-mist)]">{odaiba ? t('odaibaSocialPosts') : t('socialPosts')}</div></div>
            <div><div className="font-display text-xl text-[var(--mn-volt)]">{tgsNumber(odaiba ? (social.named_event_posts ?? 0) : (social.capcom_posts ?? 0), locale)}</div><div className="text-[11px] text-[var(--mn-mist)]">{odaiba ? t('odaibaNamedEvent') : t('capcomLinked')}</div></div>
            <div><div className="font-display text-xl text-[var(--mn-teal)]">{tgsNumber(odaiba ? (social.venue_linked_posts ?? 0) : (social.venue_mentions ?? 0), locale)}</div><div className="text-[11px] text-[var(--mn-mist)]">{odaiba ? t('odaibaVenueLinked') : t('mentionMakuhari')}</div></div>
            <div><div className="font-display text-xl text-[var(--mn-heading)]">{tgsNumber(odaiba ? (social.fuji_tv_mentions ?? 0) : (social.capcom_venue_mentions ?? 0), locale)}</div><div className="text-[11px] text-[var(--mn-mist)]">{odaiba ? t('odaibaFujiMentions') : t('capcomMakuhari')}</div></div>
          </div>
          <p className="mt-4 border-t border-[var(--mn-wire)] pt-3 text-[11px] leading-relaxed text-[var(--mn-mist)]">{t('mobilityLimit')} {t('sourceLimit')}</p>
        </div>
      </div>

      <div className="border-t border-[var(--mn-wire)] pt-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-[16px] text-[var(--mn-heading)]">{t('explorePosts')}</h3>
          <span className="font-mono text-[11px] text-[var(--mn-mist)]">{tgsNumber(filtered.length, locale)} {t('matching')} · {tgsNumber(posts.length, locale)} {t('total')}</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label={locale === 'ja' ? '期間で絞り込み' : 'Filter by event phase'}>
          {phaseButtons.map(([value, key]) => (
            <button key={value} type="button" onClick={() => { setPhase(value); setSelectedDay(''); setVisible(40) }} aria-pressed={phase === value}
              className={`rounded-[var(--mn-radius-btn)] border px-2.5 py-1.5 text-[11px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)] ${phase === value ? 'border-[var(--mn-teal)] bg-[var(--mn-callout-bg)] text-[var(--mn-heading)]' : 'border-[var(--mn-wire)] text-[var(--mn-mist)] hover:text-[var(--mn-heading)]'}`}>
              {t(key)}
            </button>
          ))}
        </div>
        <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_140px_160px_150px]">
          <input value={query} onChange={(e) => { setQuery(e.target.value); setVisible(40) }} aria-label={t('search')}
            placeholder={t('search')} className="min-w-0 rounded-[var(--mn-radius-btn)] border border-[var(--mn-border)] bg-[var(--mn-abyss)] px-3 py-2 text-[12px] text-[var(--mn-heading)] placeholder:text-[var(--mn-faint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]" />
          <select value={platform} onChange={(e) => { setPlatform(e.target.value); setVisible(40) }} aria-label={t('platformFilter')}
            className="rounded-[var(--mn-radius-btn)] border border-[var(--mn-border)] bg-[var(--mn-abyss)] px-2 py-2 text-[12px] text-[var(--mn-body)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">
            <option value="all">{t('allPlatforms')}</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option>
          </select>
          <select value={scope} onChange={(e) => { setScope(e.target.value); setVisible(40) }} aria-label={t('relevanceFilter')}
            className="rounded-[var(--mn-radius-btn)] border border-[var(--mn-border)] bg-[var(--mn-abyss)] px-2 py-2 text-[12px] text-[var(--mn-body)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">
            {odaiba ? <>
              <option value="all">{t('odaibaAllPosts')}</option>
              <option value="named">{t('odaibaNamed')}</option>
              <option value="venue_linked">{t('odaibaVenueLinkedFilter')}</option>
              <option value="fuji">{t('odaibaFujiFilter')}</option>
            </> : <>
              <option value="all">{t('allTgs')}</option>
              <option value="capcom">{t('capcomLinked')}</option>
              <option value="venue">{t('makuhariMentioned')}</option>
              <option value="capcom_venue">{t('capcomAndMakuhari')}</option>
            </>}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'engagement')} aria-label={t('sortPosts')}
            className="rounded-[var(--mn-radius-btn)] border border-[var(--mn-border)] bg-[var(--mn-abyss)] px-2 py-2 text-[12px] text-[var(--mn-body)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">
            <option value="newest">{t('newest')}</option><option value="engagement">{t('mostEngagement')}</option>
          </select>
        </div>
        {selectedDay && <button type="button" onClick={() => changeDay('')} className="mb-3 text-[11px] text-[var(--mn-teal)] underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">{t('clearDay', { date: tgsDate(selectedDay, locale) })}</button>}
        {selectedDay && social.daily[selectedDay] && (
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 rounded-[var(--mn-radius)] border border-[var(--mn-wire)] bg-[var(--mn-card)] px-3 py-2 text-[11px] text-[var(--mn-body)]">
            <strong className="text-[var(--mn-heading)]">{t('daySignal', { date: tgsDate(selectedDay, locale) })}</strong>
            {odaiba ? <>
              <span>{tgsNumber(social.daily[selectedDay].named_event_posts ?? 0, locale)} {t('odaibaNamedEvent')}</span>
              <span>{tgsNumber(social.daily[selectedDay].venue_linked_posts ?? 0, locale)} {t('odaibaVenueLinked')}</span>
              <span>{tgsNumber(social.daily[selectedDay].fuji_tv_mentions ?? 0, locale)} {t('odaibaFujiMentions')}</span>
            </> : <>
              <span>{tgsNumber(social.daily[selectedDay].capcom_posts ?? 0, locale)} {t('capcomPosts')}</span>
              <span>{tgsNumber(social.daily[selectedDay].venue_mentions ?? 0, locale)} {t('makuhariMentions')}</span>
              <span>{tgsNumber(social.daily[selectedDay].capcom_venue_mentions ?? 0, locale)} {t('capcomAndMakuhari')}</span>
            </>}
            <span>{social.daily[selectedDay].footfall == null ? t('noMovement') : `${tgsNumber(social.daily[selectedDay].footfall, locale)} ${social.footfall_label === 'Legacy campus-box devices' ? t('campusLegend') : t('eventLegend')}`}</span>
          </div>
        )}
        <div className="max-h-[760px] space-y-2 overflow-y-auto pr-1" aria-label={t('scrollPosts')}>
          {filtered.slice(0, visible).map((post) => <PostCard key={`${post.platform}:${post.post_id}`} post={post} locale={locale} odaiba={odaiba} />)}
          {!filtered.length && <p className="rounded-[var(--mn-radius)] border border-[var(--mn-wire)] p-5 text-center text-[12px] text-[var(--mn-mist)]">{t('noMatches')}</p>}
          {filtered.length > visible && <button type="button" onClick={() => setVisible((n) => n + 40)}
            className="w-full rounded-[var(--mn-radius-btn)] border border-[var(--mn-border)] px-3 py-2 text-[12px] text-[var(--mn-teal)] hover:bg-[var(--mn-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mn-volt)]">
            {t('loadMore')}
          </button>}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--mn-faint)]">{odaiba ? t('odaibaSourceNote') : t('sourceNote')}</p>
      </div>
    </div>
  )
}
