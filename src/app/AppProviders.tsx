import AuthGate from '@/components/AuthGate';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthGate isAuthed={false}>{children}</AuthGate>;
}
