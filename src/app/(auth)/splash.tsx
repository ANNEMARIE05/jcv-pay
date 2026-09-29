import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppColors } from '@/constants/colors';
import { Button } from '@/components/common/Button';

const logo = require('../../../assets/images/jcv-square-icon.png');

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-8, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [floatY]);

  const logoMotion = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topSpacer} />

        <Animated.View entering={FadeIn.duration(500)} style={styles.brandContainer}>
          <Animated.View style={logoMotion}>
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Logo JCV Pay"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(450)} style={styles.titleRow}>
            <Text style={styles.titlePrimary}>JCV</Text>
            <Text style={styles.titleAccent}>Pay</Text>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(280).duration(450)} style={styles.subtitle}>
            Église Jésus Christ Victoire • Finances & Contributions
          </Animated.Text>
        </Animated.View>

        <View style={styles.arcContainer}>
          <View style={styles.arcOuter} />
          <View style={styles.arcInner} />
        </View>

        <Animated.View entering={FadeInUp.delay(360).duration(480)} style={styles.actionsContainer}>
          <Button
            title="Se connecter"
            onPress={() => router.push('/(auth)/login')}
            size="lg"
            variant="primary"
            style={styles.actionBtn}
          />

          <Button
            title="Créer un compte"
            onPress={() => router.push('/(auth)/register')}
            size="lg"
            variant="secondary"
            style={styles.actionBtn}
          />

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Accéder directement à l application →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 36,
  },
  topSpacer: {
    height: 40,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 36,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titlePrimary: {
    fontSize: 34,
    fontWeight: '800',
    color: AppColors.primary,
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: 34,
    fontWeight: '800',
    color: AppColors.accent,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 260,
  },
  arcContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  arcOuter: {
    position: 'absolute',
    width: width * 1.3,
    height: 200,
    borderRadius: width,
    borderWidth: 2,
    borderColor: 'rgba(12, 74, 72, 0.08)',
    bottom: -60,
  },
  arcInner: {
    position: 'absolute',
    width: width,
    height: 160,
    borderRadius: width / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(242, 133, 0, 0.15)',
    bottom: -40,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
  skipBtn: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
});
