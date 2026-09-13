import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function RootIndex() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/splash" />;
  }

  return <Redirect href="/(tabs)" />;
}
