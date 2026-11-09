import * as Linking from 'expo-linking';

/**
 * Retourne l'URL de base de retour vers l'application :
 * - En Expo Go : exp://<host>:8081/--
 * - En build standalone : jcvpay://
 * - Sur Web : http://localhost:8081
 */
export function getPaymentReturnBaseUrl(): string {
  try {
    return Linking.createURL('/');
  } catch {
    return 'jcvpay://';
  }
}

/**
 * Extrait l'identifiant de reçu depuis une URL de retour (deep link ou web).
 */
export function extractReceiptIdFromReturnUrl(
  url: string,
  fallback?: string
): string | null {
  if (!url) return fallback ?? null;

  const recuMatch = url.match(/\/recu\/([^/?&#]+)/i);
  if (recuMatch?.[1] && recuMatch[1] !== 'recu') {
    return decodeURIComponent(recuMatch[1]);
  }

  try {
    const parsed = new URL(url.replace(/^jcvpay:/, 'http://jcvpay.local'));
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const recuIdx = pathParts.findIndex((p) => p.toLowerCase() === 'recu');
    if (recuIdx >= 0 && pathParts[recuIdx + 1]) {
      return decodeURIComponent(pathParts[recuIdx + 1]);
    }
  } catch {
    // jcvpay:// ou URL non standard
  }

  return fallback ?? null;
}

export function returnUrlIndicatesError(url: string): boolean {
  return (
    url.includes('error=1') ||
    url.includes('status=error') ||
    url.includes('&error') ||
    /[?&]error(=|$)/i.test(url)
  );
}
