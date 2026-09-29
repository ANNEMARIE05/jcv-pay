'use no memo';

import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/colors';
import { useKeyboardScroll } from '@/components/common/KeyboardAwareScreen';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const wrapRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardScroll = useKeyboardScroll();

  const revealField = () => {
    const run = () => {
      wrapRef.current?.measureInWindow((_x, y, _w, h) => {
        keyboardScroll?.ensureVisible(y, h);
      });
    };
    run();
    setTimeout(run, 80);
    setTimeout(run, 280);
    setTimeout(run, 450);
  };

  return (
    <View ref={wrapRef} style={[styles.wrapper, containerStyle]} collapsable={false}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          !!error && styles.errorContainer,
        ]}
        collapsable={false}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

        <TextInput
          {...props}
          ref={inputRef}
          style={[styles.input, style]}
          placeholderTextColor={AppColors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          underlineColorAndroid="transparent"
          textAlignVertical="center"
          editable={props.editable !== false}
          showSoftInputOnFocus
          importantForAutofill="yes"
          onFocus={(event) => {
            setIsFocused(true);
            revealField();
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={AppColors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCFC',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  focused: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.white,
  },
  errorContainer: {
    borderColor: AppColors.danger,
    backgroundColor: '#FFF8F8',
  },
  leftIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingVertical: 12,
    color: AppColors.textPrimary,
    fontSize: 14,
  },
  eyeButton: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});
