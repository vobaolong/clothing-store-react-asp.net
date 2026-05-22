export function adminSearchNeedle(raw: string): string {
  return raw.trim().toLowerCase()
}

export function adminRowMatches(
  needle: string,
  ...values: Array<string | number | null | undefined>
): boolean {
  if (!needle) return true
  return values.some((v) =>
    String(v ?? '')
      .toLowerCase()
      .includes(needle),
  )
}
