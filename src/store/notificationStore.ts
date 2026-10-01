import { create } from 'zustand';
import { api } from '@/api/client';
import { NotificationItem } from '@/types';
import type { EspacePayload } from '@/store/financeStore';

function syncEspace(espace: EspacePayload) {
  import('@/store/financeStore').then(({ applyEspace }) => applyEspace(espace)).catch(() => undefined);
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'lue' | 'date'>) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  markAsRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, lue: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.lue).length,
      };
    });
    api.post<EspacePayload>(`/api/notifications/${id}/lire`).then(syncEspace).catch(() => undefined);
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, lue: true })),
      unreadCount: 0,
    }));
    api.post<EspacePayload>('/api/notifications/lire-tout').then(syncEspace).catch(() => undefined);
  },

  addNotification: (notif) => {
    set((state) => {
      const newItem: NotificationItem = {
        ...notif,
        id: `notif-${Date.now()}`,
        lue: false,
        date: 'À l instant',
      };
      const updated = [newItem, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.lue).length,
      };
    });
  },
}));
