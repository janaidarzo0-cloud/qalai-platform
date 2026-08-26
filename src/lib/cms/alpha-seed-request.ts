export const ALPHA_SEED_CONFIRMATION = 'IMPORT_CLOSED_ALPHA_DRAFTS'

type AlphaSeedRequestGate = {
  confirmation: unknown
  origin: string | null
  secFetchSite: string | null
  siteURL: string
}

export const isAllowedAlphaSeedRequest = ({
  confirmation,
  origin,
  secFetchSite,
  siteURL,
}: AlphaSeedRequestGate) => {
  let siteOrigin: string
  try {
    siteOrigin = new URL(siteURL).origin
  } catch {
    return false
  }

  return (
    confirmation === ALPHA_SEED_CONFIRMATION &&
    origin === siteOrigin &&
    secFetchSite === 'same-origin'
  )
}
