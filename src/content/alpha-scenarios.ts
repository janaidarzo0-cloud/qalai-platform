/**
 * Editorial source pack for the closed alpha.
 *
 * These records are research-complete drafts, not public content. The alpha seed keeps every
 * Scenario unverified and noindex. A reviewer must independently confirm the facts and a native
 * Kazakh-language editor must approve the copy before Payload's publish gate can be satisfied.
 */

export type AlphaSource = {
  documentNumber?: string
  key: string
  language: 'kk' | 'ru'
  publisher: string
  sourceType: 'government' | 'legal-act' | 'official-provider' | 'reference'
  title: string
  trustTier: 'official-provider' | 'primary-official'
  url: string
  validFrom?: string
  validUntil?: string
}

export type AlphaEvidenceClaim = {
  disposition: 'excluded' | 'included'
  evidence: string
  id: string
  sourceKeys: string[]
  statement: string
}

export type AlphaScenarioDraft = {
  category: {
    description: string
    order: number
    slug: string
    title: string
  }
  cost: {
    asOf?: string
    explanation: string
    kind: 'calculated' | 'fixed' | 'free' | 'range' | 'varies'
  }
  documents: Array<{ name: string; note?: string; optional?: boolean }>
  editorial: {
    conflicts: Array<{
      issue: string
      resolution: string
      sourceKeys: string[]
    }>
    publicationBlockers: string[]
    nextReviewAt: string
    researchCheckedAt: string
  }
  eligibility: Array<{ condition: string; explanation?: string }>
  evidence: {
    claims: AlphaEvidenceClaim[]
    primarySourceKeys: string[]
  }
  faq: Array<{ answer: string; question: string }>
  officialLinks: Array<{ label: string; publisher: string; url: string }>
  processingTime: { explanation?: string; value: string }
  requirements: string[]
  seo: { description: string; noIndex: true; title: string }
  shortAnswer: string
  slug: string
  steps: Array<{
    actionLabel?: string
    actionUrl?: string
    description: string
    title: string
  }>
  title: string
  whoIsItFor: string
}

const CHECKED_AT = '2026-08-25T00:00:00.000Z'
const AS_OF_2026 = '2026-01-01T00:00:00.000Z'
const START_OF_2026_KZ = '2025-12-31T19:00:00.000Z'
const END_OF_2026_KZ = '2026-12-31T19:00:00.000Z'
const NEXT_REVIEW_AT = '2026-09-25T00:00:00.000Z'

export const ALPHA_SOURCE_PACK_VERSION = '2026-08-25.identity-split-v2'

export const alphaSources: AlphaSource[] = [
  {
    documentNumber: 'Қазақстан Республикасы ІІМ 2024 жылғы 9 қыркүйектегі № 677 бұйрығы',
    key: 'residence-rules',
    language: 'ru',
    publisher: 'Қазақстан Республикасы Ішкі істер министрлігі',
    sourceType: 'legal-act',
    title: 'Халықты тұрғылықты жері бойынша тіркеу қағидалары',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/rus/docs/V2400035045',
  },
  {
    documentNumber: 'Қазақстан Республикасы ІІМ 2020 жылғы 30 наурыздағы № 267 бұйрығы',
    key: 'residence-service-rules',
    language: 'ru',
    publisher: 'Қазақстан Республикасы Ішкі істер министрлігі',
    sourceType: 'legal-act',
    title: 'Халықты құжаттандыру және тіркеу мемлекеттік қызметтерінің қағидалары',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/rus/docs/V2000020192',
  },
  {
    key: 'permanent-registration-service',
    language: 'ru',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'official-provider',
    title: 'Тұрғылықты жері бойынша тұрақты тіркеу',
    trustTier: 'official-provider',
    url: 'https://www.gov.kz/services/3038?lang=ru',
  },
  {
    key: 'temporary-registration-service',
    language: 'ru',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'official-provider',
    title: 'Тұрғылықты жері бойынша уақытша тіркеу',
    trustTier: 'official-provider',
    url: 'https://www.gov.kz/services/3888?lang=ru',
  },
  {
    key: 'identity-service',
    language: 'kk',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'official-provider',
    title: 'Қазақстан Республикасы азаматтарына жеке куәліктер беру',
    trustTier: 'official-provider',
    url: 'https://egov.kz/cms/kk/services/passport/pass003_mvd?mobile=no',
  },
  {
    key: 'identity-online-2026',
    language: 'ru',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'government',
    title: 'Жеке куәлікті онлайн ауыстыру жөніндегі 2026 жылғы нұсқаулық',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/situations/22/1556?lang=ru',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    key: 'identity-government-service',
    language: 'ru',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'official-provider',
    title: 'Қазақстан азаматтарына паспорттар мен жеке куәліктер беру',
    trustTier: 'official-provider',
    url: 'https://www.gov.kz/services/3087?lang=ru',
  },
  {
    key: 'identity-loss-guide',
    language: 'kk',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'government',
    title: 'Жеке куәлік ұрланған немесе жоғалған кездегі іс-әрекет',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/situations/22/162?lang=kk',
  },
  {
    key: 'identity-loss-legacy-article',
    language: 'kk',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'government',
    title: 'Жеке куәлікті жоғалтқан кездегі бұрынғы нұсқаулық',
    trustTier: 'primary-official',
    url: 'https://egov.kz/cms/kk/articles/vost_udv',
  },
  {
    documentNumber: 'Қазақстан Республикасы ІІМ 2023 жылғы 30 маусымдағы № 532 бұйрығы',
    key: 'identity-rules',
    language: 'ru',
    publisher: 'Қазақстан Республикасы Ішкі істер министрлігі',
    sourceType: 'legal-act',
    title: 'Қазақстан азаматтарына паспорттар мен жеке куәліктер беру қағидалары',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/rus/docs/V2300032971',
    validFrom: START_OF_2026_KZ,
  },
  {
    documentNumber: '№ 214-VIII ҚРЗ',
    key: 'tax-code-2026',
    language: 'ru',
    publisher: 'Қазақстан Республикасы',
    sourceType: 'legal-act',
    title: 'Қазақстан Республикасының Салық кодексі',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/rus/docs/K2500000214',
    validFrom: START_OF_2026_KZ,
  },
  {
    key: 'identity-fees-2026',
    language: 'ru',
    publisher: 'Қорғалжын ауданының әкімдігі',
    sourceType: 'government',
    title: '2026 жылғы жеке куәлік үшін мемлекеттік баж түсіндірмесі',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/memleket/entities/aqmola-korgaljin/press/article/details/243472',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    key: 'identity-multiple-loss-2026',
    language: 'ru',
    publisher: 'Шымкент қаласының Полиция департаменті',
    sourceType: 'government',
    title: 'Жеке куәлікті бір жыл ішінде бірнеше рет жоғалтқан кездегі баж',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/memleket/entities/mvd-shymkent/press/news/details/1151733?lang=ru',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    key: 'mci-2026',
    language: 'ru',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'government',
    title: '2026 жылғы айлық есептік көрсеткіш',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/article/17157?lang=ru',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    documentNumber: '№ 235-V ҚРЗ',
    key: 'administrative-code',
    language: 'ru',
    publisher: 'Қазақстан Республикасы',
    sourceType: 'legal-act',
    title: 'Қазақстан Республикасының Әкімшілік құқық бұзушылық туралы кодексі',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/rus/docs/K1400000235',
  },
  {
    documentNumber: '№ 73-V ҚРЗ',
    key: 'identity-documents-law',
    language: 'ru',
    publisher: 'Қазақстан Республикасы',
    sourceType: 'legal-act',
    title: 'Жеке басты куәландыратын құжаттар туралы заң',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/rus/docs/Z1300000073',
  },
  {
    documentNumber: '№ 224-VII ҚРЗ',
    key: 'social-code',
    language: 'kk',
    publisher: 'Қазақстан Республикасы',
    sourceType: 'legal-act',
    title: 'Қазақстан Республикасының Әлеуметтік кодексі',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/kaz/docs/K2300000224',
  },
  {
    documentNumber: '№ 239-VIII ҚРЗ',
    key: 'budget-2026',
    language: 'ru',
    publisher: 'Қазақстан Республикасы',
    sourceType: 'legal-act',
    title: '2026–2028 жылдарға арналған республикалық бюджет туралы заң',
    trustTier: 'primary-official',
    url: 'https://www.adilet.zan.kz/rus/docs/Z2500000239',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    key: 'child-allowances-egov',
    language: 'kk',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'government',
    title: 'Қазақстандағы жәрдемақылар мен әлеуметтік төлемдер',
    trustTier: 'primary-official',
    url: 'https://egov.kz/cms/kk/articles/disabled_persons/allowance',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    documentNumber:
      'Қазақстан Республикасы Еңбек министрінің 2023 жылғы 24 мамырдағы № 169 бұйрығы',
    key: 'child-allowance-rules',
    language: 'ru',
    publisher: 'Қазақстан Республикасы Еңбек және халықты әлеуметтік қорғау министрлігі',
    sourceType: 'legal-act',
    title: 'Балалы отбасыларға мемлекеттік жәрдемақы тағайындау және төлеу қағидалары',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/memleket/entities/enbek/documents/details/481310?lang=ru',
  },
  {
    key: 'child-care-payment-service',
    language: 'kk',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'official-provider',
    title: 'Бала күтіміне байланысты кірістен айырылу төлемі',
    trustTier: 'official-provider',
    url: 'https://www.gov.kz/services/3450?lang=kk',
  },
  {
    key: 'unemployment-registration-service',
    language: 'kk',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'official-provider',
    title: 'Жұмыссыздарды тіркеу',
    trustTier: 'official-provider',
    url: 'https://egov.kz/cms/kk/services/pass363_mtszn',
  },
  {
    key: 'unemployment-payment-2026',
    language: 'kk',
    publisher: 'Қазақстан Республикасы Еңбек және халықты әлеуметтік қорғау министрлігі',
    sourceType: 'government',
    title: 'Жұмысынан айырылу жағдайы бойынша әлеуметтік төлем туралы 2026 жылғы түсіндірме',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/memleket/entities/enbek/press/news/details/1170681',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    documentNumber: 'Қазақстан Республикасы Еңбек министрінің 2023 жылғы № 237 бұйрығы',
    key: 'unemployment-payment-rules',
    language: 'kk',
    publisher: 'Қазақстан Республикасы Еңбек және халықты әлеуметтік қорғау министрлігі',
    sourceType: 'legal-act',
    title: 'Жұмысынан айырылу жағдайы бойынша әлеуметтік төлем қағидалары',
    trustTier: 'primary-official',
    url: 'https://www.adilet.zan.kz/kaz/docs/V2300032881',
  },
  {
    documentNumber: '№ 375-V ҚРЗ',
    key: 'entrepreneurial-code',
    language: 'kk',
    publisher: 'Қазақстан Республикасы',
    sourceType: 'legal-act',
    title: 'Қазақстан Республикасының Кәсіпкерлік кодексі',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/kaz/docs/K1500000375',
  },
  {
    documentNumber: 'Қазақстан Республикасы Үкіметінің 2025 жылғы 21 қарашадағы № 994 қаулысы',
    key: 'self-employed-activities',
    language: 'kk',
    publisher: 'Қазақстан Республикасының Үкіметі',
    sourceType: 'legal-act',
    title: 'Өзін-өзі жұмыспен қамтығандарға рұқсат етілген қызмет түрлері',
    trustTier: 'primary-official',
    url: 'https://adilet.zan.kz/kaz/docs/P2500000994',
    validFrom: START_OF_2026_KZ,
  },
  {
    key: 'self-employed-kgd-2026',
    language: 'kk',
    publisher: 'Қазақстан Республикасы Қаржы министрлігінің Мемлекеттік кірістер комитеті',
    sourceType: 'government',
    title: 'Өзін-өзі жұмыспен қамтығандарға арналған 2026 жылғы арнаулы салық режимі',
    trustTier: 'primary-official',
    url: 'https://www.gov.kz/memleket/entities/kgd/press/news/details/1185260',
    validFrom: START_OF_2026_KZ,
    validUntil: END_OF_2026_KZ,
  },
  {
    key: 'ip-registration-egov',
    language: 'kk',
    publisher: 'Қазақстан Республикасының электрондық үкіметі',
    sourceType: 'official-provider',
    title: 'Жеке кәсіпкерді онлайн тіркеу',
    trustTier: 'official-provider',
    url: 'https://egov.kz/cms/kk/articles/ip-registration',
  },
]

