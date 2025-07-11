import { zodResolver } from '@hookform/resolvers/zod'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ZodTypeAny } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dynamicResolver(schema: ZodTypeAny) {
  // zodResolver returns a Resolver with its own generic; we cast to our union.
  // This is safe because schema validation still happens at runtime.
  return zodResolver(schema)
}
