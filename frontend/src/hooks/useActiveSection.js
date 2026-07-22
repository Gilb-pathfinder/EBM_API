import { useScrollSpy } from './useScrollSpy'

const LANDING_SECTIONS = ['features', 'workflow', 'compliance', 'pricing', 'docs']

export function useActiveSection() {
  return useScrollSpy(LANDING_SECTIONS)
}
