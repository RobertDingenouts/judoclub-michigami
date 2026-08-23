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
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
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

/** Welkomstmail na registratie, met verificatielink */
export function buildVerificationEmail(name: string, token: string): { subject: string; html: string } {
  const url = `${BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
  const content = `
    <p>Beste ${name},</p>
    <p>Welkom bij ${APP_NAME}! Bedankt voor je inschrijving. Bevestig je e-mailadres om volledig toegang te krijgen tot je account.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#a90000;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block;">Bevestig mijn e-mailadres</a>
    </p>
    <p>Of kopieer deze link in je browser:<br/><span style="color:#a90000;word-break:break-all;">${url}</span></p>
    <p style="color:#888;font-size:13px;">Deze link is 24 uur geldig.</p>
  `
  return { subject: `Bevestig je e-mailadres bij ${APP_NAME}`, html: baseTemplate(content) }
}

/** Mail naar het NIEUWE adres bij wijziging: klik om te bevestigen */
export function buildEmailChangeConfirmEmail(name: string, newEmail: string, token: string): { subject: string; html: string } {
  const url = `${BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
  const content = `
    <p>Beste ${name},</p>
    <p>Je hebt je e-mailadres gewijzigd naar <strong>${newEmail}</strong>. Klik op de knop om deze wijziging te bevestigen.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#a90000;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block;">Wijziging bevestigen</a>
    </p>
    <p style="color:#888;font-size:13px;">Deze link is 24 uur geldig. Herken je deze wijziging niet? Neem dan contact op met de club.</p>
  `
  return { subject: `Bevestig je nieuwe e-mailadres bij ${APP_NAME}`, html: baseTemplate(content) }
}

/** Beveiligingsmelding naar het OUDE adres bij wijziging */
export function buildEmailChangeNoticeEmail(name: string, newEmail: string): { subject: string; html: string } {
  const content = `
    <p>Beste ${name},</p>
    <p>Je e-mailadres bij ${APP_NAME} is zojuist gewijzigd naar <strong>${newEmail}</strong>.</p>
    <p>Als jij dit zelf hebt gedaan, hoef je niets te doen — je logt voortaan in met het nieuwe adres zodra je het hebt bevestigd.</p>
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
 * Gecombineerde welkomstmail voor nieuw aangemaakte accounts: tijdelijk
 * wachtwoord + e-mailverificatielink in één mail. Gebruikt door beide
 * admin-flows (inschrijving goedkeuren + lid toevoegen) zodat de nieuwe
 * lid meteen inlogt én zijn e-mail bevestigt.
 */
export function buildAccountWelcomeEmail(name: string, email: string, tempPassword: string, verifyToken: string): { subject: string; html: string } {
  const url = `${BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`
  const content = `
    <p>Beste ${name},</p>
    <p>Welkom bij ${APP_NAME}! Er is een account voor je aangemaakt. Je kunt inloggen met:</p>
    <p style="background:#f5f5f0;padding:12px 16px;border-radius:8px;">
      <strong>E-mail:</strong> ${email}<br/>
      <strong>Tijdelijk wachtwoord:</strong> ${tempPassword}
    </p>
    <p>Voordat je profiel volledig werkt, bevestig je e-mailadres:</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${url}" style="background:#a90000;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;display:inline-block;">Bevestig mijn e-mailadres</a>
    </p>
    <p style="color:#888;font-size:13px;">Deze link is 24 uur geldig. Klik daarna in op "Inloggen" met het tijdelijk wachtwoord en stel direct je eigen wachtwoord in.</p>
  `
  return { subject: `Welkom bij ${APP_NAME} — inloggegevens & e-mail bevestigen`, html: baseTemplate(content) }
}
