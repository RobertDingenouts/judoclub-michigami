// ISR: revalidate every hour to pick up static data changes (agenda, technieken, less)
export const revalidate = 3600;

import MichigamiApp from './ClientPage';

export default function Page() {
  return <MichigamiApp />;
}
