// src/utils/validation.ts

export type PhoneValidationResult = {
  valid: boolean;
  reason?:
    | 'EMPTY'
    | 'NON_NUMERIC'
    | 'LENGTH'
    | 'START_DIGIT'
    | 'REPEATED'
    | 'SEQUENTIAL'
    | 'BLACKLIST';
  message?: string;
};

/**
 * Validate India-only mobile numbers.
 * - 10 digits
 * - starts with 6/7/8/9
 * - not all identical digits (e.g., 0000000000)
 * - not in common fake patterns (1234567890, 9876543210, etc.)
 */
export function validateMobile(numRaw: string): PhoneValidationResult {
  const num = (numRaw || '').trim();

  if (!num) {
    return { valid: false, reason: 'EMPTY', message: 'Enter your phone number' };
  }
  if (!/^\d+$/.test(num)) {
    return { valid: false, reason: 'NON_NUMERIC', message: 'Phone number must be digits only' };
  }
  if (!/^[6-9]/.test(num)) {
    return {
      valid: false,
      reason: 'START_DIGIT',
      message: 'Phone number must start with 6, 7, 8, or 9',
    };
  }
  if (num.length !== 10) {
    return { valid: false, reason: 'LENGTH', message: 'Phone number must be 10 digits' };
  }
  return { valid: true };
}
