import { Utilisateur } from '@/types';

export const mockMembre: Utilisateur = {
  id: 'usr-1042',
  nom: 'Kouassi',
  prenom: 'Ezekiel',
  email: 'ezekiel@jcvictoire.org',
  telephone: '+225 07 48 92 10 33',
  matricule: 'JCV-MBR-1042',
  paroisse: 'Église Jésus Christ Victoire - Abidjan',
  departement: 'Membres actifs',
  role: 'MEMBRE',
  dateAdhesion: '15 Janvier 2023',
};

export const mockAdmin: Utilisateur = {
  id: 'usr-0001',
  nom: 'N\'Guessan',
  prenom: 'Samuel',
  email: 'samuel@jcvictoire.org',
  telephone: '+225 07 01 23 45 67',
  matricule: 'JCV-ADM-001',
  paroisse: 'Église Jésus Christ Victoire - Abidjan',
  departement: 'Administration',
  role: 'ADMINISTRATEUR',
  dateAdhesion: '10 Mars 2018',
};

export const mockTresorier: Utilisateur = {
  id: 'usr-0002',
  nom: 'Bamba',
  prenom: 'Grace',
  email: 'grace@jcvictoire.org',
  telephone: '+225 07 11 22 33 44',
  matricule: 'JCV-TRS-002',
  paroisse: 'Église Jésus Christ Victoire - Abidjan',
  departement: 'Trésorerie',
  role: 'TRESORIER',
  dateAdhesion: '4 Juin 2020',
};

export const mockUtilisateurs: Utilisateur[] = [
  mockAdmin,
  mockTresorier,
  mockMembre,
  {
    id: 'usr-2108',
    nom: 'Yao',
    prenom: 'Amina',
    email: 'amina@jcvictoire.org',
    telephone: '+225 05 12 34 56 78',
    matricule: 'JCV-MBR-2108',
    paroisse: 'Église Jésus Christ Victoire - Abidjan',
    departement: 'Chorale',
    role: 'MEMBRE',
    dateAdhesion: '2 Mars 2024',
  },
];

export const mockUtilisateur: Utilisateur = mockMembre;
