import { Platform } from 'react-native';

const memory = new Map<string, string>();

export const tokenStorage = {
  async get(key: string) {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return memory.get(key) ?? null;
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
    memory.set(key, value);
  },
  async remove(key: string) {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
    memory.delete(key);
  },
};
