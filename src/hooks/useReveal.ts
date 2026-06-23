import { useGSAP } from '@gsap/react'
import { revealSection } from '@/lib/animations'

export function useReveal(ref: React.RefObject<HTMLDivElement | null>) {
  useGSAP(() => {
    if (!ref.current) return
    const anim = revealSection(ref.current)
    return () => {
      if (anim) anim.kill()
    }
  }, { scope: ref, dependencies: [] })
}
