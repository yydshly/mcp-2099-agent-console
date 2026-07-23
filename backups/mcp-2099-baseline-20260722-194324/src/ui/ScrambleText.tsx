import { useRef } from 'react'

interface ScrambleTextProps {
  children: string
  className?: string
}

const glyphs = '0123456789ABCDEF'

export function ScrambleText({ children, className }: ScrambleTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<number>(0)

  const handleEnter = () => {
    const node = elementRef.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const scramble = () => {
      const reveal = Math.floor(frame / 2)
      node.textContent = children
        .split('')
        .map((character, index) => (character === ' ' || index < reveal ? character : glyphs[(index * 11 + frame) % glyphs.length]))
        .join('')
      frame += 1
      if (reveal < children.length) animationRef.current = requestAnimationFrame(scramble)
    }
    cancelAnimationFrame(animationRef.current)
    scramble()
  }

  return <span ref={elementRef} className={className} onMouseEnter={handleEnter}>{children}</span>
}
