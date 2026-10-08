export type Locale = 'en' | 'ja'

export const tgsCopy = {
  en: {
    language: 'Language', japanMobility: 'Japan Mobility', dataQuality: 'Data quality',
    title: 'CAPCOM × Tokyo Game Show', eventLabel: 'Tokyo Game Show 2026 · Makuhari Messe · Sep 17–20 (Sep 21 venue day canceled)',
    framing: 'Explore how CAPCOM coverage, explicit Makuhari mentions, and aggregate movement changed around TGS. Post activity describes publishing, while the mobility panel describes devices in the venue area.',
    jump: 'Explore {count} linked social posts ↓', socialPosts: 'Linked TGS posts', capcomPosts: 'CAPCOM-linked posts', capcomMakuhari: 'CAPCOM + Makuhari mentions',
    campusDevices: 'Legacy campus-box devices', eventHallVisitors: 'Event-footprint visitors', footprint: 'footprint',
    legacyLift: 'Legacy period lift', duringBaseline: 'During vs baseline', legacyLiftSub: 'Includes canceled 21 Sep; refresh needed',
    normalizedDetected: 'normalized · detected', normalizedNoise: 'normalized · within noise floor', dailyVisitorLift: 'daily-visitor lift',
    medianDwell: 'Median dwell', inboundShare: 'Inbound-tourist share', ofDuring: 'of during visitors', newVenue: 'New-to-venue', ofDuringWindow: 'of during-window visitors',
    legacyWarning: 'This mobility export uses a broad campus box and its lift still includes the canceled 21 Sep in-person day. Read the daily pattern as context; a refreshed event-footprint analysis is needed for attribution.',
    keyFindings: 'What the data supports', locationSignal: 'Explicit location signal', locationFinding: '{count} of {total} CAPCOM-linked posts ({share}%) also mention Makuhari. A text mention does not verify a visit or a booth.',
    peakSignal: 'Publishing and movement diverge', peakFinding: 'The corpus peaks on Sep 20 with {posts} posts, while the campus-box movement series is below Sep 19 ({current} vs {previous} devices).',
    cancelSignal: 'Canceled day is a counterexample', cancelFinding: '{posts} posts ({share}% of the corpus) were published on Sep 21 despite the in-person cancellation. Publication date cannot stand in for attendance date.',
    footfallKicker: 'Movement · before / during / after', footfallTitle: 'How did venue-area movement change?', eventHalls: 'Event halls', wholeCampus: 'Whole campus',
    legacyChart: 'Daily counts are from the legacy campus-box export. Sep 21 was canceled; Sep 23 is incomplete through 08:59 JST. The legacy lift uses its original window.',
    phaseAverage: 'Phase daily average', before: 'before', during: 'during', after: 'after', campusLift: 'campus-box lift', eventLift: 'event-footprint lift',
    audienceKicker: 'Audience composition', newReturning: 'New vs returning', returning: 'returning', duringWindow: 'during window',
    hallKicker: 'Where in the venue', hallTitle: 'Hall-level footprint', hallSub: 'Share of devices by hall during the event window.',
    normKicker: 'Lift vs noise floor', normTitle: 'Normalized attribution', normSub: 'Share of a comparable-venue panel, with a control-derived minimum detectable effect.',
    touristKicker: 'Inbound tourists vs domestic', touristTitle: 'Airport-origin cohort', touristSub: 'Tourists first stopped at an international airport and had no Japan home anchor. Carrier nationality is not used.',
    originKicker: 'Where visitors come from', originTitle: 'Home-origin catchment', originCoverage: 'Home anchors resolved for {count} visitors.', noOrigins: 'No resolved home origins',
    crossKicker: 'Where else the audience goes', crossTitle: 'Cross-visitation', crossSub: 'Other areas and venue types visited by the aggregate audience; this does not identify social authors.', byArea: 'By area', byVenueType: 'By venue type',
    socialKicker: 'What people posted', socialTitle: 'TGS social × movement explorer', socialSub: 'Compare publication, CAPCOM, and location mentions with aggregate movement by day; open each source post below.',
    socialFallbackTitle: 'Social engagement vs footfall', socialFallbackSub: 'Daily engagement aligned with movement. Directional only.',
    missingSocial: 'Social feed is unavailable. Regenerate it with scripts/jp_tgs_media_import.py.', panelCaveat: 'Panel estimates (Factori SDK), not a census; compare patterns rather than absolute counts.',
    eventWindow: 'event window', publicHoliday: 'public holiday', rainDay: 'rain day', noDailySeries: 'No daily series.',
    allTgs: 'All TGS posts', capcomLinked: 'CAPCOM-linked', campusLegend: 'Legacy campus-box devices', eventLegend: 'Event-footprint visitors', movementDevices: 'movement devices',
    canceledNotice: 'In-person day canceled; online posts continued', partialNotice: '* Movement day incomplete; ends at 08:59 JST',
    separateScales: 'Post and device bars use separate scales. Select a day to filter posts. Publishing can lag a visit; YouTube source days lack a timezone.',
    mentionMakuhari: 'mention Makuhari', sourceLimit: 'Caption matches are location clues, not geotags or proof of attendance. The query-driven corpus is not a census of all posts.',
    mobilityLimit: 'The movement feed is aggregate. It cannot link a post or author to a trip or hall.',
    explorePosts: 'Explore the posts', matching: 'matching', total: 'total', search: 'Search author or caption', platformFilter: 'Filter platform', relevanceFilter: 'Filter relevance', sortPosts: 'Sort posts',
    phaseAll: 'All dates', phaseLead: 'Lead-up · 14–16', phaseShow: 'In person · 17–20', phaseCanceled: 'Canceled · 21', phaseAfter: 'Aftermath · 22–24',
    allPlatforms: 'All platforms', makuhariMentioned: 'Makuhari mentioned', capcomAndMakuhari: 'CAPCOM + Makuhari', newest: 'Newest first', mostEngagement: 'Most engagement',
    clearDay: 'Clear {date} filter', daySignal: '{date} signal', makuhariMentions: 'Makuhari mentions', noMovement: 'No movement coverage',
    scrollPosts: 'Scrollable social posts', noMatches: 'No posts match these filters.', loadMore: 'Load 40 more posts',
    sourceDay: 'source day', onlineCanceled: 'online / canceled day', noCaption: 'No caption provided.', engagement: 'engagement', plays: 'plays', openOriginal: 'Open original {platform} post ↗',
    sourceNote: 'JP_TGS relevant-media CSV, Sep 14–24 2026. CAPCOM-linked is a keyword screen; a CAPCOM booth may not appear. Captions remain in their original languages. YouTube publication days have no source timezone.',
    noEvent: 'Run the event build and export to load jp_event_readout.json.',
  },
  ja: {
    language: '表示言語', japanMobility: '日本モビリティ', dataQuality: 'データ品質',
    title: 'CAPCOM × 東京ゲームショウ', eventLabel: '東京ゲームショウ2026 · 幕張メッセ · 9月17〜20日（21日の現地開催は中止）',
    framing: 'TGS前後のCAPCOM関連投稿、幕張への明示的な言及、会場周辺の集計移動データを比較します。投稿数は発信動向、移動データはエリア内の端末数を表します。',
    jump: '投稿リンク{count}件を見る ↓', socialPosts: 'TGS関連投稿', capcomPosts: 'CAPCOM関連投稿', capcomMakuhari: 'CAPCOM＋幕張の言及',
    campusDevices: '旧・会場周辺エリアの端末数', eventHallVisitors: '会場範囲の来訪端末数', footprint: '対象範囲',
    legacyLift: '旧集計期間の増加率', duringBaseline: '開催期と基準期の比較', legacyLiftSub: '中止の9月21日を含む・再集計が必要',
    normalizedDetected: '正規化済み・検出', normalizedNoise: '正規化済み・ノイズ範囲内', dailyVisitorLift: '日次来訪数の増加率',
    medianDwell: '滞在時間の中央値', inboundShare: '訪日旅行者の割合', ofDuring: '開催期の来訪者に占める割合', newVenue: '会場初訪問', ofDuringWindow: '開催期の来訪者に占める割合',
    legacyWarning: '現在の移動データは広い会場周辺エリアを対象とし、増加率には現地開催が中止された9月21日も含まれます。日次推移は参考情報です。寄与分析には会場範囲を絞った再集計が必要です。',
    keyFindings: 'データから読み取れること', locationSignal: '明示的な位置の手がかり', locationFinding: 'CAPCOM関連投稿{total}件のうち{count}件（{share}%）が幕張にも言及しています。文章中の地名だけでは来場やブース訪問を確認できません。',
    peakSignal: '投稿数と移動数の違い', peakFinding: '投稿数は9月20日に{posts}件で最多。一方、会場周辺の端末数は19日より少なく、{current}対{previous}でした。',
    cancelSignal: '中止日が示す違い', cancelFinding: '現地開催が中止された9月21日にも{posts}件（全投稿の{share}%）の投稿がありました。投稿日を来場日として扱うことはできません。',
    footfallKicker: '移動 · 開催前／開催中／開催後', footfallTitle: '会場周辺の移動はどう変化したか', eventHalls: '展示ホール', wholeCampus: '会場周辺全体',
    legacyChart: '日次端末数は旧・広域エリアの集計です。9月21日は現地開催中止、23日は日本時間08:59までの不完全な日です。上の旧増加率は元の集計期間に基づきます。',
    phaseAverage: '期間別の1日平均', before: '開催前', during: '開催中', after: '開催後', campusLift: '広域エリアの増加率', eventLift: '会場範囲の増加率',
    audienceKicker: '来訪者の構成', newReturning: '初訪問と再訪問', returning: '再訪問', duringWindow: '開催期間',
    hallKicker: '会場内の位置', hallTitle: 'ホール別の分布', hallSub: '開催期間中のホール別端末割合。',
    normKicker: '増加率とノイズ水準', normTitle: '正規化した寄与分析', normSub: '類似会場の比較群に占める割合と、比較群から推定した最小検出可能効果。',
    touristKicker: '訪日旅行者と国内来訪者', touristTitle: '空港を起点とする来訪者', touristSub: '最初の滞在先が国際空港で、日本国内の居住地推定がない端末。通信事業者の国籍情報は使用しません。',
    originKicker: '来訪者の出発地', originTitle: '居住地の分布', originCoverage: '{count}人の居住地を推定。', noOrigins: '居住地を推定できません',
    crossKicker: '他に訪れた場所', crossTitle: '併訪先', crossSub: '集計対象者が訪れた他のエリア・施設分類です。投稿者個人を特定するものではありません。', byArea: 'エリア別', byVenueType: '施設分類別',
    socialKicker: '投稿内容', socialTitle: 'TGS投稿 × 移動データ', socialSub: '日別の投稿数、CAPCOM関連投稿、地名への言及と集計移動データを比較し、元投稿を確認できます。',
    socialFallbackTitle: '投稿反応と来訪数', socialFallbackSub: '日別の反応数と移動データの参考比較。',
    missingSocial: '投稿データがありません。scripts/jp_tgs_media_import.py で再生成してください。', panelCaveat: 'Factori SDKのパネル推計であり、全数調査ではありません。絶対数より傾向を比較してください。',
    eventWindow: '開催期間', publicHoliday: '祝日', rainDay: '雨の日', noDailySeries: '日次データがありません。',
    allTgs: 'TGS関連の全投稿', capcomLinked: 'CAPCOM関連', campusLegend: '旧・会場周辺エリアの端末数', eventLegend: '会場範囲の来訪端末数', movementDevices: '移動端末数',
    canceledNotice: '現地開催は中止・オンライン投稿は継続', partialNotice: '※ 移動データは日本時間08:59までの不完全な日',
    separateScales: '投稿数と端末数の棒は別々の目盛りです。日付を選ぶと投稿を絞り込めます。投稿は来訪後に行われる場合があり、YouTubeの日付にはタイムゾーン情報がありません。',
    mentionMakuhari: '幕張に言及', sourceLimit: '文章中の地名は位置の手がかりであり、位置タグや来場の証明ではありません。検索で収集した投稿は全投稿の集計ではありません。',
    mobilityLimit: '移動データは集計値です。投稿・投稿者と個別の移動やホールを結び付けることはできません。',
    explorePosts: '投稿を探す', matching: '件一致', total: '総件数', search: '投稿者・本文を検索', platformFilter: 'プラットフォームで絞り込み', relevanceFilter: '関連性で絞り込み', sortPosts: '投稿の並べ替え',
    phaseAll: '全期間', phaseLead: '開催前 · 14〜16日', phaseShow: '現地開催 · 17〜20日', phaseCanceled: '中止日 · 21日', phaseAfter: '開催後 · 22〜24日',
    allPlatforms: 'すべての媒体', makuhariMentioned: '幕張に言及', capcomAndMakuhari: 'CAPCOM＋幕張', newest: '新しい順', mostEngagement: '反応が多い順',
    clearDay: '{date}の絞り込みを解除', daySignal: '{date}の指標', makuhariMentions: '幕張への言及', noMovement: '移動データなし',
    scrollPosts: 'スクロールできる投稿一覧', noMatches: '条件に合う投稿がありません。', loadMore: 'さらに40件を表示',
    sourceDay: '元データの日付', onlineCanceled: 'オンライン／中止日', noCaption: '本文はありません。', engagement: '反応', plays: '再生', openOriginal: '元の{platform}投稿を開く ↗',
    sourceNote: 'JP_TGS関連投稿CSV（2026年9月14〜24日）。CAPCOM関連はキーワード判定で、実際のCAPCOMブースを示すとは限りません。投稿本文は原文のまま表示します。YouTubeの日付には元データのタイムゾーン情報がありません。',
    noEvent: 'jp_event_readout.json を読み込むにはイベント集計を実行してください。',
  },
} as const

