import { create } from 'zustand';
import { Utilisateur, RoleUtilisateur } from '@/types';
import { mockMembre, mockAdmin } from '@/mocks/utilisateurs.mock';

interface AuthState {
  user: Utilisateur | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (email: string, mdp: string) => Promise<boolean>;
  loginAs: (role: 'MEMBRE' | 'ADMINISTRATEUR') => Promise<boolean>;
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
  user: mockMembre,
  isAuthenticated: true,
  isOnboarded: true,

  login: async (email: string, _mdp: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    // If admin email, log in as admin
    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('tresor');
    set({
      user: isAdmin ? mockAdmin : { ...mockMembre, email: email || mockMembre.email },
      isAuthenticated: true,
    });
    return true;
  },

  loginAs: async (role: 'MEMBRE' | 'ADMINISTRATEUR') => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    set({
      user: role === 'ADMINISTRATEUR' ? mockAdmin : mockMembre,
      isAuthenticated: true,
    });
    return true;
  },

  switchRole: () => {
    const current = get().user;
    const isCurrentlyAdmin = current?.role === 'ADMINISTRATEUR' || current?.role === 'TRESORIER';
    set({
      user: isCurrentlyAdmin ? mockMembre : mockAdmin,
    });
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
