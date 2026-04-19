// src/app/play/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { haversineKm, calculateScore } from '@/lib/scoring'
import ImageViewer from '@/components/game/ImageViewer'
import GuessMap from '@/components/game/GuessMap'
import ScoreDisplay from '@/components/game/ScoreDisplay'
import RoundTimer from '@/components/game/RoundTimer'
import { Location, Mode, Round } from '@/types'

const TOTAL_ROUNDS = 5
const ROUND_DURATION = 60

export default function PlayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') ?? 'easy') as Mode

  const [locations, setLocations] = useState<Location[]>([])
  const [pool, setPool] = useState<Location[]>([])   // remaining unused locations
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [roundResult, setRoundResult] = useState<{ score: number; distanceKm: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLocations() {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('mode', mode)

      if (error || !data || data.length < TOTAL_ROUNDS) {
        alert('Not enough locations in the database for this mode.')
        router.push('/')
        return
      }

      // Shuffle entire pool once
      const shuffled = [...data].sort(() => Math.random() - 0.5)

      // First 5 are the active game locations
      const active = shuffled.slice(0, TOTAL_ROUNDS)

      // Everything else is the fallback pool for replacements
      const remaining = shuffled.slice(TOTAL_ROUNDS)

      setLocations(active)
      setPool(remaining)
      setLoading(false)
    }

    fetchLocations()
  }, [mode])

  function handleLocationInvalid(badId: string) {
    // No replacements left — nothing to do, ImageViewer shows error state
    if (pool.length === 0) return

    const [replacement, ...remainingPool] = pool

    setPool(remainingPool)
    setLocations((prev) =>
      prev.map((l) => (l.id === badId ? replacement : l))
    )
  }

  function handleGuess(lat: number, lng: number) {
    if (submitted) return
    setGuess({ lat, lng })
  }

  function handleSubmit() {
    if (!guess || submitted) return

    const location = locations[currentRound]
    const distanceKm = haversineKm(guess.lat, guess.lng, location.lat, location.lng)
    console.log(location.lat)
    console.log(location.lng)
    const score = calculateScore(distanceKm)

    setRounds((prev) => [...prev, { location, guessLat: guess.lat, guessLng: guess.lng, distanceKm, score }])
    setRoundResult({ score, distanceKm })
    setSubmitted(true)
  }

  function handleTimerExpire() {
    if (submitted) return
    const location = locations[currentRound]
    if (!guess) {
      setRounds((prev) => [...prev, { location, guessLat: null, guessLng: null, distanceKm: null, score: 0 }])
      setRoundResult({ score: 0, distanceKm: 0 })
    } else {
      const distanceKm = haversineKm(guess.lat, guess.lng, location.lat, location.lng)
      const score = calculateScore(distanceKm)
      setRounds((prev) => [...prev, { location, guessLat: guess.lat, guessLng: guess.lng, distanceKm, score }])
      setRoundResult({ score, distanceKm })
    }
    setSubmitted(true)
  }

  function handleNextRound() {
    const nextRound = currentRound + 1
    const totalScore = rounds.reduce((sum, r) => sum + (r.score ?? 0), 0) + (roundResult?.score ?? 0)

    if (nextRound >= TOTAL_ROUNDS) {
      router.push(`/results?score=${totalScore}&mode=${mode}`)
      return
    }

    setCurrentRound(nextRound)
    setGuess(null)
    setSubmitted(false)
    setRoundResult(null)
  }

  if (loading || locations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading game...
      </div>
    )
  }

  const currentLocation = locations[currentRound]
  const totalScore = rounds.reduce((sum, r) => sum + (r.score ?? 0), 0)

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 shrink-0">
        <button onClick={() => router.push('/')} className="bg-red-600 py-1 px-4 rounded-lg text-white hover:bg-red-500 text-sm transition-all">
          ← Quit
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="capitalize">{mode} mode</span>
          <span>·</span>
          <span>Round {currentRound + 1} / {TOTAL_ROUNDS}</span>
        </div>
        <div className="text-teal-400 font-mono font-bold">
          {totalScore.toLocaleString()} pts
        </div>
      </div>

      <div className="px-6 pt-3 shrink-0">
        <RoundTimer
          key={currentRound}
          duration={ROUND_DURATION}
          onExpire={handleTimerExpire}
          paused={submitted}
        />
      </div>

      <div className="flex flex-1 gap-4 p-4 min-h-0">
        <div className="relative flex-1 min-w-0 rounded-xl overflow-hidden bg-slate-900">
          <ImageViewer
            location={currentLocation}
            onInvalid={handleLocationInvalid}
          />
        </div>

        <div className="flex flex-col gap-3 w-120 shrink-0">
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden">
            <GuessMap
              onGuess={handleGuess}
              disabled={submitted}
              correctLocation={submitted ? { lat: currentLocation.lat, lng: currentLocation.lng } : null}
              guessLocation={submitted && guess ? { lat: guess.lat, lng: guess.lng } : null}
            />
          </div>

          {submitted && roundResult && (
            <ScoreDisplay
              score={roundResult.score}
              distanceKm={roundResult.distanceKm}
              round={currentRound + 1}
              totalRounds={TOTAL_ROUNDS}
            />
          )}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!guess}
              className="w-full py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              Submit Guess
            </button>
          ) : (
            <button
              onClick={handleNextRound}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#2f2bd4] hover:bg-[#5855dd] transition-colors shrink-0"
            >
              {currentRound + 1 >= TOTAL_ROUNDS ? 'See Results →' : 'Next Round →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}