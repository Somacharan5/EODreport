import { google } from 'googleapis'

interface SendEmailOptions {
  to: string[]
  subject: string
  htmlBody: string
  senderName: string
}

function makeRawEmail(opts: SendEmailOptions): string {
  const toLine = opts.to.join(', ')
  const messageParts = [
    `From: "${opts.senderName}" <${process.env.GMAIL_SENDER_EMAIL}>`,
    `To: ${toLine}`,
    `Subject: ${opts.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(opts.htmlBody).toString('base64'),
  ]
  return Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function sendViaGmail(opts: SendEmailOptions): Promise<void> {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })

  const gmail = google.gmail({ version: 'v1', auth })

  const raw = makeRawEmail(opts)

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
