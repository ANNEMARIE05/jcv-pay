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

export interface MembreTrace {
  date: string;
  heure: string;
  motDePasseTemporaire?: string;
}

export interface PayerSummary {
  key: string;
  nom: string;
  prenom?: string;
  nomFamille?: string;
  telephone: string;
  email?: string;
  matricule?: string;
  paroisse?: string;
  departement?: string;
  dateAdhesion?: string;
  creeLe?: string;
  creeA?: string;
  role?: RoleUtilisateur;
  userId?: string;
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
  caisseProjetId?: string;
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
  membresTrace: Record<string, MembreTrace>;
  dernierAjoutId: string | null;
  tresorerieGlobale: typeof emptyTreasury;
  geniusPaySolde: number | null;
  refreshEspace: (role?: RoleUtilisateur) => Promise<void>;
  loadReceipt: (id: string) => Promise<Recu>;
  loadGeniusPay: () => Promise<number | null>;
  processPayment: (payload: NewPaymentPayload) => Promise<{ recu: Recu; checkoutUrl?: string | null; transactionId: string }>;
  syncPayment: (transactionId: string) => Promise<Transaction | undefined>;
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
  transferCaisse: (payload: { fromId: string; toId: string; montant: number; motif: string }) => Promise<void>;
  deleteCaisse: (caisseId: string) => Promise<void>;
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
  addFidele: (payload: {
    prenom: string;
    nom: string;
    telephone: string;
    role: RoleUtilisateur;
  }) => Promise<Utilisateur & { motDePasseTemporaire?: string }>;
  resendMemberAccess: (userId: string) => Promise<string | undefined>;
  getMembreTrace: (userId: string) => MembreTrace | undefined;
}

function mergeUtilisateurs(
  current: Utilisateur[],
  incoming: Utilisateur[],
  pinnedId: string | null
): Utilisateur[] {
  const merged = new Map<string, Utilisateur>();
  incoming.forEach((u) => merged.set(u.id, u));
  current.forEach((u) => {
    if (!merged.has(u.id)) merged.set(u.id, u);
  });
  let list = Array.from(merged.values());
  if (pinnedId) {
    const idx = list.findIndex((u) => u.id === pinnedId);
    if (idx > 0) {
      const [pinned] = list.splice(idx, 1);
      list = [pinned, ...list];
    }
  }
  return list;
}

export function applyEspace(espace: EspacePayload) {
  useFinanceStore.setState((state) => ({
    resume: espace.resume,
    transactions: espace.transactions,
    projets: espace.projets,
    evenements: espace.evenements,
    recus: espace.recus,
    cotisations: espace.cotisations,
    mouvements: espace.mouvements,
    caissesProjet: espace.caissesProjet,
    utilisateurs: mergeUtilisateurs(state.utilisateurs, espace.utilisateurs ?? [], state.dernierAjoutId),
    tresorerieGlobale: espace.tresorerieGlobale,
  }));
  if (espace.notifications) {
    useNotificationStore.setState({
      notifications: espace.notifications,
      unreadCount: espace.notifications.filter((item) => !item.lue).length,
    });
  }
}

function creationStamp() {
  const now = new Date();
  return {
    date: now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  };
}

function rememberUtilisateur(user: Utilisateur & { motDePasseTemporaire?: string }) {
  const { motDePasseTemporaire, ...safe } = user;
  const stamp = creationStamp();
  useFinanceStore.setState((state) => {
    const previous = state.membresTrace[safe.id];
    const trace: MembreTrace = previous
      ? {
          ...previous,
          ...(motDePasseTemporaire?.trim() ? { motDePasseTemporaire: motDePasseTemporaire.trim() } : {}),
        }
      : {
          date: stamp.date,
          heure: stamp.heure,
          ...(motDePasseTemporaire?.trim() ? { motDePasseTemporaire: motDePasseTemporaire.trim() } : {}),
        };
    return {
      dernierAjoutId: safe.id,
      utilisateurs: [safe, ...(state.utilisateurs ?? []).filter((item) => item.id !== safe.id)],
      membresTrace: { ...state.membresTrace, [safe.id]: trace },
    };
  });
}

function readGeniusPaySolde(payload: unknown): number | null {
  const queue: unknown[] = [payload];
  const keys = ['balance', 'solde', 'available_balance', 'available', 'amount', 'current_balance'];
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;
    const record = current as Record<string, unknown>;
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
    }
    Object.values(record).forEach((value) => {
      if (value && typeof value === 'object') queue.push(value);
    });
  }
  return null;
}

async function postEspace(path: string, body?: unknown) {
  const espace = await api.post<EspacePayload>(path, body);
  applyEspace(espace);
  return espace;
}

