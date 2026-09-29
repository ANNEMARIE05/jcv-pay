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
import { FullScreenLoader } from '@/components/motion/BrandedLoader';
import { KeyboardAwareScreen } from '@/components/common/KeyboardAwareScreen';

export default function RegisterScreen() {
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!nomComplet.trim() || !email.trim() || !password) {
      Alert.alert('Champs requis', 'Veuillez renseigner votre nom, email et mot de passe.');
      return;
    }
    if (!agreeTerms) {
      Alert.alert(
        'Conditions requises',
        'Veuillez accepter la politique de confidentialité pour continuer.'
      );
      return;
    }

    setLoading(true);
    try {
      const parts = nomComplet.trim().split(' ');
      const prenom = parts[0];
      const nom = parts.slice(1).join(' ') || parts[0];

      await register({
        nom,
        prenom,
        email,
        telephone: telephone || '+225 07 00 00 00 00',
      });
      router.push('/(auth)/verify-otp');
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le compte pour le moment.');
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
          title="Créer un compte"
          subtitle="Get Started Today"
          showBack
          variant="curved"
        />
      }
      overlay={
        loading ? (
          <FullScreenLoader
            title="Création du compte"
            subtitle="Préparation de votre espace membre"
          />
        ) : null
      }
    >
        <View style={styles.cardContainer}>
          <Card style={styles.formCard}>
            <Input
              label="Nom & Prénom"
              placeholder="Ex: Ezekiel"
              value={nomComplet}
              onChangeText={setNomComplet}
              leftIcon={<Ionicons name="person-outline" size={20} color={AppColors.textSecondary} />}
            />

            <Input
              label="Adresse Email"
              placeholder="ex: ezekiel@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={AppColors.textSecondary} />}
            />

            <Input
              label="Numéro de Téléphone"
              placeholder="ex: +225 07 48 92 10 33"
              value={telephone}
              onChangeText={setTelephone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={AppColors.textSecondary} />}
            />

            <Input
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} />}
            />

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Ionicons name="checkmark" size={14} color={AppColors.white} />}
              </View>
              <Text style={styles.termsText}>
                J accepte la <Text style={styles.termsLink}>politique de confidentialité</Text> et les{' '}
                <Text style={styles.termsLink}>conditions d utilisation</Text>.
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
              title="Créer un compte"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              variant="primary"
              style={styles.submitBtn}
            />

            {/* Social Logins */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou continuer avec</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Vous avez déjà un compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Se connecter</Text>
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: AppColors.white,
  },
  checkboxChecked: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
