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
import {
  mockResumeFinancier,
  mockTransactions,
  mockCotisations,
  mockMouvementsCaisse,
} from '@/mocks/finances.mock';
import { mockProjets } from '@/mocks/projets.mock';
import { mockEvenements } from '@/mocks/evenements.mock';
import { mockRecus } from '@/mocks/recus.mock';
import { mockUtilisateurs } from '@/mocks/utilisateurs.mock';
import { mockCaissesProjet } from '@/mocks/caisses.mock';
import { Utilisateur } from '@/types';

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
  getPayersSummary: () => Array<{
    nom: string;
    telephone: string;
    totalPaye: number;
    nbPaiements: number;
    dernierPaiement: string;
    transactions: Transaction[];
  }>;
  registerEvent: (eventId: string) => void;
  addProject: (projet: Omit<Projet, 'id' | 'montantCollecte' | 'participantsCount' | 'maContribution'>) => void;
  addEvent: (evenement: Omit<Evenement, 'id' | 'placesReservees' | 'estInscrit'>) => void;
  addCotisation: (cotisation: Omit<CotisationStatutaire, 'id' | 'montantVerse' | 'resteAPayer' | 'statut'>) => void;
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
  resume: mockResumeFinancier,
  transactions: mockTransactions,
  projets: mockProjets,
  evenements: mockEvenements,
  recus: mockRecus,
  cotisations: mockCotisations,
  mouvements: mockMouvementsCaisse,
  caissesProjet: mockCaissesProjet,
  utilisateurs: mockUtilisateurs,
  tresorerieGlobale: {
    soldeTotal: 14850000,
    entreesMois: 3250000,
    sortiesMois: 850000,
    soldeCaissePhysique: 1200000,
    soldeWave: 4500000,
    soldeOrangeMoney: 3850000,
    soldeBancaire: 5300000,
  },

  validatePayment: (transactionId: string) => {
    set((state) => {
      const tx = state.transactions.find((t) => t.id === transactionId || t.reference === transactionId);
      const amount = tx ? tx.montant : 0;
      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const newMouvement: MouvementCaisse | null = tx
        ? {
            id: `mv-${Date.now()}`,
            type: 'ENTREE',
            montant: amount,
            motif: `${tx.titre} — ${tx.donateurNom}`,
            date: 'Aujourd hui',
            heure: now,
            source:
              tx.moyenPaiement === 'WAVE'
                ? 'WAVE'
                : tx.moyenPaiement === 'ORANGE_MONEY'
                ? 'ORANGE_MONEY'
                : tx.moyenPaiement === 'ESPECES'
                ? 'CAISSE_PHYSIQUE'
                : 'BANQUE',
            auteur: 'Trésorerie',
            transactionId: tx.id,
          }
        : null;

      return {
        transactions: state.transactions.map((t) =>
          t.id === transactionId || t.reference === transactionId
            ? { ...t, statut: 'VALIDE' as const }
            : t
        ),
        recus: state.recus.map((r) =>
          r.transactionId === transactionId || r.numeroRecu === tx?.recuNumero
            ? { ...r, statut: 'VALIDE' as const }
            : r
        ),
        resume: {
          ...state.resume,
          enAttente: Math.max(state.resume.enAttente - amount, 0),
        },
        tresorerieGlobale: {
          ...state.tresorerieGlobale,
          soldeTotal: state.tresorerieGlobale.soldeTotal + amount,
          entreesMois: state.tresorerieGlobale.entreesMois + amount,
        },
        mouvements: newMouvement ? [newMouvement, ...state.mouvements] : state.mouvements,
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
      statut: 'VALIDE',
      moyenPaiement: payload.moyenPaiement,
      egliseNom: ORG_NAME,
      egliseAdresse: ORG_ADDRESS,
      codeSecurite: `JCV-SEC-${Math.floor(100000 + Math.random() * 900000)}-VAL`,
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
      moyenPaiement: payload.moyenPaiement,
      recuNumero: receiptNum,
      projetId: payload.projetId,
      evenementId: payload.evenementId,
      donateurNom: payload.donateurNom,
      donateurTelephone: payload.donateurTelephone,
    };

    const source: SourceCaisse =
      payload.moyenPaiement === 'WAVE'
        ? 'WAVE'
        : payload.moyenPaiement === 'ORANGE_MONEY'
        ? 'ORANGE_MONEY'
        : payload.moyenPaiement === 'ESPECES'
        ? 'CAISSE_PHYSIQUE'
        : 'BANQUE';

    const newMouvement: MouvementCaisse = {
      id: `mv-${timestamp}`,
      type: 'ENTREE',
      montant: payload.montant,
      motif: `${payload.titre} — ${payload.donateurNom}`,
      date: formattedDate,
      heure: formattedTime,
      source,
      auteur: 'Système',
      transactionId: newTx.id,
    };

    set((state) => {
      const updatedProjets = state.projets.map((p) => {
        if (p.id === payload.projetId) {
          return {
            ...p,
            montantCollecte: p.montantCollecte + payload.montant,
            maContribution: p.maContribution + payload.montant,
            participantsCount: p.participantsCount + 1,
          };
        }
        return p;
      });

      const updatedEvents = state.evenements.map((ev) => {
        if (ev.id === payload.evenementId) {
          return {
            ...ev,
            estInscrit: true,
            statutPaiement: 'VALIDE' as const,
            placesReservees: ev.placesReservees + 1,
          };
        }
        return ev;
      });

      const updatedCaisses = state.caissesProjet.map((c) => {
        if (c.statut === 'OUVERTE' && payload.projetId && c.projetId === payload.projetId) {
          return { ...c, montantCollecte: c.montantCollecte + payload.montant };
        }
        return c;
      });

      const key = sourceKey(source);
      return {
        transactions: [newTx, ...state.transactions],
        recus: [newRecu, ...state.recus],
        mouvements: [newMouvement, ...state.mouvements],
        projets: updatedProjets,
        caissesProjet: updatedCaisses,
        evenements: updatedEvents,
        resume: {
          ...state.resume,
          totalContribue: state.resume.totalContribue + payload.montant,
          derniereContributionDate: formattedDate,
        },
        tresorerieGlobale: {
          ...state.tresorerieGlobale,
          soldeTotal: state.tresorerieGlobale.soldeTotal + payload.montant,
          entreesMois: state.tresorerieGlobale.entreesMois + payload.montant,
          [key]: state.tresorerieGlobale[key] + payload.montant,
        },
      };
    });

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
    const validated = get().transactions.filter((t) => t.statut === 'VALIDE' || t.statut === 'EN_ATTENTE');
    const map = new Map<
      string,
      {
        nom: string;
        telephone: string;
        totalPaye: number;
        nbPaiements: number;
        dernierPaiement: string;
        transactions: Transaction[];
      }
    >();

    validated.forEach((t) => {
      const key = t.donateurTelephone || t.donateurNom;
      const existing = map.get(key);
      if (existing) {
        existing.transactions.push(t);
        existing.nbPaiements += 1;
        if (t.statut === 'VALIDE') existing.totalPaye += t.montant;
      } else {
        map.set(key, {
          nom: t.donateurNom,
          telephone: t.donateurTelephone,
          totalPaye: t.statut === 'VALIDE' ? t.montant : 0,
          nbPaiements: 1,
          dernierPaiement: `${t.date} • ${t.heure}`,
          transactions: [t],
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalPaye - a.totalPaye);
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
}));
