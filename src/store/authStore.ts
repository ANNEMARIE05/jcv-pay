import { create } from 'zustand';
import { api } from '@/api/client';
import { Utilisateur } from '@/types';
import { applyEspace, EspacePayload } from '@/store/financeStore';
import { mockAdmin, mockMembre, mockTresorier, mockUtilisateurs } from '@/mocks/utilisateurs.mock';

interface AuthResponse {
  token: string;
  utilisateur: Utilisateur;
  espace: EspacePayload;
}

interface AuthState {
  user: Utilisateur | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  pendingResetPhone: string | null;
  login: (identifiant: string, mdp: string) => Promise<boolean>;
  enterAs: (role: 'ADMINISTRATEUR' | 'TRESORIER' | 'MEMBRE') => void;
  register: (data: {
    nom: string;
    prenom: string;
    email?: string;
    telephone: string;
    motDePasse: string;
    paroisse?: string;
  }) => Promise<boolean>;
  changePassword: (ancienMotDePasse: string, nouveauMotDePasse: string) => Promise<void>;
  requestPasswordReset: (telephone: string) => Promise<string | undefined>;
  resetPassword: (code: string, nouveauMotDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<Utilisateur>) => Promise<void>;
  bootstrap: () => Promise<void>;
}

async function openSession(data: AuthResponse) {
  await api.persistToken(data.token);
  applyEspace(data.espace);
  return data.utilisateur;
}

function localEspace(utilisateurs: Utilisateur[]): EspacePayload {
  return {
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
    utilisateurs,
    notifications: [],
    tresorerieGlobale: {
      soldeTotal: 0,
      entreesMois: 0,
      sortiesMois: 0,
      soldeCaissePhysique: 0,
      soldeWave: 0,
      soldeOrangeMoney: 0,
      soldeBancaire: 0,
    },
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,
  pendingResetPhone: null,

  bootstrap: async () => {
    if (get().hydrated) return;
    set({ hydrated: true });
  },

  enterAs: (role) => {
    const user =
      role === 'ADMINISTRATEUR' ? mockAdmin : role === 'TRESORIER' ? mockTresorier : mockMembre;
    applyEspace(localEspace(mockUtilisateurs));
    set({ user, isAuthenticated: true, hydrated: true });
  },

  login: async (identifiant, motDePasse) => {
    const data = await api.post<AuthResponse>('/api/auth/connexion', { identifiant, motDePasse });
    const utilisateur = await openSession(data);
    set({ user: utilisateur, isAuthenticated: true, hydrated: true });
    return true;
  },

  register: async (payload) => {
    const data = await api.post<AuthResponse>('/api/auth/inscription', payload);
    const utilisateur = await openSession(data);
    set({ user: utilisateur, isAuthenticated: true, hydrated: true });
    return true;
  },

  changePassword: async (ancienMotDePasse, nouveauMotDePasse) => {
    await api.post('/api/auth/mot-de-passe', { ancienMotDePasse, nouveauMotDePasse });
  },

  requestPasswordReset: async (telephone) => {
    const data = await api.post<{ code?: string }>('/api/auth/mot-de-passe/demande', { telephone });
    set({ pendingResetPhone: telephone });
    return data.code;
  },

  resetPassword: async (code, nouveauMotDePasse) => {
    const telephone = get().pendingResetPhone;
    if (!telephone) throw new Error('Demandez d’abord un code avec votre numéro.');
    await api.post('/api/auth/mot-de-passe/reinitialiser', { telephone, code, nouveauMotDePasse });
    set({ pendingResetPhone: null });
  },

  logout: async () => {
    await api.persistToken(null);
    set({ isAuthenticated: false, user: null });
  },

  updateProfile: async (updated) => {
    const data = await api.patch<{ utilisateur: Utilisateur }>('/api/auth/profil', updated);
    set({ user: data.utilisateur });
  },
}));
