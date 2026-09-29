import { create } from 'zustand';
import { Utilisateur } from '@/types';
import { mockMembre, mockAdmin, mockTresorier } from '@/mocks/utilisateurs.mock';
import { RoleUtilisateur } from '@/types';
import { useFinanceStore } from '@/store/financeStore';

interface AuthState {
  user: Utilisateur | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (email: string, mdp: string) => Promise<boolean>;
  loginAs: (role: 'MEMBRE' | 'TRESORIER' | 'ADMINISTRATEUR') => Promise<boolean>;
  switchRole: () => void;
  register: (data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    paroisse?: string;
  }) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<Utilisateur>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isOnboarded: true,

  login: async (email: string, _mdp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    // If admin email, log in as admin
    const directory = useFinanceStore.getState().utilisateurs;
    const found = directory.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    const lower = email.toLowerCase();
    const fallback =
      lower.includes('tresor') || lower.includes('grace')
        ? mockTresorier
        : lower.includes('admin') || lower.includes('samuel')
          ? mockAdmin
          : { ...mockMembre, email: email || mockMembre.email };
    set({
      user: found || fallback,
      isAuthenticated: true,
    });
    return true;
  },

  loginAs: async (role: 'MEMBRE' | 'TRESORIER' | 'ADMINISTRATEUR') => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const byRole: Record<'MEMBRE' | 'TRESORIER' | 'ADMINISTRATEUR', Utilisateur> = {
      MEMBRE: mockMembre,
      TRESORIER: mockTresorier,
      ADMINISTRATEUR: mockAdmin,
    };
    set({
      user: byRole[role],
      isAuthenticated: true,
    });
    return true;
  },

  switchRole: () => {
    const order: RoleUtilisateur[] = ['MEMBRE', 'TRESORIER', 'ADMINISTRATEUR'];
    const mocks: Record<'MEMBRE' | 'TRESORIER' | 'ADMINISTRATEUR', Utilisateur> = {
      MEMBRE: mockMembre,
      TRESORIER: mockTresorier,
      ADMINISTRATEUR: mockAdmin,
    };
    const current = get().user?.role ?? 'MEMBRE';
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length] as 'MEMBRE' | 'TRESORIER' | 'ADMINISTRATEUR';
    set({ user: mocks[next] });
  },

  register: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newUser: Utilisateur = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      telephone: data.telephone,
      matricule: `JCV-MBR-${Math.floor(1000 + Math.random() * 9000)}`,
      paroisse: data.paroisse || 'Église Jésus Christ Victoire - Abidjan',
      role: 'MEMBRE',
      dateAdhesion: 'Aujourd hui',
    };
    set({ user: newUser, isAuthenticated: true });
    return true;
  },

  verifyOtp: async (code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return code.length >= 4;
  },

  logout: () => {
    set({ isAuthenticated: false, user: null });
  },

  updateProfile: (updated) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updated } });
    }
  },
}));
