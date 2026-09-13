export type RoleUtilisateur =
  | 'SUPER_ADMIN'
  | 'ADMINISTRATEUR'
  | 'TRESORIER'
  | 'RESPONSABLE'
  | 'MEMBRE';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  matricule: string;
  paroisse: string;
  departement?: string;
  avatar?: string;
  role: RoleUtilisateur;
  dateAdhesion: string;
}

export type TypeContribution =
  | 'DIME'
  | 'OFFRANDE'
  | 'COTISATION'
  | 'PROJET'
  | 'EVENEMENT'
  | 'EPARGNE'
  | 'LIBRE';

export type StatutPaiement = 'VALIDE' | 'EN_ATTENTE' | 'REJETE' | 'ANNULE';

export type MoyenPaiement =
  | 'WAVE'
  | 'ORANGE_MONEY'
  | 'MTN_MOMO'
  | 'MOOV_MONEY'
  | 'CARTE_BANCAIRE'
  | 'VIREMENT'
  | 'ESPECES';

export interface Transaction {
  id: string;
  reference: string;
  titre: string;
  description?: string;
  type: TypeContribution;
  montant: number;
  date: string;
  heure: string;
  statut: StatutPaiement;
  moyenPaiement: MoyenPaiement;
  recuNumero: string;
  projetId?: string;
  evenementId?: string;
  donateurNom: string;
  donateurTelephone: string;
}

export interface Projet {
  id: string;
  titre: string;
  description: string;
  categorie: 'CONSTRUCTION' | 'MISSION' | 'EQUIPEMENT' | 'SOCIAL';
  objectif: number;
  montantCollecte: number;
  dateFin: string;
  statut: 'EN_COURS' | 'CLOTURE' | 'PLANIFIE';
  imageUrl: string;
  participantsCount: number;
  maContribution: number;
  organisateur: string;
  lieu?: string;
}

export interface Evenement {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  lieu: string;
  tarif: number;
  placesDisponibles: number;
  placesReservees: number;
  imageUrl: string;
  estInscrit: boolean;
  statutPaiement?: StatutPaiement;
  intervenant?: string;
}

export interface Recu {
  id: string;
  numeroRecu: string;
  transactionId: string;
  titre: string;
  type: TypeContribution;
  donateurNom: string;
  donateurMatricule: string;
  donateurTelephone: string;
  donateurEmail: string;
  montant: number;
  frais: number;
  total: number;
  date: string;
  heure: string;
  statut: StatutPaiement;
  moyenPaiement: MoyenPaiement;
  egliseNom: string;
  egliseAdresse: string;
  codeSecurite: string;
}

export interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  date: string;
  lue: boolean;
  type: 'PAIEMENT' | 'ECHEANCE' | 'PROJET' | 'EVENEMENT' | 'INFO';
  referenceId?: string;
}

export interface ResumeFinancier {
  totalContribue: number;
  resteAPayer: number;
  enAttente: number;
  epargneSolde: number;
  projetsActifsCount: number;
  derniereContributionDate: string;
}

export interface CotisationStatutaire {
  id: string;
  titre: string;
  categorie: 'COTISATION' | 'DIME' | 'EPARGNE' | 'PROJET';
  montantTotal: number;
  montantVerse: number;
  resteAPayer: number;
  echeance: string;
  statut: 'PAYE' | 'PARTIEL' | 'A_PAYER';
}

export type TypeMouvementCaisse = 'ENTREE' | 'SORTIE';

export type SourceCaisse =
  | 'CAISSE_PHYSIQUE'
  | 'WAVE'
  | 'ORANGE_MONEY'
  | 'BANQUE';

export interface MouvementCaisse {
  id: string;
  type: TypeMouvementCaisse;
  montant: number;
  motif: string;
  date: string;
  heure: string;
  source: SourceCaisse;
  auteur: string;
  transactionId?: string;
  beneficiaire?: string;
  caisseProjetId?: string;
}

export interface CaisseProjet {
  id: string;
  nom: string;
  description: string;
  projetId?: string;
  montantCollecte: number;
  objectif: number;
  statut: 'OUVERTE' | 'TERMINEE';
  visibleAuxMembres: boolean;
  dateOuverture: string;
  dateCloture?: string;
}
