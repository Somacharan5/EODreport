import { google, gmail_v1 } from 'googleapis'

interface SendEmailOptions {
  to: string[]
  subject: string
  htmlBody: string
  senderName: string
}

interface ThreadRef {
  threadId: string
  inReplyTo: string   // Message-ID of the latest message in the thread
  references: string  // full References chain to preserve threading
}

function makeRawEmail(opts: SendEmailOptions, thread?: ThreadRef): string {
  const toLine = opts.to.join(', ')
  const messageParts = [
    `From: "${opts.senderName}" <${process.env.GMAIL_SENDER_EMAIL}>`,
    `To: ${toLine}`,
    `Subject: ${opts.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
  ]

  // Reply headers so the message threads in EVERY recipient's mailbox,
  // not just the sender's (threadId only affects the sender's account).
  if (thread) {
    messageParts.push(`In-Reply-To: ${thread.inReplyTo}`)
    messageParts.push(`References: ${thread.references}`)
  }

  messageParts.push('')
  messageParts.push(Buffer.from(opts.htmlBody).toString('base64'))

  return Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Find the most recent message that shares this exact subject, so a new report
// can be posted as a reply inside the same conversation.
async function findExistingThread(
  gmail: gmail_v1.Gmail,
  subject: string,
): Promise<ThreadRef | undefined> {
  try {
    const list = await gmail.users.messages.list({
      userId: 'me',
      q: `subject:"${subject.replace(/"/g, '')}"`,
      maxResults: 1,
    })

    const hit = list.data.messages?.[0]
    if (!hit?.id) return undefined

    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: hit.id,
      format: 'metadata',
      metadataHeaders: ['Message-ID', 'References'],
    })

    const headers = msg.data.payload?.headers ?? []
    const get = (name: string) =>
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ''

    const messageId = get('Message-ID')
    if (!msg.data.threadId || !messageId) return undefined

    const priorRefs = get('References')
    return {
      threadId: msg.data.threadId,
      inReplyTo: messageId,
      references: priorRefs ? `${priorRefs} ${messageId}` : messageId,
    }
  } catch {
    // If the lookup fails for any reason, fall back to sending a fresh email.
    return undefined
  }
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

  const thread = await findExistingThread(gmail, opts.subject)
  const raw = makeRawEmail(opts, thread)

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: thread ? { raw, threadId: thread.threadId } : { raw },
  })
}
