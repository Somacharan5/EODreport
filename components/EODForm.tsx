'use client'

import { useState, useCallback, Fragment } from 'react'
import {
  EODFormData, SubStageRow, APP_STAGES, LM_STAGES, SHEET_STAGES, STAGE_COLORS, CallSummary,
} from '@/lib/types'

// ── helpers ──────────────────────────────────────────────────────────────────

function buildInitialRows(
  stages: { stage: string; subStages: string[] }[],
): SubStageRow[] {
  return stages.flatMap(({ stage, subStages }) =>
    subStages.map(subStage => ({ stage, subStage, calls: 0 })),
  )
}

function summarise(rows: SubStageRow[]): CallSummary {
  const sum = (stage: string) =>
    rows.filter(r => r.stage === stage).reduce((a, r) => a + r.calls, 0)
  return {
    counseled:             sum('Counseled'),
    noContactEstablished:  sum('No Contact Established'),
    notEligible:           sum('Not Eligible'),
    notInterested:         sum('Not Interested'),
    duplicateLeads:        sum('Duplicate Lead') || undefined,
    grandTotal:            rows.reduce((a, r) => a + r.calls, 0),
  }
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="section-heading">
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="label">{label}</span>
      {children}
    </div>
  )
}

interface CallTableProps {
  rows: SubStageRow[]
  onChange: (index: number, value: number) => void
  col1: string
}

