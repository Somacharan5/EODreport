export interface SubStageRow {
  stage: string
  subStage: string
  calls: number
}

export interface CallSummary {
  counseled: number
  noContactEstablished: number
  notEligible: number
  notInterested: number
  duplicateLeads?: number
  grandTotal: number
}

export interface PhoneSummary {
  totalCallsToday: string
  totalOutgoing: string
  totalTalkTime: string
  paidAppsToday: string
}

export interface EODFormData {
  // Meta
  counsellorName: string
  reportDate: string
  introText: string

  // App Starts
  appRows: SubStageRow[]
  appSummary: CallSummary
  appInsights: string[]

  // Lead Manager
  lmRows: SubStageRow[]
  lmSummary: CallSummary
  lmInsights: string[]

  // Sheet Callings
  sheetRows: SubStageRow[]
  sheetSummary: CallSummary
  sheetInsights: string[]

  // Phone stats
  phoneSummary: PhoneSummary

  // Closing
  overallSummary: string
}

// ── Counsellors ──────────────────────────────────────────────────────────────

export const COUNSELLORS = [
  'Jasmeet',
  'Prerna',
  'Komal',
  'Drishti',
  'Sanjana',
  'Ishaan',
  'Sunny',
  'Aniket',
  'Devam',
  'Aprajita',
  'Simran',
]

// Each counsellor is also added as a recipient so they receive their own
// EOD report thread / mail trail.
export const COUNSELLOR_EMAILS: Record<string, string> = {
  Jasmeet:  'jasmeet.kaur@mastersunion.org',
  Prerna:   'prerna.kaushik@mastersunion.org',
  Komal:    'komal.pandey@mastersunion.org',
  Drishti:  'drishti.majumdar@mastersunion.org',
  Sanjana:  'sanjana.deshwal_sbmc2@mastercamp.org',
  Ishaan:   'ishan.ali1@mastersunion.org',
  Sunny:    'sunny.singh@mastersunion.org',
  Aniket:   'aniket.singh1@mastersunion.org',
  Devam:    'devam.chandna@mastersunion.org',
  Aprajita: 'aprajita.mitra@mastersunion.org',
  Simran:   'simran.mishra@mastersunion.org',
}

// ── Predefined stage/sub-stage definitions ──────────────────────────────────
// All three calling tables (App Starts, Lead Manager, Sheet Callings) share the
// exact same stages so their tables are identical in structure and height.

export const CALL_STAGES: { stage: string; subStages: string[] }[] = [
  {
    stage: 'Counseled',
    subStages: ['Cold', 'Hot', 'Warm'],
  },
  {
    stage: 'No Contact Established',
    subStages: ['DNP', 'DNP2', 'Dead', 'Call later', 'Not Reachable', 'Incorrect Number'],
  },
  {
    stage: 'Not Eligible',
    subStages: ['In Graduation below 3rd year', 'Language Barrier'],
  },
  {
    stage: 'Not Interested',
    subStages: [
      'Disconnected on Hearing MU',
      'Applied By Mistake',
      'Looking for different course',
      'Parental Issues',
      'Other - Refer Comments',
    ],
  },
]

export const APP_STAGES = CALL_STAGES
export const LM_STAGES = CALL_STAGES
export const SHEET_STAGES = CALL_STAGES

export const STAGE_COLORS: Record<string, string> = {
  'Counseled':               'bg-green-100 text-green-800',
  'No Contact Established':  'bg-amber-100 text-amber-800',
  'Not Eligible':            'bg-blue-100  text-blue-800',
  'Not Interested':          'bg-red-100   text-red-800',
}
