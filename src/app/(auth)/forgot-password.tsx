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
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Email requis', 'Veuillez saisir votre adresse email.');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSent(true);

    Alert.alert(
      'Code envoyé',
      `Un code de vérification à 4 chiffres a été envoyé à ${email}.`,
      [{ text: 'Saisir le code', onPress: () => router.push('/(auth)/verify-otp') }]
    );
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
              Saisissez l adresse email associée à votre compte membre. Nous vous enverrons un code de réinitialisation sécurisé.
            </Text>

            <Input
              label="Adresse Email"
              placeholder="ex: ezekiel@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={AppColors.textSecondary} />}
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
