import { create } from 'zustand';
import { api } from '@/api/client';
import {
  ResumeFinancier,
  Transaction,
  Projet,
  Evenement,
  Recu,
  MoyenPaiement,
  TypeContribution,
  CotisationStatutaire,
  MouvementCaisse,
  SourceCaisse,
  CaisseProjet,
  RoleUtilisateur,
  Utilisateur,
  NotificationItem,
} from '@/types';
import { useNotificationStore } from '@/store/notificationStore';

export interface PayerSummary {
  key: string;
  nom: string;
  telephone: string;
  email?: string;
  matricule?: string;
  role?: RoleUtilisateur;
  totalPaye: number;
  totalDeclare: number;
  nbPaiements: number;
  nbValides: number;
  nbAttente: number;
  nbRejetes: number;
  dernierPaiement: string;
  aPaye: boolean;
  transactions: Transaction[];
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, '');
}

export interface NewPaymentPayload {
  titre: string;
  type: TypeContribution;
  montant: number;
  moyenPaiement: MoyenPaiement;
  donateurNom: string;
  donateurTelephone: string;
  donateurEmail?: string;
  projetId?: string;
  evenementId?: string;
  cotisationId?: string;
}

export interface EspacePayload {
  resume: ResumeFinancier;
  transactions: Transaction[];
  projets: Projet[];
  evenements: Evenement[];
  recus: Recu[];
  cotisations: CotisationStatutaire[];
  mouvements: MouvementCaisse[];
  caissesProjet: CaisseProjet[];
  utilisateurs: Utilisateur[];
  notifications?: NotificationItem[];
  tresorerieGlobale: FinanceState['tresorerieGlobale'];
}

const emptyTreasury = {
  soldeTotal: 0,
  entreesMois: 0,
  sortiesMois: 0,
  soldeCaissePhysique: 0,
  soldeWave: 0,
  soldeOrangeMoney: 0,
  soldeBancaire: 0,
};

interface FinanceState {
  resume: ResumeFinancier;
  transactions: Transaction[];
  projets: Projet[];
  evenements: Evenement[];
  recus: Recu[];
  cotisations: CotisationStatutaire[];
  mouvements: MouvementCaisse[];
  caissesProjet: CaisseProjet[];
  utilisateurs: Utilisateur[];
  tresorerieGlobale: typeof emptyTreasury;
  processPayment: (payload: NewPaymentPayload) => Promise<{ recu: Recu; checkoutUrl?: string | null; transactionId: string }>;
  syncPayment: (transactionId: string) => Promise<void>;
  recordCashPayment: (payload: {
    donateurNom: string;
    donateurTelephone: string;
    donateurMatricule?: string;
    montant: number;
    type: TypeContribution;
    titre: string;
    projetId?: string;
    caisseProjetId?: string;
  }) => Promise<Recu>;
  recordWithdrawal: (payload: {
    montant: number;
    motif: string;
    source: SourceCaisse;
    auteur: string;
    beneficiaire?: string;
  }) => Promise<MouvementCaisse | null>;
  openProjectCaisse: (payload: {
    nom: string;
    description: string;
    projetId?: string;
    objectif: number;
  }) => Promise<CaisseProjet | void>;
  closeProjectCaisse: (caisseId: string) => Promise<void>;
  validatePayment: (transactionId: string) => Promise<void>;
  rejectPayment: (transactionId: string) => Promise<void>;
  getReceiptById: (id: string) => Recu | undefined;
  getProjectById: (id: string) => Projet | undefined;
  getEventById: (id: string) => Evenement | undefined;
  getPaymentsByDonor: (nomOrPhone: string) => Transaction[];
  getPayersSummary: () => PayerSummary[];
  registerEvent: (eventId: string) => Promise<void>;
  addProject: (projet: Omit<Projet, 'id' | 'montantCollecte' | 'participantsCount' | 'maContribution'>) => Promise<void>;
  addEvent: (evenement: Omit<Evenement, 'id' | 'placesReservees' | 'estInscrit'>) => Promise<void>;
  addCotisation: (cotisation: Omit<CotisationStatutaire, 'id' | 'montantVerse' | 'resteAPayer' | 'statut'>) => Promise<void>;
  addUser: (payload: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: RoleUtilisateur;
    departement?: string;
  }) => Promise<Utilisateur & { motDePasseTemporaire?: string }>;
  updateUserRole: (userId: string, role: RoleUtilisateur) => Promise<void>;
  addFidele: (payload: { prenom: string; nom: string; telephone: string }) => void;
}

export function applyEspace(espace: EspacePayload) {
  useFinanceStore.setState({
    resume: espace.resume,
    transactions: espace.transactions,
    projets: espace.projets,
    evenements: espace.evenements,
    recus: espace.recus,
    cotisations: espace.cotisations,
    mouvements: espace.mouvements,
    caissesProjet: espace.caissesProjet,
    utilisateurs: espace.utilisateurs,
    tresorerieGlobale: espace.tresorerieGlobale,
  });
  if (espace.notifications) {
    useNotificationStore.setState({
      notifications: espace.notifications,
      unreadCount: espace.notifications.filter((item) => !item.lue).length,
    });
  }
}

