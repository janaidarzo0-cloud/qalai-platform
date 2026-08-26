import type { ScenarioViewModel } from '@/lib/cms/types'

import { alphaScenarioViewModels } from './alpha-view-models'

/**
 * UX fixture only. It is deliberately unverified, noindex and never seeded as published content.
 */
export const demoScenarios: ScenarioViewModel[] = [
  {
    calculatorRuleSetCurrent: true,
    category: 'Мемлекет',
    cost: 'Ресми дереккөз тексерілгеннен кейін көрсетіледі.',
    costAsOf: undefined,
    documents: [
      { name: 'Қажетті құжаттардың расталған тізімі осы блокта болады.', optional: false },
      { name: 'Әр құжатқа жағдайға байланысты түсіндірме қосылады.', optional: true },
    ],
    eligibility: [
      {
        condition: 'Бұл бөлім қызметтің сізге сәйкес келетінін түсіндіреді.',
        explanation: 'Нақты шарттар ресми дереккөздер тексерілгеннен кейін толтырылады.',
      },
    ],
    factsCheckedAt: undefined,
    faq: [
      {
        answer: 'QALAI редакторы ресми дереккөздерді тексергеннен кейін нақты жауап жарияланады.',
        question: 'Бұл ақпаратты қазір пайдалануға бола ма?',
      },
    ],
    officialLinks: [],
    processingTime: 'Ресми мерзім тексерілгеннен кейін көрсетіледі.',
    processingTimeExplanation: undefined,
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
      reviewerConfirmed: false,
      status: 'unverified',
    },
    whoIsItFor: 'Қазақстанда жеке кәсіпкерлік ашуды жоспарлап жүрген адамға арналған бет үлгісі.',
  },
  {
    calculatorRuleSetCurrent: true,
    category: 'Мемлекет',
    cost: 'Тегін',
    costAsOf: '2026-08-26T00:00:00.000Z',
    documents: [
      {
        name: 'Қазақстанда берілген фотосуреті бар жарамды жеке куәлік немесе мемлекеттік дерекқордағы ҚР азаматының паспорты',
        optional: false,
      },
    ],
    eligibility: [
      {
        condition: 'ЭЦҚ-ны өз атыңыздан аласыз',
        explanation:
          '2025 жылғы 28 маусымнан бастап сенімхат арқылы алу мүмкін емес; иесі биометриялық сәйкестендіруден өзі өтеді.',
      },
      {
        condition: 'Телефон, камера және компьютер қолжетімді',
        explanation:
          'SMS қабылдайтын телефон, веб-камерасы бар компьютер немесе камерасы бар телефон және NCALayer қажет.',
      },
    ],
    factsCheckedAt: '2026-08-26T00:00:00.000Z',
    faq: [
      {
        answer:
          'Бес әрекеттен кейін биометрия өтпесе, компьютерден өтінім беріп, жеке басыңызды растау үшін ХҚКО-ның өзіне-өзі қызмет көрсету секторына жеке барыңыз.',
        question: 'Биометриялық тексеруден өте алмасам не істеймін?',
      },
      {
        answer:
          'Жоқ. Кілт пен парольді ешкімге бермеңіз. Ортақ компьютер қолдансаңыз, кілтті өз тасымалдағышыңызға көшіріп, компьютерден өшіріңіз.',
        question: 'ЭЦҚ кілтін бухгалтерге немесе басқа адамға беруге бола ма?',
      },
    ],
    officialLinks: [
      {
        label: 'ЭЦҚ алуға өтінім беру',
        publisher: 'Қазақстан Республикасының Ұлттық куәландырушы орталығы',
        url: 'https://nca.pki.gov.kz/service/pkiorder/precreate.xhtml?certtemplateAlias=digital_id_fl_ng&lang=kk',
      },
      {
        label: 'NCALayer орнату',
        publisher: 'Қазақстан Республикасының Ұлттық куәландырушы орталығы',
        url: 'https://ncl.pki.gov.kz/',
      },
    ],
    processingTime: 'Онлайн; құжат модерацияға жіберілсе — 1 жұмыс күніне дейін',
    processingTimeExplanation:
      'Қашықтан сәйкестендіру сәтсіз болып, құжат растауға жіберілген жағдайда оператор тексеруі бір жұмыс күні ішінде жүргізіледі. Қалыпты онлайн өтінімге бұл мерзімді қолданбаймыз.',
    requirements: [
      'SMS қабылдайтын белсенді телефон нөмірі',
      'Веб-камерасы бар компьютер немесе камерасы бар телефон',
      'Ресми сайттан орнатылған NCALayer',
      'Кілтті сақтайтын жеке қорғалған орын және есте қалатын сенімді пароль',
    ],
    seo: {
      description:
        'Қазақстанда ЭЦҚ немесе ЭЦП кілтін онлайн алу: не қажет, NCALayer орнату, биометрия және ресми өтінім.',
      noIndex: true,
      title: 'ЭЦҚ-ны онлайн қалай алуға болады? — QALAI',
    },
    shortAnswer:
      'Жарамды құжатты, SMS қабылдайтын телефонды және камераны дайындаңыз, NCALayer орнатып, НУЦ-тың ресми сайтында биометрия арқылы өтінім беріңіз.',
    slug: 'etsq-alu',
    sources: [
      {
        checkedAt: '2026-08-26T00:00:00.000Z',
        isPrimary: true,
        publisher: 'Қазақстан Республикасының электрондық үкіметі',
        title: 'ЭЦҚ-ны қашықтан алу',
        trustTier: 'official-provider',
        url: 'https://egov.kz/cms/kk/services/reservation_for_busunesses/pass_onlineecp',
      },
      {
        checkedAt: '2026-08-26T00:00:00.000Z',
        isPrimary: true,
        publisher: 'Қазақстан Республикасының Ұлттық куәландырушы орталығы',
        title: 'Жеке тұлғалар үшін қашықтан сәйкестендіру',
        trustTier: 'official-provider',
        url: 'https://pki.gov.kz/ru/poluchenie-flud/',
      },
      {
        checkedAt: '2026-08-26T00:00:00.000Z',
        isPrimary: true,
        publisher: 'Қазақстан Республикасының Ұлттық куәландырушы орталығы',
        title: 'NCALayer ресми жүктеу беті',
        trustTier: 'official-provider',
        url: 'https://ncl.pki.gov.kz/',
      },
      {
        checkedAt: '2026-08-26T00:00:00.000Z',
        isPrimary: true,
        publisher: 'Қазақстан Республикасының Ұлттық куәландырушы орталығы',
        title: 'ЭЦҚ-ны жеке алу және қауіпсіз сақтау туралы ескерту',
        trustTier: 'primary-official',
        url: 'https://pki.gov.kz/ru/2025/08/28/%D1%83%D0%B2%D0%B0%D0%B6%D0%B0%D0%B5%D0%BC%D1%8B%D0%B5-%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D0%B8-5/',
      },
    ],
    status: 'draft',
    steps: [
      {
        description:
          'Жарамды жеке куәлік не паспорт, SMS қабылдайтын телефон және камера дайындаңыз. Өтінімді тек өз атыңыздан беріңіз.',
        title: 'Қажеттілерді дайындаңыз',
      },
      {
        actionLabel: 'NCALayer ресми бетін ашу',
        actionUrl: 'https://ncl.pki.gov.kz/',
        description:
          'Операциялық жүйеңізге арналған NCALayer нұсқасын тек Ұлттық куәландырушы орталықтың сайтынан жүктеп, іске қосыңыз.',
        title: 'NCALayer орнатыңыз',
      },
      {
        actionLabel: 'Ресми өтінімге өту',
        actionUrl:
          'https://nca.pki.gov.kz/service/pkiorder/precreate.xhtml?certtemplateAlias=digital_id_fl_ng&lang=kk',
        description:
          'ЖСН мен экрандағы кодты енгізіп, дербес деректерді өңдеу шарттарын оқыңыз. Содан кейін SMS және биометриялық сәйкестендіру қадамдарын өзіңіз өтіңіз.',
        title: 'Онлайн өтінім беріңіз',
      },
      {
        description:
          'Биометрия бес әрекеттен кейін өтпесе, компьютерден берілген өтініммен ХҚКО-ның өзіне-өзі қызмет көрсету секторына жеке барыңыз.',
        title: 'Биометрия өтпесе, ХҚКО-да жеке растаңыз',
      },
      {
        description:
          'Кілтті жеке қорғалған жерде сақтаңыз, сенімді пароль қойыңыз және оны ешкімге бермеңіз. Ортақ компьютерден кілтті міндетті түрде өшіріңіз.',
        title: 'Кілтті қауіпсіз сақтаңыз',
      },
    ],
    title: 'ЭЦҚ-ны онлайн қалай алуға болады?',
    verification: {
      nextReviewAt: '2026-09-26T00:00:00.000Z',
      reviewerConfirmed: false,
      status: 'in-review',
    },
    whoIsItFor: 'Қазақстанда ЭЦҚ кілтін алғаш рет немесе қайта онлайн алғысы келетін жеке тұлғаға.',
  },
  ...alphaScenarioViewModels,
]
