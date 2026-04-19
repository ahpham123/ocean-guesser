// src/app/page.tsx
'use client'
import Image from "next/image";

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-4">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-3">🌊 OceanGuesser</h1>
        <p className="text-slate-400 text-lg">How well do you know the world's oceans?</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.push('/play?mode=easy')}
          className="group px-10 py-5 rounded-2xl bg-teal-500 hover:bg-teal-400 transition-colors text-white text-center"
        >
          <p className="text-2xl font-bold">Easy</p>
          <p className="text-teal-100 text-sm mt-1">Coastal shorelines</p>
        </button>

        <button
          onClick={() => router.push('/play?mode=hard')}
          className="group px-10 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-center"
        >
          <p className="text-2xl font-bold">Hard</p>
          <p className="text-indigo-200 text-sm mt-1">Open ocean satellite</p>
        </button>
      </div>

      <p className="mt-16 text-slate-600 text-sm">5 rounds · guess the location · submit your score</p>
    </main>
  )
}