async function postEspace(path: string, body?: unknown) {
  const espace = await api.post<EspacePayload>(path, body);
  applyEspace(espace);
  return espace;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  resume: {
    totalContribue: 0,
    resteAPayer: 0,
    enAttente: 0,
    epargneSolde: 0,
    projetsActifsCount: 0,
    derniereContributionDate: '',
  },
  transactions: [],
  projets: [],
  evenements: [],
  recus: [],
  cotisations: [],
  mouvements: [],
  caissesProjet: [],
  utilisateurs: [],
  tresorerieGlobale: emptyTreasury,

  processPayment: async (payload) => {
    const data = await api.post<{
      recu: Recu;
      checkoutUrl?: string | null;
      transaction: Transaction;
      espace: EspacePayload;
    }>('/api/paiements', payload);
    applyEspace(data.espace);
    return { recu: data.recu, checkoutUrl: data.checkoutUrl, transactionId: data.transaction.id };
  },

  syncPayment: async (transactionId) => {
    const data = await api.post<{ espace: EspacePayload }>(`/api/paiements/${transactionId}/synchroniser`);
    applyEspace(data.espace);
  },

  recordCashPayment: async (payload) => {
    const data = await api.post<{ recu: Recu; espace: EspacePayload }>('/api/paiements/especes', payload);
    applyEspace(data.espace);
    return data.recu;
  },

  recordWithdrawal: async (payload) => {
    try {
      const data = await api.post<{ mouvement: MouvementCaisse; espace: EspacePayload }>(
        '/api/mouvements/sortie',
        payload
      );
      applyEspace(data.espace);
      return data.mouvement;
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('solde')) return null;
      throw error;
    }
  },

  openProjectCaisse: async (payload) => {
    await postEspace('/api/caisses', payload);
  },

  closeProjectCaisse: async (caisseId) => {
    await postEspace(`/api/caisses/${caisseId}/cloturer`);
  },

  validatePayment: async (transactionId) => {
    await postEspace(`/api/paiements/${transactionId}/valider`);
  },

  rejectPayment: async (transactionId) => {
    await postEspace(`/api/paiements/${transactionId}/rejeter`);
  },

  getReceiptById: (id) => {
    return get().recus.find((r) => r.id === id || r.numeroRecu === id || r.transactionId === id);
  },

  getProjectById: (id) => get().projets.find((p) => p.id === id),
  getEventById: (id) => get().evenements.find((e) => e.id === id),

  getPaymentsByDonor: (nomOrPhone) => {
    const q = nomOrPhone.toLowerCase();
    return get().transactions.filter(
      (t) =>
        t.donateurNom.toLowerCase().includes(q) ||
        t.donateurTelephone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );
  },

  getPayersSummary: () => {
    const { transactions, utilisateurs } = get();
    const map = new Map<string, PayerSummary>();
    const makeKey = (phone: string, fallback: string) => normalizePhone(phone) || fallback.trim().toLowerCase();

    utilisateurs.forEach((u) => {
      const nom = `${u.prenom} ${u.nom}`.trim();
      const key = makeKey(u.telephone, u.id);
      map.set(key, {
        key,
        nom,
        telephone: u.telephone,
        email: u.email,
        matricule: u.matricule,
        role: u.role,
        totalPaye: 0,
        totalDeclare: 0,
        nbPaiements: 0,
        nbValides: 0,
        nbAttente: 0,
        nbRejetes: 0,
        dernierPaiement: 'Aucun versement',
        aPaye: false,
        transactions: [],
      });
    });

    transactions.forEach((t) => {
      const key = makeKey(t.donateurTelephone, t.donateurNom);
      const existing = map.get(key);
      const row: PayerSummary = existing ?? {
        key,
        nom: t.donateurNom,
        telephone: t.donateurTelephone,
        totalPaye: 0,
        totalDeclare: 0,
        nbPaiements: 0,
        nbValides: 0,
        nbAttente: 0,
        nbRejetes: 0,
        dernierPaiement: 'Aucun versement',
        aPaye: false,
        transactions: [],
      };
      row.transactions.push(t);
      row.nbPaiements += 1;
      row.totalDeclare += t.montant;
      row.dernierPaiement = `${t.date} • ${t.heure}`;
      if (t.statut === 'VALIDE') {
        row.totalPaye += t.montant;
        row.nbValides += 1;
        row.aPaye = true;
      } else if (t.statut === 'EN_ATTENTE') {
        row.nbAttente += 1;
      } else {
        row.nbRejetes += 1;
      }
      if (!existing) {
        row.nom = t.donateurNom;
        row.telephone = t.donateurTelephone;
      }
      map.set(key, row);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.aPaye !== b.aPaye) return a.aPaye ? -1 : 1;
      if (b.totalPaye !== a.totalPaye) return b.totalPaye - a.totalPaye;
      return a.nom.localeCompare(b.nom, 'fr');
    });
  },

  registerEvent: async (eventId) => {
    await postEspace(`/api/evenements/${eventId}/inscription`);
  },

  addProject: async (projetData) => {
    await postEspace('/api/projets', projetData);
  },

  addEvent: async (eventData) => {
    await postEspace('/api/evenements', eventData);
  },

  addCotisation: async (cotisationData) => {
    await postEspace('/api/cotisations', cotisationData);
  },

  addUser: async (payload) => {
    const data = await api.post<{
      utilisateur: Utilisateur & { motDePasseTemporaire?: string };
      espace: EspacePayload;
    }>('/api/utilisateurs', payload);
    applyEspace(data.espace);
    return data.utilisateur;
  },

  updateUserRole: async (userId, role) => {
    await postEspace(`/api/utilisateurs/${userId}/role`, { role });
  },

  addFidele: ({ prenom, nom, telephone }) => {
    const now = new Date();
    const utilisateur: Utilisateur = {
      id: `fidele-${now.getTime()}`,
      prenom: prenom.trim(),
      nom: nom.trim(),
      telephone: telephone.trim(),
      email: '',
      matricule: `JCV-MBR-${String(now.getTime()).slice(-4)}`,
      paroisse: 'Église Jésus Christ Victoire',
      role: 'MEMBRE',
      dateAdhesion: now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    set((state) => ({ utilisateurs: [utilisateur, ...state.utilisateurs] }));
  },
}));
