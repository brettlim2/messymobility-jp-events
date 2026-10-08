export const fmtInt = (n: number | null | undefined): string =>
  n == null ? '—' : Math.round(n).toLocaleString('en-US')

// share in 0..1 -> "x.x%"
export const fmtPct = (n: number | null | undefined, dp = 1): string =>
  n == null ? '—' : `${(n * 100).toFixed(dp)}%`

// value already a percentage (0..100)
export const fmtPct100 = (n: number | null | undefined, dp = 1): string =>
  n == null ? '—' : `${n.toFixed(dp)}%`

export const fmtFloat = (n: number | null | undefined, dp = 1): string =>
  n == null ? '—' : n.toFixed(dp)

export const fmtLift = (n: number | null | undefined): string =>
  n == null ? '—' : `${n.toFixed(2)}×`

// "2026-09-19" -> "Sep 19"
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fmtDateShort = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  return `${MONTHS[+m[2] - 1]} ${+m[3]}`
}
