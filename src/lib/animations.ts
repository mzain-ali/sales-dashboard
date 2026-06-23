import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function revealSection(container: HTMLElement | null) {
  if (!container) return null
  if (prefersReducedMotion()) return null

  const targets = Array.from(container.children) as HTMLElement[]
  if (targets.length === 0) return null

  // Pre-set targets to hidden to avoid popping/FOUC
  gsap.set(targets, { opacity: 0, y: 20 })

  return gsap.fromTo(
    targets,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.06,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        once: true,
      }
    }
  )
}
