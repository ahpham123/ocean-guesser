// src/app/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import Wave from 'react-wavify'
import { useEffect, useRef } from 'react'

function WaterRippleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0, 1); }
    `
    const frag = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_ripples[12];
      uniform float u_times[12];
      uniform int u_count;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float distort = 0.0;

        for (int i = 0; i < 12; i++) {
          if (i >= u_count) break;
          vec2 diff = uv - u_ripples[i];
          diff.x *= u_res.x / u_res.y;
          float dist = length(diff);
          float age = u_time - u_times[i];
          float radius = age * 0.6;
          float falloff = exp(-age * 1.4);
          float ring = exp(-pow((dist - radius) * 18.0, 2.0));
          distort += sin(dist * 60.0 - age * 8.0) * ring * falloff * 0.012;
        }

        vec2 distUv = uv + distort;
        float x = distUv.x;
        float y = distUv.y;

        vec3 deep    = vec3(0.012, 0.063, 0.180);
        vec3 mid     = vec3(0.024, 0.102, 0.251);
        vec3 surface = vec3(0.031, 0.192, 0.290);

        float t = smoothstep(0.0, 1.0, y + distort * 3.0);
        vec3 col = mix(deep, mix(mid, surface, t), t);

        gl_FragColor = vec4(col, 1.0);
      }
    `

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes    = gl.getUniformLocation(prog, 'u_res')
    const uTime   = gl.getUniformLocation(prog, 'u_time')
    const uRipples = gl.getUniformLocation(prog, 'u_ripples')
    const uTimes  = gl.getUniformLocation(prog, 'u_times')
    const uCount  = gl.getUniformLocation(prog, 'u_count')

    const MAX = 12
    const ripples: { x: number; y: number; t: number }[] = []
    let lastMouse = { x: -1, y: -1 }
    let startTime = performance.now()

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth
      const ny = 1 - e.clientY / window.innerHeight
      const dx = nx - lastMouse.x
      const dy = ny - lastMouse.y
      if (Math.sqrt(dx*dx + dy*dy) < 0.012) return
      lastMouse = { x: nx, y: ny }
      const now = (performance.now() - startTime) / 1000
      ripples.push({ x: nx, y: ny, t: now })
      if (ripples.length > MAX) ripples.shift()
    }
    window.addEventListener('mousemove', onMove)

    let raf: number
    const render = () => {
      const now = (performance.now() - startTime) / 1000
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, now)

      const alive = ripples.filter(r => now - r.t < 3.5)
      while (ripples.length) ripples.pop()
      alive.forEach(r => ripples.push(r))

      const flat = new Float32Array(MAX * 2).fill(0)
      const times = new Float32Array(MAX).fill(0)
      ripples.forEach((r, i) => { flat[i*2] = r.x; flat[i*2+1] = r.y; times[i] = r.t })

      gl.uniform2fv(uRipples, flat)
      gl.uniform1fv(uTimes, times)
      gl.uniform1i(uCount, ripples.length)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10"
    />
  )
}

export default function Home() {
  const router = useRouter()
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white px-4 overflow-hidden">

      <WaterRippleCanvas />

      {/* Animated waves — layered bottom-up */}
      <div className="absolute bottom-0 left-0 w-full -z-10 flex flex-col">
        <Wave
          fill="rgba(34,211,238,0.25)"
          paused={false}
          options={{ height: 20, amplitude: 18, speed: 0.22, points: 4 }}
        />
        <Wave
          fill="rgba(6,182,212,0.45)"
          paused={false}
          options={{ height: 80, amplitude: 22, speed: 0.16, points: 3 }}
          style={{ marginTop: '-140px' }}
        />
        <Wave
          fill="rgba(3,55,128,0.80)"
          paused={false}
          options={{ height: 40, amplitude: 28, speed: 0.10, points: 3 }}
          style={{ marginTop: '-160px' }}
        />
      </div>

      {/* Content */}
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-3">🌊 OceanGuesser</h1>
        <p className="text-slate-400 text-lg">How well do you know the world's oceans?</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.push('/play?mode=easy')}
          className="px-10 py-5 rounded-2xl bg-teal-500 hover:bg-teal-400 transition-colors text-white text-center"
        >
          <p className="text-2xl font-bold">Easy</p>
          <p className="text-teal-100 text-sm mt-1">Coastal shorelines</p>
        </button>
        <button
          onClick={() => router.push('/play?mode=hard')}
          className="px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-center"
        >
          <p className="text-2xl font-bold">Hard</p>
          <p className="text-indigo-200 text-sm mt-1">Open ocean satellite</p>
        </button>
      </div>

      <p className="mt-16 text-slate-600 text-sm">5 rounds · guess the location · submit your score</p>
    </main>
  )
}