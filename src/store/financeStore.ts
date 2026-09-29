import { create } from 'zustand';
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
} from '@/types';
import { RoleUtilisateur, Utilisateur } from '@/types';
import { mockUtilisateurs } from '@/mocks/utilisateurs.mock';

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
}

const ORG_NAME = 'Église Jésus Christ Victoire';
const ORG_ADDRESS = 'Boulevard de la Victoire, Abidjan';

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
  tresorerieGlobale: {
    soldeTotal: number;
    entreesMois: number;
    sortiesMois: number;
    soldeCaissePhysique: number;
    soldeWave: number;
    soldeOrangeMoney: number;
    soldeBancaire: number;
  };

  processPayment: (payload: NewPaymentPayload) => Promise<Recu>;
  recordCashPayment: (payload: {
    donateurNom: string;
    donateurTelephone: string;
    donateurMatricule?: string;
    montant: number;
    type: TypeContribution;
    titre: string;
    projetId?: string;
    caisseProjetId?: string;
  }) => Recu;
  recordWithdrawal: (payload: {
    montant: number;
    motif: string;
    source: SourceCaisse;
    auteur: string;
    beneficiaire?: string;
  }) => MouvementCaisse | null;
  openProjectCaisse: (payload: {
    nom: string;
    description: string;
    projetId?: string;
    objectif: number;
  }) => CaisseProjet;
  closeProjectCaisse: (caisseId: string) => void;
  validatePayment: (transactionId: string) => void;
  rejectPayment: (transactionId: string) => void;
  getReceiptById: (id: string) => Recu | undefined;
  getProjectById: (id: string) => Projet | undefined;
  getEventById: (id: string) => Evenement | undefined;
  getPaymentsByDonor: (nomOrPhone: string) => Transaction[];
  getPayersSummary: () => PayerSummary[];
  registerEvent: (eventId: string) => void;
  addProject: (projet: Omit<Projet, 'id' | 'montantCollecte' | 'participantsCount' | 'maContribution'>) => void;
  addEvent: (evenement: Omit<Evenement, 'id' | 'placesReservees' | 'estInscrit'>) => void;
  addCotisation: (cotisation: Omit<CotisationStatutaire, 'id' | 'montantVerse' | 'resteAPayer' | 'statut'>) => void;
  addUser: (payload: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: RoleUtilisateur;
    departement?: string;
  }) => Utilisateur;
  updateUserRole: (userId: string, role: RoleUtilisateur) => void;
}

