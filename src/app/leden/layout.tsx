import { isMember } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LangProviderShell } from '@/components/LangProviderShell'
import { LedenSidebarNav } from '@/components/LedenSidebarNav'
import { LedenHeader } from '@/components/LedenHeader'

export const dynamic = 'force-dynamic'

export default async function LedenLayout({ children }: { children: React.ReactNode }) {
  const memberSession = await isMember()

  if (!memberSession) {
    redirect('/signin')
  }

  return (
    <LangProviderShell>
      <div className="flex min-h-screen bg-[#f5f5f0]">
        {/* Sidebar */}
        <aside className="hidden w-[260px] flex-col border-r border-gray-200 bg-white lg:flex">
          <LedenSidebarNav />
        </aside>

        {/* Mobile header */}
        <LedenHeader />

        {/* Main content */}
        <main className="min-h-screen flex-1 pt-14 lg:pt-0">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </LangProviderShell>
  )
}
