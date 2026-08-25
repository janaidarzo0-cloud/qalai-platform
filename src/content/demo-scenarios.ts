import type { ScenarioViewModel } from '@/lib/cms/types'

/**
 * UX fixture only. It is deliberately unverified, noindex and never seeded as published content.
 */
export const demoScenarios: ScenarioViewModel[] = [
  {
    category: 'Мемлекет',
    cost: 'Ресми дереккөз тексерілгеннен кейін көрсетіледі.',
    documents: [
      { name: 'Қажетті құжаттардың расталған тізімі осы блокта болады.' },
      { name: 'Әр құжатқа жағдайға байланысты түсіндірме қосылады.' },
    ],
    faq: [
      {
        answer: 'QALAI редакторы ресми дереккөздерді тексергеннен кейін нақты жауап жарияланады.',
        question: 'Бұл ақпаратты қазір пайдалануға бола ма?',
      },
    ],
    officialLinks: [],
    processingTime: 'Ресми мерзім тексерілгеннен кейін көрсетіледі.',
    requirements: ['Сценарийге қатысты талаптар ресми дереккөзден толтырылады.'],
    seo: {
      description: 'QALAI сценарий бетінің тек дизайн және құрылым үлгісі.',
      noIndex: true,
      title: 'ЖК қалай ашуға болады? — QALAI демо',
    },
    shortAnswer:
      'Бұл — сценарий бетінің UX-үлгісі. Нақты нұсқаулық ресми дереккөздер тексерілгеннен кейін ғана жарияланады.',
    slug: 'zheke-kasipkerlik-ashu-demo',
    sources: [],
    status: 'draft',
    steps: [
      {
        description: 'QALAI пайдаланушының жағдайын қысқа сұрақтар арқылы анықтайды.',
        title: 'Жағдайыңызды анықтаңыз',
      },
      {
        description: 'Редактор тексерген құжаттар мен әрекеттер ретімен көрсетіледі.',
        title: 'Қадамдар мен құжаттарды қараңыз',
      },
      {
        description: 'Соңғы қадамда тек ресми қызметке апаратын сілтеме беріледі.',
        title: 'Ресми қызметке өтіңіз',
      },
    ],
    title: 'ЖК қалай ашуға болады?',
    verification: {
      status: 'unverified',
    },
    whoIsItFor: 'Қазақстанда жеке кәсіпкерлік ашуды жоспарлап жүрген адамға арналған бет үлгісі.',
  },
]
