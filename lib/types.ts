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
}

export interface EODFormData {
  // Meta
  counsellorName: string
  reportDate: string
  assignedBy: string
  introText: string

  // App Starts
  appRows: SubStageRow[]
  appSummary: CallSummary
  appLeadNote: string
  appLeadType: string
  appLeadSubstage: string
  appInsights: string[]

  // Lead Manager
  lmRows: SubStageRow[]
  lmSummary: CallSummary
  lmInsights: string[]

  // Phone stats
  phoneSummary: PhoneSummary

  // Closing
  overallSummary: string
}

// ── Predefined stage/sub-stage definitions ──────────────────────────────────

export const APP_STAGES: { stage: string; subStages: string[] }[] = [
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
    subStages: ['Disconnected on Hearing MU', 'Looking for different course', 'Applied By Mistake'],
  },
]

export const LM_STAGES: { stage: string; subStages: string[] }[] = [
  {
    stage: 'Counseled',
    subStages: ['Cold', 'Hot', 'Warm'],
  },
  {
    stage: 'No Contact Established',
    subStages: ['DNP', 'DNP2', 'Dead', 'Call later', 'Not Reachable'],
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
  {
    stage: 'Duplicate Lead',
    subStages: ['Duplicate lead'],
  },
]

export const STAGE_COLORS: Record<string, string> = {
  'Counseled':               'bg-green-100 text-green-800',
  'No Contact Established':  'bg-amber-100 text-amber-800',
  'Not Eligible':            'bg-blue-100  text-blue-800',
  'Not Interested':          'bg-red-100   text-red-800',
  'Duplicate Lead':          'bg-purple-100 text-purple-800',
}
