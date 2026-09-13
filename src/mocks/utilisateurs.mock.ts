import { Utilisateur } from '@/types';

export const mockMembre: Utilisateur = {
  id: 'usr-1042',
  nom: 'Rahman',
  prenom: 'Shahinur',
  email: 'shahinur.rahman@jcvictoire.org',
  telephone: '+225 07 48 92 10 33',
  matricule: 'JCV-MBR-1042',
  paroisse: 'Église Jésus Christ Victoire - Abidjan',
  departement: 'Membres actifs',
  role: 'MEMBRE',
  dateAdhesion: '15 Janvier 2023',
};

export const mockAdmin: Utilisateur = {
  id: 'usr-0001',
  nom: 'Kouassi',
  prenom: 'Awa',
  email: 'tresorier@jcvictoire.org',
  telephone: '+225 07 01 23 45 67',
  matricule: 'JCV-ADM-001',
  paroisse: 'Église Jésus Christ Victoire - Abidjan',
  departement: 'Trésorerie & Administration',
  role: 'TRESORIER',
  dateAdhesion: '10 Mars 2018',
};

export const mockUtilisateurs: Utilisateur[] = [
  mockMembre,
  {
    id: 'usr-0891',
    nom: 'Kouamé',
    prenom: 'Éric',
    email: 'eric.kouame@jcvictoire.org',
    telephone: '+225 05 12 34 56 78',
    matricule: 'JCV-MBR-0891',
    paroisse: 'Église Jésus Christ Victoire - Abidjan',
    role: 'MEMBRE',
    dateAdhesion: '02 Février 2024',
  },
  {
    id: 'usr-1104',
    nom: 'Konan',
    prenom: 'Marie-Paule',
    email: 'marie.konan@jcvictoire.org',
    telephone: '+225 01 23 45 67 89',
    matricule: 'JCV-MBR-1104',
    paroisse: 'Église Jésus Christ Victoire - Abidjan',
    role: 'MEMBRE',
    dateAdhesion: '18 Mai 2023',
  },
  {
    id: 'usr-0752',
    nom: 'Brou',
    prenom: 'Jean-Marc',
    email: 'jeanmarc.brou@jcvictoire.org',
    telephone: '+225 07 98 76 54 32',
    matricule: 'JCV-MBR-0752',
    paroisse: 'Église Jésus Christ Victoire - Abidjan',
    role: 'MEMBRE',
    dateAdhesion: '09 Août 2022',
  },
  {
    id: 'usr-1230',
    nom: 'Yao',
    prenom: 'Affoué Chantal',
    email: 'chantal.yao@jcvictoire.org',
    telephone: '+225 05 67 89 01 23',
    matricule: 'JCV-MBR-1230',
    paroisse: 'Église Jésus Christ Victoire - Abidjan',
    role: 'MEMBRE',
    dateAdhesion: '21 Novembre 2024',
  },
  mockAdmin,
];

export const mockUtilisateur: Utilisateur = mockMembre;
