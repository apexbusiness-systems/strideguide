import { AuthPage as AuthComponent } from "@/components/auth/AuthPage";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  return <AuthComponent onAuthSuccess={onAuthSuccess} />;
}