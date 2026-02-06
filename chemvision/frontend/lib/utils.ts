import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with clsx.
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
