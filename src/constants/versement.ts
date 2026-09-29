import { MoyenPaiement } from '@/types';

export const VERSEMENT_CHANNELS: {
  id: MoyenPaiement;
  name: string;
  how: string;
  detail: string;
  icon: 'water-outline' | 'phone-portrait-outline' | 'business-outline' | 'cash-outline';
}[] = [
  {
    id: 'WAVE',
    name: 'Wave',
    how: 'Envoyez depuis votre appli Wave vers le compte de l église.',
    detail: '07 01 23 45 67 — Église JCV',
    icon: 'water-outline',
  },
  {
    id: 'ORANGE_MONEY',
    name: 'Orange Money',
    how: 'Faites un dépôt Orange Money vers ce numéro.',
    detail: '07 01 23 45 67 — Trésorerie JCV',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'VIREMENT',
    name: 'Virement bancaire',
    how: 'Virez depuis votre banque. Indiquez votre nom en motif.',
    detail: 'NSIA — CI93 0001 0000 0000 1234 5678',
    icon: 'business-outline',
  },
  {
    id: 'ESPECES',
    name: 'Espèces au secrétariat',
    how: 'Déposez l enveloppe au secrétariat, avant ou après le culte.',
    detail: 'Guichet trésorerie — Temple de la Victoire',
    icon: 'cash-outline',
  },
];
