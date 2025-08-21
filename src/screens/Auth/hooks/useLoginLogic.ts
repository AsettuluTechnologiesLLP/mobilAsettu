// src/screens/Auth/hooks/useLoginLogic.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, Platform } from 'react-native';

import ERROR_MESSAGES from '../../../constants/errors';
import ROUTES from '../../../navigation/routes';
import { getOtp } from '../../../services/api';
import logger from '../../../utils/logger';
import { validateMobile } from '../../../utils/validation';

type UseLoginLogicParams = {
  navigation: any; // if you have typed stacks, replace `any`
  defaultCountryCode?: string; // e.g. '+91'
};

export function useLoginLogic({ navigation, defaultCountryCode = '+91' }: UseLoginLogicParams) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef<any>(null);

  useEffect(() => {
    logger.debug('[useLoginLogic] useLoginLogic >>>> Mounted');
    phoneInputRef.current?.focus?.();

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (Platform.OS === 'android' && (Keyboard as any)?.isVisible?.()) return true;
      return false;
    });

    return () => {
      sub.remove();
      logger.debug('[useLoginLogic] useLoginLogic <<<< UnMounted');
    };
  }, []);

  // derived validation
  const validation = validateMobile(phoneNumber);
  const isValid = validation.valid;

  const onGetOtp = useCallback(async () => {
    if (loading) return; // debounce

    // Re-check before API (no need to capture `isValid`)
    const v = validateMobile(phoneNumber);
    if (!v.valid) {
      setServerError(v.message || ERROR_MESSAGES.INVALID_PHONE_NUMBER);
      logger.warn(`[useLoginLogic] Invalid phone number entered: ${phoneNumber} (${v.reason})`);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const response = await getOtp(defaultCountryCode, phoneNumber);
      if (response?.success) {
        logger.debug('[useLoginLogic] OTP requested successfully and routing to OTP_VERIFICATION');
        navigation.replace(ROUTES.OTP, {
          phoneNumber,
          countryCode: defaultCountryCode,
        });
      } else {
        logger.error('[useLoginLogic] OTP request failed', response);
        setServerError(response?.error || ERROR_MESSAGES.INVALID_PHONE_NUMBER);
      }
    } catch (err: any) {
      logger.error(
        `[useLoginLogic] Error sending OTP: ${err?.message || ERROR_MESSAGES.NETWORK_ERROR}`,
      );
      setServerError(err?.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [defaultCountryCode, loading, navigation, phoneNumber]);

  return {
    countryCode: defaultCountryCode,
    phoneNumber,
    setPhoneNumber: (t: string) => {
      setServerError('');
      // keep digits only (defensive)
      setPhoneNumber(t.replace(/\D+/g, ''));
    },
    error: serverError || (phoneNumber.length > 0 && !isValid ? validation.message || '' : ''),
    isValid,
    loading,
    phoneInputRef,
    onGetOtp,
  };
}
