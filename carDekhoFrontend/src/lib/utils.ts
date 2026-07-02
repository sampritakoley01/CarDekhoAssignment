import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export function getImageUrl(imageUrl: string): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  if (imageUrl.startsWith('http')) return imageUrl
  return `${base}${imageUrl}`
}
