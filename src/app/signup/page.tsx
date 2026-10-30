'use client'

import Link from 'next/link'
import { SeasonalLogo } from '@/components/SeasonalLogo'
import { useT } from '@/i18n/LangContext'
import { LangToggle } from '@/components/LangToggle'
import { LangProvider } from '@/i18n/LangContext'
import { T } from '@/components/T'

/**
 * Openbare registratie is uitgeschakeld: accounts worden door de club
 * aangemaakt (na inschrijfformulier + goedkeuring, of door de admin).
 * Deze pagina legt dat uit en verwijst door naar het inschrijfformulier.
 */
export default function SignUpPage() {
  return (
    <LangProvider>
      <SignUpInner />
    </LangProvider>
  )
}

function SignUpInner() {
  const { t } = useT()
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f0] px-4">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#a90000]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#a90000]/10 blur-3xl" />

      <div className="absolute top-6 right-6 z-10">
        <LangToggle />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#a90000] hover:text-[#8c0000]">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M9.793 14.707a1 1 0 010-1.414L12.179 11H5a1 1 0 110-2h7.179l-2.386-2.386a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {t('Terug naar website')}
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-lg border border-white/60 bg-white/90 p-8 shadow-[0_8px_40px_-8px_rgba(169,0,0,0.18)] backdrop-blur-xl text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-[#fdf6f6] to-white p-1 shadow-sm ring-4 ring-[#a90000]/10 mx-auto">
          <SeasonalLogo alt="Judoclub Michigami" className="h-16 w-16 object-contain rounded-full" />
        </div>

        <h1 className="font-display text-2xl font-bold text-[#2a2a2a]">{t('Account aanmaken?')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          <T k="Accounts worden door" /> <strong>Judoclub Michigami</strong> <T k="aangemaakt — zo houden we onze ledenadministratie overzichtelijk." />
        </p>
        <ol className="mt-4 space-y-2 text-left text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#a90000] text-[11px] font-bold text-white">1</span>
            <T k="Schrijf je in via het" /> <strong><T k="inschrijfformulier" /></strong>.
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#a90000] text-[11px] font-bold text-white">2</span>
            <T k="De club controleert je inschrijving en keurt goed." />
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#a90000] text-[11px] font-bold text-white">3</span>
            <T k="Je ontvangt een" /> <strong><T k="e-mail met je tijdelijk wachtwoord" /></strong> — <T k="en dat is je account." />
          </li>
        </ol>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/inschrijven"
            className="flex items-center justify-center rounded-lg bg-[#a90000] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#8c0000] shadow-sm"
          >
            {t('Naar het inschrijfformulier')}
          </Link>
          <Link href="/signin" className="text-sm font-medium text-[#a90000] hover:text-[#8c0000]">
            {t('Al een account? Inloggen')}
          </Link>
        </div>
      </div>
    </div>
  )
}