export const retiredAlphaScenarioSlugs = ['zheke-kualikti-auystyru'] as const

export const alphaScenarioDrafts: AlphaScenarioDraft[] = [
  {
    category: {
      description: 'Тіркеу, құжаттар және мемлекеттік рәсімдер.',
      order: 10,
      slug: 'memleket',
      title: 'Мемлекет',
    },
    cost: {
      explanation: 'Тұрақты және уақытша тіркеу тегін.',
      kind: 'free',
    },
    documents: [
      {
        name: 'Жеке куәлік немесе цифрлық құжат',
        note: 'ХҚКО-ға барсаңыз, тіркелетін адам мен меншік иесі жеке басын растайды.',
      },
      {
        name: 'Меншік иесінің келісімі',
        note: 'Ортақ меншік болса, ортақ меншік иелерінің де келісімі қажет.',
      },
      {
        name: 'Тұрғын үйге құқықты растайтын дерек',
        note: 'Көп жағдайда мемлекеттік жүйе бұл деректі өзі алады.',
        optional: true,
      },
    ],
    editorial: {
      conflicts: [
        {
          issue:
            'Уақытша тіркеудің қазіргі қызмет беті онлайн/15 минут дейді, ал 2026 жылғы 17 шілдеден күшіндегі қағида ХҚКО/30 минут арнасын сипаттайды.',
          resolution:
            'Альфа мәтіні уақытша тіркеудің арнасы мен минуттық мерзімін бекітпейді; пайдаланушыны тірі ресми қызмет бетіне жібереді. Жариялау алдында 1414 немесе ІІМ-ден растау керек.',
          sourceKeys: ['residence-service-rules', 'temporary-registration-service'],
        },
      ],
      publicationBlockers: [
        'Қазақша мәтінді тәуелсіз редактор тексеруі керек.',
        'Уақытша тіркеудің қызмет көрсету арнасын ІІМ немесе 1414 растауы керек.',
        'Мобильді экранда және ресми сілтемелерде staging smoke-test өтуі керек.',
      ],
      nextReviewAt: NEXT_REVIEW_AT,
      researchCheckedAt: CHECKED_AT,
    },
    eligibility: [
      {
        condition: 'Тұрақты көшсеңіз — жаңа мекенжайға тұрақты тіркелесіз.',
        explanation: 'Жаңа тұрақты тіркеу бұрынғы мекенжайдағы тіркеуді автоматты түрде тоқтатады.',
      },
      {
        condition: 'Бір айдан ұзақ уақытша тұрсаңыз — уақытша тіркеу қажет.',
        explanation:
          'Келген күннен бастап 10 күн ішінде 1 айдан 1 жылға дейін тіркеледі; тұрақты тіркеу сақталады.',
      },
      {
        condition: 'Үй сіздікі болмаса, меншік иесінің келісімі керек.',
        explanation: 'Ортақ меншік болса, барлық тиісті меншік иелері өтінішті растайды.',
      },
    ],
    evidence: {
      claims: [
        {
          disposition: 'included',
          evidence:
            'Қағидалардың 3–5 және 13-тармақтары тұрақты/уақытша тіркеуді, 10 күндік міндетті және 1 ай–1 жыл мерзімін айқындайды.',
          id: 'RES-01',
          sourceKeys: ['residence-rules'],
          statement: 'Тұрақты және уақытша тіркеудің қолданылу жағдайлары мен мерзімі.',
        },
        {
          disposition: 'included',
          evidence:
            'Қызмет карточкасы тұрақты тіркеудің тегін екенін және порталдағы 15 минут/ХҚКО-дағы 30 минут мерзімін көрсетеді.',
          id: 'RES-02',
          sourceKeys: ['permanent-registration-service'],
          statement: 'Тұрақты тіркеудің құны, ресми арналары және қызмет мерзімі.',
        },
        {
          disposition: 'included',
          evidence: 'Қағидалар меншік иесінің және ортақ меншік иелерінің келісімін талап етеді.',
          id: 'RES-03',
          sourceKeys: ['residence-rules'],
          statement: 'Басқа адамның үйіне тіркелу үшін меншік иелерінің келісімі қажет.',
        },
        {
          disposition: 'excluded',
          evidence: 'Қызмет беті мен қолданыстағы қағида арна және мерзім бойынша қайшы.',
          id: 'RES-X1',
          sourceKeys: ['residence-service-rules', 'temporary-registration-service'],
          statement: 'Уақытша тіркеу міндетті түрде онлайн жасалады және 15 минут алады.',
        },
      ],
      primarySourceKeys: [
        'residence-rules',
        'residence-service-rules',
        'permanent-registration-service',
      ],
    },
    faq: [
      {
        answer: 'Жоқ. Уақытша тіркеу тұрақты тіркеуді тоқтатпайды.',
        question: 'Уақытша тіркелсем, тұрақты тіркеуім жойыла ма?',
      },
      {
        answer: 'Ортақ меншік болса, өтінішті тиісті ортақ меншік иелері де растауы керек.',
        question: 'Үйдің бірнеше иесі болса не болады?',
      },
    ],
    officialLinks: [
      {
        label: 'Тұрақты тіркеу қызметін ашу',
        publisher: 'gov.kz',
        url: 'https://www.gov.kz/services/3038?lang=kk',
      },
      {
        label: 'Уақытша тіркеу қызметін ашу',
        publisher: 'gov.kz',
        url: 'https://www.gov.kz/services/3888?lang=kk',
      },
    ],
    processingTime: {
      explanation:
        'Уақытша тіркеудің арнасы туралы ресми беттер қайшы болғандықтан, оның минуттық мерзімін QALAI көрсетпейді.',
      value: 'Тұрақты тіркеу: онлайн 15 минут, ХҚКО-да 30 минут',
    },
    requirements: [
      'Онлайн өтініш үшін мобильді азаматтар базасында тіркелген нөмір немесе ЭЦҚ дайындаңыз.',
      'Меншік иесі өтінішті белгіленген уақытта растауға дайын болуы керек.',
      'Астанада тұрғын алаңына байланысты бөлек шектеу болуы мүмкін — қызмет бетінде мекенжайды тексеріңіз.',
    ],
    seo: {
      description:
        'Қазақстанда тұрақты немесе уақытша мекенжайға тіркелу жолы, меншік иесінің келісімі және ресми қызметтер.',
      noIndex: true,
      title: 'Тұрғылықты жерге қалай тіркелуге болады? — QALAI',
    },
    shortAnswer:
      'Тұрақты көшсеңіз — жаңа мекенжайға тұрақты тіркеліңіз. Бір айдан ұзақ уақытша тұрсаңыз — келген күннен бастап 10 күн ішінде уақытша тіркеліңіз. Үй сіздікі болмаса, меншік иесінің келісімі қажет.',
    slug: 'turgylikty-zherge-tirkelu',
    steps: [
      {
        description:
          'Негізгі мекенжайыңыз өзгерсе — тұрақты, басқа жерде бір айдан ұзақ тұрсаңыз — уақытша тіркеуді таңдаңыз.',
        title: 'Тіркеу түрін анықтаңыз',
      },
      {
        description:
          'Үй өзіңіздікі болмаса, меншік иесімен алдын ала келісіңіз. Ортақ меншік болса, басқа меншік иелерінің де растауы қажет.',
        title: 'Меншік иесінің келісімін алыңыз',
      },
      {
        actionLabel: 'Тұрақты тіркеуге өту',
        actionUrl: 'https://www.gov.kz/services/3038?lang=kk',
        description:
          'Ресми қызмет бетін ашып, онлайн өтініш беріңіз немесе көрсетілген ХҚКО бағытын пайдаланыңыз.',
        title: 'Тұрақты тіркеуге өтініш беріңіз',
      },
      {
        actionLabel: 'Уақытша тіркеу бетін ашу',
        actionUrl: 'https://www.gov.kz/services/3888?lang=kk',
        description:
          'Қызмет арнасы өзгеріп жатқандықтан, дәл сол сәттегі өтініш беру тәсілін ресми беттен тексеріңіз.',
        title: 'Уақытша тіркеу керек болса, ресми арнаны тексеріңіз',
      },
    ],
    title: 'Тұрғылықты жерге қалай тіркелуге болады?',
    whoIsItFor:
      'Қазақстанда жаңа тұрақты мекенжайға көшкен немесе басқа мекенжайда бір айдан ұзақ уақытша тұратын адамға.',
  },
  {
    category: {
      description: 'Тіркеу, құжаттар және мемлекеттік рәсімдер.',
      order: 10,
      slug: 'memleket',
      title: 'Мемлекет',
    },
    cost: {
      asOf: AS_OF_2026,
      explanation:
        '2026 жылы мерзімі аяқталған жеке куәлікті қалыпты мерзімде ауыстыру тегін. Жедел дайындау — өңір мен санатқа қарай бөлек ақылы қызмет.',
      kind: 'free',
    },
    documents: [
      {
        name: 'Мерзімі аяқталатын немесе аяқталған жеке куәлік',
        note: 'ХҚКО-да құжаттың өзін немесе цифрлық нысанын көрсетіңіз.',
      },
      {
        name: 'Әкімшілік іс бойынша қаулы',
        note: 'Куәлік мерзімі 10 күннен бір айға дейін өтіп кетсе ғана қажет.',
        optional: true,
      },
      {
        name: 'Әкімшілік хаттама және айыппұл төленгені туралы түбіртек',
        note: 'Куәлік мерзімі бір айдан артық өтіп кетсе ғана қажет.',
        optional: true,
      },
    ],
    editorial: {
      conflicts: [
        {
          issue:
            '2026 жылғы мамырдағы онлайн нұсқаулық пен eGov қызмет карточкасында мерзімі аяқталған куәлікке 0,2 АЕК деген ескі ақпарат қалған, ал жаңа Салық кодексі мен кейінгі ресми түсіндірмелер бұл ауыстыруды тегін деп белгілейді.',
          resolution:
            'Альфа жаңа Салық кодексін, ІІМ хабарламасын және 2026 жылғы 10 тамыздағы gov.kz түсіндірмесін басым дереккөз ретінде қолданады; ескі соманы қоспайды.',
          sourceKeys: [
            'tax-code-2026',
            'identity-fees-2026',
            'identity-multiple-loss-2026',
            'identity-online-2026',
            'identity-service',
          ],
        },
        {
          issue:
            'Онлайн қызмет мерзім өткеннен кейінгі 10-күнді онлайн терезеге қосады, ал әкімшілік құжаттар тізімі 10 күннен басталады.',
          resolution:
            'Альфа ресми онлайн формуласын «10 күнтізбелік күннен аспаса» деп береді, бірақ дәл 10-күні әкімшілік мәселе болмайтынына кепіл бермейді және өтінішті соңғы күнге қалдырмауды ұсынады.',
          sourceKeys: [
            'identity-service',
            'identity-online-2026',
            'identity-rules',
            'administrative-code',
          ],
        },
      ],
      publicationBlockers: [
        'Қазақша мәтінді тәуелсіз редактор тексеруі керек.',
        'Онлайн CTA, фото жүктеу және ХҚКО-ға ауысу жолын мобильді staging-де тексеру керек.',
        'gov.kz кезек бетінің ішкі «Онлайн сұрау» сілтемесі 2026 жылғы 25 тамызда 404 қайтарды; жұмыс істейтін брондау жолын қайта тексеру керек.',
      ],
      nextReviewAt: NEXT_REVIEW_AT,
      researchCheckedAt: CHECKED_AT,
    },
    eligibility: [
      {
        condition: 'Онлайн өтінішті жеке куәлік иесі өзі береді.',
        explanation: 'Жеке куәлік Қазақстан азаматтарына 16 жастан беріледі.',
      },
      {
        condition: 'Онлайн ауыстыру тек белгіленген уақыт аралығында қолжетімді.',
        explanation:
          'Өтінішті мерзім аяқталуына 30 күн немесе одан аз қалғанда және мерзімі өткеніне 10 күнтізбелік күннен аспаса беруге болады.',
      },
      {
        condition: 'Онлайн жол үшін тұрақты тіркеу және өзгермеген жеке деректер керек.',
        explanation:
          'Тұрақты тіркеу болмаса, аты-жөніңіз немесе туған күніңіз өзгерсе не онлайн сәйкестендіруден өте алмасаңыз, ХҚКО-ға барыңыз.',
      },
    ],
    evidence: {
      claims: [
        {
          disposition: 'included',
          evidence:
            'eGov қызмет беті мен 2026 жылғы нұсқаулық −30/+10 күндік терезені, тұрақты тіркеуді, өзгермеген деректерді және биометриялық сәйкестендіруді көрсетеді.',
          id: 'ID-EXP-01',
          sourceKeys: ['identity-service', 'identity-online-2026'],
          statement:
            'Мерзімі аяқталған куәлікті онлайн ауыстырудың уақыт және сәйкестендіру шарттары.',
        },
        {
          disposition: 'included',
          evidence:
            'Қызмет қағидалары мен eGov карточкасы мерзімі өткен құжатты және кешігу ұзақтығына байланысты әкімшілік құжаттарды көрсетеді.',
          id: 'ID-EXP-02',
          sourceKeys: ['identity-service', 'identity-rules', 'administrative-code'],
          statement: 'ХҚКО-да мерзімінің аяқталуына байланысты сұралатын құжаттар.',
        },
        {
          disposition: 'included',
          evidence:
            '2026 жылдан күшіне енген Салық кодексі, ІІМ хабарламасы және 10 тамыздағы gov.kz түсіндірмесі мерзімі аяқталған куәлікті ауыстыру үшін баж алынбайтынын растайды.',
          id: 'ID-EXP-03',
          sourceKeys: ['tax-code-2026', 'identity-fees-2026', 'identity-multiple-loss-2026'],
          statement: '2026 жылы мерзімі аяқталған жеке куәлікті қалыпты ауыстыру тегін.',
        },
        {
          disposition: 'included',
          evidence:
            'eGov карточкасы мен 2026 жылғы онлайн нұсқаулық қалыпты дайындалу мерзімін 15 жұмыс күніне дейін деп көрсетеді.',
          id: 'ID-EXP-04',
          sourceKeys: ['identity-service', 'identity-online-2026'],
          statement: 'Қалыпты дайындалу мерзімі — 15 жұмыс күніне дейін.',
        },
        {
          disposition: 'included',
          evidence:
            'ІІМ қағидалары куәлікті оның қолданылу мерзімі аяқталуына бір ай қалғанда рәсімдеуге рұқсат береді.',
          id: 'ID-EXP-05',
          sourceKeys: ['identity-rules'],
          statement: 'ХҚКО арқылы ауыстыруды мерзім аяқталуына бір ай қалғанда бастауға болады.',
        },
        {
          disposition: 'included',
          evidence:
            'eGov қызмет карточкасы электрондық рәсімдеуде ХҚКО қызметкері фотоны халықаралық талаптарға сай тегін түсіретінін көрсетеді.',
          id: 'ID-EXP-06',
          sourceKeys: ['identity-service'],
          statement: 'Әдеттегі ХҚКО рәсімінде фотосурет сол жерде тегін түсіріледі.',
        },
        {
          disposition: 'excluded',
          evidence:
            '2026 жылғы 5 мамырдағы нұсқаулықтағы бұл сома жаңа Салық кодексіне және 10 тамыздағы кейінгі ресми түсіндірмеге қайшы келеді.',
          id: 'ID-EXP-X1',
          sourceKeys: [
            'identity-online-2026',
            'identity-service',
            'tax-code-2026',
            'identity-fees-2026',
            'identity-multiple-loss-2026',
          ],
          statement: 'Мерзімі аяқталған жеке куәлікті ауыстыру 0,2 АЕК тұрады.',
        },
        {
          disposition: 'excluded',
          evidence:
            'Онлайн терезе мен әкімшілік құжаттар ережесі дәл 10-күнде қабаттасады, сондықтан бұл күнге тәуекелсіз кепіл беруге болмайды.',
          id: 'ID-EXP-X2',
          sourceKeys: [
            'identity-service',
            'identity-online-2026',
            'identity-rules',
            'administrative-code',
          ],
          statement: 'Мерзім өткеннен кейінгі дәл 10-күні әкімшілік мәселе болмайды.',
        },
      ],
      primarySourceKeys: [
        'identity-rules',
        'tax-code-2026',
        'identity-service',
        'identity-online-2026',
        'identity-fees-2026',
        'identity-multiple-loss-2026',
        'administrative-code',
      ],
    },
    faq: [
      {
        answer:
          'Мерзім аяқталуына 30 күн қалғанда онлайн өтініш беруге болады. Қағидалар ХҚКО-да рәсімдеуді бір ай бұрын бастауға да мүмкіндік береді.',
        question: 'Куәлікті қанша уақыт бұрын ауыстыруға болады?',
      },
      {
        answer:
          'Жоқ. Мерзім өткеніне 10 күннен асса, ХҚКО-ға жүгініңіз. Кешігу мерзіміне қарай әкімшілік құжат сұралуы мүмкін.',
        question: 'Мерзім өткеніне 10 күннен асып кетті. Онлайн ауыстыра аламын ба?',
      },
      {
        answer:
          'Онлайн өтініште талапқа сай цифрлық фото мен қолтаңба үлгісін жүктейсіз. Әдеттегі ХҚКО рәсімінде фото сол жерде тегін түсіріледі.',
        question: 'Фото алып бару керек пе?',
      },
      {
        answer:
          'Жалпы тәртіпте 15 жұмыс күніне дейін. Өтінішті ресімдеу және дайын құжатты алу күні бұл мерзімге кірмейді. Ақылы жедел дайындау өңірге байланысты.',
        question: 'Жаңа куәлік қанша уақытта дайын болады?',
      },
    ],
    officialLinks: [
      {
        label: 'Мерзімі аяқталған куәлікті онлайн ауыстыру',
        publisher: 'eGov.kz',
        url: 'https://egov.kz/services/P40.06/',
      },
      {
        label: 'ХҚКО кезегі туралы ресми ақпарат',
        publisher: 'gov.kz',
        url: 'https://www.gov.kz/services/3134?lang=kk',
      },
    ],
    processingTime: {
      explanation:
        'Өтінішті ресімдеу және дайын құжатты алу күні мерзімге кірмейді. Жедел дайындау ақылы және өңірге байланысты.',
      value: 'Жалпы тәртіпте 15 жұмыс күніне дейін',
    },
    requirements: [
      'Онлайн ауыстыру үшін Қазақстанда тұрақты тіркеу болуы керек.',
      'Аты-жөніңіз немесе туған күніңіз өзгерсе, ХҚКО-ға жүгініңіз.',
      'Онлайн өтініш үшін биометриялық сәйкестендіруден өтіп, цифрлық фото мен қолтаңба үлгісін жүктеу керек.',
    ],
    seo: {
      description:
        'Жеке куәліктің мерзімі аяқталса не істеу керек: онлайн және ХҚКО жолы, құжаттар, мерзім және 2026 жылғы құны.',
      noIndex: true,
      title: 'Жеке куәліктің мерзімі аяқталды — QALAI',
    },
    shortAnswer:
      'Куәліктің мерзімі аяқталуына 30 күн немесе одан аз қалса не мерзімі өткеніне 10 күнтізбелік күннен аспаса, шарттарға сай болғанда eGov арқылы онлайн өтініш беріңіз. Шарттар орындалмаса, ХҚКО-ға барыңыз. 2026 жылы қалыпты ауыстыру тегін, дайындалуы 15 жұмыс күніне дейін.',
    slug: 'zheke-kualik-merzimi-ayaktaldy',
    steps: [
      {
        description:
          'Онлайн өтініш мерзім аяқталуына 30 күн немесе одан аз қалғанда және мерзімі өткеніне 10 күнтізбелік күннен аспаса ғана қолжетімді.',
        title: 'Куәліктің мерзімін тексеріңіз',
      },
      {
        actionLabel: 'Онлайн ауыстыру',
        actionUrl: 'https://egov.kz/services/P40.06/',
        description:
          'Сәйкестендіруден өтіп, өтінішті толтырыңыз, фото мен қолтаңба үлгісін жүктеп, дайын құжатты алатын пунктті таңдаңыз.',
        title: 'Шарттарға сай болсаңыз, онлайн өтініш беріңіз',
      },
      {
        actionLabel: 'ХҚКО кезегі туралы ресми ақпарат',
        actionUrl: 'https://www.gov.kz/services/3134?lang=kk',
        description:
          'Мерзім 10 күннен артық өтіп кетсе, жеке деректеріңіз өзгерсе немесе онлайн сәйкестендіруден өте алмасаңыз, ХҚКО-ға жүгініңіз. Сілтеме брондау туралы ресми ақпаратты ашады, бірақ оның ішкі онлайн өту жолы зерттеу күні жұмыс істемеді. Мерзімі өткен куәлікті немесе цифрлық нысанын алыңыз; 10 күннен бір айға дейін кешіксеңіз — қаулы, бір айдан асса — хаттама мен айыппұл түбіртегі сұралады.',
        title: 'Онлайн шарттар орындалмаса, ХҚКО-ға жүгініңіз',
      },
      {
        description:
          'SMS немесе жеке кабинеттегі хабарламадан кейін куәлікті өтініште көрсетілген пункттен алыңыз.',
        title: 'Дайын болғаны туралы хабарламаны күтіңіз',
      },
    ],
    title: 'Жеке куәліктің мерзімі аяқталды',
    whoIsItFor:
      'Жеке куәлігінің мерзімі аяқталатын немесе мерзімі өтіп кеткен 16 жасқа толған Қазақстан азаматына.',
  },
  {
    category: {
      description: 'Тіркеу, құжаттар және мемлекеттік рәсімдер.',
      order: 10,
      slug: 'memleket',
      title: 'Мемлекет',
    },
    cost: {
      asOf: AS_OF_2026,
      explanation:
        '2026 жылы бір жыл ішіндегі бірінші немесе екінші жоғалтуда куәлікті қайта шығару — 0,2 АЕК, яғни 865 ₸. Үшінші және кейінгі жоғалтуда — 1 АЕК, яғни 4 325 ₸. Жедел дайындау бөлек төленеді.',
      kind: 'varies',
    },
    documents: [
      {
        name: 'Жоғалу мән-жайы көрсетілген жазбаша өтініш',
        note: 'Куәлік жай жоғалған жағдайда қажет; қайда, қашан және қалай жоғалғанын жазыңыз.',
        optional: true,
      },
      {
        name: 'Полицияның талон-хабарламасы',
        note: 'Куәлік ұрланған жағдайда ғана қажет.',
        optional: true,
      },
      {
        name: 'Қолда бар жеке басты куәландыратын құжат немесе оның цифрлық нысаны',
        note: 'Бар болса апарыңыз немесе цифрлық құжаттар сервисі арқылы көрсетіңіз.',
        optional: true,
      },
      {
        name: 'Қазақстан азаматының паспорты',
        note: 'Бар болса апарыңыз.',
        optional: true,
      },
      {
        name: 'Мемлекеттік баж төленгені немесе жеңілдік туралы дерек',
        note: 'Жеңілдік дерегі жүйеде болмаса, оны растайтын құжат қажет болуы мүмкін.',
        optional: true,
      },
      {
        name: 'Әкімшілік іс бойынша қаулы',
        note: 'Куәліксіз жүргеніңізге 10 күннен бір айға дейін болса ғана сұралады.',
        optional: true,
      },
      {
        name: 'Әкімшілік хаттама және айыппұл төленгені туралы түбіртек',
        note: 'Куәліксіз жүргеніңізге бір айдан асса ғана сұралады.',
        optional: true,
      },
    ],
    editorial: {
      conflicts: [
        {
          issue:
            '2025 жылғы eGov мақаласында ескерту мерзімі 10 күннен 3 айға дейін, ал айыппұл 3 айдан кейін деп жазылған; қолданыстағы ӘҚБтК мен қызмет карточкалары шекті 1 ай деп көрсетеді.',
          resolution:
            'Альфа қолданыстағы ӘҚБтК-нің 492-бабын және қазіргі қызмет карточкаларын басым көреді: 10 күннен бір айға дейін ескерту, бір айдан асса 7 АЕК. Ескі 3 айлық шек пайдаланылмайды.',
          sourceKeys: [
            'identity-loss-legacy-article',
            'administrative-code',
            'identity-service',
            'identity-government-service',
          ],
        },
        {
          issue:
            '2025 жылғы eGov мақаласы ХҚКО-ны тұрақты тіркелген немесе нақты тұратын жермен шектейді, ал қазіргі қызмет беттері мен 2026 жылғы нұсқаулық кез келген ыңғайлы ХҚКО-ны көрсетеді.',
          resolution:
            'Альфа қазіргі қызмет карточкалары мен 2026 жылғы бағытты басым көреді және кез келген ыңғайлы ХҚКО-ға жүгінуді көрсетеді; ескі аумақтық шектеуді қоспайды.',
          sourceKeys: [
            'identity-loss-legacy-article',
            'identity-loss-guide',
            'identity-government-service',
            'identity-rules',
          ],
        },
      ],
      publicationBlockers: [
        'Қазақша мәтінді тәуелсіз редактор тексеруі керек.',
        'ХҚКО, баж төлеу және полиция тармақтарын мобильді staging-де тексеру керек.',
        'gov.kz кезек бетінің ішкі «Онлайн сұрау» сілтемесі 2026 жылғы 25 тамызда 404 қайтарды; жұмыс істейтін брондау жолын қайта тексеру керек.',
      ],
      nextReviewAt: NEXT_REVIEW_AT,
      researchCheckedAt: CHECKED_AT,
    },
    eligibility: [
      {
        condition: 'Жеке куәлігі жоғалған немесе ұрланған Қазақстан азаматына арналған.',
        explanation:
          'Әдетте өтініш иесі кез келген ыңғайлы ХҚКО-ға өзі жүгінеді. Кәмелетке толмаған адамның ата-анасы не заңды өкілі, сондай-ақ сот әрекетке қабілетсіз деп таныған адамның заңды өкілі өкілеттігін растайтын құжатпен жүгіне алады.',
      },
      {
        condition: 'Жоғалу мен ұрлану онлайн рәсімделмейді.',
        explanation: 'eGov-тағы онлайн ауыстыру тек куәліктің мерзімі аяқталған жағдайға арналған.',
      },
      {
        condition: 'Басқа құжат болмаса да, ХҚКО-ға жүгіну керек.',
        explanation:
          'Тұлғаны мемлекеттік деректерден растау немесе қосымша тексеру қажет болуы мүмкін; мұндай жағдайда қалыпты мерзімге кепіл берілмейді.',
      },
    ],
    evidence: {
      claims: [
        {
          disposition: 'included',
          evidence:
            'Ресми нұсқаулықтар жоғалу немесе ұрлану кезінде өтініштің кез келген ХҚКО-да жеке берілетінін көрсетеді.',
          id: 'ID-LOSS-01',
          sourceKeys: ['identity-loss-guide', 'identity-government-service', 'identity-rules'],
          statement: 'Жоғалған немесе ұрланған куәлік тек ХҚКО арқылы қайта шығарылады.',
        },
        {
          disposition: 'included',
          evidence:
            'Қызмет карточкасы жоғалғанда жазбаша өтінішті, ұрланғанда полицияның талон-хабарламасын және қолда бар басқа құжаттарды бөлек атайды.',
          id: 'ID-LOSS-02',
          sourceKeys: ['identity-service', 'identity-government-service', 'identity-rules'],
          statement: 'Жоғалу мен ұрлануға арналған құжаттар тізімі бірдей емес.',
        },
        {
          disposition: 'included',
          evidence:
            'Салық кодексі 0,2 және 1 АЕК ставкаларын белгілейді; ресми gov.kz түсіндірмелері мен 2026 жылғы 4 325 теңгелік АЕК оларды 865 және 4 325 теңге ретінде растайды.',
          id: 'ID-LOSS-03',
          sourceKeys: [
            'tax-code-2026',
            'identity-fees-2026',
            'identity-multiple-loss-2026',
            'mci-2026',
          ],
          statement:
            '2026 жылғы баж: бір жыл ішіндегі бірінші немесе екінші жоғалтуда 865 ₸, үшінші және кейінгі жағдайда 4 325 ₸.',
        },
        {
          disposition: 'included',
          evidence:
            'eGov қызмет карточкалары мен ІІМ қағидалары қаулыны не хаттама мен айыппұл түбіртегін құжаттар тізіміне қосады; ӘҚБтК 10 күннен бір айға дейін ескертуді, бір айдан асқанда 7 АЕК айыппұлды белгілейді.',
          id: 'ID-LOSS-07',
          sourceKeys: [
            'identity-service',
            'identity-government-service',
            'identity-rules',
            'administrative-code',
            'mci-2026',
          ],
          statement:
            '10 күннен бір айға дейін куәліксіз жүру ескертуге, бір айдан асу 7 АЕК айыппұлға әкелуі мүмкін; тиісті әкімшілік құжаттар сұралады.',
        },
        {
          disposition: 'included',
          evidence:
            'eGov пен мемлекеттік қызмет карточкасы қалыпты дайындалу мерзімін 15 жұмыс күніне дейін деп көрсетеді.',
          id: 'ID-LOSS-04',
          sourceKeys: ['identity-service', 'identity-government-service'],
          statement: 'Қалыпты дайындалу мерзімі — 15 жұмыс күніне дейін.',
        },
        {
          disposition: 'included',
          evidence:
            'Қағидалар басқа жеке құжат пен паспортты бар болғанда ұсынуды және тұлғаны мемлекеттік жүйелер арқылы растауды қарастырады, бірақ қосымша анықтау жағдайына жеке стандартты мерзім бермейді.',
          id: 'ID-LOSS-05',
          sourceKeys: ['identity-service', 'identity-government-service', 'identity-rules'],
          statement:
            'Басқа құжат мүлде болмаса да ХҚКО-ға жүгіну керек; қосымша тексеру мерзімін алдын ала кепілдеуге болмайды.',
        },
        {
          disposition: 'included',
          evidence:
            'Жеке басты куәландыратын құжаттар туралы заң жоғалған құжатты өтініш берілген күннен бастап жарамсыз деп таниды және табылған құжатты тапсыруды талап етеді.',
          id: 'ID-LOSS-06',
          sourceKeys: ['identity-documents-law'],
          statement: 'Жоғалғаны туралы өтініштен кейін табылған ескі куәлікті қолдануға болмайды.',
        },
        {
          disposition: 'excluded',
          evidence: 'Онлайн қайта шығару пилоты тек қолданылу мерзімі аяқталған куәлікке арналған.',
          id: 'ID-LOSS-X1',
          sourceKeys: ['identity-online-2026', 'identity-loss-guide'],
          statement: 'Жоғалған жеке куәлікті eGov арқылы қалпына келтіруге болады.',
        },
        {
          disposition: 'excluded',
          evidence:
            'Ресми тізімде полиция талон-хабарламасы ұрлау немесе жымқыру жағдайына ғана қойылған; жай жоғалуда жазбаша өтініш беріледі.',
          id: 'ID-LOSS-X2',
          sourceKeys: ['identity-service', 'identity-rules'],
          statement: 'Куәлік жай жоғалса да, алдымен полицияға бару міндетті.',
        },
        {
          disposition: 'excluded',
          evidence:
            '2025 жылғы eGov мақаласындағы 3 айлық шек қолданыстағы ӘҚБтК-нің 492-бабына және қазіргі қызмет карточкаларына қайшы келеді.',
          id: 'ID-LOSS-X3',
          sourceKeys: [
            'identity-loss-legacy-article',
            'administrative-code',
            'identity-service',
            'identity-government-service',
          ],
          statement:
            'Куәліксіз 10 күннен 3 айға дейін жүру тек ескертуге, ал 3 айдан асу айыппұлға әкеледі.',
        },
        {
          disposition: 'excluded',
          evidence:
            'Ескі eGov мақаласындағы аумақтық шектеу қазіргі қызмет беттері мен 2026 жылғы нұсқаулықтағы «кез келген ыңғайлы ХҚКО» бағытына қайшы келеді.',
          id: 'ID-LOSS-X4',
          sourceKeys: [
            'identity-loss-legacy-article',
            'identity-loss-guide',
            'identity-government-service',
            'identity-rules',
          ],
          statement:
            'Жоғалған куәлікті тек тұрақты тіркелген немесе нақты тұратын жердегі ХҚКО-да рәсімдеуге болады.',
        },
      ],
      primarySourceKeys: [
        'identity-rules',
        'tax-code-2026',
        'identity-loss-guide',
        'identity-government-service',
        'identity-documents-law',
        'identity-fees-2026',
        'identity-multiple-loss-2026',
        'mci-2026',
        'administrative-code',
      ],
    },
    faq: [
      {
        answer: 'Жоқ. Жоғалу және ұрлану бойынша өтініш кез келген ыңғайлы ХҚКО-да жеке беріледі.',
        question: 'Жоғалған куәлікті eGov арқылы қалпына келтіруге бола ма?',
      },
      {
        answer:
          'Жай жоғалтсаңыз, полицияға бару міндетті емес: ХҚКО-да жоғалу мән-жайы көрсетілген жазбаша өтініш бересіз. Паспорт бар болса көрсетіңіз, бажды төлеңіз немесе босатылу құқығын растаңыз; 10 күннен бастап құжатсыз жүрсеңіз, әкімшілік құжат сұралуы мүмкін.',
        question: 'Жай жоғалтсам, полицияға бару міндетті ме?',
      },
      {
        answer:
          '10 күннен бір айға дейін куәліксіз жүру ескертуге әкелуі мүмкін. Бір айдан асса, айыппұл 7 АЕК — 2026 жылы 30 275 ₸. Бұл куәлікті қайта шығару бажынан бөлек; ХҚКО тиісті қаулыны не хаттама мен түбіртекті сұрайды.',
        question: 'Куәліксіз жүргеніме 10 күннен асып кетсе не болады?',
      },
      {
        answer:
          'Иә. Басқа құжат болмаса да ХҚКО-ға барыңыз. Тұлғаны растауға қосымша тексеру қажет болуы мүмкін, сондықтан мұндай жағдайда 15 жұмыс күніне кепіл берілмейді.',
        question: 'Басқа жеке басты куәландыратын құжатым жоқ болса ше?',
      },
      {
        answer:
          'Жоқ. Жоғалу туралы өтініш берілген күннен бастап ескі куәлік жарамсыз болады. Табылған құжатты уәкілетті органға тапсырыңыз.',
        question: 'Өтініштен кейін ескі куәлікті тауып алсам, қолдана аламын ба?',
      },
      {
        answer:
          'Жалпы жағдайда 15 жұмыс күніне дейін. Өтінішті ресімдеу және дайын құжатты алу күні мерзімге кірмейді. Тұлғаны қосымша анықтау қажет болса, бұл мерзімге кепіл берілмейді.',
        question: 'Жаңа куәлік қанша уақытта дайын болады?',
      },
    ],
    officialLinks: [
      {
        label: 'ХҚКО кезегі туралы ресми ақпарат',
        publisher: 'gov.kz',
        url: 'https://www.gov.kz/services/3134?lang=kk',
      },
      {
        label: 'Ресми нұсқаулықты ашу',
        publisher: 'gov.kz',
        url: 'https://www.gov.kz/situations/22/162?lang=kk',
      },
    ],
    processingTime: {
      explanation:
        'Өтінішті ресімдеу және дайын құжатты алу күні мерзімге кірмейді. Жедел дайындау ақылы және өңірге байланысты. Тұлғаны қосымша анықтау қажет болса, 15 жұмыс күндік қалыпты мерзімге кепіл берілмейді.',
      value: 'Жалпы жағдайда 15 жұмыс күніне дейін',
    },
    requirements: [
      'Әдетте өтінішті ХҚКО-ға жеке беріңіз; кәмелетке толмаған адамның ата-анасы не заңды өкілі және сот әрекетке қабілетсіз деп танылған адамның заңды өкілі өкілеттігін растайтын құжатпен жүгіне алады.',
      'Ұрланған жағдайда алдымен полициядан талон-хабарлама алыңыз.',
      'Жай жоғалған жағдайда мән-жайын көрсететін жазбаша өтініш дайындаңыз.',
      'Мемлекеттік бажды төлеңіз немесе жеңілдік құқығын растайтын деректі ұсыныңыз.',
      '10 күннен бір айға дейін құжатсыз жүрсеңіз, ХҚКО-да әкімшілік рәсім қажет болып, қаулы сұралуы мүмкін; бір айдан асса, хаттама мен айыппұл түбіртегі сұралады.',
    ],
    seo: {
      description:
        'Жеке куәлік жоғалса немесе ұрланса не істеу керек: ХҚКО жолы, құжаттар, 2026 жылғы баж және дайындалу мерзімі.',
      noIndex: true,
      title: 'Жеке куәлік жоғалды немесе ұрланды — QALAI',
    },
    shortAnswer:
      'Жоғалған немесе ұрланған жеке куәлік онлайн қалпына келтірілмейді: кез келген ХҚКО-ға жүгініңіз. Жай жоғалса — мән-жайы жазылған өтініш, ұрланса — полицияның талон-хабарламасы қажет. 2026 жылғы баж: бір жыл ішіндегі бірінші немесе екінші жоғалтуда 865 ₸, үшінші және кейінгі жоғалтуда 4 325 ₸.',
    slug: 'zheke-kualik-zhogaldy-nemese-urlandy',
    steps: [
      {
        description:
          'Ұрланған болса, полицияға арыз беріп, талон-хабарлама алыңыз. Жай жоғалса, қайда, қашан және қалай жоғалғанын жазыңыз.',
        title: 'Куәлік жоғалды ма, әлде ұрланды ма — соған сай әрекет етіңіз',
      },
      {
        description:
          'Бір жыл ішіндегі бірінші немесе екінші жоғалтуда ресми ұсынылған тәсілмен 865 ₸ төлеңіз. Үшінші және кейінгі жағдайда баж 4 325 ₸ болады. Жеңілдік болса, растайтын деректі дайындаңыз.',
        title: 'Бажды өтініш берген кезде төлеңіз',
      },
      {
        description:
          'Бар болса, паспортты немесе басқа жеке басты куәландыратын құжатты дайындаңыз. Құжат мүлде болмаса да ХҚКО-ға жүгініңіз.',
        title: 'Қолда бар құжаттарды жинаңыз',
      },
      {
        actionLabel: 'ХҚКО кезегі туралы ресми ақпарат',
        actionUrl: 'https://www.gov.kz/services/3134?lang=kk',
        description:
          'Кез келген ыңғайлы ХҚКО-ға барыңыз. Сілтеме кезек туралы ресми ақпаратты ашады, бірақ оның ішкі онлайн өту жолы зерттеу күні жұмыс істемеді. ХҚКО-да сізді тегін суретке түсіреді, қол қою сканерінде қол қоясыз.',
        title: 'ХҚКО-ға өтініш беріңіз',
      },
      {
        description:
          'Өтінім талонын сақтап, SMS немесе басқа ресми хабарламаны күтіңіз. Дайын болғанда жаңа куәлікті алыңыз.',
        title: 'Дайындық туралы хабарламаны күтіңіз',
      },
    ],
    title: 'Жеке куәлік жоғалды немесе ұрланды',
    whoIsItFor: 'Жеке куәлігін жоғалтқан немесе ұрлатып алған 16 жасқа толған Қазақстан азаматына.',
  },
  {
    category: {
      description: 'Бала туғаннан кейінгі құжаттар мен төлемдер.',
      order: 20,
      slug: 'otbasy-zhane-balalar',
      title: 'Отбасы және балалар',
    },
    cost: {
      asOf: AS_OF_2026,
      explanation:
        'Қызмет тегін. Біржолғы төлем: 1–3-балаға 164 350 ₸, 4-баладан бастап 272 475 ₸. Бала күтімі төлемі сақтандыру мәртебесіне қарай бөлек есептеледі.',
      kind: 'calculated',
    },
    documents: [
      { name: 'Өтініш берушінің жеке куәлігі немесе цифрлық құжаты' },
      { name: 'Баланың туу туралы жазбасы немесе куәлігі' },
      {
        name: 'Өтініш берушінің атына ашылған банк шоты',
        note: 'Төлем өтініш берушінің өз шотына түседі.',
      },
      {
        name: 'Шетелде туғанын растайтын заңдастырылған немесе апостиль қойылған құжат',
        optional: true,
      },
    ],
    editorial: {
      conflicts: [
        {
          issue:
            '2026 жылғы екінші және үшінші балаға ай сайынғы күтім жәрдемақысының теңгелік сомасы eGov пен Еңбек министрлігінің материалында 1 теңгеге айырмашылықпен берілген.',
          resolution:
            'Альфа бұл екі жолға тек заңдағы АЕК коэффициентін көрсетеді; теңгелік соманы жарияламайды.',
          sourceKeys: ['child-allowances-egov', 'social-code', 'budget-2026'],
        },
      ],
      publicationBlockers: [
        'Қазақша мәтінді тәуелсіз редактор тексеруі керек.',
        'Жеке сақтандыру төлеміне калькулятор қоспас бұрын rule set пен бақылау мысалдары қажет.',
        'Проактивті SMS және портал жолдары staging-де тексерілуі керек.',
      ],
      nextReviewAt: NEXT_REVIEW_AT,
      researchCheckedAt: CHECKED_AT,
    },
    eligibility: [
      {
        condition: 'Біржолғы туу жәрдемақысы жұмысқа және табысқа тәуелді емес.',
        explanation: 'Егіз немесе үшем туған жағдайда әр балаға бөлек төленеді.',
      },
      {
        condition: 'Әлеуметтік сақтандыруға қатыспасаңыз, бюджеттен ай сайынғы жәрдемақы беріледі.',
        explanation: 'Мөлшері баланың кезегіне қарай 5,76–8,90 АЕК.',
      },
      {
        condition: 'Әлеуметтік сақтандыруға қатыссаңыз, МӘСҚ төлемі табысыңызға қарай есептеледі.',
        explanation:
          'Нақты соманы QALAI әзірге есептемейді: қор әлеуметтік аударымдары бар соңғы 24 ай дерегін қолданады.',
      },
    ],
    evidence: {
      claims: [
        {
          disposition: 'included',
          evidence:
            'Әлеуметтік кодекстің 80–82-баптары төлем алушыларын, 38/63 АЕК және 5,76/6,81/7,85/8,90 АЕК мөлшерлерін белгілейді.',
          id: 'CHILD-01',
          sourceKeys: ['social-code'],
          statement: 'Туу және бала күтімі жәрдемақыларының құқықтық негізі мен мөлшері.',
        },
        {
          disposition: 'included',
          evidence:
            '2026 жылғы бюджетте АЕК 4 325 теңге; eGov 38 АЕК = 164 350 және 63 АЕК = 272 475 деп көрсетеді.',
          id: 'CHILD-02',
          sourceKeys: ['budget-2026', 'child-allowances-egov'],
          statement: '2026 жылғы біржолғы жәрдемақының теңгелік сомасы.',
        },
        {
          disposition: 'included',
          evidence:
            'eGov өтініш мерзімін туған күннен бастап 18 ай деп, ал жәрдемақы қағидалары қарау мерзімін 7 жұмыс күні деп көрсетеді.',
          id: 'CHILD-03',
          sourceKeys: [
            'child-allowances-egov',
            'child-care-payment-service',
            'child-allowance-rules',
          ],
          statement: 'Өтініш беру және қызмет көрсету мерзімі.',
        },
        {
          disposition: 'included',
          evidence:
            'Ресми қызмет карточкасы сақтандырылған күтушінің төлемі жеке табыс пен әлеуметтік аударымдарға тәуелді екенін және банк шоты талабын көрсетеді.',
          id: 'CHILD-04',
          sourceKeys: ['social-code', 'child-care-payment-service'],
          statement: 'Сақтандырылған және сақтандырылмаған күтушілер үшін төлем жолы әртүрлі.',
        },
        {
          disposition: 'excluded',
          evidence: 'Ресми беттер арасында 1 теңгелік дөңгелектеу айырмасы бар.',
          id: 'CHILD-X1',
          sourceKeys: ['child-allowances-egov', 'budget-2026'],
          statement: 'Екінші және үшінші балаға 2026 жылғы нақты теңгелік күтім төлемі.',
        },
      ],
      primarySourceKeys: [
        'social-code',
        'budget-2026',
        'child-allowances-egov',
        'child-care-payment-service',
        'child-allowance-rules',
      ],
    },
    faq: [
      {
        answer:
          'Иә. Біржолғы туу жәрдемақысы жұмыс істейтін және жұмыс істемейтін адамдарға табысына қарамастан беріледі.',
        question: 'Жұмыс істесем де біржолғы жәрдемақы аламын ба?',
      },
      {
        answer:
          'Әр балаға бөлек тағайындалады. Мөлшері әр баланың отбасындағы кезегіне байланысты.',
        question: 'Егіз туса, төлем бір рет пе?',
      },
      {
        answer: 'Туу және күтім төлеміне туған күннен бастап 18 айдан кешікпей жүгініңіз.',
        question: 'Өтінішті қашанға дейін беру керек?',
      },
    ],
    officialLinks: [
      {
        label: 'Туу және күтім төлемі қызметін ашу',
        publisher: 'gov.kz',
        url: 'https://www.gov.kz/services/3450?lang=kk',
      },
    ],
    processingTime: {
      explanation: 'МӘСҚ төлемі мен ХҚКО арқылы өтініштің мерзімі басқа болуы мүмкін.',
      value: 'Туу жәрдемақысы бойынша хабарлама — 7 жұмыс күні',
    },
    requirements: [
      'Төлемге өтінішті бала туған күннен бастап 18 айдан кешіктірмей беріңіз.',
      '1414-тен проактивті ұсыныс келсе, жауап беру мерзімін өткізіп алмаңыз.',
      'Төлем үшін өтініш берушінің атына ашылған банк шотын көрсетіңіз.',
    ],
    seo: {
      description:
        '2026 жылы бала туған кезде берілетін біржолғы және ай сайынғы төлемдер, кімге тиесілі және қайда өтініш беру керек.',
      noIndex: true,
      title: 'Бала туған кезде қандай төлем алуға болады? — QALAI',
    },
    shortAnswer:
      '2026 жылы әр туған балаға біржолғы жәрдемақы беріледі: 1–3-балаға 164 350 ₸, 4-баладан бастап 272 475 ₸. Бала күтімінің ай сайынғы төлемі сіздің әлеуметтік сақтандыру мәртебеңізге қарай анықталады.',
    slug: 'bala-tuuy-tolemderi',
    steps: [
      {
        description:
          'Туу туралы жазбаны рәсімдеп, проактивті SMS келсе, ұсынылған қызметтерді тексеріңіз.',
        title: 'Баланың тууын тіркеңіз',
      },
      {
        actionLabel: 'Жәрдемақы қызметін ашу',
        actionUrl: 'https://www.gov.kz/services/3450?lang=kk',
        description:
          'Біржолғы жәрдемақы барлық отбасына беріледі. Өтінішті туған күннен бастап 18 ай ішінде беріңіз.',
        title: 'Біржолғы жәрдемақыға өтініш беріңіз',
      },
      {
        description:
          'Соңғы кезеңде әлеуметтік аударымдарыңыз болса — МӘСҚ төлемі; болмаса — бала кезегіне қарай бюджет жәрдемақысы қолданылады.',
        title: 'Ай сайынғы күтім төлемінің түрін анықтаңыз',
      },
      {
        actionLabel: 'Күтім төлемі қызметін ашу',
        actionUrl: 'https://www.gov.kz/services/3450?lang=kk',
        description:
          'Өтініш берушінің атына ашылған банк шотын көрсетіп, ресми қызметте өтінішті аяқтаңыз.',
        title: 'Банк шотын көрсетіп, өтінішті аяқтаңыз',
      },
    ],
    title: 'Бала туған кезде қандай төлем алуға болады?',
    whoIsItFor:
      'Қазақстанда бала туғаннан кейін біржолғы жәрдемақы мен 1,5 жасқа дейінгі күтім төлемін рәсімдейтін ата-анаға немесе күтушіге.',
  },
  {
    category: {
      description: 'Жұмыс, жұмыссыздық және табысқа байланысты қызметтер.',
      order: 30,
      slug: 'zhumys-zhane-tabys',
      title: 'Жұмыс және табыс',
    },
    cost: {
      explanation:
        'Тіркелу тегін. Әлеуметтік төлемнің нақты сомасын МӘСҚ соңғы 24 айдағы әлеуметтік аударымдары бар табысқа қарай есептейді.',
      kind: 'calculated',
    },
    documents: [
      {
        name: 'Құжат жүктеу талап етілмейді',
        note: 'Жұмыссыз ретінде тіркеуге қажет деректер мемлекеттік жүйелерден алынады.',
      },
      {
        name: 'Өз атыңызға ашылған банк шоты',
        note: 'Әлеуметтік төлем тағайындалса қажет болуы мүмкін.',
        optional: true,
      },
    ],
    editorial: {
      conflicts: [],
      publicationBlockers: [
        'Қазақша мәтінді тәуелсіз редактор тексеруі керек.',
        'Жеке төлем сомасын есептейтін калькулятор rule set және бақылау мысалдары болмайынша қосылмайды.',
        'eGov/Enbek және 1414 SMS жолы staging-де тексерілуі керек.',
      ],
      nextReviewAt: NEXT_REVIEW_AT,
      researchCheckedAt: CHECKED_AT,
    },
    eligibility: [
      {
        condition: 'Алдымен жұмыссыз ретінде тіркелуіңіз керек.',
        explanation: 'Төлем құқығы жұмыссыз мәртебесі тіркелген күннен басталады.',
      },
      {
        condition: 'Міндетті әлеуметтік сақтандыру жүйесіне қатысу өтілі кемінде 6 ай болуы керек.',
        explanation:
          'Соңғы 24 айда әлеуметтік аударым болмаған жағдайда немесе өтіл 6 айдан аз болса, төлем тағайындалмайды.',
      },
      {
        condition: 'Жұмыстан шығу себебі төлем құқығын өздігінен жоймайды.',
        explanation:
          'Ресми түсіндірме төлем жұмыстан шығу себебіне қарамастан берілетінін көрсетеді.',
      },
    ],
    evidence: {
      claims: [
        {
          disposition: 'included',
          evidence:
            'eGov қызмет карточкасы тіркеудің тегін, 2 жұмыс күні және құжатсыз екенін көрсетеді.',
          id: 'JOB-01',
          sourceKeys: ['unemployment-registration-service'],
          statement: 'Жұмыссыз ретінде тіркелудің құны, мерзімі және құжаттары.',
        },
        {
          disposition: 'included',
          evidence:
            'Әлеуметтік кодекстің 113 және 115-баптары құқықтың тіркелген күннен басталуын, 12 айлық жүгіну мерзімін, соңғы 24 айдағы аударым мен кемінде 6 ай өтіл талабын белгілейді.',
          id: 'JOB-02',
          sourceKeys: ['social-code'],
          statement: 'Жұмысынан айырылу төлеміне құқықтың негізгі шарттары.',
        },
        {
          disposition: 'included',
          evidence:
            'Еңбек министрлігінің 2026 жылғы ақпараты төлемнің 1–6 ай, жоғалған кірістің 45%-ына дейін және жұмыстан шығу себебіне қарамастан берілетінін түсіндіреді.',
          id: 'JOB-03',
          sourceKeys: ['unemployment-payment-2026', 'unemployment-payment-rules'],
          statement: 'Төлем ұзақтығы мен жеке мөлшерінің жалпы шегі.',
        },
        {
          disposition: 'excluded',
          evidence: 'Нақты сома қордағы жеке аударым деректерінсіз сенімді есептелмейді.',
          id: 'JOB-X1',
          sourceKeys: ['social-code', 'unemployment-payment-rules'],
          statement: 'Пайдаланушы алатын нақты төлем сомасы.',
        },
      ],
      primarySourceKeys: [
        'social-code',
        'unemployment-registration-service',
        'unemployment-payment-2026',
        'unemployment-payment-rules',
      ],
    },
    faq: [
      {
        answer:
          'Иә. Ресми түсіндірмеге сәйкес төлем жұмыстан шығу себебіне қарамастан тағайындалады, бірақ сақтандыру өтілі мен аударым шарттары орындалуы керек.',
        question: 'Өз еркіммен шықсам, төлем ала аламын ба?',
      },
      {
        answer: 'Міндетті әлеуметтік сақтандыруға қатысу өтіліне қарай 1 айдан 6 айға дейін.',
        question: 'Төлем қанша ай беріледі?',
      },
      {
        answer:
          'Жұмыссыз ретінде тіркелу үшін құжат ұсыну талап етілмейді; жүйе деректерді өзі тексереді.',
        question: 'Қандай құжат жүктеймін?',
      },
    ],
    officialLinks: [
      {
        label: 'Жұмыссыз ретінде тіркелу',
        publisher: 'eGov.kz',
        url: 'https://egov.kz/cms/kk/services/pass363_mtszn',
      },
      {
        label: 'Enbek.kz порталын ашу',
        publisher: 'Электрондық еңбек биржасы',
        url: 'https://www.enbek.kz/kk',
      },
    ],
    processingTime: {
      explanation:
        'Жұмыссыз мәртебесі тіркелгеннен кейін төлем туралы 1414-тен проактивті SMS келуі мүмкін.',
      value: 'Жұмыссыз ретінде тіркеу — 2 жұмыс күні',
    },
    requirements: [
      'eGov немесе Enbek.kz жүйесіне кіре алатыныңызды тексеріңіз.',
      'Байланыс нөміріңіз мобильді азаматтар базасында өзекті болуы керек.',
      '1414-тен келген SMS-ке тек ресми арнада жауап беріңіз және кодты бөгде адамға айтпаңыз.',
    ],
    seo: {
      description:
        'Жұмыссыз ретінде тіркелу және жұмысынан айырылу төлеміне құқықты тексеру: шарттар, мерзім және ресми өтініш.',
      noIndex: true,
      title: 'Жұмыссыз ретінде қалай тіркеліп, төлем алуға болады? — QALAI',
    },
    shortAnswer:
      'Алдымен eGov немесе Enbek.kz арқылы жұмыссыз ретінде тіркеліңіз. Әлеуметтік сақтандыру талаптары орындалса, 1414-тен төлемді тағайындауға келісу туралы SMS келуі мүмкін. Нақты сома мен мерзімді МӘСҚ жеке деректеріңіз бойынша есептейді.',
    slug: 'zhumyssyz-retinde-tirkelu-zhane-tolem',
    steps: [
      {
        actionLabel: 'Тіркелу қызметін ашу',
        actionUrl: 'https://egov.kz/cms/kk/services/pass363_mtszn',
        description:
          'eGov немесе Enbek.kz арқылы жұмыс іздеуші ретінде өтініш беріп, байланыс деректерін толтырыңыз.',
        title: 'Жұмыс іздеуші ретінде өтініш беріңіз',
      },
      {
        description:
          'Мансап орталығы бос жұмыс орындарын ұсынады. Жұмыс табылмаса, жүйе жұмыссыз мәртебесін рәсімдейді.',
        title: 'Ұсынылған жұмыс орындарын тексеріңіз',
      },
      {
        description:
          'Жұмыссыз мәртебесі тіркелсе және сақтандыру талаптары орындалса, 1414 төлемге келісу сұрағын жібере алады.',
        title: '1414 хабарламасын күтіңіз',
      },
      {
        description:
          'Келіскеннен кейін тағайындау нәтижесін жеке кабинеттен тексеріңіз. QALAI көрсеткен пайыз нақты кепілденген сома емес.',
        title: 'Нәтижені ресми кабинеттен тексеріңіз',
      },
    ],
    title: 'Жұмыссыз ретінде қалай тіркеліп, төлем алуға болады?',
    whoIsItFor:
      'Жұмысынан айырылған және жұмыссыз мәртебесін рәсімдеп, МӘСҚ төлеміне құқығын тексергісі келетін адамға.',
  },
  {
    category: {
      description: 'Жеке кәсіп, салық режимі және бизнесті бастау.',
      order: 40,
      slug: 'kasip',
      title: 'Кәсіп',
    },
    cost: {
      asOf: AS_OF_2026,
      explanation:
        'ЖК тіркеу тегін. Өзін-өзі жұмыспен қамту режимінде ЖТС 0%, ал нақты табыстан әлеуметтік төлемдер 4%. Басқа режимдегі салық жүктемесі жеке есептеледі.',
      kind: 'varies',
    },
    documents: [
      { name: 'Жеке куәлік және ЖСН' },
      {
        name: 'Қызмет түрі мен ЭҚЖЖ коды',
        note: 'Өзін-өзі жұмыспен қамту режимі үшін қызмет № 994 рұқсат тізімінде болуы керек.',
      },
      {
        name: 'e-Salyq Business немесе eLicense/eGov қолжетімділігі',
        note: 'Таңдалған жолға қарай.',
      },
    ],
    editorial: {
      conflicts: [
        {
          issue:
            'Кейбір ресми түсіндірмелер Кәсіпкерлік кодекстегі 360 АЕК жылдық шекті теңгеге ескі АЕК-пен айналдырып көрсетеді.',
          resolution:
            'Альфа бұл қате теңгелік соманы қолданбайды және таңдау логикасын жаңа өзін-өзі жұмыспен қамту режимінің тікелей шарттарына негіздейді.',
          sourceKeys: ['entrepreneurial-code', 'budget-2026', 'self-employed-kgd-2026'],
        },
      ],
      publicationBlockers: [
        'Қазақша мәтінді салық терминдерін білетін тәуелсіз редактор тексеруі керек.',
        'e-Salyq Business және ЖК тіркеу жолдары staging/құрылғыда тексерілуі керек.',
        'Қызмет түрлері өзгермегенін жариялау алдында № 994 қаулыдан қайта тексеру керек.',
      ],
      nextReviewAt: NEXT_REVIEW_AT,
      researchCheckedAt: CHECKED_AT,
    },
    eligibility: [
      {
        condition: 'Өзін-өзі жұмыспен қамту: ЖК ретінде тіркелмегенсіз.',
        explanation: 'Бұл режим жеке тұлғаға арналған.',
      },
      {
        condition: 'Жалдамалы жұмыскер қолданбайсыз.',
        explanation: 'Қызметті өзіңіз атқаруыңыз керек.',
      },
      {
        condition: 'Қызметіңіз № 994 рұқсат тізімінде бар.',
        explanation: 'Тізімде жоқ қызмет үшін басқа режимді таңдаңыз.',
      },
      {
        condition: 'Айлық табыс 300 АЕК-тен аспайды.',
        explanation: '2026 жылы бұл 1 297 500 ₸.',
      },
    ],
    evidence: {
      claims: [
        {
          disposition: 'included',
          evidence:
            'Жаңа Салық кодексі мен КГД түсіндірмесі режимнің шарттарын: ЖК емес, жұмыскерсіз, рұқсат етілген қызмет және айына 300 АЕК деп көрсетеді.',
          id: 'BIZ-01',
          sourceKeys: ['tax-code-2026', 'self-employed-kgd-2026'],
          statement: 'Өзін-өзі жұмыспен қамту режимінің төрт негізгі шарты.',
        },
        {
          disposition: 'included',
          evidence: 'Үкіметтің № 994 қаулысы рұқсат етілген 40 қызмет түрін бекітеді.',
          id: 'BIZ-02',
          sourceKeys: ['self-employed-activities'],
          statement: 'Режим тек бекітілген қызмет тізіміне қолданылады.',
        },
        {
          disposition: 'included',
          evidence:
            '2026 жылғы АЕК — 4 325 теңге; 300 АЕК = 1 297 500 теңге. КГД әлеуметтік төлемді нақты табыстың 4%-ы деп көрсетеді.',
          id: 'BIZ-03',
          sourceKeys: ['budget-2026', 'self-employed-kgd-2026'],
          statement: '2026 жылғы айлық табыс шегі және әлеуметтік төлем мөлшерлемесі.',
        },
        {
          disposition: 'included',
          evidence:
            'Кәсіпкерлік кодекстің 36-бабы хабарлама арқылы тіркеуді және мемлекеттік кіріс органының бір жұмыс күндік мерзімін айқындайды; eGov ресми онлайн жолды көрсетеді.',
          id: 'BIZ-04',
          sourceKeys: ['entrepreneurial-code', 'ip-registration-egov'],
          statement: 'ЖК-ны хабарлама арқылы онлайн тіркеу жолы мен мерзімі.',
        },
        {
          disposition: 'excluded',
          evidence:
            'ЖК-ның нақты салық жүктемесі режимге, өңірлік мөлшерлемеге, ҚҚС және басқа жағдайларға тәуелді.',
          id: 'BIZ-X1',
          sourceKeys: ['tax-code-2026'],
          statement: 'Барлық ЖК үшін бірдей нақты салық сомасы.',
        },
      ],
      primarySourceKeys: [
        'tax-code-2026',
        'entrepreneurial-code',
        'self-employed-activities',
        'budget-2026',
        'self-employed-kgd-2026',
      ],
    },
    faq: [
      {
        answer:
          'Жоқ. Өзін-өзі жұмыспен қамту режимінің бір шарты — жалдамалы жұмыскердің болмауы. Қызметкер керек болса, ЖК немесе басқа нысанды таңдаңыз.',
        question: 'Өзін-өзі жұмыспен қамтып, қызметкер жалдай аламын ба?',
      },
      {
        answer:
          'Алдымен № 994 қаулыдағы тізімді тексеріңіз. Қызмет жоқ болса, бұл режим жарамайды.',
        question: 'Менің қызметім бұл режимге кіре ме?',
      },
      {
        answer: '2026 жылы айына 300 АЕК, яғни 1 297 500 теңге. Шек АЕК өзгерсе қайта есептеледі.',
        question: 'Табыс шегі қанша?',
      },
    ],
    officialLinks: [
      {
        label: 'Рұқсат етілген қызметтерді тексеру',
        publisher: 'Әділет',
        url: 'https://adilet.zan.kz/kaz/docs/P2500000994',
      },
      {
        label: 'ЖК тіркеу жолын ашу',
        publisher: 'eGov.kz',
        url: 'https://egov.kz/cms/kk/articles/ip-registration',
      },
    ],
    processingTime: {
      explanation:
        'Өзін-өзі жұмыспен қамту режимі e-Salyq Business-тегі алғашқы чек күнінен басталады.',
      value: 'ЖК тіркеу — хабарлама берілгеннен кейін 1 жұмыс күніне дейін',
    },
    requirements: [
      'Алдымен нақты қызмет түрін және айлық күтілетін табысты жазыңыз.',
      'Қызметкер жалдайсыз ба — соны анықтаңыз.',
      'Өзін-өзі жұмыспен қамту жолын таңдасаңыз, № 994 қызмет тізімін міндетті түрде тексеріңіз.',
      'Шарттардың біреуі орындалмаса, ЖК үшін салық режимін жеке таңдаңыз.',
    ],
    seo: {
      description:
        '2026 жылы ЖК ашу керек пе, әлде өзін-өзі жұмыспен қамту режимі жарай ма: төрт шарт, табыс шегі және ресми тіркеу жолы.',
      noIndex: true,
      title: 'ЖК ме, әлде өзін-өзі жұмыспен қамту ма? — QALAI',
    },
    shortAnswer:
      'Егер ЖК ретінде тіркелмеген болсаңыз, қызметкер жалдамасаңыз, қызметіңіз рұқсат тізімінде болса және айлық табыс 300 АЕК-тен аспаса, өзін-өзі жұмыспен қамту режимі жарауы мүмкін. Осы шарттардың бірі орындалмаса, ЖК немесе басқа нысанды таңдаңыз.',
    slug: 'zhk-nemese-ozin-ozi-zhumyspen-kamtu',
    steps: [
      {
        description:
          'Жалдамалы жұмыскер, қызмет түрі және айлық табыс бойынша төрт шарттың бәрін салыстырыңыз.',
        title: 'Өзін-өзі жұмыспен қамту шарттарын тексеріңіз',
      },
      {
        actionLabel: '№ 994 тізімді ашу',
        actionUrl: 'https://adilet.zan.kz/kaz/docs/P2500000994',
        description: 'Қызметіңіздің Үкімет бекіткен рұқсат тізімінде бар-жоғын табыңыз.',
        title: 'Қызмет түрін тексеріңіз',
      },
      {
        description:
          'Барлық шарт орындалса, e-Salyq Business арқылы алғашқы чекті беріп, табыстан әлеуметтік төлемдерді орындаңыз.',
        title: 'Шарттар сай болса — өзін-өзі жұмыспен қамту режимін бастаңыз',
      },
      {
        actionLabel: 'ЖК тіркеу нұсқаулығын ашу',
        actionUrl: 'https://egov.kz/cms/kk/articles/ip-registration',
        description:
          'Қызметкер керек болса немесе режим шарттары сай болмаса, ЖК тіркеп, қызметіңізге сәйкес салық режимін таңдаңыз.',
        title: 'Шарттар сай болмаса — ЖК бағытын таңдаңыз',
      },
    ],
    title: 'ЖК ашу керек пе, әлде өзін-өзі жұмыспен қамту режимі жарай ма?',
    whoIsItFor:
      '2026 жылы Қазақстанда жалғыз өзі табыс табуды немесе шағын кәсіп бастауды жоспарлап, заңды нысанды таңдап жүрген адамға.',
  },
]
