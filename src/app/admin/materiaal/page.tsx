import MateriaalClient from './MateriaalClient'

export const dynamic = 'force-dynamic'

// Inventaris (gezaaid uit OneDrive 'inventaris 2026.xlsx') + materiaalgerechtigde
// API's onder /api/admin2/inventory. Alle auth zit in die routes zelf.
export default function MateriaalPage() {
  return <MateriaalClient />
}
