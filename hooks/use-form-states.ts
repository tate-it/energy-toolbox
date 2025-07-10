import { createFormStateParsers } from '@/lib/xml-generator/nuqs-parsers'
import { useQueryStates } from 'nuqs'

export function useFormStates() {
  const [formStates, setFormStates] = useQueryStates(createFormStateParsers())
  return [formStates, setFormStates] as const
}
