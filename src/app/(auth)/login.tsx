import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('shahinur.rahman@jcvictoire.org');
  const [password, setPassword] = useState('password123');
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

  const handleQuickLogin = async (role: 'MEMBRE' | 'ADMINISTRATEUR') => {
    setLoading(true);
    try {
      await loginAs(role);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Teal Header */}
        <Header
          title="JCV Pay"
          subtitle="Église Jésus Christ Victoire"
          variant="curved"
        />

        {/* Form Card */}
        <View style={styles.cardContainer}>
          <Card style={styles.formCard}>
            <View style={styles.brandTitleRow}>
              <View style={styles.brandIconCircle}>
                <Ionicons name="book-outline" size={24} color={AppColors.primary} />
              </View>
              <View>
                <Text style={styles.loginTitle}>Connexion à votre espace</Text>
                <Text style={styles.loginSubtitle}>Fidèles & Responsables financiers</Text>
              </View>
            </View>

            {/* QUICK DEMO LOGIN BUTTONS */}
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessLabel}>⚡ CHOIX RAPIDE DU RÔLE (TEST IMMÉDIAT)</Text>

              <TouchableOpacity
                style={styles.demoRoleBtn}
                onPress={() => handleQuickLogin('MEMBRE')}
                activeOpacity={0.8}
              >
                <View style={styles.roleIconCircle}>
                  <Ionicons name="person" size={20} color={AppColors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.roleHeaderRow}>
                    <Text style={styles.roleName}>Mode Membre / Fidèle</Text>
                    <Badge label="Shahinur" variant="primary" size="sm" />
                  </View>
                  <Text style={styles.roleDesc}>Dîmes, cotisations, projets, reçus fiscaux</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={AppColors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoRoleBtn, styles.demoAdminBtn]}
                onPress={() => handleQuickLogin('ADMINISTRATEUR')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconCircle, styles.adminRoleIconCircle]}>
                  <Ionicons name="shield-checkmark" size={20} color={AppColors.accent} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.roleHeaderRow}>
                    <Text style={[styles.roleName, { color: AppColors.primaryDark }]}>
                      Mode Administrateur / Trésorier
                    </Text>
                    <Badge label="Trésorier" variant="accent" size="sm" />
                  </View>
                  <Text style={styles.roleDesc}>Caisse, payeurs, historiques & retraits</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={AppColors.accent} />
              </TouchableOpacity>
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
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginTop: -16,
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
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
    marginBottom: 16,
    gap: 8,
  },
  quickAccessLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AppColors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  demoRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  demoAdminBtn: {
    borderColor: AppColors.accent,
    backgroundColor: '#FFFBF5',
  },
  roleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: AppColors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminRoleIconCircle: {
    backgroundColor: AppColors.accentLight,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  roleDesc: {
    fontSize: 10,
    color: AppColors.textSecondary,
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
