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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const loginAs = useAuthStore((s) => s.loginAs);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Champs requis', 'Veuillez saisir votre adresse email et mot de passe.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Erreur', 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'MEMBRE' | 'TRESORIER' | 'ADMINISTRATEUR') => {
    setLoading(true);
    try {
      await loginAs(role);
      router.replace('/(tabs)');
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
      overlay={
        loading ? (
          <FullScreenLoader
            title="Connexion en cours"
            subtitle="Ouverture de votre espace JCV Pay"
          />
        ) : null
      }
    >
        {/* Form Card */}
        <View style={styles.cardContainer}>
          <Card style={styles.formCard}>
            <View style={styles.brandTitleRow}>
              <View style={styles.brandIconCircle}>
                <Ionicons name="book-outline" size={24} color={AppColors.primary} />
              </View>
              <View>
                <Text style={styles.loginTitle}>Connexion à votre espace</Text>
                <Text style={styles.loginSubtitle}>Choisissez votre espace, ou saisissez vos identifiants</Text>
              </View>
            </View>

            {/* QUICK DEMO LOGIN BUTTONS */}
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessLabel}>Entrer comme</Text>
              <View style={styles.roleStack}>
                <TouchableOpacity
                  style={styles.demoRoleBtn}
                  onPress={() => handleQuickLogin('MEMBRE')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleAccent, { backgroundColor: AppColors.primary }]} />
                  <View style={styles.roleIconCircle}>
                    <Ionicons name="heart-outline" size={20} color={AppColors.primary} />
                  </View>
                  <View style={styles.roleCopy}>
                    <Text style={styles.roleName}>Fidèle</Text>
                    <Text style={styles.roleDesc}>Déclarer un versement · reçus · projets</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoRoleBtn}
                  onPress={() => handleQuickLogin('TRESORIER')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleAccent, { backgroundColor: AppColors.accent }]} />
                  <View style={[styles.roleIconCircle, styles.tresorRoleIcon]}>
                    <Ionicons name="wallet-outline" size={20} color={AppColors.accentDark} />
                  </View>
                  <View style={styles.roleCopy}>
                    <Text style={styles.roleName}>Trésorier</Text>
                    <Text style={styles.roleDesc}>Confirmer l argent · projets · caisses</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoRoleBtn}
                  onPress={() => handleQuickLogin('ADMINISTRATEUR')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.roleAccent, { backgroundColor: AppColors.primaryDark }]} />
                  <View style={[styles.roleIconCircle, styles.adminRoleIconCircle]}>
                    <Ionicons name="people-outline" size={20} color={AppColors.primary} />
                  </View>
                  <View style={styles.roleCopy}>
                    <Text style={styles.roleName}>Administrateur</Text>
                    <Text style={styles.roleDesc}>Comptes · projets · caisses · rôles</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou saisissez vos identifiants</Text>
              <View style={styles.dividerLine} />
            </View>

            <Input
              label="Adresse Email"
              placeholder="ex: membre@jcvictoire.org"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={AppColors.textSecondary} />}
            />

            <Input
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} />}
            />

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color={AppColors.white} />}
                </View>
                <Text style={styles.rememberText}>Se souvenir de moi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              variant="primary"
              style={styles.submitBtn}
            />

            {/* Register Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Vous n avez pas de compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>S inscrire</Text>
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
    padding: 20,
    borderRadius: 24,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  brandIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  loginSubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  quickAccessSection: {
    marginBottom: 16,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.textSecondary,
    marginBottom: 10,
  },
  roleStack: {
    gap: 8,
  },
  demoRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingVertical: 12,
    paddingRight: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    overflow: 'hidden',
  },
  roleAccent: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: 10,
  },
  roleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tresorRoleIcon: {
    backgroundColor: AppColors.accentLight,
  },
  adminRoleIconCircle: {
    backgroundColor: '#E8EEF5',
  },
  roleCopy: {
    flex: 1,
    marginLeft: 10,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  roleDesc: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: AppColors.white,
  },
  checkboxChecked: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  rememberText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: AppColors.accent,
    fontWeight: '600',
  },
  submitBtn: {
    marginBottom: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11,
    color: AppColors.textMuted,
    fontWeight: '500',
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
