import { Evenement } from '@/types';

export const mockEvenements: Evenement[] = [
  {
    id: 'ev-01',
    titre: 'Convention Nationale des Familles 2026',
    description:
      'Trois jours intenses d enseignements bibliques, ateliers de couples, louange prophétique et partages fraternels.',
    date: '25-27 Septembre 2026',
    heure: '09:00 - 18:00',
    lieu: 'Palais de la Culture, Salle Anoumabo',
    tarif: 15000,
    placesDisponibles: 1500,
    placesReservees: 1120,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    estInscrit: true,
    statutPaiement: 'EN_ATTENTE',
    intervenant: 'Pasteur Samuel Osei & Invités Internationaux',
  },
  {
    id: 'ev-02',
    titre: 'Nuit de Traversée & Grandes Louanges',
    description:
      'Veillée spéciale de prière, proclamation de victoires et intercession pour les nations.',
    date: '31 Octobre 2026',
    heure: '21:00 - 05:00',
    lieu: 'Église Jésus Christ Victoire, Temple Central',
    tarif: 0,
    placesDisponibles: 3000,
    placesReservees: 1890,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    estInscrit: false,
    intervenant: 'Chœur Céleste & Ministres Invités',
  },
  {
    id: 'ev-03',
    titre: 'Séminaire des Responsables & Leaders',
    description:
      'Formation en leadership serviteur, gestion des finances ecclésiastiques et intégrité administrative.',
    date: '14 Novembre 2026',
    heure: '08:30 - 16:30',
    lieu: 'Salle Polyvalente Bethesda',
    tarif: 10000,
    placesDisponibles: 200,
    placesReservees: 145,
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    estInscrit: false,
    intervenant: 'Pasteur Samuel & Conseil Pastoral',
  },
];
