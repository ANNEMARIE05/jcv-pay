import { MoyenPaiement } from '@/types';

export const VERSEMENT_CHANNELS: {
  id: MoyenPaiement;
  name: string;
  how: string;
  detail: string;
  geniusPay: boolean;
  icon: 'water-outline' | 'phone-portrait-outline' | 'business-outline' | 'cash-outline' | 'card-outline';
}[] = [
  {
    id: 'WAVE',
    name: 'Wave',
    how: 'Vous payez sur la page sécurisée GeniusPay, puis revenez dans l’application.',
    detail: 'Encaissement immédiat',
    geniusPay: true,
    icon: 'water-outline',
  },
  {
    id: 'ORANGE_MONEY',
    name: 'Orange Money',
    how: 'GeniusPay ouvre Orange Money. Le reçu se confirme dès que le paiement aboutit.',
    detail: 'Encaissement immédiat',
    geniusPay: true,
    icon: 'phone-portrait-outline',
  },
  {
    id: 'MTN_MOMO',
    name: 'MTN MoMo',
    how: 'Le paiement MTN passe par GeniusPay.',
    detail: 'Encaissement immédiat',
    geniusPay: true,
    icon: 'phone-portrait-outline',
  },
  {
    id: 'MOOV_MONEY',
    name: 'Moov Money',
    how: 'Le paiement Moov passe par GeniusPay.',
    detail: 'Encaissement immédiat',
    geniusPay: true,
    icon: 'phone-portrait-outline',
  },
  {
    id: 'CARTE_BANCAIRE',
    name: 'Carte bancaire',
    how: 'Visa ou Mastercard via la page GeniusPay.',
    detail: 'Encaissement immédiat',
    geniusPay: true,
    icon: 'card-outline',
  },
  {
    id: 'VIREMENT',
    name: 'Virement bancaire',
    how: 'Virez depuis votre banque, puis déclarez. La trésorerie confirmera.',
    detail: 'NSIA — CI93 0001 0000 0000 1234 5678',
    geniusPay: false,
    icon: 'business-outline',
  },
  {
    id: 'ESPECES',
    name: 'Espèces au secrétariat',
    how: 'Déposez l’enveloppe au secrétariat, puis déclarez le versement.',
    detail: 'Guichet trésorerie — Temple de la Victoire',
    geniusPay: false,
    icon: 'cash-outline',
  },
];
