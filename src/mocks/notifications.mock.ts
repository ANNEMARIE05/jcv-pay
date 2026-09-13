import { NotificationItem } from '@/types';

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    titre: 'Paiement confirmé avec succès',
    message: 'Votre contribution de 50 000 FCFA pour la Dîme de Septembre a été validée. Reçu disponible.',
    date: 'Il y a 2 heures',
    lue: false,
    type: 'PAIEMENT',
    referenceId: 'rec-01',
  },
  {
    id: 'notif-2',
    titre: 'Rappel d échéance cotisation',
    message: 'La cotisation annuelle 2026 arrive à échéance le 30 Septembre. Reste à régler : 25 000 FCFA.',
    date: 'Hier à 14:15',
    lue: false,
    type: 'ECHEANCE',
  },
  {
    id: 'notif-3',
    titre: 'Avancement du Grand Sanctuaire',
    message: 'La collecte a atteint 75% de son objectif ! Merci pour votre généreuse implication fraternelle.',
    date: 'Il y a 3 jours',
    lue: true,
    type: 'PROJET',
    referenceId: 'proj-01',
  },
  {
    id: 'notif-4',
    titre: 'Inscription validée - Convention',
    message: 'Votre place pour la Convention Nationale des Familles 2026 est pré-réservée.',
    date: 'Il y a 5 jours',
    lue: true,
    type: 'EVENEMENT',
    referenceId: 'ev-01',
  },
  {
    id: 'notif-5',
    titre: 'Culte spécial d actions de grâce',
    message: 'Rendez-vous ce dimanche dès 08h30 pour la célébration de rentrée pastorale.',
    date: 'La semaine dernière',
    lue: true,
    type: 'INFO',
  },
];
