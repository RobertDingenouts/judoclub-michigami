import ToernooiInschrijfForm from '@/components/toernooi/ToernooiInschrijfForm'
import { TOERNOOIEN } from '@/lib/toernooien'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inschrijven Pre-tornooi Yoshi-Kwai 21 februari — Judoclub Michigami',
  description: 'Schrijf je Judoclub Michigami-lid in voor het educatieve pre-tornooi van JC. Yoshi-Kwai in Borgerhout.',
}

export default function PreTornooi2027Page() {
  // deadlineShintai (7 feb bij Yoshi-Kwai) is interne clubinfo — niet naar de client
  const { deadlineShintai: _intern, ...cfg } = TOERNOOIEN['pre-tornooi-yoshikwai-2027']
  return <ToernooiInschrijfForm cfg={cfg} slug='pre-tornooi-yoshikwai-2027' headerEmoji='🌟' />
}
