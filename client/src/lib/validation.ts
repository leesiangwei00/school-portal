const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SG mobile numbers are 8 digits (excludes the +65 country code).
const SG_MOBILE_PATTERN = /^\d{8}$/;

export function validateRequired(value: string, label: string): string | null {
  return value.trim().length === 0 ? `${label} is required.` : null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Email address is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "This email address is invalid.";
  return null;
}

/** Strips everything but digits, e.g. tolerates spaces from formatting or pasted input. */
export function stripContactNumber(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateContactNumber(value: string): string | null {
  const digits = stripContactNumber(value);
  if (digits.length === 0) return "Work contact number is required.";
  if (!SG_MOBILE_PATTERN.test(digits)) return "This work contact number is invalid.";
  return null;
}

/** Formats an 8-digit SG mobile number as "XXXX XXXX" for display. */
export function formatContactNumber(value: string): string {
  const digits = stripContactNumber(value);
  return digits.length <= 4 ? digits : `${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
}
