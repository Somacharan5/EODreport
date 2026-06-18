import { EODFormData, SubStageRow } from './types'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDate()
  const suffix =
    day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th'
  return `${day}${suffix} ${d.toLocaleString('en', { month: 'long' })} ${d.getFullYear()}`
}

function groupByStage(rows: SubStageRow[]): Record<string, SubStageRow[]> {
  const grouped: Record<string, SubStageRow[]> = {}
  for (const row of rows) {
    if (row.calls > 0) {
      if (!grouped[row.stage]) grouped[row.stage] = []
      grouped[row.stage].push(row)
    }
  }
  return grouped
}

function stageColor(stage: string): string {
  const map: Record<string, string> = {
    'Counseled':              '#d1fae5',
    'No Contact Established': '#fef3c7',
    'Not Eligible':           '#dbeafe',
    'Not Interested':         '#fee2e2',
    'Duplicate Lead':         '#ede9fe',
  }
  return map[stage] ?? '#f3f4f6'
}

function stageFontColor(stage: string): string {
  const map: Record<string, string> = {
    'Counseled':              '#065f46',
    'No Contact Established': '#92400e',
    'Not Eligible':           '#1e40af',
    'Not Interested':         '#991b1b',
    'Duplicate Lead':         '#5b21b6',
  }
  return map[stage] ?? '#374151'
}

