/**
 * Password validation and strength checking utilities
 */

export interface PasswordStrength {
  score: number; // 0-4 (0=weak, 4=very strong)
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  feedback: string[];
  isValid: boolean;
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Check password strength
 */
export function checkPasswordStrength(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= requirements.minLength) {
    score += 1;
  } else {
    feedback.push(`At least ${requirements.minLength} characters`);
  }

  // Character variety checks
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (hasUppercase) {
    score += 0.5;
  } else if (requirements.requireUppercase) {
    feedback.push('One uppercase letter');
  }

  if (hasLowercase) {
    score += 0.5;
  } else if (requirements.requireLowercase) {
    feedback.push('One lowercase letter');
  }

  if (hasNumbers) {
    score += 0.5;
  } else if (requirements.requireNumbers) {
    feedback.push('One number');
  }

  if (hasSpecialChars) {
    score += 0.5;
  } else if (requirements.requireSpecialChars) {
    feedback.push('One special character');
  }

  // Bonus for length
  if (password.length >= 12) {
    score += 0.5;
  }
  if (password.length >= 16) {
    score += 0.5;
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.floor(score));

  // Determine label
  let label: PasswordStrength['label'];
  if (normalizedScore <= 1) {
    label = normalizedScore === 0 ? 'Very Weak' : 'Weak';
  } else if (normalizedScore === 2) {
    label = 'Fair';
  } else if (normalizedScore === 3) {
    label = 'Good';
  } else {
    label = 'Strong';
  }

  // Check if password meets all requirements
  const isValid =
    password.length >= requirements.minLength &&
    (!requirements.requireUppercase || hasUppercase) &&
    (!requirements.requireLowercase || hasLowercase) &&
    (!requirements.requireNumbers || hasNumbers) &&
    (!requirements.requireSpecialChars || hasSpecialChars);

  return {
    score: normalizedScore,
    label,
    feedback,
    isValid,
  };
}

/**
 * Validate password against requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

