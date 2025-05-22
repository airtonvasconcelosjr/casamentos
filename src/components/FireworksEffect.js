import { Fireworks } from 'fireworks-js'
import { useRef, useEffect } from 'react'

function FireworksEffect({ className = "" }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      const fireworks = new Fireworks(containerRef.current, {
        opacity: 0.05,
        acceleration: 1.05,
        friction: 0.95,
        gravity: 1.5,
        particles: 50,
        trace: 3,
        explosion: 5,
        intensity: 20,
        flickering: 50,
        lineStyle: 'round',
      })
      fireworks.start()

      return () => fireworks.stop()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute top-[-600px] left-0 w-full h-1/2 z-0 pointer-events-none select-none ${className}`}
    />
  )
}

export default FireworksEffect;
