import { Wall, Buildings, Bed, Shower, Lightning, FireExtinguisher, Door, Files, type IconProps } from '@phosphor-icons/react'

const MAP: Record<string, React.ComponentType<IconProps>> = {
  structure: Wall, exterior: Buildings, rooms: Bed, bathrooms: Shower, technical: Lightning, safety: FireExtinguisher, common: Door, documentation: Files,
}

export function CategoryIcon({ id, size = 20, className = 'text-muted' }: { id: string; size?: number; className?: string }) {
  const C = MAP[id] ?? Files
  return <C size={size} weight="regular" className={className} aria-hidden />
}
