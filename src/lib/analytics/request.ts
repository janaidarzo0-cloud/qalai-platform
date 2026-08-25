export const ANALYTICS_REQUEST_MAX_BYTES = 4_096

export const isTrustedAnalyticsOrigin = ({
  origin,
  requestOrigin,
  secFetchSite,
}: {
  origin: string | null
  requestOrigin: string
  secFetchSite: string | null
}) => {
  if (!origin || origin !== requestOrigin) return false
  return secFetchSite == null || secFetchSite === 'same-origin'
}

export const isAnalyticsRequestBodyTooLarge = (
  contentLength: string | null,
  actualLength?: number,
) => {
  const declaredLength = contentLength == null ? 0 : Number(contentLength)
  if (Number.isFinite(declaredLength) && declaredLength > ANALYTICS_REQUEST_MAX_BYTES) return true
  return actualLength != null && actualLength > ANALYTICS_REQUEST_MAX_BYTES
}
