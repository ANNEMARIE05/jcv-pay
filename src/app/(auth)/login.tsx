'use no memo';

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifiant.trim() || !motDePasse) {
      Alert.alert('Champs requis', 'Saisissez votre téléphone ou votre email, puis votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await login(identifiant.trim(), motDePasse);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Connexion impossible',
        error instanceof Error ? error.message : 'Vérifiez vos identifiants.'
      );
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
          title="JCV Pay"
          subtitle="Église Jésus Christ Victoire"
          variant="curved"
        />
      }
    >
      <View style={styles.cardContainer}>
        <Card style={styles.formCard}>
          <Text style={styles.loginTitle}>Connexion</Text>
          <Text style={styles.loginSubtitle}>
            Utilisez votre numéro de téléphone, ou votre email si vous êtes administrateur.
          </Text>

          <Input
            label="Téléphone ou email"
            placeholder="+2250700000000"
            value={identifiant}
            onChangeText={setIdentifiant}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            leftIcon={<Ionicons name="person-outline" size={20} color={AppColors.textSecondary} />}
          />

          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={motDePasse}
            onChangeText={setMotDePasse}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} />}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            variant="primary"
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  loginSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
});