function buildTable(rows: SubStageRow[], col1: string, col2: string): string {
  const grouped = groupByStage(rows)
  if (Object.keys(grouped).length === 0) return ''

  const grandTotal = rows.reduce((s, r) => s + r.calls, 0)

  let tableRows = ''
  for (const [stage, stageRows] of Object.entries(grouped)) {
    const stageTotal = stageRows.reduce((s, r) => s + r.calls, 0)
    const bg = stageColor(stage)
    const fg = stageFontColor(stage)

    stageRows.forEach((row, i) => {
      tableRows += `
        <tr>
          ${i === 0 ? `
            <td rowspan="${stageRows.length}" style="
              background:${bg}; color:${fg};
              font-size:12px; font-weight:600; padding:8px 12px;
              border:1px solid #e5e7eb; vertical-align:middle;
              white-space:nowrap; border-radius:4px 0 0 4px;
            ">${stage}</td>` : ''}
          <td style="font-size:13px;padding:7px 12px;border:1px solid #e5e7eb;color:#374151;">${row.subStage}</td>
          <td style="font-size:13px;padding:7px 12px;border:1px solid #e5e7eb;text-align:center;font-weight:600;color:#111827;">${row.calls}</td>
        </tr>`
    })
    tableRows += `
      <tr style="background:#f9fafb;">
        <td style="font-size:12px;font-weight:700;padding:6px 12px;border:1px solid #e5e7eb;color:#6b7280;text-align:right;" colspan="2">${stage} Total</td>
        <td style="font-size:13px;font-weight:700;padding:6px 12px;border:1px solid #e5e7eb;text-align:center;color:#111827;">${stageTotal}</td>
      </tr>`
  }

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;font-family:Inter,Arial,sans-serif;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;border:1px solid #e5e7eb;color:#6b7280;text-align:left;">${col1}</th>
          <th style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;border:1px solid #e5e7eb;color:#6b7280;text-align:left;">${col2}</th>
          <th style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:9px 12px;border:1px solid #e5e7eb;color:#6b7280;text-align:center;">Calls</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr style="background:#1e293b;">
          <td colspan="2" style="font-size:13px;font-weight:700;padding:9px 12px;border:1px solid #334155;color:#f8fafc;text-align:right;">Grand Total</td>
          <td style="font-size:14px;font-weight:800;padding:9px 12px;border:1px solid #334155;text-align:center;color:#f8fafc;">${grandTotal}</td>
        </tr>
      </tbody>
    </table>`
}

function bulletList(items: string[]): string {
  return items
    .filter(Boolean)
    .map(i => `<li style="margin-bottom:5px;color:#374151;">${i}</li>`)
    .join('')
}

function sectionDivider(title: string): string {
  return `
    <tr>
      <td style="padding:24px 0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-bottom:2px solid #e5e7eb;padding-bottom:8px;">
              <span style="font-size:15px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.06em;">${title}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

export function buildEmailHTML(data: EODFormData): string {
  const formattedDate = formatDate(data.reportDate)
  const hasAppRows   = data.appRows.some(r => r.calls > 0)
  const hasLMRows    = data.lmRows.some(r => r.calls > 0)
  const hasSheetRows = data.sheetRows.some(r => r.calls > 0)
  const hasPhone     = data.phoneSummary.totalCallsToday || data.phoneSummary.totalOutgoing || data.phoneSummary.totalTalkTime
  const appInsights  = data.appInsights.filter(Boolean)
  const lmInsights   = data.lmInsights.filter(Boolean)
  const sheetInsights = data.sheetInsights.filter(Boolean)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>EOD Report – ${formattedDate}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1e40af;padding:28px 36px;">
              <p style="margin:0;font-size:11px;font-weight:600;color:#93c5fd;text-transform:uppercase;letter-spacing:.1em;">Masters Union</p>
              <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#ffffff;">End of Day Report</h1>
              <p style="margin:6px 0 0;font-size:14px;color:#bfdbfe;">${formattedDate}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Greeting -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0;font-size:14px;color:#374151;">Hi Siddharth,</p>
                    <p style="margin:8px 0 0;font-size:14px;color:#374151;">
                      Sharing my <strong>End of Day</strong> report for <strong>${formattedDate}</strong>.
                    </p>
                    ${data.introText ? `<p style="margin:8px 0 0;font-size:14px;color:#374151;">${data.introText}</p>` : ''}
                  </td>
                </tr>

                <!-- Meta chips -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <span style="display:inline-block;background:#dbeafe;color:#1e40af;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin-right:6px;">👤 ${data.counsellorName}</span>
                  </td>
                </tr>

                ${hasPhone ? `
                ${sectionDivider('Call Statistics')}
                <tr>
                  <td style="padding-bottom:20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        ${data.phoneSummary.totalCallsToday ? `
                        <td style="text-align:center;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:12px 20px;margin-right:10px;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#0369a1;">${data.phoneSummary.totalCallsToday}</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#0284c7;font-weight:600;">Total Calls</p>
                        </td>
                        <td width="10"></td>` : ''}
                        ${data.phoneSummary.totalOutgoing ? `
                        <td style="text-align:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px 20px;margin-right:10px;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#15803d;">${data.phoneSummary.totalOutgoing}</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#16a34a;font-weight:600;">Connected</p>
                        </td>
                        <td width="10"></td>` : ''}
                        ${data.phoneSummary.totalTalkTime ? `
                        <td style="text-align:center;background:#fdf4ff;border:1px solid #e9d5ff;border-radius:10px;padding:12px 20px;">
                          <p style="margin:0;font-size:20px;font-weight:800;color:#7e22ce;">${data.phoneSummary.totalTalkTime}</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#9333ea;font-weight:600;">Talk Time</p>
                        </td>` : ''}
                      </tr>
                    </table>
                  </td>
                </tr>` : ''}

                ${hasAppRows ? `
                ${sectionDivider('App Starts Calling')}
                <tr><td>${buildTable(data.appRows, 'Application Stage', 'Application Sub Stage')}</td></tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.8;">
                      <li style="color:#374151;"><strong>Counselled:</strong> ${data.appSummary.counseled}</li>
                      <li style="color:#374151;"><strong>No Contact Established:</strong> ${data.appSummary.noContactEstablished}</li>
                      <li style="color:#374151;"><strong>Not Eligible:</strong> ${data.appSummary.notEligible}</li>
                      <li style="color:#374151;"><strong>Not Interested:</strong> ${data.appSummary.notInterested}</li>
                      <li style="color:#111827;"><strong>Total Calls Made:</strong> ${data.appSummary.grandTotal}</li>
                    </ul>
                  </td>
                </tr>` : ''}

                ${hasLMRows ? `
                ${sectionDivider('Lead Manager Calling')}
                <tr><td>${buildTable(data.lmRows, 'Lead Stage', 'Lead Sub Stage')}</td></tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.8;">
                      <li style="color:#374151;"><strong>Counselled Follow ups:</strong> ${data.lmSummary.counseled}</li>
                      <li style="color:#374151;"><strong>No Contact Established:</strong> ${data.lmSummary.noContactEstablished}</li>
                      <li style="color:#374151;"><strong>Not Eligible:</strong> ${data.lmSummary.notEligible}</li>
                      <li style="color:#374151;"><strong>Not Interested:</strong> ${data.lmSummary.notInterested}</li>
                      ${data.lmSummary.duplicateLeads ? `<li style="color:#374151;"><strong>Duplicate Leads:</strong> ${data.lmSummary.duplicateLeads}</li>` : ''}
                      <li style="color:#111827;"><strong>Total Calls Made:</strong> ${data.lmSummary.grandTotal}</li>
                    </ul>
                  </td>
                </tr>` : ''}

                ${hasSheetRows ? `
                ${sectionDivider('Sheet Callings')}
                <tr><td>${buildTable(data.sheetRows, 'Lead Stage', 'Lead Sub Stage')}</td></tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.8;">
                      <li style="color:#374151;"><strong>Counselled:</strong> ${data.sheetSummary.counseled}</li>
                      <li style="color:#374151;"><strong>No Contact Established:</strong> ${data.sheetSummary.noContactEstablished}</li>
                      <li style="color:#374151;"><strong>Not Eligible:</strong> ${data.sheetSummary.notEligible}</li>
                      <li style="color:#374151;"><strong>Not Interested:</strong> ${data.sheetSummary.notInterested}</li>
                      ${data.sheetSummary.duplicateLeads ? `<li style="color:#374151;"><strong>Duplicate Leads:</strong> ${data.sheetSummary.duplicateLeads}</li>` : ''}
                      <li style="color:#111827;"><strong>Total Calls Made:</strong> ${data.sheetSummary.grandTotal}</li>
                    </ul>
                  </td>
                </tr>` : ''}

                ${appInsights.length ? `
                ${sectionDivider('App Starts — Key Insights')}
                <tr>
                  <td style="padding-bottom:16px;">
                    <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.9;">
                      ${bulletList(appInsights)}
                    </ul>
                  </td>
                </tr>` : ''}

                ${lmInsights.length ? `
                ${sectionDivider('Lead Manager — Key Insights')}
                <tr>
                  <td style="padding-bottom:16px;">
                    <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.9;">
                      ${bulletList(lmInsights)}
                    </ul>
                  </td>
                </tr>` : ''}

                ${sheetInsights.length ? `
                ${sectionDivider('Sheet Callings — Key Insights')}
                <tr>
                  <td style="padding-bottom:16px;">
                    <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.9;">
                      ${bulletList(sheetInsights)}
                    </ul>
                  </td>
                </tr>` : ''}

                ${data.overallSummary ? `
                <tr>
                  <td style="padding-top:8px;padding-bottom:4px;">
                    <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">${data.overallSummary}</p>
                  </td>
                </tr>` : ''}

                <!-- Sign off -->
                <tr>
                  <td style="padding-top:28px;border-top:1px solid #f3f4f6;margin-top:20px;">
                    <p style="margin:0;font-size:13px;color:#6b7280;">Best Regards,</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111827;">${data.counsellorName}</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:16px 36px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                Sent automatically via EOD Report System · Masters Union
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildEmailSubject(data: EODFormData): string {
  // Constant per counsellor so all their reports thread into one conversation.
  return `EOD report ${data.counsellorName}`
}
