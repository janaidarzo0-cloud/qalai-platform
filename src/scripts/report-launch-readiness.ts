import { demoScenarios } from '@/content/demo-scenarios'
import { assessPublicLaunchReadiness } from '@/lib/launch/readiness'
import { calculatorDefinitions } from '@/modules/calculators/registry'

const strict = process.argv.includes('--strict')
const readiness = assessPublicLaunchReadiness({
  calculators: calculatorDefinitions,
  scenarios: demoScenarios,
})

console.log(`QALAI public launch: ${readiness.ready ? 'READY' : 'BLOCKED'}`)
console.log('')
console.log('Launch cohort:')
for (const candidate of readiness.candidates) {
  const marker = candidate.ready ? '[ready]' : '[blocked]'
  const tier = candidate.tier === 'core' ? 'core' : 'supporting'
  const blockers = candidate.blockers.length > 0 ? ` — ${candidate.blockers.join(', ')}` : ''
  console.log(`${marker} ${candidate.label} (${tier}, demand ${candidate.demandScore})${blockers}`)
}

console.log('')
console.log(
  readiness.configurationBlockers.length > 0
    ? `Configuration blockers: ${readiness.configurationBlockers.join(', ')}`
    : 'Configuration blockers: none',
)

process.exit(strict && !readiness.ready ? 1 : 0)
