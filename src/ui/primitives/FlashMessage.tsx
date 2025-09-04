// src/ui/primitives/FlashMessage.tsx
import { fontSizes, radii, spacing } from '@ui/tokens';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

type FlashType = 'success' | 'error' | 'info';
type ShowFn = (text: string) => void;

type FlashContextValue = {
  success: ShowFn;
  error: ShowFn;
  info: ShowFn;
};

const FallbackContext: FlashContextValue = {
  // If provider isn't mounted, fall back to Android Toast (no-op on iOS)
  success: (t) => {
    if (Platform.OS === 'android') {
      const { ToastAndroid } = require('react-native');
      ToastAndroid.show(t, ToastAndroid.SHORT);
    }
  },
  error: (t) => {
    if (Platform.OS === 'android') {
      const { ToastAndroid } = require('react-native');
      ToastAndroid.show(t, ToastAndroid.SHORT);
    }
  },
  info: (t) => {
    if (Platform.OS === 'android') {
      const { ToastAndroid } = require('react-native');
      ToastAndroid.show(t, ToastAndroid.SHORT);
    }
  },
};

const FlashContext = createContext<FlashContextValue>(FallbackContext);

type Msg = { id: number; type: FlashType; text: string };

export const FlashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [msg, setMsg] = useState<Msg | null>(null);
  const idRef = useRef(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const animateIn = useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(-16);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const animateOut = useCallback(
    (onDone?: () => void) => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -16,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onDone?.();
      });
    },
    [opacity, translateY],
  );

  const show = useCallback(
    (type: FlashType, text: string) => {
      clearTimer();
      const id = ++idRef.current;
      setMsg({ id, type, text });
      animateIn();
      hideTimer.current = setTimeout(() => {
        animateOut(() => {
          setMsg((m) => (m && m.id === id ? null : m));
        });
      }, 2200);
    },
    [animateIn, animateOut, clearTimer],
  );

  const value = useMemo<FlashContextValue>(
    () => ({
      success: (t) => show('success', t),
      error: (t) => show('error', t),
      info: (t) => show('info', t),
    }),
    [show],
  );

  const bg = msg?.type === 'success' ? '#16a34a' : msg?.type === 'error' ? '#dc2626' : '#374151';

  return (
    <FlashContext.Provider value={value}>
      {children}

      {msg ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.host,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.card, { backgroundColor: bg }]}>
            <Text style={styles.text} numberOfLines={2}>
              {msg.text}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </FlashContext.Provider>
  );
};

export function useFlash() {
  return useContext(FlashContext);
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    maxWidth: 560,
  },
  text: {
    color: '#fff',
    fontSize: fontSizes.sm,
  },
});
