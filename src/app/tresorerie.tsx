import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { isStaff } from '@/constants/roles';

/**
 * Ancienne interface trésorerie (doublon de l’accueil admin + onglet Transactions).
 * Redirection vers l’espace unifié.
 */
export default function TresorerieRedirectScreen() {
  const user = useAuthStore((s) => s.user);
  if (!isStaff(user?.role)) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/(tabs)/recus" />;
}
