import { create } from 'zustand';
import { api, setUnauthorizedHandler } from '@/api/client';
import { tokenStorage } from '@/api/storage';
import { Utilisateur } from '@/types';
import { applyEspace, EspacePayload } from '@/store/financeStore';

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
  updateAvatar: (avatar: string, previewUri?: string) => Promise<string>;
  bootstrap: () => Promise<void>;
}

async function openSession(data: AuthResponse) {
  await api.persistToken(data.token);
  applyEspace(data.espace);
  return data.utilisateur;
}

let bootstrapTask: Promise<void> | null = null;

const BOOTSTRAP_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('bootstrap-timeout')), ms);
    }),
  ]);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,
  pendingResetPhone: null,

  bootstrap: () => {
    if (get().hydrated) return Promise.resolve();
    if (bootstrapTask) return bootstrapTask;
    bootstrapTask = (async () => {
      try {
        const token = await api.restoreToken();
        if (!token) return;
        const data = await withTimeout(
          api.get<{ utilisateur: Utilisateur; espace: EspacePayload }>('/api/auth/moi'),
          BOOTSTRAP_TIMEOUT_MS
        );
        applyEspace(data.espace);
        set({ user: data.utilisateur, isAuthenticated: true });
      } catch {
        await api.persistToken(null);
        set({ user: null, isAuthenticated: false });
      } finally {
        set({ hydrated: true });
      }
    })();
    return bootstrapTask;
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
    const payload = Object.fromEntries(
      Object.entries({
        prenom: updated.prenom,
        nom: updated.nom,
        email: updated.email,
        telephone: updated.telephone,
        departement: updated.departement,
      }).filter((entry) => entry[1] !== undefined)
    );
    const data = await api.patch<{ utilisateur: Utilisateur }>('/api/auth/profil', payload);
    set({ user: data.utilisateur });
  },

  updateAvatar: async (avatar, previewUri) => {
    const current = get().user;
    if (!current) throw new Error('Connectez-vous pour modifier votre photo.');

    const storageKey = `jcv_avatar_${current.id}`;
    let savedUri = previewUri ?? avatar;

    try {
      const data = await api.patch<{ utilisateur: Utilisateur }>('/api/auth/profil', { avatar });
      savedUri = data.utilisateur.avatar ?? savedUri;
      set({ user: data.utilisateur });
    } catch {
      set({ user: { ...current, avatar: savedUri } });
    }

    await tokenStorage.set(storageKey, savedUri);
    return savedUri;
  },
}));

setUnauthorizedHandler(() => {
  useAuthStore.setState({ isAuthenticated: false, user: null, hydrated: true });
});