export const useFinanceStore = create<FinanceState>((_set, get) => ({
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
  membresTrace: {},
  dernierAjoutId: null,
  tresorerieGlobale: emptyTreasury,
  geniusPaySolde: null,

  refreshEspace: async (role) => {
    const espace = await api.get<EspacePayload>('/api/espace');
    applyEspace(espace);
    if (role === 'ADMINISTRATEUR' || role === 'SUPER_ADMIN') {
      try {
        const utilisateurs = await api.get<Utilisateur[]>('/api/utilisateurs');
        useFinanceStore.setState({ utilisateurs });
      } catch {
        // La liste de l’espace reste affichée si ce droit est refusé.
      }
    }
    if (role === 'TRESORIER' || role === 'SUPER_ADMIN') {
      try {
        await get().loadGeniusPay();
      } catch {
        // Le solde marchand reste masqué s’il est indisponible.
      }
    }
  },

  loadReceipt: async (id) => {
    const cached = get().getReceiptById(id);
    if (cached) return cached;
    const recu = await api.get<Recu>(`/api/paiements/recus/${encodeURIComponent(id)}`);
    useFinanceStore.setState((state) => ({
      recus: state.recus.some((item) => item.id === recu.id) ? state.recus : [recu, ...state.recus],
    }));
    return recu;
  },

  loadGeniusPay: async () => {
    const data = await api.get<Record<string, unknown>>('/api/tresorerie/geniuspay');
    const solde = readGeniusPaySolde(data);
    useFinanceStore.setState({ geniusPaySolde: solde });
    return solde;
  },

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
    const data = await api.post<{ espace: EspacePayload; transaction?: Transaction }>(
      `/api/paiements/${transactionId}/synchroniser`
    );
    applyEspace(data.espace);
    return data.transaction;
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

  transferCaisse: async (payload) => {
    await postEspace('/api/caisses/transfert', payload);
  },

  deleteCaisse: async (caisseId) => {
    await postEspace(`/api/caisses/${caisseId}/supprimer`);
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

  getMembreTrace: (userId) => get().membresTrace[userId],

  resendMemberAccess: async (userId) => {
    const state = get();
    const member = state.utilisateurs.find((u) => u.id === userId);
    if (!member) {
      throw new Error('Membre introuvable.');
    }
    let password: string | undefined;
    try {
      const data = await api.post<{ motDePasseTemporaire?: string }>(
        `/api/utilisateurs/${encodeURIComponent(userId)}/renvoyer-acces`
      );
      password = data.motDePasseTemporaire?.trim();
    } catch {
      try {
        const data = await api.post<{ motDePasseTemporaire?: string }>(
          `/api/fideles/${encodeURIComponent(userId)}/renvoyer-acces`
        );
        password = data.motDePasseTemporaire?.trim();
      } catch {
        password = state.membresTrace[userId]?.motDePasseTemporaire;
      }
    }
    if (password) {
      const trace = state.membresTrace[userId] ?? creationStamp();
      useFinanceStore.setState({
        membresTrace: {
          ...state.membresTrace,
          [userId]: { ...trace, motDePasseTemporaire: password },
        },
      });
    }
    return password;
  },

  getPayersSummary: () => {
    const { transactions, utilisateurs, membresTrace } = get();
    const map = new Map<string, PayerSummary>();
    const makeKey = (phone: string, fallback: string) => normalizePhone(phone) || fallback.trim().toLowerCase();

    utilisateurs.forEach((u) => {
      const nom = `${u.prenom} ${u.nom}`.trim();
      const key = makeKey(u.telephone, u.id);
      const trace = membresTrace[u.id];
      map.set(key, {
        key,
        nom,
        prenom: u.prenom,
        nomFamille: u.nom,
        telephone: u.telephone,
        email: u.email,
        matricule: u.matricule,
        paroisse: u.paroisse,
        departement: u.departement,
        dateAdhesion: u.dateAdhesion,
        creeLe: trace?.date,
        creeA: trace?.heure,
        role: u.role,
        userId: u.id,
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

    const pinned = get().dernierAjoutId;
    return Array.from(map.values()).sort((a, b) => {
      if (pinned && a.userId === pinned) return -1;
      if (pinned && b.userId === pinned) return 1;
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
    rememberUtilisateur({
      ...data.utilisateur,
      motDePasseTemporaire: data.utilisateur.motDePasseTemporaire,
    });
    return data.utilisateur;
  },

  updateUserRole: async (userId, role) => {
    const espace = await api.patch<EspacePayload>(`/api/utilisateurs/${userId}/role`, { role });
    applyEspace(espace);
  },

  addFidele: async ({ prenom, nom, telephone, role }) => {
    const data = await api.post<{
      utilisateur: Utilisateur & { motDePasseTemporaire?: string };
      espace: EspacePayload;
    }>('/api/fideles', { prenom, nom, telephone, role });
    applyEspace(data.espace);
    const created = data.utilisateur.role === role
      ? data.utilisateur
      : { ...data.utilisateur, role };
    if (data.utilisateur.role !== role) {
      const espace = await api.patch<EspacePayload>(`/api/utilisateurs/${data.utilisateur.id}/role`, { role });
      applyEspace(espace);
    }
    rememberUtilisateur({
      ...created,
      motDePasseTemporaire: data.utilisateur.motDePasseTemporaire ?? created.motDePasseTemporaire,
    });
    return created;
  },
}));
