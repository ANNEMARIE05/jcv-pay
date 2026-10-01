import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { tokenStorage } from '@/api/storage';
import { useAuthStore } from '@/store/authStore';

function avatarStorageKey(userId: string) {
  return `jcv_avatar_${userId}`;
}

export function useProfileAvatar() {
  const user = useAuthStore((s) => s.user);
  const updateAvatar = useAuthStore((s) => s.updateAvatar);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLocalUri(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const stored = await tokenStorage.get(avatarStorageKey(user.id));
      if (!cancelled) setLocalUri(stored);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.avatar]);

  const displayUri = user?.avatar || localUri || null;

  const pickAndUpload = useCallback(async () => {
    if (!user?.id) return;

    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Accès aux photos',
          'Autorisez l’accès à la galerie pour choisir une photo de profil.'
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const previewUri = asset.uri;
    const mime = asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg';
    const dataUri = asset.base64 ? `data:${mime};base64,${asset.base64}` : previewUri;

    setUploading(true);
    try {
      const saved = await updateAvatar(dataUri, previewUri);
      setLocalUri(saved);
    } catch (error) {
      Alert.alert(
        'Photo non enregistrée',
        error instanceof Error ? error.message : 'Réessayez avec une autre image.'
      );
    } finally {
      setUploading(false);
    }
  }, [updateAvatar, user?.id]);

  return { displayUri, pickAndUpload, uploading };
}
