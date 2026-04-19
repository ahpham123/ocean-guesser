// src/app/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import Wave from 'react-wavify'

export default function Home() {
  const router = useRouter()
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-[#0c1a3a] to-[#0f3460] -z-10" />
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