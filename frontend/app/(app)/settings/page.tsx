import { DEMO_MODE } from '@/lib/demo';
import { getCurrentUser } from '@/lib/server/api';
import { SettingsView } from './SettingsView';

export default async function SettingsPage() {
  const user = DEMO_MODE ? null : await getCurrentUser();
  return <SettingsView user={user} />;
}
