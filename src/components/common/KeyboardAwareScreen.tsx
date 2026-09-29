import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';

type KeyboardScrollApi = {
  ensureVisible: (screenY: number, height: number) => void;
};

const KeyboardScrollContext = createContext<KeyboardScrollApi | null>(null);

export function useKeyboardScroll() {
  return useContext(KeyboardScrollContext);
}

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  overlay?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  keyboardVerticalOffset?: number;
  scrollViewProps?: Omit<ScrollViewProps, 'contentContainerStyle' | 'children'>;
};

export function KeyboardSpacer() {
  const inset = useKeyboardInset();
  if (inset <= 0) return null;
  return <View style={{ height: inset + 32 }} accessibilityElementsHidden />;
}

export function KeyboardAwareScreen({
  children,
  header,
  footer,
  overlay,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  scrollViewProps,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const keyboardHeight = useKeyboardInset();
  const keyboardHeightRef = useRef(keyboardHeight);
  keyboardHeightRef.current = keyboardHeight;

  const ensureVisible = useCallback((screenY: number, height: number) => {
    const windowH = Dimensions.get('window').height;
    const kb = keyboardHeightRef.current > 80 ? keyboardHeightRef.current : 320;
    const visibleBottom = windowH - kb - 20;
    const overflow = screenY + height - visibleBottom;
    if (overflow <= 8) return;

    const nextY = Math.max(0, scrollYRef.current + overflow + 24);
    scrollRef.current?.scrollTo({ y: nextY, animated: true });
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        keyboardHeightRef.current = event.endCoordinates.height;
      }
    );
    return () => show.remove();
  }, []);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
    scrollViewProps?.onScroll?.(event);
  };

  const keyboardOpen = keyboardHeight > 80;

  const body = (
    <KeyboardScrollContext.Provider value={{ ensureVisible }}>
      {header}
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
        {...scrollViewProps}
        onScroll={onScroll}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
        <KeyboardSpacer />
      </ScrollView>
      {keyboardOpen ? null : footer}
      {overlay}
    </KeyboardScrollContext.Provider>
  );

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={[styles.flex, style]}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return <View style={[styles.flex, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
