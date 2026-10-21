// E-mail verzendlaag voor Judoclub Michigami
// Gebruikt Strato SMTP via omgevingsvariabelen (NOOIT credentials in code).
// Door Vercel env vars in te stellen werkt dit zowel lokaal als in productie.

import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  subject: string
  html: string
  text?: string
}

const FROM_ADDRESS = process.env.MAIL_FROM || 'webmaster@judoclubmichigami.nl'
const APP_NAME = 'Judoclub Michigami'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://judoclubmichigami.nl'

// Transporter wordt lazy geïnitialiseerd (één keer per runtime)
// nodemailer 10: type heet Mail i.p.v. Transporter — ReturnType houdt dit versie-onafhankelijk
type MailTransporter = ReturnType<typeof nodemailer.createTransport>
let transporter: MailTransporter | null = null

function getTransporter(): MailTransporter {
  if (transporter) return transporter

  const host = process.env.MAIL_HOST
  const port = Number(process.env.MAIL_PORT || 465)
  const user = process.env.MAIL_USER
  const pass = process.env.MAIL_PASSWORD

  if (!host || !user || !pass) {
    throw new Error(
      'Mailconfiguratie ontbreekt. Stel MAIL_HOST, MAIL_PORT, MAIL_USER en MAIL_PASSWORD in als omgevingsvariabelen.'
    )
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS (secure:false + requireTLS)
    auth: { user, pass },
    // Strato kan traag zijn; ruime timeouts
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  })

  return transporter
}

/**
 * Verstuur een e-mail. Gooit bij een mislukte verzending een Error zodat de
 * aanroepende route dit kan afvangen en netjes melden aan de gebruiker.
 */
export async function sendEmail({ to, subject, html, text }: MailOptions): Promise<void> {
  const mailOptions = {
    from: `"${APP_NAME}" <${FROM_ADDRESS}>`,
    to,
    subject,
    text: text || html.replace(/<[^>]+>/g, ''),
    html,
  }

  await getTransporter().sendMail(mailOptions)
}

// ============================================================================
// Templates
// ============================================================================

