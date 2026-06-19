import { NextRequest, NextResponse } from 'next/server'
import { EODFormData, COUNSELLOR_EMAILS } from '@/lib/types'
import { buildEmailHTML, buildEmailSubject } from '@/lib/emailTemplate'
import { sendViaGmail } from '@/lib/gmail'

const RECIPIENTS = [
  'siddharth.garg@mastersunion.org',
  'soma.charan@mastersunion.org',
]

export async function POST(req: NextRequest) {
  try {
    const data: EODFormData = await req.json()

    // Basic validation
    if (!data.counsellorName?.trim()) {
      return NextResponse.json({ error: 'Counsellor name is required.' }, { status: 400 })
    }
    if (!data.reportDate) {
      return NextResponse.json({ error: 'Report date is required.' }, { status: 400 })
    }

    const htmlBody = buildEmailHTML(data)
    const subject  = buildEmailSubject(data)

    // Also send to the counsellor's own inbox so they keep their mail trail.
    const counsellorEmail = COUNSELLOR_EMAILS[data.counsellorName.trim()]
    const recipients = counsellorEmail
      ? [...RECIPIENTS, counsellorEmail]
      : RECIPIENTS

    await sendViaGmail({
      to: recipients,
      subject,
      htmlBody,
      senderName: `${data.counsellorName} (EOD Report)`,
    })

    return NextResponse.json({ success: true, message: 'Report sent successfully!' })
  } catch (err: unknown) {
    console.error('[send-report]', err)
    const message = err instanceof Error ? err.message : 'Failed to send report.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
