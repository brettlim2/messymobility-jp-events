// JSON shapes emitted by the analytics engine (scripts/jp_*.py, analytics/jp_*.py)
// and the Phase-E exporter (scripts/export_jp_dashboards.py).

export interface ZoneCount { zone: string; visitors?: number; devices?: number; stops?: number; median_dwell_min?: number }
export interface GroupCount { group: string; visits: number; visitors?: number }

export interface Hall { state_id: string; name: string; kind: string; polygon: [number, number][]; devices: number; share: number }
export interface DayTag { dow: string; weekend: boolean; holiday?: string; weather?: { temp_mean_c?: number | null; temp_max_c?: number | null; rain_mm?: number; wet_hours?: number; station?: string } }
export interface Normalization {
  method: string
  panel_venues: string[]
  control_venues: string[]
  during_dates: string[]
  during_share_pct: number
  baseline_share_pct: number
  effect_pts: number
  relative_pct: number | null
  placebo_sd_pts: number
  placebo_n: number
  mde_pts: number
  mde_relative_pct: number | null
  detected: boolean
  dau_share_per_100k: { during: number; baseline: number; effect: number }
  share_series: Record<string, Record<string, number>>
  verdict: string
}

export interface EventVenue {
  venue: string
  event: string
  centroid?: { lng: number; lat: number }
  visitors: number
  visits: number
  median_dwell_min: number | null
  // tight event-footprint series (new schema); daily_visitors kept for old exports
  daily_counts?: Record<string, number>
  daily_counts_campus?: Record<string, number>
  daily_counts_tourist?: Record<string, number>
  daily_visitors?: { date: string; visitors: number }[]
  footprint?: string
  footprint_area_km2?: number
  campus_area_km2?: number
  window?: { before: string[]; during: string[]; after: string[] }
  halls?: Hall[]
  day_tags?: Record<string, DayTag>
  holiday_overlap_note?: string
  normalization?: Normalization | null
  phase_avg_daily: { before: number | null; during: number | null; after: number | null }
  phase_avg_daily_campus?: { before: number | null; during: number | null; after: number | null }
  during_vs_before_lift: number | null
  during_vs_before_lift_campus?: number | null
  during_vs_before_lift_tourist?: number | null
  tourist_share_during?: number | null
  during_visitors: number
  first_time_at_venue: number
  returning: number
  first_time_share: number | null
  home_origin_coverage: number
  home_origin_top_zones: { zone: string; visitors: number }[]
  cross_visit_zones: { zone: string; devices: number }[]
  cross_visit_poi_groups: { group: string; visits: number }[]
  cross_visit_poi_categories: { category: string; visits: number }[]
}
export type EventReadout = Record<string, EventVenue>

export interface RetailVenue {
  daily_footfall: { date: string; visitors: number; sessions: number }[]
  mission_mix: { mission: string; sessions: number }[]
  zone_footfall: { zone: string; visitors: number; stops: number }[]
  zone_transitions: { from: string; to: string; n: number }[]
  poi_category_transitions: { from: string; to: string; n: number }[]
}
export type RetailPaths = Record<string, RetailVenue>

export interface Tourism {
  inbound_cohort: number
  cohort_definition: string
  arrivals_per_airport: { airport: string; arrivals: number }[]
  first_destination_zones: { zone: string; devices: number }[]
  all_destination_zones: { zone: string; visitors: number; stops: number; median_dwell_min: number }[]
  airport_to_destination: { airport: string; zone: string; visitors: number }[]
  shopping_poi_groups: GroupCount[]
  nationality: {
    carrier_coverage: number
    class_counts: Record<string, number>
    foreign_by_nationality: { nationality: string; devices: number }[]
    top_foreign_carriers: { carrier: string; devices: number }[]
    note: string
  }
}

export interface ODArc { from: [number, number]; to: [number, number]; airport: string; zone: string; visitors: number }
export interface ODArcs { arcs: ODArc[]; airports: { id: string; name: string; lng: number; lat: number }[] }

export interface Reference {
  window: { first: string; last: string; days: number }
  panel: { devices_sample?: number; stops_sample?: number; note?: string }
  weighting?: { national_weighted_pop?: number; top_prefectures?: { pref_jis: string; name: string; weighted_pop: number; devices: number }[] }
  age_profile?: { pref_jis: string; name: string; youth_pct: number; working_pct: number; elderly_pct: number }[]
  caveats: string[]
}

export interface VenueRow {
  mall_id: string
  name?: string
  footfall_trend?: unknown
  visitor_profile?: Record<string, unknown>
  audience?: Record<string, unknown>
  missions?: { grab_share?: number; browse_share?: number; day_out_share?: number }
}
export type Venues = Record<string, VenueRow>

export interface SocialPost {
  post_id: string; date: string; platform: string; voice: string; post_type: string
  engagement: number; source_url?: string; caption?: string
}
export interface TgsSocialPost {
  post_id: string
  date: string
  posted_at_jst: string | null
  date_precision: string
  platform: string
  author: string
  language: string
  phase: string
  relevance: string
  venue_mention: boolean
  hall_mention: string | null
  engagement: number
  likes: number
  comments: number
  shares: number
  plays: number | null
  source_url: string
  caption: string
}
export interface SocialVenue {
  posts: number
  engagement: number
  daily: Record<string, { posts: number; capcom_posts?: number; venue_mentions?: number; capcom_venue_mentions?: number; engagement: number; footfall: number | null }>
  by_voice?: Record<string, { posts: number; engagement: number }>
  by_post_type?: Record<string, { posts: number; engagement: number }>
  top_posts?: SocialPost[]
  footfall_corr?: { pearson_r: number | null; n_days: number; note: string }
  capcom_posts?: number
  venue_mentions?: number
  capcom_venue_mentions?: number
  platforms?: Record<string, number>
  feed_posts?: TgsSocialPost[]
  source_note?: string
  mobility_note?: string
  footfall_label?: string
  cancelled_day?: string
  partial_footfall_day?: string | null
}
export type Social = Record<string, SocialVenue>

export interface JpData {
  event: EventReadout | null
  retail: RetailPaths | null
  tourism: Tourism | null
  odArcs: ODArcs | null
  reference: Reference | null
  venues: Venues | null
  social: Social | null
}
