import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a human-friendly meeting code.
 * Format: vel-XXXX-XXXX (e.g., vel-a3b7-k9m2)
 */
export function generateMeetingCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segment = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return `vel-${segment(4)}-${segment(4)}`;
}

/**
 * Generates a unique identifier using UUID v4.
 */
export function generateId(): string {
  return uuidv4();
}