export const tgsText = (locale: Locale, key: keyof typeof tgsCopy.en, values?: Record<string, string | number>): string => {
  let result: string = tgsCopy[locale][key]
  for (const [name, value] of Object.entries(values ?? {})) result = result.replace(`{${name}}`, String(value))
  return result
}

const ZONES_JA: Record<string, string> = {
  'Makuhari / Chiba': '幕張／千葉', 'Asakusa': '浅草', 'Tokyo Disney Resort / Maihama': '東京ディズニーリゾート／舞浜',
  'Ikebukuro': '池袋', 'Omiya / Saitama': '大宮／埼玉', 'Tachikawa': '立川', 'Narita Airport': '成田空港',
  'Haneda Airport': '羽田空港', 'Shibuya': '渋谷', 'Kawasaki': '川崎', 'Yokohama Minato Mirai': '横浜みなとみらい',
  'Shinjuku': '新宿', 'Shinagawa': '品川', 'Marunouchi / Tokyo Station': '丸の内／東京駅', 'Akihabara': '秋葉原',
}

const GROUPS_JA: Record<string, string> = {
  'Services & Business': 'サービス・ビジネス', 'Food & Drink': '飲食', 'Shopping': '買い物',
  'Sports & Recreation': 'スポーツ・レジャー', 'Health Care': '医療', 'Transport & Travel': '交通・旅行',
  'Lifestyle Services': '生活サービス',
}

export const tgsZone = (value: string, locale: Locale): string => locale === 'ja' ? ZONES_JA[value] ?? value : value
export const tgsGroup = (value: string, locale: Locale): string => locale === 'ja' ? GROUPS_JA[value] ?? value : value
export const tgsNumber = (value: number, locale: Locale): string => new Intl.NumberFormat(locale === 'ja' ? 'ja-JP' : 'en-US').format(value)
export const tgsDate = (day: string, locale: Locale): string => new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
  month: 'short', day: 'numeric', timeZone: 'Asia/Tokyo',
}).format(new Date(`${day}T12:00:00+09:00`))
