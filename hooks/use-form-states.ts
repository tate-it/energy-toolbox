import { useQueryStates } from 'nuqs'
import { createFormStateParsers } from '@/lib/xml-generator/nuqs-parsers'

export function useFormStates() {
  const [formStates, setFormStates] = useQueryStates(createFormStateParsers())
  return [formStates, setFormStates] as const
}