function sourceKey(source: SourceCaisse): keyof FinanceState['tresorerieGlobale'] {
  switch (source) {
    case 'WAVE':
      return 'soldeWave';
    case 'ORANGE_MONEY':
      return 'soldeOrangeMoney';
    case 'BANQUE':
      return 'soldeBancaire';
    default:
      return 'soldeCaissePhysique';
  }
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
  utilisateurs: mockUtilisateurs,
  tresorerieGlobale: {
    soldeTotal: 0,
    entreesMois: 0,
    sortiesMois: 0,
    soldeCaissePhysique: 0,
    soldeWave: 0,
    soldeOrangeMoney: 0,
    soldeBancaire: 0,
  },

  validatePayment: (transactionId: string) => {
    set((state) => {
      const tx = state.transactions.find((t) => t.id === transactionId || t.reference === transactionId);
      if (!tx || tx.statut === 'VALIDE') return state;
      const amount = tx.montant;
      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const source: SourceCaisse =
        tx.moyenPaiement === 'WAVE'
          ? 'WAVE'
          : tx.moyenPaiement === 'ORANGE_MONEY'
          ? 'ORANGE_MONEY'
          : tx.moyenPaiement === 'ESPECES'
          ? 'CAISSE_PHYSIQUE'
          : 'BANQUE';
      const key = sourceKey(source);
      const newMouvement: MouvementCaisse = {
        id: `mv-${Date.now()}`,
        type: 'ENTREE',
        montant: amount,
        motif: `${tx.titre} — ${tx.donateurNom}`,
        date: 'Aujourd hui',
        heure: now,
        source,
        auteur: 'Trésorerie',
        transactionId: tx.id,
      };

      return {
        transactions: state.transactions.map((t) =>
          t.id === transactionId || t.reference === transactionId
            ? { ...t, statut: 'VALIDE' as const }
            : t
        ),
        recus: state.recus.map((r) =>
          r.transactionId === tx.id || r.numeroRecu === tx.recuNumero
            ? { ...r, statut: 'VALIDE' as const }
            : r
        ),
        projets: state.projets.map((p) =>
          p.id === tx.projetId
            ? {
                ...p,
                montantCollecte: p.montantCollecte + amount,
                maContribution: p.maContribution + amount,
                participantsCount: p.participantsCount + 1,
              }
            : p
        ),
        evenements: state.evenements.map((ev) =>
          ev.id === tx.evenementId
            ? {
                ...ev,
                estInscrit: true,
                statutPaiement: 'VALIDE' as const,
                placesReservees: ev.placesReservees + 1,
              }
            : ev
        ),
        caissesProjet: state.caissesProjet.map((c) =>
          c.statut === 'OUVERTE' && tx.projetId && c.projetId === tx.projetId
            ? { ...c, montantCollecte: c.montantCollecte + amount }
            : c
        ),
        resume: {
          ...state.resume,
          enAttente: Math.max(state.resume.enAttente - amount, 0),
          totalContribue: state.resume.totalContribue + amount,
          derniereContributionDate: 'Aujourd hui',
        },
        tresorerieGlobale: {
          ...state.tresorerieGlobale,
          soldeTotal: state.tresorerieGlobale.soldeTotal + amount,
          entreesMois: state.tresorerieGlobale.entreesMois + amount,
          [key]: state.tresorerieGlobale[key] + amount,
        },
        mouvements: [newMouvement, ...state.mouvements],
      };
    });
  },

  rejectPayment: (transactionId: string) => {
    set((state) => {
      const tx = state.transactions.find((t) => t.id === transactionId || t.reference === transactionId);
      const amount = tx ? tx.montant : 0;
      return {
        transactions: state.transactions.map((t) =>
          t.id === transactionId || t.reference === transactionId
            ? { ...t, statut: 'REJETE' as const }
            : t
        ),
        recus: state.recus.map((r) =>
          r.transactionId === transactionId ? { ...r, statut: 'REJETE' as const } : r
        ),
        resume: {
          ...state.resume,
          enAttente: Math.max(state.resume.enAttente - amount, 0),
        },
      };
    });
  },

  processPayment: async (payload: NewPaymentPayload) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const timestamp = Date.now();
    const formattedDate = 'Aujourd hui';
    const formattedTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const receiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecu: Recu = {
      id: `rec-${timestamp}`,
      numeroRecu: receiptNum,
      transactionId: `tx-${timestamp}`,
      titre: payload.titre,
      type: payload.type,
      donateurNom: payload.donateurNom,
      donateurMatricule: 'JCV-MBR-1042',
      donateurTelephone: payload.donateurTelephone,
      donateurEmail: payload.donateurEmail || 'membre@jcvictoire.org',
      montant: payload.montant,
      frais: 0,
      total: payload.montant,
      date: formattedDate,
      heure: formattedTime,
      statut: 'EN_ATTENTE',
      moyenPaiement: payload.moyenPaiement,
      egliseNom: ORG_NAME,
      egliseAdresse: ORG_ADDRESS,
      codeSecurite: `JCV-SEC-${Math.floor(100000 + Math.random() * 900000)}-ATT`,
    };

    const newTx: Transaction = {
      id: `tx-${timestamp}`,
      reference: txRef,
      titre: payload.titre,
      type: payload.type,
      montant: payload.montant,
      date: formattedDate,
      heure: formattedTime,
      statut: 'EN_ATTENTE',
      moyenPaiement: payload.moyenPaiement,
      recuNumero: receiptNum,
      projetId: payload.projetId,
      evenementId: payload.evenementId,
      donateurNom: payload.donateurNom,
      donateurTelephone: payload.donateurTelephone,
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
      recus: [newRecu, ...state.recus],
      resume: {
        ...state.resume,
        enAttente: state.resume.enAttente + payload.montant,
        derniereContributionDate: formattedDate,
      },
    }));

    return newRecu;
  },

  getReceiptById: (id: string) => {
    return get().recus.find(
      (r) => r.id === id || r.numeroRecu === id || r.transactionId === id
    );
  },

  getProjectById: (id: string) => {
    return get().projets.find((p) => p.id === id);
  },

  getEventById: (id: string) => {
    return get().evenements.find((e) => e.id === id);
  },

  getPaymentsByDonor: (nomOrPhone: string) => {
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

    const makeKey = (phone: string, fallback: string) =>
      normalizePhone(phone) || fallback.trim().toLowerCase();

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

  registerEvent: (eventId: string) => {
    set((state) => ({
      evenements: state.evenements.map((ev) =>
        ev.id === eventId ? { ...ev, estInscrit: true } : ev
      ),
    }));
  },

  addProject: (projetData) => {
    const timestamp = Date.now();
    const newProjet: Projet = {
      ...projetData,
      id: `proj-${timestamp}`,
      montantCollecte: 0,
      participantsCount: 0,
      maContribution: 0,
    };
    const newCaisse: CaisseProjet = {
      id: `caisse-proj-${timestamp}`,
      nom: `Caisse — ${projetData.titre}`,
      description: projetData.description,
      projetId: newProjet.id,
      montantCollecte: 0,
      objectif: projetData.objectif,
      statut: 'OUVERTE',
      visibleAuxMembres: true,
      dateOuverture: 'Aujourd hui',
    };
    set((state) => ({
      projets: [newProjet, ...state.projets],
      caissesProjet: [newCaisse, ...state.caissesProjet],
      resume: {
        ...state.resume,
        projetsActifsCount: state.resume.projetsActifsCount + 1,
      },
    }));
  },

  openProjectCaisse: (payload) => {
    const timestamp = Date.now();
    const caisse: CaisseProjet = {
      id: `caisse-proj-${timestamp}`,
      nom: payload.nom,
      description: payload.description,
      projetId: payload.projetId,
      montantCollecte: 0,
      objectif: payload.objectif,
      statut: 'OUVERTE',
      visibleAuxMembres: true,
      dateOuverture: 'Aujourd hui',
    };
    set((state) => ({
      caissesProjet: [caisse, ...state.caissesProjet],
    }));
    return caisse;
  },

  closeProjectCaisse: (caisseId: string) => {
    set((state) => {
      const caisse = state.caissesProjet.find((c) => c.id === caisseId);
      return {
        caissesProjet: state.caissesProjet.map((c) =>
          c.id === caisseId
            ? { ...c, statut: 'TERMINEE' as const, dateCloture: 'Aujourd hui' }
            : c
        ),
        projets: state.projets.map((p) =>
          caisse?.projetId && p.id === caisse.projetId
            ? { ...p, statut: 'CLOTURE' as const }
            : p
        ),
      };
    });
  },

  addEvent: (eventData) => {
    const timestamp = Date.now();
    const newEvent: Evenement = {
      ...eventData,
      id: `ev-${timestamp}`,
      placesReservees: 0,
      estInscrit: false,
    };
    set((state) => ({
      evenements: [newEvent, ...state.evenements],
    }));
  },

  addCotisation: (cotisationData) => {
    const timestamp = Date.now();
    const newCotisation: CotisationStatutaire = {
      ...cotisationData,
      id: `cot-${timestamp}`,
      montantVerse: 0,
      resteAPayer: cotisationData.montantTotal,
      statut: 'A_PAYER',
    };
    set((state) => ({
      cotisations: [newCotisation, ...state.cotisations],
      resume: {
        ...state.resume,
        resteAPayer: state.resume.resteAPayer + cotisationData.montantTotal,
      },
    }));
  },

  recordCashPayment: (payload) => {
    const timestamp = Date.now();
    const formattedDate = 'Aujourd hui';
    const formattedTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const receiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecu: Recu = {
      id: `rec-${timestamp}`,
      numeroRecu: receiptNum,
      transactionId: `tx-${timestamp}`,
      titre: payload.titre,
      type: payload.type,
      donateurNom: payload.donateurNom,
      donateurMatricule: payload.donateurMatricule || 'JCV-MBR-GUICHET',
      donateurTelephone: payload.donateurTelephone,
      donateurEmail: 'tresorerie@jcvictoire.org',
      montant: payload.montant,
      frais: 0,
      total: payload.montant,
      date: formattedDate,
      heure: formattedTime,
      statut: 'VALIDE',
      moyenPaiement: 'ESPECES',
      egliseNom: ORG_NAME,
      egliseAdresse: ORG_ADDRESS,
      codeSecurite: `JCV-SEC-${Math.floor(100000 + Math.random() * 900000)}-ESP`,
    };

    const newTx: Transaction = {
      id: `tx-${timestamp}`,
      reference: txRef,
      titre: payload.titre,
      type: payload.type,
      montant: payload.montant,
      date: formattedDate,
      heure: formattedTime,
      statut: 'VALIDE',
      moyenPaiement: 'ESPECES',
      recuNumero: receiptNum,
      donateurNom: payload.donateurNom,
      donateurTelephone: payload.donateurTelephone,
    };

    const newMouvement: MouvementCaisse = {
      id: `mv-${timestamp}`,
      type: 'ENTREE',
      montant: payload.montant,
      motif: `${payload.titre} — ${payload.donateurNom}`,
      date: formattedDate,
      heure: formattedTime,
      source: 'CAISSE_PHYSIQUE',
      auteur: 'Trésorerie',
      transactionId: newTx.id,
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
      recus: [newRecu, ...state.recus],
      mouvements: [newMouvement, ...state.mouvements],
      resume: {
        ...state.resume,
        totalContribue: state.resume.totalContribue + payload.montant,
        derniereContributionDate: formattedDate,
      },
      tresorerieGlobale: {
        ...state.tresorerieGlobale,
        soldeTotal: state.tresorerieGlobale.soldeTotal + payload.montant,
        entreesMois: state.tresorerieGlobale.entreesMois + payload.montant,
        soldeCaissePhysique: state.tresorerieGlobale.soldeCaissePhysique + payload.montant,
      },
    }));

    return newRecu;
  },

  recordWithdrawal: (payload) => {
    const key = sourceKey(payload.source);
    const current = get().tresorerieGlobale[key];
    if (payload.montant <= 0 || payload.montant > current) {
      return null;
    }

    const timestamp = Date.now();
    const formattedDate = 'Aujourd hui';
    const formattedTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const mouvement: MouvementCaisse = {
      id: `mv-${timestamp}`,
      type: 'SORTIE',
      montant: payload.montant,
      motif: payload.motif,
      date: formattedDate,
      heure: formattedTime,
      source: payload.source,
      auteur: payload.auteur,
      beneficiaire: payload.beneficiaire,
    };

    set((state) => ({
      mouvements: [mouvement, ...state.mouvements],
      tresorerieGlobale: {
        ...state.tresorerieGlobale,
        soldeTotal: state.tresorerieGlobale.soldeTotal - payload.montant,
        sortiesMois: state.tresorerieGlobale.sortiesMois + payload.montant,
        [key]: state.tresorerieGlobale[key] - payload.montant,
      },
    }));

    return mouvement;
  },

  addUser: (payload) => {
    const timestamp = Date.now();
    const user: Utilisateur = {
      id: `usr-${timestamp}`,
      nom: payload.nom.trim(),
      prenom: payload.prenom.trim(),
      email: payload.email.trim(),
      telephone: payload.telephone.trim(),
      matricule: `JCV-${payload.role === 'TRESORIER' ? 'TRS' : payload.role === 'MEMBRE' ? 'MBR' : 'ADM'}-${Math.floor(1000 + Math.random() * 9000)}`,
      paroisse: 'Église Jésus Christ Victoire - Abidjan',
      departement: payload.departement,
      role: payload.role,
      dateAdhesion: 'Aujourd hui',
    };
    set((state) => ({ utilisateurs: [user, ...state.utilisateurs] }));
    return user;
  },

  updateUserRole: (userId, role) => {
    set((state) => ({
      utilisateurs: state.utilisateurs.map((u) => (u.id === userId ? { ...u, role } : u)),
    }));
  },
}));
