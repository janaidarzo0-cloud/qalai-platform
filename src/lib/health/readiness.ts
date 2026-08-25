export type ReadinessResult = {
  body: {
    service: 'qalai-platform'
    status: 'ok' | 'unavailable'
  }
  status: 200 | 503
}

export const checkReadiness = async (probe: () => Promise<unknown>): Promise<ReadinessResult> => {
  try {
    await probe()

    return {
      body: { service: 'qalai-platform', status: 'ok' },
      status: 200,
    }
  } catch {
    return {
      body: { service: 'qalai-platform', status: 'unavailable' },
      status: 503,
    }
  }
}
