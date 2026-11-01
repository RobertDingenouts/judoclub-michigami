import ToernooiInschrijfForm from './ToernooiInschrijfForm'
import { TOERNOOIEN } from '@/lib/toernooien'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inschrijven Kersttoernooi Shintai 13 december — Judoclub Michigami',
  description: 'Schrijf je Judoclub Michigami-lid in voor het kersttoernooi van Sportschool Shintai in Halsteren.',
}

export default function Kersttoernooi2026Page() {
  const cfg = TOERNOOIEN['kersttoernooi-shintai-2026']
  return <ToernooiInschrijfForm cfg={cfg} slug='kersttoernooi-shintai-2026' />
}
