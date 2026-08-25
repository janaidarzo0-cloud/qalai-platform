export type ScenarioPublicationCandidate = {
  officialLinks?: unknown[] | null
  sourceReferences?: unknown[] | null
  steps?: unknown[] | null
  verification?: { status?: string | null } | null
}

export const assertScenarioCanPublish = (candidate: ScenarioPublicationCandidate) => {
  if (!Array.isArray(candidate.sourceReferences) || candidate.sourceReferences.length === 0) {
    throw new Error('Жариялау үшін кемінде бір ресми дереккөз керек.')
  }

  if (candidate.verification?.status !== 'verified') {
    throw new Error('Жариялау алдында фактологиялық статус «Тексерілді» болуы керек.')
  }

  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) {
    throw new Error('Жариялау үшін кемінде бір әрекет қадамы керек.')
  }

  if (!Array.isArray(candidate.officialLinks) || candidate.officialLinks.length === 0) {
    throw new Error('Жариялау үшін ресми әрекет сілтемесі керек.')
  }
}

export type RuleSetPublicationCandidate = {
  effectiveFrom?: unknown
  parameters?: unknown
  sourceReferences?: unknown[] | null
  verification?: { status?: string | null } | null
}

export const assertRuleSetCanPublish = (candidate: RuleSetPublicationCandidate) => {
  if (!Array.isArray(candidate.sourceReferences) || candidate.sourceReferences.length === 0) {
    throw new Error('Ереже жинағын жариялау үшін ресми дереккөз керек.')
  }

  if (candidate.verification?.status !== 'verified') {
    throw new Error('Ереже жинағын жариялау алдында «Тексерілді» статусы керек.')
  }

  if (typeof candidate.effectiveFrom !== 'string' || !candidate.effectiveFrom) {
    throw new Error('Ереже жинағының қолданыс басталатын күні керек.')
  }

  if (
    candidate.parameters == null ||
    typeof candidate.parameters !== 'object' ||
    Array.isArray(candidate.parameters)
  ) {
    throw new Error('Ереже параметрлері JSON object болуы керек.')
  }
}
