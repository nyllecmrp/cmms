export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'This field is required';
  }

  if (!value) return null;

  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  if (rules.min !== undefined && Number(value) < rules.min) {
    return `Must be at least ${rules.min}`;
  }

  if (rules.max !== undefined && Number(value) > rules.max) {
    return `Must be no more than ${rules.max}`;
  }

  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email address';
    }
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm(data: Record<string, any>, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const field in rules) {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
