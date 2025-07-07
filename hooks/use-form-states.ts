import { useQueryStates } from 'nuqs';
import { createFormStateSchema } from '@/providers/form-provider';

export function useFormStates() {
  const [formStates, setFormStates] = useQueryStates(createFormStateSchema());
  return [formStates, setFormStates] as const;
}
