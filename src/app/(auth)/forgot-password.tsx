import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useAuthStore } from '@/store/authStore';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';

export default function ForgotPasswordScreen() {
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);

  const handleSendCode = async () => {
    if (!telephone.trim()) {
      Alert.alert('Numéro requis', 'Saisissez le numéro associé à votre compte.');
      return;
    }

    setLoading(true);
    try {
      const code = await requestPasswordReset(telephone.trim());
      Alert.alert(
        'Code prêt',
        code
          ? `Code de développement : ${code}. Il expire dans 10 minutes.`
          : 'Si ce numéro existe, un code de réinitialisation a été préparé.',
        [{ text: 'Saisir le code', onPress: () => router.push('/(auth)/verify-otp') }]
      );
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible d’envoyer le code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScreen
      style={styles.keyboardContainer}
      contentContainerStyle={styles.scrollContent}
      header={
        <Header
          title="Mot de passe oublié"
          subtitle="Forgot Password"
          showBack
          variant="curved"
        />
      }
    >
        <View style={styles.cardContainer}>
          <Card style={styles.formCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={32} color={AppColors.primary} />
              </View>
            </View>

            <Text style={styles.instructions}>
              Saisissez le numéro de téléphone de votre compte. Un code à 4 chiffres permettra de choisir un nouveau mot de passe.
            </Text>

            <Input
              label="Numéro de téléphone"
              placeholder="+225 07 47 18 50 39"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={AppColors.textSecondary} />}
            />

            <Button
              title="Envoyer le code"
              onPress={handleSendCode}
              loading={loading}
              size="lg"
              variant="primary"
              style={styles.submitBtn}
            />

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>← Retour à la connexion</Text>
            </TouchableOpacity>
          </Card>
        </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.primary,
  },
});
