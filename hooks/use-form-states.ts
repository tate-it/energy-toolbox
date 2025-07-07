import { createFormStateSchema } from "@/providers/form-provider"
import { useQueryStates } from "nuqs"

export function useFormStates() {
  const [formStates, setFormStates] = useQueryStates(createFormStateSchema())
  return [formStates, setFormStates] as const
}