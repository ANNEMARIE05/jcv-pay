import { ImageSourcePropType } from 'react-native';
import { MoyenPaiement } from '@/types';

export interface VersementChannel {
  id: MoyenPaiement;
  name: string;
  badge?: string;
  how: string;
  detail: string;
  isOnline: boolean;
  logoSource?: ImageSourcePropType;
  secondaryLogoSource?: ImageSourcePropType;
  brandColor: string;
  brandLightBg: string;
  icon: 'water-outline' | 'phone-portrait-outline' | 'business-outline' | 'cash-outline' | 'card-outline';
}

export const VERSEMENT_CHANNELS: VersementChannel[] = [
  {
    id: 'WAVE',
    name: 'Wave',
    badge: 'Populaire',
    how: 'Paiement direct et sécurisé via Wave Mobile Money. Reçu officiel généré automatiquement.',
    detail: 'Wave Mobile Money CI • 0% frais',
    isOnline: true,
    logoSource: require('@/assets/images/payment/wave.png'),
    brandColor: '#1DC7EA',
    brandLightBg: '#E0F7FD',
    icon: 'water-outline',
  },
  {
    id: 'ORANGE_MONEY',
    name: 'Orange Money',
    badge: 'Instantané',
    how: 'Paiement sécurisé via Orange Money CI avec code d’autorisation ou validation mobile.',
    detail: 'Orange Money Côte d’Ivoire',
    isOnline: true,
    logoSource: require('@/assets/images/payment/orange.png'),
    brandColor: '#FF6600',
    brandLightBg: '#FFF2E8',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'MTN_MOMO',
    name: 'MTN MoMo',
    badge: 'Instantané',
    how: 'Paiement direct et sécurisé via MTN Mobile Money. Approbation par push ou code USSD.',
    detail: 'MTN Mobile Money Côte d’Ivoire',
    isOnline: true,
    logoSource: require('@/assets/images/payment/mtn.png'),
    brandColor: '#FFCC00',
    brandLightBg: '#FFFBE6',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'MOOV_MONEY',
    name: 'Moov Money',
    badge: 'Instantané',
    how: 'Paiement sécurisé via Moov Money Flooz CI avec validation rapide sur votre téléphone.',
    detail: 'Moov Money Flooz CI',
    isOnline: true,
    logoSource: require('@/assets/images/payment/moov.png'),
    brandColor: '#004F9F',
    brandLightBg: '#EBF3FA',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'CARTE_BANCAIRE',
    name: 'Carte bancaire',
    badge: '3D-Secure',
    how: 'Règlement sécurisé par carte bancaire Visa ou Mastercard avec validation bancaire 3D-Secure.',
    detail: 'Visa / Mastercard (toutes banques)',
    isOnline: true,
    logoSource: require('@/assets/images/payment/mastercard.png'),
    brandColor: '#1E293B',
    brandLightBg: '#F1F5F9',
    icon: 'card-outline',
  },
  {
    id: 'ESPECES',
    name: 'Paiement en espèces',
    how: 'Vous déclarez un paiement en espèces déjà remis ou à remettre au secrétariat. La trésorerie confirmera la réception.',
    detail: 'Espèces — guichet trésorerie, Temple de la Victoire',
    isOnline: false,
    brandColor: '#16A34A',
    brandLightBg: '#F0FDF4',
    icon: 'cash-outline',
  },
];

const MOYEN_PAIEMENT_LABELS: Record<MoyenPaiement, string> = {
  WAVE: 'Wave Mobile Money',
  ORANGE_MONEY: 'Orange Money',
  MTN_MOMO: 'MTN Mobile Money',
  MOOV_MONEY: 'Moov Money',
  CARTE_BANCAIRE: 'Carte bancaire',
  VIREMENT: 'Virement bancaire',
  ESPECES: 'Paiement en espèces',
};

const channelById = new Map(VERSEMENT_CHANNELS.map((c) => [c.id, c]));

export function getVersementChannel(moyen: MoyenPaiement): VersementChannel | undefined {
  return channelById.get(moyen);
}

export function formatMoyenPaiementLabel(moyen: MoyenPaiement | string): string {
  if (moyen in MOYEN_PAIEMENT_LABELS) {
    return MOYEN_PAIEMENT_LABELS[moyen as MoyenPaiement];
  }
  return String(moyen).replace(/_/g, ' ');
}

export function isCashPayment(moyen: MoyenPaiement | string): boolean {
  return moyen === 'ESPECES';
}