function CallTable({ rows, onChange, col1 }: CallTableProps) {
  const grandTotal = rows.reduce((s, r) => s + r.calls, 0)

  // Group consecutive rows by stage for visual grouping
  const stageGroups: { stage: string; indices: number[] }[] = []
  rows.forEach((row, i) => {
    const last = stageGroups[stageGroups.length - 1]
    if (last && last.stage === row.stage) last.indices.push(i)
    else stageGroups.push({ stage: row.stage, indices: [i] })
  })

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="text-left px-4 py-2.5 border-b border-gray-100">{col1}</th>
            <th className="text-left px-4 py-2.5 border-b border-gray-100">Sub-stage</th>
            <th className="text-right px-4 py-2.5 border-b border-gray-100 w-24">Calls</th>
          </tr>
        </thead>
        <tbody>
          {stageGroups.map(group => {
            const stageTotal = group.indices.reduce((s, i) => s + rows[i].calls, 0)
            const colorClass = STAGE_COLORS[group.stage] ?? 'bg-gray-100 text-gray-700'
            return (
              <Fragment key={group.stage}>
                {group.indices.map((rowIdx, posInGroup) => {
                  const row = rows[rowIdx]
                  return (
                    <tr key={rowIdx} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      {posInGroup === 0 && (
                        <td
                          className="px-4 py-2 align-middle"
                          rowSpan={group.indices.length}
                        >
                          <span className={`stage-pill ${colorClass}`}>{group.stage}</span>
                        </td>
                      )}
                      <td className="px-4 py-2 text-gray-600">{row.subStage}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          value={row.calls === 0 ? '' : row.calls}
                          placeholder="0"
                          onChange={e => onChange(rowIdx, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full text-right input-field py-1.5 px-2"
                        />
                      </td>
                    </tr>
                  )
                })}
                {/* Stage subtotal */}
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <td colSpan={2} className="px-4 py-1.5 text-xs font-semibold text-gray-400 text-right">
                    {group.stage} total
                  </td>
                  <td className="px-4 py-1.5 text-right text-xs font-bold text-gray-700">{stageTotal}</td>
                </tr>
              </Fragment>
            )
          })}
          {/* Grand total */}
          <tr className="bg-slate-800">
            <td colSpan={2} className="px-4 py-2.5 text-sm font-bold text-slate-200 text-right">
              Grand Total
            </td>
            <td className="px-4 py-2.5 text-right text-sm font-extrabold text-white">{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function InsightList({
  insights,
  onChange,
  placeholder,
}: {
  insights: string[]
  onChange: (next: string[]) => void
  placeholder: string
}) {
  const add = () => onChange([...insights, ''])
  const remove = (i: number) => onChange(insights.filter((_, idx) => idx !== i))
  const update = (i: number, val: string) =>
    onChange(insights.map((v, idx) => (idx === i ? val : v)))

  return (
    <div className="space-y-2">
      {insights.map((val, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-gray-300 text-sm">•</span>
          <input
            type="text"
            value={val}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder}
            className="input-field flex-1"
          />
          {insights.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
              aria-label="Remove insight"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
      >
        <span className="text-base">＋</span> Add insight
      </button>
    </div>
  )
}

// ── main form ─────────────────────────────────────────────────────────────────

const INITIAL_STATE: EODFormData = {
  counsellorName: '',
  reportDate: todayISO(),
  introText: '',
  appRows: buildInitialRows(APP_STAGES),
  appSummary: summarise(buildInitialRows(APP_STAGES)),
  appInsights: [''],
  lmRows: buildInitialRows(LM_STAGES),
  lmSummary: summarise(buildInitialRows(LM_STAGES)),
  lmInsights: [''],
  sheetRows: buildInitialRows(SHEET_STAGES),
  sheetSummary: summarise(buildInitialRows(SHEET_STAGES)),
  sheetInsights: [''],
  phoneSummary: { totalCallsToday: '', totalOutgoing: '', totalTalkTime: '' },
  overallSummary: '',
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function EODForm() {
  const [form, setForm] = useState<EODFormData>(INITIAL_STATE)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Generic string field update
  const setField = useCallback(
    <K extends keyof EODFormData>(key: K, value: EODFormData[K]) =>
      setForm(prev => ({ ...prev, [key]: value })),
    [],
  )

  // App Starts row update
  const updateAppRow = useCallback((index: number, value: number) => {
    setForm(prev => {
      const rows = prev.appRows.map((r, i) => (i === index ? { ...r, calls: value } : r))
      return { ...prev, appRows: rows, appSummary: summarise(rows) }
    })
  }, [])

  // Lead Manager row update
  const updateLMRow = useCallback((index: number, value: number) => {
    setForm(prev => {
      const rows = prev.lmRows.map((r, i) => (i === index ? { ...r, calls: value } : r))
      return { ...prev, lmRows: rows, lmSummary: summarise(rows) }
    })
  }, [])

  // Sheet Callings row update
  const updateSheetRow = useCallback((index: number, value: number) => {
    setForm(prev => {
      const rows = prev.sheetRows.map((r, i) => (i === index ? { ...r, calls: value } : r))
      return { ...prev, sheetRows: rows, sheetSummary: summarise(rows) }
    })
  }, [])

  const handleSubmit = async () => {
    if (!form.counsellorName.trim()) {
      setErrorMsg('Please enter your name.')
      setStatus('error')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong.')
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send.')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setForm({ ...INITIAL_STATE, reportDate: todayISO() })
    setStatus('idle')
    setErrorMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── success screen ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Report Sent!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your EOD report has been emailed to Siddharth & Soma.
          </p>
          <button onClick={handleReset} className="btn-primary mx-auto">
            Submit another report
          </button>
        </div>
      </div>
    )
  }

  // ── main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">

       {/* ── Narrow top group ──────────────────────────────────────── */}
       <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Masters Union</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">End of Day Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in your daily calling activity. This will be emailed directly to Siddharth & Soma.
          </p>
        </div>

        {/* ── 1. Counsellor Info ─────────────────────────────────────── */}
        <div className="section-card">
          <SectionHeading icon="👤">Counsellor info</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Your name *">
              <input
                type="text"
                placeholder="e.g. Prerna Kaushik"
                value={form.counsellorName}
                onChange={e => setField('counsellorName', e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Report date *">
              <input
                type="date"
                value={form.reportDate}
                onChange={e => setField('reportDate', e.target.value)}
                className="input-field"
              />
            </Field>
          </div>
          <Field label="Lead sets worked on" className="mt-4">
            <textarea
              rows={2}
              placeholder="e.g. Today, I worked on Application Manager and Lead Manager leads assigned by Soma."
              value={form.introText}
              onChange={e => setField('introText', e.target.value)}
              className="input-field resize-none"
            />
          </Field>
        </div>

        {/* ── 2. Phone summary ──────────────────────────────────────── */}
        <div className="section-card">
          <SectionHeading icon="📞">Phone summary</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Total calls today">
              <input type="number" min={0} placeholder="121"
                value={form.phoneSummary.totalCallsToday}
                onChange={e => setField('phoneSummary', { ...form.phoneSummary, totalCallsToday: e.target.value })}
                className="input-field" />
            </Field>
            <Field label="Total outgoing">
              <input type="number" min={0} placeholder="110"
                value={form.phoneSummary.totalOutgoing}
                onChange={e => setField('phoneSummary', { ...form.phoneSummary, totalOutgoing: e.target.value })}
                className="input-field" />
            </Field>
            <Field label="Talk time">
              <input type="text" placeholder="1h 12m 48s"
                value={form.phoneSummary.totalTalkTime}
                onChange={e => setField('phoneSummary', { ...form.phoneSummary, totalTalkTime: e.target.value })}
                className="input-field" />
            </Field>
          </div>
        </div>

       </div>{/* end narrow top group */}

       {/* ── Calling sections: 3 columns on laptop, stacked on mobile ── */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── 3. App Starts ─────────────────────────────────────────── */}
        <div className="section-card mb-0 h-full">
          <SectionHeading icon="📲">App Starts Calling</SectionHeading>
          <CallTable rows={form.appRows} onChange={updateAppRow} col1="Application Stage" />

          <div className="mt-5 pt-5 border-t border-gray-100">
            <SectionHeading icon="💡">App Starts — Key Insights</SectionHeading>
            <InsightList
              insights={form.appInsights}
              onChange={v => setField('appInsights', v)}
              placeholder="e.g. High DNP/DNP2 volume continued to impact connectivity"
            />
          </div>
        </div>

        {/* ── 4. Lead Manager ───────────────────────────────────────── */}
        <div className="section-card mb-0 h-full">
          <SectionHeading icon="📋">Lead Manager Calling</SectionHeading>
          <CallTable rows={form.lmRows} onChange={updateLMRow} col1="Lead Stage" />

          <div className="mt-5 pt-5 border-t border-gray-100">
            <SectionHeading icon="💡">Lead Manager — Key Insights</SectionHeading>
            <InsightList
              insights={form.lmInsights}
              onChange={v => setField('lmInsights', v)}
              placeholder="e.g. Connectivity remained challenging, most outcomes fell under DNP/DNP2"
            />
          </div>
        </div>

        {/* ── 5. Sheet Callings ─────────────────────────────────────── */}
        <div className="section-card mb-0 h-full">
          <SectionHeading icon="📄">Sheet Callings</SectionHeading>
          <CallTable rows={form.sheetRows} onChange={updateSheetRow} col1="Lead Stage" />

          <div className="mt-5 pt-5 border-t border-gray-100">
            <SectionHeading icon="💡">Sheet Callings — Key Insights</SectionHeading>
            <InsightList
              insights={form.sheetInsights}
              onChange={v => setField('sheetInsights', v)}
              placeholder="e.g. Most sheet leads were unreachable or already counselled earlier"
            />
          </div>
        </div>

       </div>{/* end calling grid */}

       {/* ── Narrow bottom group ───────────────────────────────────── */}
       <div className="max-w-2xl mx-auto mt-5">

        {/* ── 6. Any feedback ───────────────────────────────────────── */}
        <div className="section-card">
          <SectionHeading icon="📝">Any feedback</SectionHeading>
          <Field label="Any feedback">
            <textarea rows={3}
              placeholder="e.g. The day was primarily focused on follow-up activities across App Starts and Lead Manager…"
              value={form.overallSummary}
              onChange={e => setField('overallSummary', e.target.value)}
              className="input-field resize-none" />
          </Field>
        </div>

        {/* ── Error banner ──────────────────────────────────────────── */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-12">
          <button
            onClick={handleSubmit}
            disabled={status === 'sending'}
            className="btn-primary"
          >
            {status === 'sending' ? (
              <>
                <span className="animate-spin">⟳</span> Sending…
              </>
            ) : (
              <>📧 Send EOD Report</>
            )}
          </button>
          <button onClick={handleReset} className="btn-secondary" type="button">
            Clear form
          </button>
        </div>

       </div>{/* end narrow bottom group */}

      </div>
    </div>
  )
}
