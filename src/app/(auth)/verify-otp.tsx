import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { useAuthStore } from '@/store/authStore';

export default function VerifyOtpScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);

  const resetPassword = useAuthStore((s) => s.resetPassword);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleKeyPress = (num: string) => {
    if (currentIndex < 4) {
      const newCode = [...code];
      newCode[currentIndex] = num;
      setCode(newCode);
      setCurrentIndex((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBackspace = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const newCode = [...code];
      newCode[newIndex] = '';
      setCode(newCode);
      setCurrentIndex(newIndex);
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 4 || password.length < 8) {
      Alert.alert(
        'Champs requis',
        'Saisissez le code à 4 chiffres et un nouveau mot de passe d’au moins 8 caractères.'
      );
      return;
    }

    setLoading(true);
    try {
      await resetPassword(fullCode, password);
      Alert.alert('Mot de passe modifié', 'Connectez-vous avec votre numéro et le nouveau mot de passe.', [
        { text: 'Connexion', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Code de vérification invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Teal Header */}
      <Header
        title="Nouveau mot de passe"
        subtitle="Code reçu puis nouveau mot de passe"
        showBack
        variant="curved"
      />

      <View style={styles.content}>
        <Card style={styles.otpCard}>
          {/* OTP Digits Row */}
          <View style={styles.otpRow}>
            {code.map((digit, idx) => (
              <View
                key={idx}
                style={[
                  styles.otpBox,
                  currentIndex === idx && styles.otpBoxActive,
                  digit !== '' && styles.otpBoxFilled,
                ]}
              >
                <Text style={styles.otpDigit}>{digit || ''}</Text>
              </View>
            ))}
          </View>

          {/* Resend Code */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.resendText}>
                Renvoyer le code dans <Text style={styles.timerBold}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={() => setTimer(45)}>
                <Text style={styles.resendAction}>Renvoyer le code maintenant</Text>
              </TouchableOpacity>
            )}
          </View>

          <Input
            label="Nouveau mot de passe"
            placeholder="8 caractères minimum"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={AppColors.textSecondary} />}
          />

          {/* Verify Button */}
          <Button
            title="Enregistrer"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            variant="primary"
            style={styles.verifyBtn}
          />
        </Card>

        {/* Custom Numeric Keypad (Matches Screen 5 exactly) */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['*', '0', 'delete'],
          ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.keyBtn}
                  onPress={() => {
                    if (item === 'delete') {
                      handleBackspace();
                    } else {
                      handleKeyPress(item);
                    }
                  }}
                  activeOpacity={0.6}
                >
                  {item === 'delete' ? (
                    <Ionicons name="backspace-outline" size={24} color={AppColors.textPrimary} />
                  ) : (
                    <Text style={styles.keyText}>{item}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -16,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  otpCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
    marginTop: 8,
  },
  otpBox: {
    width: 54,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: '#FAFCFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.white,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: AppColors.primary,
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  resendRow: {
    marginBottom: 20,
  },
  resendText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  timerBold: {
    fontWeight: '700',
    color: AppColors.primary,
  },
  resendAction: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.accent,
  },
  verifyBtn: {
    width: '100%',
  },
  keypad: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 4,
  },
  keyBtn: {
    width: 64,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
});
