import ToernooiInschrijfForm from '@/components/toernooi/ToernooiInschrijfForm'
import { TOERNOOIEN } from '@/lib/toernooien'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inschrijven Clubtoernooi Tokyokai 27 november — Judoclub Michigami',
  description: 'Schrijf je Judoclub Michigami-lid in voor het clubtoernooi van Tokyokai in Oostkapelle.',
}

export default function Tokyokai2026Page() {
  // deadlineShintai is alleen interne clubinfo — niet meesturen naar de client
  const { deadlineShintai: _intern, ...cfg } = TOERNOOIEN['tokyokai-clubtoernooi-2026']
  return <ToernooiInschrijfForm cfg={cfg} slug='tokyokai-clubtoernooi-2026' headerEmoji='🏆' />
}