function baseTemplate(content: string): string {
  return `<!doctype html>
<html lang="nl">
  <body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr><td style="background:#a90000;padding:20px 28px;">
            <span style="color:#ffffff;font-size:20px;font-weight:bold;">${APP_NAME}</span>
          </td></tr>
          <tr><td style="padding:28px;color:#2a2a2a;font-size:15px;line-height:1.6;">
            ${content}
          </td></tr>
          <tr><td style="padding:18px 28px;background:#faf7f7;color:#888;font-size:12px;border-top:1px solid #eee;">
            ${APP_NAME} · Nederland<br/>
            Dit bericht is automatisch gegenereerd, antwoord hier niet op.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

// ============================================================================
// E-mailadres wijziging: beveiligingsmelding naar het OUDE adres
// ============================================================================
export function buildEmailChangeNoticeEmail(name: string, newEmail: string): { subject: string; html: string } {
  const content = `
    <p>Beste ${name},</p>
    <p>Je e-mailadres bij ${APP_NAME} is zojuist gewijzigd naar <strong>${newEmail}</strong>.</p>
    <p>Je logt voortaan in met het nieuwe adres.</p>
    <p>Als jij dit <strong>niet</strong> hebt gedaan, neem dan direct contact op met de club, want iemand anders kan toegang hebben tot je account.</p>
  `
  return { subject: `Je e-mailadres bij ${APP_NAME} is gewijzigd`, html: baseTemplate(content) }
}

/** Wachtwoord-reset mail met tijdelijke link */
export function buildPasswordResetEmail(name: string, token: string): { subject: string; html: string } {
  const url = `${BASE_URL}/wachtwoord-reset?token=${encodeURIComponent(token)}`
  const content = `
    <p>Beste ${name},</p>
    <p>We ontvingen een verzoek om je wachtwoord te resetten. Klik op de knop om een nieuw wachtwoord in te stellen.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#a90000;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block;">Wachtwoord resetten</a>
    </p>
    <p style="color:#888;font-size:13px;">Deze link is 1 uur geldig en kan maar één keer gebruikt worden.</p>
    <p style="color:#888;font-size:13px;">Heb je geen reset aangevraagd? Negeer deze mail, je wachtwoord blijft ongewijzigd.</p>
  `
  return { subject: `Wachtwoord resetten — ${APP_NAME}`, html: baseTemplate(content) }
}

/** Bevestiging dat het wachtwoord is gewijzigd (beveiligingsmelding) */
export function buildPasswordChangedEmail(name: string): { subject: string; html: string } {
  const content = `
    <p>Beste ${name},</p>
    <p>Je wachtwoord bij ${APP_NAME} is zojuist gewijzigd.</p>
    <p>Als jij dit zelf hebt gedaan, hoef je niets te doen. Zo niet, neem dan direct contact op met de club.</p>
  `
  return { subject: `Je wachtwoord bij ${APP_NAME} is gewijzigd`, html: baseTemplate(content) }
}

/** Welkomstmail voor door admin aangemaakte accounts met tijdelijk wachtwoord */
export function buildAdminWelcomeEmail(name: string, email: string, tempPassword: string): { subject: string; html: string } {
  const content = `
    <p>Beste ${name},</p>
    <p>Er is een account voor je aangemaakt bij ${APP_NAME}. Je kunt inloggen met:</p>
    <p style="background:#f5f5f0;padding:12px 16px;border-radius:8px;">
      <strong>E-mail:</strong> ${email}<br/>
      <strong>Tijdelijk wachtwoord:</strong> ${tempPassword}
    </p>
    <p>Log direct in en stel je eigen wachtwoord in via "Profiel en instellingen".</p>
  `
  return { subject: `Welkom bij ${APP_NAME}`, html: baseTemplate(content) }
}

/**
 * Welkomstmail voor nieuw aangemaakte accounts: tijdelijk wachtwoord.
 * Gebruikt door beide admin-flows (inschrijving goedkeuren + lid toevoegen).
 */
export function buildAccountWelcomeEmail(name: string, email: string, tempPassword: string): { subject: string; html: string } {
  const content = `
    <p>Beste ${name},</p>
    <p>Welkom bij ${APP_NAME}! Er is een account voor je aangemaakt. Je kunt inloggen met:</p>
    <p style="background:#f5f5f0;padding:12px 16px;border-radius:8px;">
      <strong>E-mail:</strong> ${email}<br/>
      <strong>Tijdelijk wachtwoord:</strong> ${tempPassword}
    </p>
    <p>Log in via <strong>judoclubmichigami.nl</strong> en stel via "Profiel en instellingen" direct je eigen wachtwoord in.</p>
  `
  return { subject: `Welkom bij ${APP_NAME} — je inloggegevens`, html: baseTemplate(content) }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape user-input voor veilige inbedding in HTML (voorkomt kapotte mail/HTML-injectie). */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---------------------------------------------------------------------------
// Admin-notificatie: nieuwe inschrijving die goedgekeurd moet worden
// ---------------------------------------------------------------------------

const LOCATION_LABELS: Record<string, string> = {
  STeenbergen: 'Steenbergen',
  OUD_VOSSEMEER: 'Oud-Vossemeer',
}

const GROUP_LABELS: Record<string, string> = {
  VRI_JONG: 'Vrijdag 18:45–19:45 (6–9 jaar)',
  VRI_OUD: 'Vrijdag 19:45–20:45 (9+ jaar)',
  WOEN: 'Woensdagavond',
}

/**
 * Melding naar de admin dat er een nieuwe inschrijving is die goedkeuring
 * vereist. Toont de belangrijkste gegevens van de aanvrager + een directe
 * knop naar het admin dashboard.
 */
export function buildNewApplicationEmail(app: {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  location: string
  preferredGroup?: string | null
  isChild?: boolean
  parentName?: string | null
  parentEmail?: string | null
  parentPhone?: string | null
  medicalNotes?: string | null
}): { subject: string; html: string } {
  const loc = LOCATION_LABELS[app.location] || app.location
  const grp = app.preferredGroup
    ? GROUP_LABELS[app.preferredGroup] || app.preferredGroup
    : '—'

  const rows: Array<[string, string]> = [
    ['Naam', `${app.firstName} ${app.lastName}`.trim()],
    ['E-mail', app.email],
  ]
  if (app.phone) rows.push(['Telefoon', app.phone])
  rows.push(['Locatie', loc])
  rows.push(['Voorkeursgroep', grp])
  if (app.isChild) {
    rows.push(['Type', 'Kind-inschrijving'])
    if (app.parentName) rows.push(['Ouder / verzorger', app.parentName])
    if (app.parentEmail) rows.push(['E-mail ouder', app.parentEmail])
    if (app.parentPhone) rows.push(['Telefoon ouder', app.parentPhone])
  }
  if (app.medicalNotes) rows.push(['Medische notities', app.medicalNotes])

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
          <td style="padding:8px 0;color:#2a2a2a;font-size:14px;font-weight:bold;">${esc(value)}</td>
        </tr>`
    )
    .join('')

  const url = `${BASE_URL}/admin/inschrijvingen`
  const content = `
    <p>Er is een <strong>nieuwe inschrijving</strong> binnengekomen die je moet goedkeuren.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;border-radius:8px;padding:8px 16px;margin:16px 0;">
      ${tableRows}
    </table>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#a90000;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block;">Inschrijving goedkeuren</a>
    </p>
    <p style="color:#888;font-size:13px;">Klik op de knop om naar het admin dashboard te gaan. De inschrijving staat daar als "wachtend" tot je hem goedkeurt of afwijst.</p>
  `
  return {
    subject: `Nieuwe inschrijving: ${app.firstName} ${app.lastName} — goedkeuren`,
    html: baseTemplate(content),
  }
}
