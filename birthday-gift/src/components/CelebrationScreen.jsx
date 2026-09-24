import { useEffect, useRef, useState } from 'react'
import { playBirthday, playHeartTap } from '../sounds.js'
import './CelebrationScreen.css'

function Cake() {
  return (
    <div className="cake-wrap" aria-hidden="true">
      <div className="cake-candle">
        <div className="candle-flame" />
      </div>
      <div className="cake-tier cake-top">
        <div className="cake-drip" />
      </div>
      <div className="cake-tier cake-bottom" />
      <div className="cake-plate" />
    </div>
  )
}

class Firework {
  constructor(x, y, targetX, targetY, color) {
    this.x = x
    this.y = y
    this.startX = x
    this.startY = y
    this.targetX = targetX
    this.targetY = targetY
    this.color = color
    this.distanceToTarget = Math.hypot(targetX - x, targetY - y)
    this.distanceTraveled = 0
    this.coordinates = []
    this.coordinateCount = 3
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y])
    }
    this.angle = Math.atan2(targetY - y, targetX - x)
    this.speed = 2
    this.acceleration = 1.05
    this.brightness = Math.random() * 50 + 50
  }

  update(index, fireworks, particles) {
    this.coordinates.pop()
    this.coordinates.unshift([this.x, this.y])
    this.speed *= this.acceleration
    const vx = Math.cos(this.angle) * this.speed
    const vy = Math.sin(this.angle) * this.speed
    this.distanceTraveled = Math.hypot(this.x + vx - this.startX, this.y + vy - this.startY)

    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.targetX, this.targetY, this.color, particles)
      fireworks.splice(index, 1)
    } else {
      this.x += vx
      this.y += vy
    }
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1],
    )
    ctx.lineTo(this.x, this.y)
    ctx.strokeStyle = `hsl(${this.color}, 100%, ${this.brightness}%)`
    ctx.stroke()
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x
    this.y = y
    this.coordinates = []
    this.coordinateCount = 5
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y])
    }
    this.angle = Math.random() * Math.PI * 2
    this.speed = Math.random() * 10 + 1
    this.friction = 0.95
    this.gravity = 1
    this.hue = color + (Math.random() * 40 - 20)
    this.brightness = Math.random() * 50 + 50
    this.alpha = 1
    this.decay = Math.random() * 0.015 + 0.015
  }

  update(index, particles) {
    this.coordinates.pop()
    this.coordinates.unshift([this.x, this.y])
    this.speed *= this.friction
    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed + this.gravity
    this.alpha -= this.decay

    if (this.alpha <= 0) {
      particles.splice(index, 1)
    }
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1],
    )
    ctx.lineTo(this.x, this.y)
    ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`
    ctx.stroke()
  }
}

function createParticles(x, y, color, particles) {
  let count = 30
  while (count--) {
    particles.push(new Particle(x, y, color))
  }
}

function drawHeart(ctx, heart) {
  const { x, y, size, rotation } = heart
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('❤️', 0, 0)
  ctx.restore()
}

function createFallingHeart(width) {
  const big = Math.random() > 0.78
  const size = big ? 82 + Math.random() * 26 : 48 + Math.random() * 26
  return {
    x: size + Math.random() * Math.max(1, width - size * 2),
    y: -size - Math.random() * 120,
    vy: 2.2 + Math.random() * 2.4,
    size,
    sway: Math.random() * Math.PI * 2,
    rotation: (Math.random() - 0.5) * 0.8,
    spin: (Math.random() - 0.5) * 0.012,
    plump: 0.78 + Math.random() * 0.4,
    hue: 336 + Math.random() * 24,
    light: 56 + Math.random() * 16,
  }
}

export default function CelebrationScreen() {
  const fireRef = useRef(null)
  const heartRef = useRef(null)
  const [showBirthday, setShowBirthday] = useState(false)

  useEffect(() => {
    const fireCanvas = fireRef.current
    const heartCanvas = heartRef.current
    if (!fireCanvas || !heartCanvas) return undefined

    const fireCtx = fireCanvas.getContext('2d')
    const heartCtx = heartCanvas.getContext('2d')
    const pile = document.createElement('canvas')
    const pileCtx = pile.getContext('2d')

    let w = window.innerWidth
    let h = window.innerHeight
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      fireCanvas.width = w
      fireCanvas.height = h
      heartCanvas.width = w
      heartCanvas.height = h
      pile.width = w
      pile.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    const fireworks = []
    const particles = []
    const falling = []
    const cell = 34
    let columns = Math.ceil(w / cell)
    let stack = new Float32Array(columns)
    let hue = 330
    let tick = 0
    let spawnAt = 0
    let filled = false
    let animationId = 0
    const started = performance.now()

    const loop = (now) => {
      animationId = requestAnimationFrame(loop)
      const elapsed = now - started
      hue += 0.4

      fireCtx.globalCompositeOperation = 'destination-out'
      fireCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      fireCtx.fillRect(0, 0, w, h)
      fireCtx.globalCompositeOperation = 'lighter'

      if (elapsed < 7000) {
        let i = fireworks.length
        while (i--) {
          fireworks[i].draw(fireCtx)
          fireworks[i].update(i, fireworks, particles)
        }
        let j = particles.length
        while (j--) {
          particles[j].draw(fireCtx)
          particles[j].update(j, particles)
        }
        if (tick >= 28) {
          fireworks.push(
            new Firework(w / 2, h, Math.random() * w, Math.random() * (h * 0.55), hue),
          )
          tick = 0
        } else {
          tick += 1
        }
        return
      }

      if (columns !== Math.ceil(w / cell)) {
        columns = Math.ceil(w / cell)
        stack = new Float32Array(columns)
      }

      if (!filled && falling.length < 28 && now - spawnAt > 110) {
        const burst = Math.max(1, Math.round(columns / 24))
        for (let n = 0; n < burst; n += 1) falling.push(createFallingHeart(w))
        spawnAt = now
      }

      for (let i = falling.length - 1; i >= 0; i -= 1) {
        const heart = falling[i]
        heart.vy = Math.min(heart.vy + 0.62, 18)
        heart.y += heart.vy
        heart.sway += 0.03
        heart.x += Math.sin(heart.sway) * 0.7
        heart.rotation += heart.spin

        const span = Math.max(1, Math.round(heart.size / cell))
        let col = Math.floor(heart.x / cell)
        col = Math.max(0, Math.min(columns - span, col))
        let floor = 0
        for (let c = col; c < col + span; c += 1) floor = Math.max(floor, stack[c])
        const floorY = h - floor - heart.size * 0.42

        if (heart.y < floorY) continue

        heart.y = floorY
        const rise = heart.size * 0.5
        for (let c = col; c < col + span; c += 1) stack[c] += rise
        if (col > 0) stack[col - 1] = Math.max(stack[col - 1], stack[col] - rise * 0.45)
        if (col + span < columns) {
          stack[col + span] = Math.max(stack[col + span], stack[col + span - 1] - rise * 0.45)
        }
        drawHeart(pileCtx, heart)
        falling.splice(i, 1)
        playHeartTap()
      }

      heartCtx.clearRect(0, 0, w, h)
      heartCtx.drawImage(pile, 0, 0)
      falling.forEach((heart) => drawHeart(heartCtx, heart))

      if (!filled) {
        let lowest = stack[0] || 0
        for (let c = 1; c < columns; c += 1) lowest = Math.min(lowest, stack[c])
        if (lowest >= h - 6) {
          filled = true
          setShowBirthday(true)
          playBirthday()
        }
      }
    }

    animationId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <section className="celebration-screen" aria-label="Happy Birthday">
      <canvas ref={fireRef} className="celebration-canvas" />
      <Cake />
      <canvas ref={heartRef} className="celebration-canvas celebration-hearts" />
      <div className={`celebration-text ${showBirthday ? 'is-visible' : ''}`}>
        <p>HAPPY BIRTHDAY</p>
      </div>
    </section>
  )
}
