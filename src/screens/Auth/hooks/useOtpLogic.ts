// src/screens/Auth/hooks/useOtpLogic.ts
import ERROR_MESSAGES from '@constants/errors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfile } from '@screens/Profile/hooks/useProfile';
import { resendOtp, verifyOtp } from '@services/api';
import logger from '@utils/logger';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from './useAuth';

type UseOtpLogicParams = {
  phoneNumber: string;
  countryCode: string;
};

export function useOtpLogic({ phoneNumber, countryCode }: UseOtpLogicParams) {
  const { login } = useAuth();
  const { setLocal } = useProfile();

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const otpInputRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(30);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleResendOtp = useCallback(async () => {
    logger.debug('[Otp] handleResendOtp', { phoneNumber, countryCode });
    if (timer > 0 || loading) return;

    try {
      setLoading(true);
      setError('');

      const response = await resendOtp(countryCode, phoneNumber);
      if ((response as any)?.success) {
        startTimer();
        otpInputRef.current?.reset?.();
        setOtp(['', '', '', '']);
      } else {
        logger.error('[Otp] Resend ✗', response);
        setError((response as any)?.error || ERROR_MESSAGES.INVALID_PHONE_NUMBER);
      }
    } catch (e: any) {
      logger.error('[Otp] Resend error', e?.message);
      setError(e?.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [timer, loading, countryCode, phoneNumber, startTimer]);

  const isOtpFilled = useMemo(() => otp.every((d) => d !== ''), [otp]);

  const handleVerifyOtp = useCallback(async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      setError(ERROR_MESSAGES.INVALID_OTP);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await verifyOtp(countryCode, phoneNumber, enteredOtp);

      const accessToken = (res as any)?.accessToken ?? (res as any)?.data?.accessToken ?? null;
      const refreshToken = (res as any)?.refreshToken ?? (res as any)?.data?.refreshToken ?? null;

      if ((res as any)?.success && accessToken && refreshToken) {
        await login({ accessToken, refreshToken });
        setLocal({
          phoneNumber,
          phoneCountryCode: countryCode,
        });

        const refreshTokenExpiry =
          (res as any)?.refreshTokenExpiry ?? (res as any)?.data?.refreshTokenExpiry;
        const isNewUser = (res as any)?.isNewUser ?? (res as any)?.data?.isNewUser;

        const extraPairs: [string, string][] = [];
        if (refreshTokenExpiry) extraPairs.push(['refreshTokenExpiry', String(refreshTokenExpiry)]);
        if (typeof isNewUser !== 'undefined')
          extraPairs.push(['isNewUser', JSON.stringify(!!isNewUser)]);
        if (extraPairs.length) await AsyncStorage.multiSet(extraPairs);
      } else {
        const msg = (res as any)?.error || (res as any)?.message || ERROR_MESSAGES.INVALID_OTP;
        logger.warn('[Otp] verify ✗', msg);
        setError(msg);
      }
    } catch (e: any) {
      logger.error('[Otp] verify error', e?.message);
      setError(e?.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [otp, countryCode, phoneNumber, login, setLocal]);

  return {
    otp,
    setOtp,
    error,
    loading,
    timer,
    isOtpFilled,
    otpInputRef,
    handleResendOtp,
    handleVerifyOtp,
  };
}
